// app/dashboard.tsx
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../contexts/themeContext";
import { useMenu, Conversation } from "../contexts/menuContext";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore/lite";
import { db, auth } from "../utils/firebaseconfig";

export default function Dashboard() {
  const { darkMode } = useTheme();
  const { updateConversationHistory } = useMenu();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const loadConversations = async () => {
      if (currentUser) {
        try {
          const convRef = collection(db, "conversations");
          const convQuery = query(
            convRef,
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "asc")
          );
          const convSnapshot = await getDocs(convQuery);
          const loadedConvs: Conversation[] = convSnapshot.docs.map((doc) => ({
            id: doc.id,
            title: (doc.data() as any).title || "Sin título",
          }));
          setConversations(loadedConvs);

          // Recupera historial para cada conversación
          loadedConvs.forEach(async (conv) => {
            try {
              const messagesRef = collection(db, "conversations", conv.id, "messages");
              const q = query(messagesRef, orderBy("createdAt", "asc"));
              const msgSnapshot = await getDocs(q);
              const loadedMessages = msgSnapshot.docs.map((msgDoc) => {
                const data = msgDoc.data();
                return {
                  id: msgDoc.id,
                  text: data.text,
                  sender: data.sender,
                };
              });
              updateConversationHistory(conv.id, loadedMessages);
            } catch (err) {
              console.error(`Error al recuperar mensajes para la conversación ${conv.id}:`, err);
            }
          });
        } catch (error: any) {
          console.error("Error cargando conversaciones:", error);
          if (error.code === "failed-precondition") {
            setErrorMessage("Esta consulta requiere un índice. Por favor, crea el índice en la consola de Firebase usando el enlace indicado en el error.");
          } else {
            setErrorMessage("Error cargando conversaciones. Por favor, inténtalo de nuevo.");
          }
        }
      }
    };

    loadConversations();
  }, [currentUser]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: darkMode ? "#000" : "#fff" }]}>
      <Text style={[styles.header, { color: darkMode ? "#fff" : "#000" }]}>Tus Conversaciones</Text>
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      {conversations.length > 0 ? (
        conversations.map((conv) => (
          <TouchableOpacity
            key={conv.id}
            style={[styles.conversationItem, { backgroundColor: darkMode ? "#333" : "#f0f0f0" }]}
            onPress={() => router.push(`/chat?conversationId=${conv.id}`)}
          >
            <Text style={[styles.conversationTitle, { color: darkMode ? "#fff" : "#000" }]}>{conv.title}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={[styles.noConversations, { color: darkMode ? "#ccc" : "#888" }]}>
          No hay conversaciones aún.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  conversationItem: { padding: 12, borderRadius: 8, marginBottom: 12 },
  conversationTitle: { fontSize: 18, fontWeight: "600" },
  noConversations: { fontSize: 16, fontStyle: "italic", textAlign: "center" },
  errorText: { color: "#ff4d4d", fontSize: 14, marginBottom: 16, textAlign: "center" },
});
