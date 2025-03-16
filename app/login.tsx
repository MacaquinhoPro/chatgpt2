// app/login.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebaseconfig";
import { useTheme } from "../contexts/themeContext";
import * as Haptics from "expo-haptics"; // Importa Haptics para la respuesta háptica

// Función para transformar el error de Firebase en un mensaje amigable
const getFriendlyError = (error: any): string => {
  switch (error.code) {
    case "auth/invalid-email":
      return "El correo electrónico no es válido.";
    case "auth/user-not-found":
      return "No se encontró un usuario con este correo.";
    case "auth/wrong-password":
      return "La contraseña es incorrecta.";
    case "auth/too-many-requests":
      return "Demasiados intentos fallidos. Por favor, inténtalo de nuevo más tarde.";
    default:
      return "Error al iniciar sesión. Por favor, inténtalo de nuevo.";
  }
};

export default function LoginScreen() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    // Habilita la respuesta háptica al presionar el botón
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setError(""); // Limpiar error previo
    if (!email.trim() || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Redirige al usuario a la pantalla de index (ruta raíz)
      router.replace("/");
    } catch (err: any) {
      console.error(err);
      setError(getFriendlyError(err));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? "#000" : "#fff" }]}>
      <Text style={[styles.header, { color: darkMode ? "#fff" : "#000" }]}>Iniciar Sesión</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={[styles.input, { color: darkMode ? "#fff" : "#000", borderColor: darkMode ? "#fff" : "#000" }]}
        placeholder="Correo electrónico"
        placeholderTextColor={darkMode ? "#fff" : "#888"}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { color: darkMode ? "#fff" : "#000", borderColor: darkMode ? "#fff" : "#000" }]}
        placeholder="Contraseña"
        placeholderTextColor={darkMode ? "#fff" : "#888"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={{ color: darkMode ? "#fff" : "#000", marginTop: 12 }}>
          ¿No tienes cuenta? Regístrate
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  header: { fontSize: 24, marginBottom: 24 },
  input: {
    width: "80%",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    width: "80%",
    backgroundColor: "#fff", // Botón en color blanco
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { color: "#000", fontSize: 16 },
  errorText: {
    color: "#ff4d4d",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
});
