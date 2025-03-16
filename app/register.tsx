// app/register.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../utils/firebaseconfig";
import { useTheme } from "../contexts/themeContext";
import * as Haptics from "expo-haptics"; // Importa Haptics para la respuesta háptica

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función para transformar el error de Firebase en un mensaje amigable para el registro
const getFriendlyRegisterError = (error: any): string => {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "Este correo electrónico ya está registrado.";
    case "auth/invalid-email":
      return "El correo electrónico no es válido.";
    case "auth/weak-password":
      return "La contraseña es demasiado débil. Debe tener al menos 6 caracteres.";
    default:
      return "Error en el registro. Por favor, inténtalo de nuevo.";
  }
};

export default function RegisterScreen() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    // Habilita la respuesta háptica al presionar el botón
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setError(""); // Limpiar error previo
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError("El correo electrónico no es válido.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      // Actualiza el perfil del usuario con el nombre
      await updateProfile(userCredential.user, { displayName: trimmedName });
      // Redirige a la pantalla de login
      router.replace("/login");
    } catch (err: any) {
      console.error(err);
      setError(getFriendlyRegisterError(err));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? "#000" : "#fff" }]}>
      <Text style={[styles.header, { color: darkMode ? "#fff" : "#000" }]}>Registrarse</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={[styles.input, { color: darkMode ? "#fff" : "#000", borderColor: darkMode ? "#fff" : "#000" }]}
        placeholder="Nombre"
        placeholderTextColor={darkMode ? "#ccc" : "#888"}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, { color: darkMode ? "#fff" : "#000", borderColor: darkMode ? "#fff" : "#000" }]}
        placeholder="Correo electrónico"
        placeholderTextColor={darkMode ? "#ccc" : "#888"}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { color: darkMode ? "#fff" : "#000", borderColor: darkMode ? "#fff" : "#000" }]}
        placeholder="Contraseña"
        placeholderTextColor={darkMode ? "#ccc" : "#888"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrar</Text>
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
