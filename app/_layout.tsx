// app/_layout.tsx
import React, { useEffect, useState } from "react";
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Text,
  ActivityIndicator
} from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemeProvider, useTheme } from "../contexts/themeContext";
import { MenuProvider, useMenu } from "../contexts/menuContext";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../utils/firebaseconfig";

const publicRoutes = ["login", "register"];

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const currentPath = segments.join("/");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && !publicRoutes.includes(currentPath)) {
        setTimeout(() => {
          router.replace("/login");
        }, 100);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [mounted, router, currentPath]);

  if (!mounted || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }
  return <>{children}</>;
}

function SideMenu() {
  const { isMenuOpen, toggleMenu, conversations, createConversation } = useMenu();
  const { darkMode } = useTheme();
  const router = useRouter();
  const slideAnim = React.useRef(new Animated.Value(-280)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isMenuOpen ? 0 : -280,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isMenuOpen, slideAnim]);

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (!isMenuOpen) return null;

  return (
    <View style={styles.sideMenuContainer}>
      <TouchableOpacity style={styles.backdrop} onPress={toggleMenu} activeOpacity={1} />
      <Animated.View
        style={[
          styles.menuContent,
          { transform: [{ translateX: slideAnim }] },
          { backgroundColor: darkMode ? "#1f1f1f" : "#fff" },
        ]}
      >
        <View style={styles.staticHeader}>
          <Text style={[styles.menuHeader, { color: darkMode ? "#fff" : "#000" }]}>
            Dashboard
          </Text>
        </View>
        <TouchableOpacity style={styles.menuItem} onPress={() => createConversation()}>
          <Ionicons name="add" size={18} color={darkMode ? "#fff" : "#000"} style={{ marginRight: 8 }} />
          <Text style={[styles.menuItemText, { color: darkMode ? "#fff" : "#000" }]}>
            Nuevo Chat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleMenu();
            router.push("/dashboard");
          }}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={darkMode ? "#fff" : "#000"} style={{ marginRight: 8 }} />
          <Text style={[styles.menuItemText, { color: darkMode ? "#fff" : "#000" }]}>
            Dashboard
          </Text>
        </TouchableOpacity>
        {conversations.map((conv) => (
          <TouchableOpacity
            key={conv.id}
            style={styles.conversationItem}
            onPress={() => {
              toggleMenu();
              router.push(`/chat?conversationId=${conv.id}`);
            }}
          >
            <Text style={[styles.menuItemText, { color: darkMode ? "#fff" : "#000" }]}>
              {conv.title}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={darkMode ? "#fff" : "#000"} />
          </TouchableOpacity>
        ))}
        <View style={styles.separator} />
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleMenu();
            router.push("/settings");
          }}
        >
          <Ionicons name="settings-outline" size={18} color={darkMode ? "#fff" : "#000"} style={{ marginRight: 8 }} />
          <Text style={[styles.menuItemText, { color: darkMode ? "#fff" : "#000" }]}>
            Settings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleMenu();
            router.push("/about");
          }}
        >
          <Ionicons name="information-circle-outline" size={18} color={darkMode ? "#fff" : "#000"} style={{ marginRight: 8 }} />
          <Text style={[styles.menuItemText, { color: darkMode ? "#fff" : "#000" }]}>
            About
          </Text>
        </TouchableOpacity>
        {/* Botón para cerrar sesión, ubicado debajo de "About" */}
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={darkMode ? "#fff" : "#000"} style={{ marginRight: 8 }} />
          <Text style={[styles.menuItemText, { color: darkMode ? "#fff" : "#000" }]}>
            Cerrar Sesión
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function AppLayout() {
  const { toggleMenu } = useMenu();
  const { darkMode, toggleDarkMode } = useTheme();
  const headerBackground = darkMode ? "#000" : "#fff";
  const headerTintColor = darkMode ? "#fff" : "#000";

  return (
    <>
      <Stack
        initialRouteName="login"
        screenOptions={{
          headerStyle: { backgroundColor: headerBackground },
          headerTintColor: headerTintColor,
          headerLeft: () => (
            <TouchableOpacity onPress={toggleMenu} style={{ marginLeft: 15 }}>
              <Ionicons name="menu-outline" size={24} color={headerTintColor} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={toggleDarkMode} style={{ marginRight: 15 }}>
              <Ionicons name="contrast-outline" size={24} color={headerTintColor} />
            </TouchableOpacity>
          ),
        }}
      >
        {/* Rutas públicas */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        {/* Rutas protegidas */}
        <Stack.Screen name="index" options={{ title: "Inicio" }} />
        <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />
        <Stack.Screen name="chat" options={{ title: "Chat" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
        <Stack.Screen name="about" options={{ title: "About" }} />
      </Stack>
      <SideMenu />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <MenuProvider>
        <AuthGate>
          <AppLayout />
        </AuthGate>
      </MenuProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sideMenuContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    zIndex: 999,
    pointerEvents: "box-none",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  menuContent: {
    width: 280,
    paddingTop: 50,
    paddingHorizontal: 16,
    zIndex: 1000,
  },
  staticHeader: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  menuHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    justifyContent: "space-between",
  },
  menuItemText: {
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#444",
    marginVertical: 10,
  },
});
