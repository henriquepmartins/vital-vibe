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
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

const { width, height } = Dimensions.get("window");

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const formatCPF = (text: string) => {
    const numbers = text.replace(/\D/g, "");
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
        6
      )}`;
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
        6,
        9
      )}-${numbers.slice(9, 11)}`;
    }
  };

  const handleCPFChange = (text: string) => {
    const formattedCPF = formatCPF(text);
    setCpf(formattedCPF);
  };

  async function handleSignUp() {
    setLoading(true);
    setErrorMessage("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, cpf: cpf, email: email },
      },
    });
    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }
    const user = data.user;
    if (user) {
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: user.id,
          name,
          email,
          cpf: cpf.replace(/\D/g, ""),
        },
      ]);
      if (insertError) {
        setErrorMessage(insertError.message);
        setLoading(false);
        return;
      }
    }
    router.replace("/dashboard");
    setLoading(false);
  }

  return (
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
                source={require("@/assets/images/register.png")}
                style={styles.illustration}
                resizeMode="contain"
              />
            </View>
            <View style={styles.loginCard}>
              <Text style={styles.title}>Criar Conta</Text>
              <Text style={styles.subtitle}>
                Preencha seus dados para se cadastrar
              </Text>
              {errorMessage ? (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              ) : null}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nome</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome completo"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>CPF</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChangeText={handleCPFChange}
                  keyboardType="numeric"
                  maxLength={14}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Senha</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="********"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={secureTextEntry}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                  >
                    <Ionicons
                      name={secureTextEntry ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#A98467"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleSignUp}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? "Cadastrando..." : "Cadastrar"}
                </Text>
              </TouchableOpacity>
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Já tem uma conta? </Text>
                <TouchableOpacity onPress={() => router.replace("/")}>
                  <Text style={styles.registerLink}>Entrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    justifyContent: "center",
  },
  phoneContainer: {
    width: width > 500 ? 420 : "96%",
    maxWidth: 420,
    height: "auto",
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginTop: 10,
    elevation: 10,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  coloredBackground: {
    height: height * 0.22,
    width: "100%",
    backgroundColor: "#ADC178",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 8,
  },
  illustration: {
    width: width * 0.4,
    height: width * 0.65,
    bottom: 20,
  },
  loginCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 25,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6C584C",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  subtitle: {
    fontSize: 15,
    color: "#A98467",
    textAlign: "center",
    marginBottom: 22,
  },
  inputContainer: {
    marginBottom: 10,
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 15,
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
    paddingVertical: 12,
    fontSize: 16,
    color: "#6C584C",
  },
  eyeIcon: {
    position: "absolute",
    right: 0,
    top: 8,
    padding: 4,
  },
  loginButton: {
    backgroundColor: "#A98467",
    borderRadius: 18,
    paddingVertical: 15,
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
    fontSize: 18,
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
    fontSize: 14,
    marginTop: 60,
  },
  registerLink: {
    color: "#ADC178",
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
    marginTop: 60,
  },
  errorMessage: {
    color: "#ff4444",
    backgroundColor: "#ffeaea",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
  },
});
