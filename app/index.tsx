// app/index.tsx
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../contexts/themeContext";
import * as Haptics from "expo-haptics"; // Importa expo-haptics

const { width } = Dimensions.get("window");

type Slide = {
  content: string[];
  buttonLabel: string;
};

const slides: Slide[] = [
  {
    content: [
      "Ejemplos:",
      "“Explica la computación cuántica en términos sencillos”",
      "“¿Tienes ideas creativas para el cumpleaños de un niño de 10 años?”",
      "“¿Cómo hago una petición HTTP en JavaScript?”",
    ],
    buttonLabel: "Siguiente",
  },
  {
    content: [
      "Capacidades:",
      "Recuerda lo que el usuario dijo anteriormente",
      "Permite correcciones de seguimiento",
      "Entrenado para rechazar solicitudes inapropiadas",
      "Interacciones seguras y respetuosas",
    ],
    buttonLabel: "Siguiente",
  },
  {
    content: [
      "Limitaciones:",
      "Puede producir información incorrecta ocasionalmente",
      "Puede generar instrucciones perjudiciales o contenido sesgado",
      "Conocimientos limitados sobre eventos posteriores a 2021",
    ],
    buttonLabel: "Empecemos",
  },
];

export default function IndexScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { darkMode } = useTheme();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const position = event.nativeEvent.contentOffset.x;
    const index = Math.round(position / width);
    setCurrentIndex(index);
  };

  // Se marca la función como async para usar await
  const goToNextSlide = async () => {
    // Activa feedback háptico al presionar el botón
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
    } else {
      router.push("/chat");
    }
  };

  const containerStyle = {
    ...styles.container,
    backgroundColor: darkMode ? "#000000" : "#ffffff",
  };

  const headerTextStyle = {
    color: darkMode ? "#ffffff" : "#000000",
  };

  return (
    <View style={containerStyle}>
      <View style={styles.staticHeader}>
        <Image
          source={require("../assets/images/logo.png")}
          style={{ width: 80, height: 80, marginBottom: 20 }}
        />
        <Text style={[styles.title, headerTextStyle]}>Bienvenido a ChatGPT</Text>
        <Text style={[styles.subtitle, headerTextStyle]}>
          Haz cualquier pregunta, obtén respuestas reales
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.carouselContainer}
      >
        {slides.map((slide, index) => (
          <View key={index} style={[styles.slide, { width }]}>
            <View style={styles.cardsContainer}>
              {slide.content.map((item, i) => (
                <View key={i} style={styles.bulletContainer}>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.button} onPress={goToNextSlide}>
              <Text style={styles.buttonText}>{slide.buttonLabel}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.paginationContainer}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.paginationDot,
              { opacity: i === currentIndex ? 1 : 0.3 },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  staticHeader: {
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  carouselContainer: {
    alignItems: "center",
  },
  slide: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  cardsContainer: {
    width: "100%",
    maxWidth: 500,
    marginBottom: 24,
  },
  bulletContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
  },
  bulletText: {
    fontSize: 14,
    textAlign: "center",
    color: "#000000",
  },
  button: {
    backgroundColor: "#bbbbbb",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: "#bbbbbb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  paginationContainer: {
    position: "absolute",
    bottom: 30,
    flexDirection: "row",
    alignSelf: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#000000",
    marginHorizontal: 5,
  },
});
