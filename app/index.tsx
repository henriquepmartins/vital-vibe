"use client";

// ─── POLYFILLS FOR NODE CORE MODULES ─────────────────────────────────────────
import "react-native-get-random-values";
import { Buffer } from "buffer";
import process from "process";

if (typeof global.Buffer === "undefined") {
  // @ts-ignore
  global.Buffer = Buffer;
}
if (typeof global.process === "undefined") {
  // @ts-ignore
  global.process = process;
}
// ───────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import React from "react";
import { supabase } from "@/lib/supabase";

const { width, height } = Dimensions.get("window");

export default function LoginScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<any>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setErrorMessage("");
    if (!email || !password) {
      setErrorMessage("Preencha todos os campos.");
      return;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErrorMessage("Digite um email válido.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          setErrorMessage("Email ou senha incorretos.");
        } else {
          setErrorMessage(error.message);
        }
        return;
      }
      router.push("/dashboard");
    } catch (error) {
      setErrorMessage("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.phoneContainer}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <View style={styles.coloredBackground}>
                <Image
                  source={require("@/assets/images/login.png")}
                  style={styles.illustration}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.loginCard}>
                <Text style={styles.title}>Entrar</Text>
                <Text style={styles.subtitle}>
                  Acesse a plataforma Vital Vibe!
                </Text>
                {errorMessage ? (
                  <Text style={styles.errorMessage}>{errorMessage}</Text>
                ) : null}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="seu@email.com"
                    placeholderTextColor="#A98467"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Senha</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="********"
                      placeholderTextColor="#A98467"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={secureTextEntry}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setSecureTextEntry(!secureTextEntry)}
                    >
                      <Ionicons
                        name={
                          secureTextEntry ? "eye-outline" : "eye-off-outline"
                        }
                        size={20}
                        color="#A98467"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={styles.loginButtonText}>
                    {loading ? "Entrando..." : "Continuar"}
                  </Text>
                </TouchableOpacity>
                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>Não tem uma conta? </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/sign-up/register")}
                  >
                    <Text style={styles.registerLink}>Cadastre-se</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EAD2",
    alignItems: "center",
    justifyContent: "center",
  },
  keyboardView: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  phoneContainer: {
    width: width > 500 ? 420 : "96%",
    maxWidth: 420,
    height: "98%",
    minHeight: height * 0.8,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginTop: Platform.OS === "ios" ? 10 : 10,
    elevation: 10,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  coloredBackground: {
    height: height * 0.3,
    width: "100%",
    backgroundColor: "#ADC178",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 20 : 30,
  },
  illustration: {
    width: width * 0.65,
    height: width * 0.65,
    bottom: 28,
  },
  loginCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: width > 500 ? 35 : 25,
    paddingTop: 30,
    paddingBottom: Platform.OS === "ios" ? 40 : 50,
    flex: 1,
  },
  title: {
    fontSize: width > 500 ? 32 : 28,
    fontWeight: "bold",
    color: "#6C584C",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  subtitle: {
    fontSize: width > 500 ? 16 : 15,
    color: "#A98467",
    textAlign: "center",
    marginBottom: 22,
  },
  inputContainer: {
    marginBottom: width > 500 ? 20 : 18,
    marginTop: width > 500 ? 25 : 22,
  },
  inputLabel: {
    fontSize: width > 500 ? 16 : 15,
    color: "#6C584C",
    marginBottom: 6,
    fontWeight: "600",
  },
  passwordContainer: {
    position: "relative",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#DDE5B6",
    paddingVertical: width > 500 ? 14 : 12,
    fontSize: width > 500 ? 18 : 16,
    color: "#6C584C",
  },
  eyeIcon: {
    position: "absolute",
    right: 0,
    top: width > 500 ? 10 : 8,
    padding: 4,
  },
  loginButton: {
    backgroundColor: "#A98467",
    borderRadius: 18,
    paddingVertical: width > 500 ? 18 : 15,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 18,
    shadowColor: "#A98467",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    top: 25,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: width > 500 ? 20 : 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 6,
  },
  registerText: {
    color: "#6C584C",
    fontSize: width > 500 ? 15 : 14,
    marginTop: 60,
  },
  registerLink: {
    color: "#ADC178",
    fontSize: width > 500 ? 15 : 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
    marginTop: 60,
  },
  errorMessage: {
    color: "#ff4444",
    backgroundColor: "#ffeaea",
    borderRadius: 8,
    padding: width > 500 ? 12 : 10,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: width > 500 ? 15 : 14,
  },
});
