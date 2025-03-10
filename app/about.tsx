import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useTheme } from "../contexts/themeContext";

export default function AboutScreen() {
  const { darkMode } = useTheme();

  const containerStyle = {
    ...styles.container,
    backgroundColor: darkMode ? "#000" : "#fff",
  };

  const textStyle = {
    ...styles.text,
    color: darkMode ? "#fff" : "#000",
  };

  return (
    <View style={containerStyle}>
      <Text style={[styles.header, textStyle]}>Acerca de ChatGPT</Text>
      <Text style={textStyle}>
        Réplica de la interfaz móvil de ChatGPT en modo {darkMode ? "oscuro" : "claro"}.
      </Text>
      <Text style={textStyle}>Versión 1.0.0</Text>
      <TouchableOpacity onPress={() => Linking.openURL("https://openai.com")}>
        <Text style={[styles.link, textStyle]}>Más información en OpenAI</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  link: {
    fontSize: 18,
    marginTop: 16,
  },
});
