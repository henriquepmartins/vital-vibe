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
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";

type Nutricionista = {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  crn: string;
  created_at?: string;
};

const DashboardAdmin = () => {
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

  const handleSave = async () => {
    setSaving(true);
    setError("");
    if (!form.nome || !form.email || !form.crn || !form.senha) {
      setError("Preencha todos os campos obrigatórios.");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("nutricionistas").insert([
      {
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        crn: form.crn,
      },
    ]);
    if (error) {
      setError("Erro ao salvar nutricionista: " + error.message);
    } else {
      setForm({ nome: "", email: "", telefone: "", crn: "", senha: "" });
      fetchNutricionistas();
      Alert.alert("Sucesso", "Nutricionista cadastrado com sucesso!");
    }
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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={{ flex: 1, padding: 24 }}>
        <Text style={styles.title}>Dashboard Admin</Text>
        <Text style={styles.subtitle}>Cadastro de Nutricionistas</Text>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Novo Nutricionista</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome*"
            value={form.nome}
            onChangeText={(v) => handleChange("nome", v)}
          />
          <TextInput
            style={styles.input}
            placeholder="E-mail*"
            value={form.email}
            onChangeText={(v) => handleChange("email", v)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Telefone"
            value={form.telefone}
            onChangeText={(v) => handleChange("telefone", v)}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="CRN*"
            value={form.crn}
            onChangeText={(v) => handleChange("crn", v)}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha (opcional)"
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
                      value={editForm.nome}
                      onChangeText={(v) => handleEditChange("nome", v)}
                      placeholder="Nome*"
                    />
                    <TextInput
                      style={styles.input}
                      value={editForm.email}
                      onChangeText={(v) => handleEditChange("email", v)}
                      placeholder="E-mail*"
                      autoCapitalize="none"
                    />
                    <TextInput
                      style={styles.input}
                      value={editForm.telefone}
                      onChangeText={(v) => handleEditChange("telefone", v)}
                      placeholder="Telefone"
                    />
                    <TextInput
                      style={styles.input}
                      value={editForm.crn}
                      onChangeText={(v) => handleEditChange("crn", v)}
                      placeholder="CRN*"
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
                          style={[styles.saveButtonText, { color: "#6C584C" }]}
                        >
                          Cancelar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.nutriName}>{item.nome}</Text>
                    <Text style={styles.nutriInfo}>Email: {item.email}</Text>
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
                      <TouchableOpacity onPress={() => handleDelete(item.id)}>
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
                style={{ color: "#A98467", textAlign: "center", marginTop: 16 }}
              >
                Nenhum nutricionista cadastrado.
              </Text>
            }
          />
        )}
      </View>
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
});

export default DashboardAdmin;
