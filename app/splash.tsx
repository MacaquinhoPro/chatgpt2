import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack initialRouteName="splash">
      <Stack.Screen
        name="splash"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="home"
        options={{
          title: "ChatGPT",
          headerStyle: { backgroundColor: "#343541" },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="chat"
        options={{
          title: "Chat",
          headerStyle: { backgroundColor: "#343541" },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Configuración",
          headerStyle: { backgroundColor: "#343541" },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          title: "Acerca de",
          headerStyle: { backgroundColor: "#343541" },
          headerTintColor: "#fff",
        }}
      />
    </Stack>
  );
}
