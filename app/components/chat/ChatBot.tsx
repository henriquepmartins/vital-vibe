import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useChat } from "../../contexts/ChatContext";
import { useUser } from "../../contexts/UserContext";
import { useHydration } from "../../contexts/HydrationContext";
import { useAppointment } from "../../contexts/AppointmentContext";
import Markdown from "react-native-markdown-display";

interface ChatBotProps {
  open?: boolean;
  onClose?: () => void;
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export const ChatBot: React.FC<ChatBotProps> = ({ open, onClose }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const drawerAnimation = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { appointmentInfo } = useChat();
  const { user } = useUser();
  const { waterProgress, totalWaterGoal } = useHydration();
  const { appointmentCount } = useAppointment();

  const windowHeight = Dimensions.get("window").height;
  const drawerHeight = windowHeight * 0.7;

  // Limpa o histórico do chat ao trocar de usuário
  useEffect(() => {
    setMessages([
      {
        id: Date.now().toString(),
        text: "Olá! Bem-vindo ao suporte da clínica. Como posso te ajudar hoje?",
        isBot: true,
        timestamp: new Date(),
      },
    ]);
  }, [user?.id]);

  // Sincroniza o estado interno com a prop 'open'
  useEffect(() => {
    if (typeof open === 'boolean') {
      setIsDrawerOpen(open);
      if (open) {
        Animated.spring(drawerAnimation, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }).start();
      } else {
        Animated.spring(drawerAnimation, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }).start();
      }
    }
  }, [open]);

  const toggleDrawer = () => {
    const toValue = isDrawerOpen ? 0 : 1;
    Animated.spring(drawerAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
    setIsDrawerOpen(!isDrawerOpen);
    if (isDrawerOpen && onClose) {
      onClose();
    }
  };

  const handleNewConversation = () => {
    Alert.alert(
      "Nova conversa",
      "Tem certeza que deseja iniciar uma nova conversa? O histórico será apagado.",
      [
        {
          text: "Cancelar",
          style: "destructive",
        },
        {
          text: "Iniciar",
          style: "default",
          onPress: () => {
            setMessages([
              {
                id: Date.now().toString(),
                text: "Olá! Bem-vindo ao suporte da clínica. Como posso te ajudar hoje?",
                isBot: true,
                timestamp: new Date(),
              },
            ]);
            setInputText("");
            setLoading(false);
          },
        },
      ]
    );
  };

  const getSystemPrompt = () => {
    let prompt =
      "Você é um assistente de uma clínica de nutrição. Responda de forma simpática, clara e útil, lembrando o contexto da conversa.";

    // Dados do usuário
    if (user) {
      prompt += `\nInformações do usuário:\n`;
      prompt += `- Nome: ${user.name || "-"}\n`;
      if (user.birthdate) {
        const birthYear = Number(user.birthdate.split("-")[0]);
        const age = !isNaN(birthYear)
          ? new Date().getFullYear() - birthYear
          : "-";
        prompt += `- Idade: ${age}\n`;
      }
      if (user.weight) prompt += `- Peso: ${user.weight} kg\n`;
      if (user.height) prompt += `- Altura: ${user.height} cm\n`;
      if (user.phone) prompt += `- Telefone: ${user.phone}\n`;
    }

    // Dados de hidratação
    prompt += `- Copos de água bebidos hoje: ${waterProgress} de ${totalWaterGoal}\n`;

    // Total de consultas agendadas
    prompt += `- Consultas agendadas: ${appointmentCount}\n`;

    // Dados de agendamento
    if (appointmentInfo.patientName) {
      prompt += `\nInformações do agendamento atual:\n`;
      prompt += `- Paciente: ${appointmentInfo.patientName}\n`;
      if (appointmentInfo.appointmentType) {
        prompt += `- Tipo de atendimento: ${appointmentInfo.appointmentType}\n`;
      }
      if (appointmentInfo.appointmentDate) {
        prompt += `- Data: ${appointmentInfo.appointmentDate.toLocaleDateString()}\n`;
      }
      if (appointmentInfo.appointmentTime) {
        prompt += `- Horário: ${appointmentInfo.appointmentTime}\n`;
      }
      if (appointmentInfo.phoneNumber) {
        prompt += `- Telefone: ${appointmentInfo.phoneNumber}\n`;
      }
    }

    return prompt;
  };

  const sendMessage = async () => {
    if (inputText.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        isBot: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputText("");
      setLoading(true);
      try {
        const history = [
          {
            role: "system",
            content: getSystemPrompt(),
          },
          ...messages.map((msg) => ({
            role: msg.isBot ? "assistant" : "user",
            content: msg.text,
          })),
          { role: "user", content: userMessage.text },
        ];

        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
              model: "meta-llama/llama-4-maverick:free",
              messages: history,
              max_tokens: 1000,
              temperature: 0.7,
              top_p: 0.9,
              frequency_penalty: 0.3,
              presence_penalty: 0.3,
              n: 1,
            }),
          }
        );

        if (!response.ok) throw new Error("Erro ao comunicar com o chatbot");

        const data = await response.json();
        const botText =
          data.choices?.[0]?.message?.content?.trim() ||
          "Desculpe, não consegui gerar uma resposta.";

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: botText,
          isBot: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            text: "Erro ao comunicar com o chatbot.",
            isBot: true,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const translateY = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [drawerHeight, 0],
  });

  return (
    <>
      {/* Chat Button */}
      <TouchableOpacity
        style={[styles.chatButton, { bottom: insets.bottom + 20 }]}
        onPress={() => {
          setIsDrawerOpen(true);
          Animated.spring(drawerAnimation, {
            toValue: 1,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="white" />
      </TouchableOpacity>

      {/* Chat Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateY }],
            height: drawerHeight,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Chat da Clínica</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={handleNewConversation}
              style={{ marginRight: 12 }}
            >
              <Ionicons name="add" size={26} color="#ADC178" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleDrawer}>
              <Ionicons name="close" size={24} color="#333333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isBot ? styles.botMessage : styles.userMessage,
              ]}
            >
              {message.isBot ? (
                <Markdown
                  style={{
                    body: [styles.messageText, styles.botMessageText],
                    strong: { fontWeight: "bold" },
                    em: { fontStyle: "italic" },
                    heading1: { fontSize: 22, fontWeight: "bold" },
                    heading2: { fontSize: 18, fontWeight: "bold" },
                  }}
                >
                  {message.text}
                </Markdown>
              ) : (
                <Text style={[styles.messageText, styles.userMessageText]}>
                  {message.text}
                </Text>
              )}
              <Text
                style={[
                  styles.timestamp,
                  message.isBot ? styles.botTimestamp : styles.userTimestamp,
                ]}
              >
                {message.timestamp.toLocaleTimeString().slice(0, 5)}
              </Text>
            </View>
          ))}
          {loading && (
            <View style={{ alignItems: "center", marginVertical: 8 }}>
              <Text style={{ color: "#ADC178" }}>
                O assistente está digitando...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
          style={styles.inputContainer}
        >
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#666666"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={24}
              color={inputText.trim() ? "#ADC178" : "#A0A0A0"}
            />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  chatButton: {
    position: "absolute",
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ADC178",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  botMessage: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  userMessage: {
    backgroundColor: "#ADC178",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  botMessageText: {
    color: "#333333",
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  botTimestamp: {
    color: "#666666",
  },
  userTimestamp: {
    color: "#FFFFFF",
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
    marginBottom: 46,
  },
  input: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
    color: "#333333",
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 44,
    height: 44,
  },
});
