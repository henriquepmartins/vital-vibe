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
  Alert,
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
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
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

  function formatBirthdateInput(text: string) {
    let cleaned = text.replace(/\D/g, "");
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);
    let formatted = cleaned;
    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(
        2,
        4
      )}/${cleaned.slice(4)}`;
    } else if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return formatted;
  }

  function formatPhoneInput(text: string) {
    let cleaned = text.replace(/\D/g, "");
    if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 7)
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    if (cleaned.length <= 11)
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(
        7
      )}`;
    return text;
  }

  function formatBirthdateToISO(date: string) {
    const [day, month, year] = date.split("/");
    if (day && month && year) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return null;
  }

  async function handleSignUp() {
    setErrorMessage("");

    if (
      !name ||
      !email ||
      !cpf ||
      !phone ||
      !birthdate ||
      !height ||
      !weight ||
      !password
    ) {
      setErrorMessage("Preencha todos os campos.");
      return;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErrorMessage("Digite um email válido.");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name,
            cpf: cpf,
            phone: phone,
            weight: weight,
            height: height,
            birthdate: formatBirthdateToISO(birthdate),
            avatar_url: avatarUrl,
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          setErrorMessage("Email ou senha incorretos.");
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (!session) {
        Alert.alert(
          "Verificação de Email",
          "Por favor, verifique seu email para confirmar o cadastro!"
        );
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setErrorMessage("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.phoneContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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
                  placeholderTextColor="#A98467"
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
                  placeholderTextColor="#A98467"
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
                  placeholderTextColor="#A98467"
                  value={cpf}
                  onChangeText={handleCPFChange}
                  keyboardType="numeric"
                  maxLength={14}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Telefone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor="#A98467"
                  value={phone}
                  onChangeText={(text) => setPhone(formatPhoneInput(text))}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Data de Nascimento</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#A98467"
                  value={birthdate}
                  onChangeText={(text) =>
                    setBirthdate(formatBirthdateInput(text))
                  }
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Altura (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 170"
                  placeholderTextColor="#A98467"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Peso (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 70"
                  placeholderTextColor="#A98467"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
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
              <TouchableOpacity
                style={styles.restritoButton}
                onPress={() => router.push("/admin/login")}
              >
                <Text style={styles.restritoButtonText}>Restrito</Text>
              </TouchableOpacity>
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
    height: "98%",
    minHeight: height * 0.8,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginTop: Platform.OS === "ios" ? 10 : 20,
    elevation: 10,
    flex: 1,
    bottom: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  coloredBackground: {
    height: height * 0.25,
    width: "100%",
    backgroundColor: "#ADC178",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 8 : 16,
  },
  illustration: {
    width: width * 0.6,
    height: width * 0.65,
    bottom: 20,
  },
  loginCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: width > 500 ? 35 : 25,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 16 : 24,
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
    marginBottom: width > 500 ? 15 : 10,
    marginTop: width > 500 ? 15 : 10,
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
  restritoButton: {
    marginTop: 16,
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: "#E1E1E1",
  },
  restritoButtonText: {
    color: "#6C584C",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
