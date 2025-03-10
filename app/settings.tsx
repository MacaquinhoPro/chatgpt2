// app/settings.tsx
import React from "react";
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/themeContext";

export default function SettingsScreen() {
  const { darkMode, toggleDarkMode } = useTheme();

  const containerStyle = {
    ...styles.container,
    backgroundColor: darkMode ? "#000000" : "#fff",
  };

  const textStyle = {
    ...styles.settingText,
    color: darkMode ? "#fff" : "#000",
  };

  return (
    <ScrollView contentContainerStyle={containerStyle}>
      <Text style={[styles.header, { color: darkMode ? "#fff" : "#000" }]}>
        Configuración
      </Text>
      <View style={styles.settingItem}>
        <Text style={textStyle}>Modo Oscuro</Text>
        <Switch 
          value={darkMode} 
          onValueChange={toggleDarkMode} 
          thumbColor={darkMode ? "#ffffff" : "#000000"}
          trackColor={{ false: "#767577", true: "#cad7de" }}
        />
      </View>
      {/* Otras opciones */}
      <TouchableOpacity style={styles.settingItem}>
        <Text style={textStyle}>Cuenta</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem}>
        <Text style={textStyle}>Notificaciones</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem}>
        <Text style={textStyle}>Privacidad</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem}>
        <Text style={textStyle}>Ayuda</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  settingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#4e5661",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingText: {
    fontSize: 18,
  },
});
