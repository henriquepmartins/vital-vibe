import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Nutricionista = {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  crn: string;
  created_at?: string;
};

const DashboardAdmin = () => {
  const router = useRouter();
  const [nutricionistas, setNutricionistas] = useState<Nutricionista[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    crn: "",
    senha: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    crn: "",
  });

  const fetchNutricionistas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("nutricionistas")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setError("Erro ao buscar nutricionistas.");
      setNutricionistas([]);
    } else {
      setNutricionistas((data as Nutricionista[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNutricionistas();
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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

  function formatCRNInput(text: string) {
    return text.replace(/\D/g, "").slice(0, 5);
  }

  const handleSave = async () => {
    setSaving(true);
    setError("");
    if (!form.nome || !form.email || !form.crn || !form.senha) {
      setError("Preencha todos os campos obrigatórios.");
      setSaving(false);
      return;
    }
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: form.email,
        password: form.senha,
        options: {
          data: {
            name: form.nome,
            crn: form.crn,
            telefone: form.telefone,
          },
        },
      }
    );
    if (signUpError) {
      setError("Erro ao criar usuário no Auth: " + signUpError.message);
      setSaving(false);
      return;
    }
    const userId = signUpData?.user?.id;
    if (!userId) {
      setError("Não foi possível obter o user_id do Auth.");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("nutricionistas").insert([
      {
        user_id: userId,
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        crn: form.crn,
      },
    ]);
    if (error) {
      setError("Erro ao salvar nutricionista: " + error.message);
      setSaving(false);
      return;
    }
    setForm({ nome: "", email: "", telefone: "", crn: "", senha: "" });
    fetchNutricionistas();
    Alert.alert("Sucesso", "Nutricionista cadastrado com sucesso!");
    setSaving(false);
  };

  const startEdit = (nutri: Nutricionista) => {
    setEditingId(nutri.id);
    setEditForm({
      nome: nutri.nome,
      email: nutri.email,
      telefone: nutri.telefone || "",
      crn: nutri.crn,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ nome: "", email: "", telefone: "", crn: "" });
  };

  const handleEditChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!editForm.nome || !editForm.email || !editForm.crn) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    const { error } = await supabase
      .from("nutricionistas")
      .update({
        nome: editForm.nome,
        email: editForm.email,
        telefone: editForm.telefone,
        crn: editForm.crn,
      })
      .eq("id", editingId!);
    if (error) {
      setError("Erro ao atualizar: " + error.message);
    } else {
      setEditingId(null);
      setEditForm({ nome: "", email: "", telefone: "", crn: "" });
      fetchNutricionistas();
      Alert.alert("Sucesso", "Nutricionista atualizado com sucesso!");
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Confirmação", "Deseja realmente excluir este nutricionista?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("nutricionistas")
            .delete()
            .eq("id", id);
          if (error) {
            setError("Erro ao excluir: " + error.message);
          } else {
            fetchNutricionistas();
            Alert.alert("Sucesso", "Nutricionista excluído!");
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F0EAD2" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 24}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            flex: 1,
            padding: 24,
            justifyContent: "flex-start",
            alignItems: "center",
            paddingTop: 56,
          }}
        >
          <View style={{ width: "100%", maxWidth: 500 }}>
            <TouchableOpacity
              style={{
                marginTop: 16,
                marginBottom: 8,
                alignSelf: "flex-start",
                height: 28,
                justifyContent: "center",
              }}
              onPress={() => router.push("/(auth)/sign-up/register")}
            >
              <Ionicons name="arrow-back" size={20} color="#6C584C" />
            </TouchableOpacity>
            <Text style={styles.title}>Cadastro de Nutricionistas</Text>
            <Text style={styles.subtitle}>
              Preencha os dados para cadastrar um novo nutricionista
            </Text>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Novo Nutricionista</Text>
              <Text style={styles.inputLabel}>Nome</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome*"
                placeholderTextColor="#A9A9A9"
                value={form.nome}
                onChangeText={(v) => handleChange("nome", v)}
              />
              <Text style={styles.inputLabel}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="E-mail*"
                placeholderTextColor="#A9A9A9"
                value={form.email}
                onChangeText={(v) => handleChange("email", v)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Text style={styles.inputLabel}>Telefone</Text>
              <TextInput
                style={styles.input}
                placeholder="Telefone"
                placeholderTextColor="#A9A9A9"
                value={form.telefone}
                onChangeText={(v) =>
                  handleChange("telefone", formatPhoneInput(v))
                }
                keyboardType="phone-pad"
                maxLength={15}
              />
              <Text style={styles.inputLabel}>CRN</Text>
              <TextInput
                style={styles.input}
                placeholder="CRN*"
                placeholderTextColor="#A9A9A9"
                value={form.crn}
                onChangeText={(v) => handleChange("crn", formatCRNInput(v))}
                keyboardType="numeric"
                maxLength={5}
              />
              <Text style={styles.inputLabel}>Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Senha*"
                placeholderTextColor="#A9A9A9"
                value={form.senha}
                onChangeText={(v) => handleChange("senha", v)}
                secureTextEntry
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.listTitle}>Nutricionistas Cadastrados</Text>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#A98467"
                style={{ marginTop: 24 }}
              />
            ) : (
              <FlatList
                data={nutricionistas}
                keyExtractor={(item) => item.id}
                style={{ marginTop: 12 }}
                renderItem={({ item }) => (
                  <View style={styles.nutriCard}>
                    {editingId === item.id ? (
                      <>
                        <TextInput
                          style={styles.input}
                          placeholder="Nome*"
                          placeholderTextColor="#A9A9A9"
                          value={editForm.nome}
                          onChangeText={(v) => handleEditChange("nome", v)}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="E-mail*"
                          placeholderTextColor="#A9A9A9"
                          value={editForm.email}
                          onChangeText={(v) => handleEditChange("email", v)}
                          autoCapitalize="none"
                        />
                        <Text style={styles.inputLabel}>Telefone</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Telefone"
                          placeholderTextColor="#A9A9A9"
                          value={editForm.telefone}
                          onChangeText={(v) =>
                            handleEditChange("telefone", formatPhoneInput(v))
                          }
                          keyboardType="phone-pad"
                          maxLength={15}
                        />
                        <Text style={styles.inputLabel}>CRN</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="CRN*"
                          placeholderTextColor="#A9A9A9"
                          value={editForm.crn}
                          onChangeText={(v) =>
                            handleEditChange("crn", formatCRNInput(v))
                          }
                          keyboardType="numeric"
                          maxLength={5}
                        />
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "flex-end",
                            marginTop: 8,
                          }}
                        >
                          <TouchableOpacity
                            style={[
                              styles.saveButton,
                              { marginRight: 8, backgroundColor: "#ADC178" },
                            ]}
                            onPress={handleUpdate}
                          >
                            <Text style={styles.saveButtonText}>Salvar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.saveButton,
                              { backgroundColor: "#E1E1E1" },
                            ]}
                            onPress={cancelEdit}
                          >
                            <Text
                              style={[
                                styles.saveButtonText,
                                { color: "#6C584C" },
                              ]}
                            >
                              Cancelar
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <>
                        <Text style={styles.nutriName}>{item.nome}</Text>
                        <Text style={styles.nutriInfo}>
                          Email: {item.email}
                        </Text>
                        <Text style={styles.nutriInfo}>
                          Telefone: {item.telefone || "-"}
                        </Text>
                        <Text style={styles.nutriInfo}>CRN: {item.crn}</Text>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "flex-end",
                            marginTop: 8,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => startEdit(item)}
                            style={{ marginRight: 12 }}
                          >
                            <Ionicons
                              name="create-outline"
                              size={22}
                              color="#A98467"
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDelete(item.id)}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={22}
                              color="#ff4444"
                            />
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                )}
                ListEmptyComponent={
                  <Text
                    style={{
                      color: "#A98467",
                      textAlign: "center",
                      marginTop: 16,
                    }}
                  >
                    Nenhum nutricionista cadastrado.
                  </Text>
                }
                contentContainerStyle={{ paddingBottom: 40 }}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6C584C",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#A98467",
    textAlign: "center",
    marginBottom: 18,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6C584C",
    marginBottom: 12,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#DDE5B6",
    paddingVertical: 12,
    fontSize: 16,
    color: "#6C584C",
    marginBottom: 14,
  },
  saveButton: {
    backgroundColor: "#A98467",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 2,
    padding: 10,
  },
  error: {
    color: "red",
    marginBottom: 8,
    fontSize: 14,
    textAlign: "center",
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6C584C",
    marginBottom: 8,
    marginTop: 8,
  },
  nutriCard: {
    backgroundColor: "#F0EAD2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  nutriName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6C584C",
    marginBottom: 2,
  },
  nutriInfo: {
    fontSize: 14,
    color: "#A98467",
    marginBottom: 1,
  },
  inputLabel: {
    fontSize: 15,
    color: "#6C584C",
    marginBottom: 6,
    fontWeight: "600",
  },
});

export default DashboardAdmin;
