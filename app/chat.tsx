// app/chat.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Animated,
  Platform,
  Easing,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

// Importa tus contextos (ajusta la ruta según corresponda)
import { useTheme } from "../contexts/themeContext";
import { useMenu, Conversation, Message } from "../contexts/menuContext";

// Importa Firebase (Firestore y Auth)
import { auth, db } from "../utils/firebaseconfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore/lite";

export default function ChatScreen() {
  const { darkMode } = useTheme();
  const router = useRouter();
  const { conversationId: convIdParam = "" } = useLocalSearchParams();
  const conversationId = Array.isArray(convIdParam) ? convIdParam[0] : convIdParam;

  const {
    conversations,
    createConversation,
    updateConversationTitle,
    conversationHistories,
    addMessage,
    updateConversationHistory,
  } = useMenu();

  // Si no existe una conversación, se crea una nueva y se redirige
  useEffect(() => {
    if (conversationId === "") {
      const newId = createConversation();
      const currentUser = auth.currentUser;
      (async () => {
        try {
          // Crea el documento de conversación usando el mismo ID generado y asigna el userId
          await setDoc(doc(db, "conversations", newId), {
            title: "New Chat",
            createdAt: serverTimestamp(),
            history: [],
            userId: currentUser?.uid,
          });
        } catch (error) {
          console.error("Error creando conversación en Firestore:", error);
        }
      })();
      router.replace(`/chat?conversationId=${newId}`);
    }
  }, [conversationId]);

  const conversation: Conversation | undefined =
    conversationId !== ""
      ? conversations.find((c: Conversation) => c.id === conversationId)
      : undefined;
  const messages: Message[] =
    conversationId !== "" ? conversationHistories[conversationId] || [] : [];

  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputBottomAnim = useRef(new Animated.Value(80)).current;

  // Recupera el historial de mensajes desde la subcolección de Firestore
  useEffect(() => {
    const fetchMessages = async () => {
      if (conversationId !== "") {
        try {
          const messagesRef = collection(db, "conversations", conversationId, "messages");
          const q = query(messagesRef, orderBy("createdAt", "asc"));
          const querySnapshot = await getDocs(q);
          const loadedMessages: Message[] = querySnapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              text: data.text,
              sender: data.sender,
            };
          });
          updateConversationHistory(conversationId, loadedMessages);
        } catch (error) {
          console.error("Error al recuperar mensajes desde Firestore:", error);
        }
      }
    };
    fetchMessages();
  }, [conversationId]);

  // Ajusta la posición del input al mostrar/ocultar el teclado
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        Animated.timing(inputBottomAnim, {
          toValue: event.endCoordinates.height + 16,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        Animated.timing(inputBottomAnim, {
          toValue: 80,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      }
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [inputBottomAnim]);

  // Función para formatear el texto, mostrando en negrita lo que esté entre ** **
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2);
        return (
          <Text key={index} style={{ fontWeight: "bold" }}>
            {boldText}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  // Guarda el mensaje en la subcolección "messages" de la conversación
  const saveMessageToFirestore = async (convId: string, message: Message) => {
    try {
      await setDoc(
        doc(collection(db, "conversations", convId, "messages")),
        {
          text: message.text,
          sender: message.sender,
          createdAt: serverTimestamp(),
        }
      );
    } catch (error) {
      console.error("Error guardando mensaje en Firestore:", error);
    }
  };

  // Actualiza el campo "history" en el documento de la conversación (usa merge para crear si no existe)
  const updateConversationHistoryInFirestore = async (convId: string, history: Message[]) => {
    try {
      const convDoc = doc(db, "conversations", convId);
      await setDoc(convDoc, { history }, { merge: true });
    } catch (error) {
      console.error("Error actualizando historial en Firestore:", error);
    }
  };

  const sendMessage = async () => {
    Haptics.selectionAsync();
    if (messageText.trim() && conversationId !== "") {
      // Si el título aún es "New Chat", actualízalo con la primera palabra del mensaje
      if (conversation && conversation.title === "New Chat") {
        const firstWord = messageText.trim().split(" ")[0];
        updateConversationTitle(conversation.id, firstWord);
        try {
          const convDoc = doc(db, "conversations", conversation.id);
          await setDoc(convDoc, { title: firstWord }, { merge: true });
        } catch (error) {
          console.error("Error actualizando título en Firestore:", error);
        }
      }
      const userMsg: Message = {
        id: String(Date.now()),
        text: messageText,
        sender: "user",
      };
      // Guarda el mensaje localmente y en Firestore
      addMessage(conversationId, userMsg);
      await saveMessageToFirestore(conversationId, userMsg);
      const newHistory = [...messages, userMsg];
      await updateConversationHistoryInFirestore(conversationId, newHistory);

      setMessageText("");
      setIsTyping(true);

      // Prepara el prompt para la API (ejemplo con Gemini)
      const currentHistory = [...messages, userMsg];
      const promptParts = currentHistory.map((msg) => ({
        text: msg.sender === "user" ? `User: ${msg.text}` : `Assistant: ${msg.text}`,
      }));

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCm6KBxmAH62LOkJVvzvvTU8UAfsAAK728`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: promptParts }],
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          Alert.alert("Error de API", "No se pudo obtener respuesta del modelo Gemini.");
          return;
        }

        const data = await response.json();
        const botResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (botResponseText) {
          const botMsg: Message = {
            id: String(Date.now() + 1),
            text: botResponseText.trim(),
            sender: "bot",
          };
          addMessage(conversationId, botMsg);
          await saveMessageToFirestore(conversationId, botMsg);
          const updatedHistory = [...newHistory, botMsg];
          await updateConversationHistoryInFirestore(conversationId, updatedHistory);
        } else {
          Alert.alert("Respuesta Inválida", "La API de Gemini no respondió con un mensaje válido.");
        }
      } catch (error) {
        Alert.alert("Error de Conexión", "No se pudo conectar con la API de Gemini.");
      } finally {
        setIsTyping(false);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? "#000" : "#fff" }]}>
      {conversation && (
        <View style={styles.conversationHeader}>
          <Text style={[styles.conversationTitle, { color: darkMode ? "#fff" : "#000" }]}>
            {conversation.title}
          </Text>
        </View>
      )}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.sender === "user"
                ? { backgroundColor: darkMode ? "#fff" : "#000", alignSelf: "flex-end" }
                : { backgroundColor: darkMode ? "#333" : "#f0f0f0", alignSelf: "flex-start" },
            ]}
          >
            <Text
              style={[
                styles.messageText,
                msg.sender === "user"
                  ? { color: darkMode ? "#000" : "#fff" }
                  : { color: darkMode ? "#fff" : "#000" },
              ]}
            >
              {renderFormattedText(msg.text)}
            </Text>
          </View>
        ))}
        {isTyping && (
          <View style={styles.typingIndicatorContainer}>
            <Animated.View style={[styles.dot, { backgroundColor: darkMode ? "#fff" : "#000" }]} />
            <Animated.View style={[styles.dot, { backgroundColor: darkMode ? "#fff" : "#000", marginHorizontal: 4 }]} />
            <Animated.View style={[styles.dot, { backgroundColor: darkMode ? "#fff" : "#000" }]} />
          </View>
        )}
      </ScrollView>
      <Animated.View
        style={[
          styles.inputContainer,
          {
            bottom: inputBottomAnim,
            backgroundColor: darkMode ? "#000" : "#fff",
            borderColor: darkMode ? "#fff" : "#000",
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: darkMode ? "#fff" : "#000" }]}
          placeholder="Escribe tu mensaje..."
          placeholderTextColor={darkMode ? "#ccc" : "#444"}
          value={messageText}
          onChangeText={setMessageText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: darkMode ? "#fff" : "#000" }]}
          onPress={sendMessage}
        >
          <Ionicons name="send" size={20} color={darkMode ? "#000" : "#fff"} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  conversationHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
  },
  conversationTitle: { fontSize: 18, fontWeight: "600" },
  messagesContainer: { flex: 1 },
  messagesContentContainer: { padding: 16, paddingBottom: 120 },
  messageBubble: { padding: 12, borderRadius: 8, marginBottom: 8, maxWidth: "80%" },
  messageText: { fontSize: 16 },
  inputContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 8, paddingHorizontal: 12 },
  sendButton: {
    padding: 10,
    borderRadius: 25,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 40,
    minHeight: 40,
  },
  typingIndicatorContainer: {
    flexDirection: "row",
    alignSelf: "flex-start",
    marginTop: 8,
    marginLeft: 16,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
