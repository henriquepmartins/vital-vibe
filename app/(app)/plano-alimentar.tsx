import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { getIconForMeal } from "../utils/icons";

const PALETTE = {
  primary: "#ADC178",
  background: "#F6F8F3",
  text: "#333333",
  accent: "#6C584C",
  inputBg: "#F8F9FA",
  border: "#E0E4D9",
  card: "#FFFFFF",
};

const FIXED_MEALS = [
  {
    type: "Café da Manhã",
    isFixed: true,
    placeholder: "Descreva as refeições e porções para o café da manhã...",
  },
  {
    type: "Almoço",
    isFixed: true,
    placeholder: "Descreva as refeições e porções para o almoço...",
  },
  {
    type: "Jantar",
    isFixed: true,
    placeholder: "Descreva as refeições e porções para o jantar...",
  },
  {
    type: "Lanches",
    isFixed: true,
    placeholder: "Descreva os lanches intermediários...",
  },
];

const { width } = Dimensions.get("window");

const PlanoAlimentar = () => {
  const router = useRouter();
  const { paciente } = useLocalSearchParams<{ paciente: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planoId, setPlanoId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [meals, setMeals] = useState<{ type: string; description: string }[]>(
    []
  );
  const [newMealType, setNewMealType] = useState("");

  useEffect(() => {
    if (!paciente) return;
    async function fetchPlano() {
      setLoading(true);
      const { data, error } = await supabase
        .from("planos_alimentares")
        .select("id, descricao, refeicoes")
        .eq("paciente_id", paciente)
        .single();
      if (data) {
        setPlanoId(data.id);
        setTitle(data.descricao || "");
        if (data.refeicoes && Array.isArray(data.refeicoes)) {
          setMeals(data.refeicoes);
        } else {
          setMeals(FIXED_MEALS.map((m) => ({ type: m.type, description: "" })));
        }
      } else {
        setMeals(FIXED_MEALS.map((m) => ({ type: m.type, description: "" })));
      }
      setLoading(false);
    }
    fetchPlano();
  }, [paciente]);

  function handleMealChange(idx: number, desc: string) {
    setMeals((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, description: desc } : m))
    );
  }

  function handleRemoveMeal(idx: number) {
    if (meals[idx]?.isFixed) return;
    setMeals((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleAddMeal() {
    if (!newMealType.trim()) return;
    const exists = meals.some(
      (m) => m.type.trim().toLowerCase() === newMealType.trim().toLowerCase()
    );
    if (exists) {
      if (typeof window !== "undefined" && window?.toast) {
        window.toast("Já existe uma refeição com esse nome.", {
          type: "error",
        });
      }
      return;
    }
    setMeals((prev) => [
      ...prev,
      { type: newMealType.trim(), description: "" },
    ]);
    setNewMealType("");
  }

  async function handleSave() {
    if (!paciente) return;
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userEmail = session?.user?.email;
      let nutricionistaId = null;
      if (userEmail) {
        const { data: nutri } = await supabase
          .from("nutricionistas")
          .select("id")
          .eq("email", userEmail)
          .single();
        nutricionistaId = nutri?.id;
      }
      const hoje = new Date().toISOString().split("T")[0];
      const upsertObj = {
        ...(planoId ? { id: planoId } : {}),
        paciente_id: paciente,
        nutricionista_id: nutricionistaId,
        descricao: title,
        refeicoes: meals,
        validade_inicio: hoje,
      };
      const { data: upsertData, error } = await supabase
        .from("planos_alimentares")
        .upsert([upsertObj]);
      if (error) {
        if (typeof window !== "undefined" && window?.toast) {
          window.toast("Erro ao salvar plano alimentar", { type: "error" });
        }
        throw error;
      }
      setPlanoId(upsertData?.[0]?.id || planoId);
      if (typeof window !== "undefined" && window?.toast) {
        window.toast("Plano alimentar salvo com sucesso!", { type: "success" });
      }
      router.back();
    } catch (err) {
      console.error("[SALVAR PLANO] Erro ao salvar:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.headerImproved}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBackBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={26} color={PALETTE.accent} />
          </TouchableOpacity>
          <Text style={styles.headerImprovedTitle}>Plano Alimentar</Text>
        </View>
        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator color={PALETTE.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.formContainer}>
            <Text style={styles.label}>Título do Plano</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Dieta para emagrecimento"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#B0B0B0"
            />
            {meals.map((meal, idx) => (
              <View key={idx} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <View style={styles.mealIcon}>
                    {getIconForMeal(meal.type)}
                  </View>
                  <Text style={styles.mealTitle}>{meal.type}</Text>
                  {idx >= FIXED_MEALS.length && (
                    <TouchableOpacity onPress={() => handleRemoveMeal(idx)}>
                      <Ionicons name="close-circle" size={20} color="#C97A7A" />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={styles.mealTextarea}
                  placeholder={
                    FIXED_MEALS[idx]?.placeholder ||
                    `Descreva as refeições para ${meal.type.toLowerCase()}...`
                  }
                  value={meal.description}
                  onChangeText={(desc) => handleMealChange(idx, desc)}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#B0B0B0"
                />
              </View>
            ))}
            <View style={styles.addMealContainer}>
              <TextInput
                style={styles.addMealInput}
                placeholder="Adicionar nova refeição (ex: Pré-treino)"
                value={newMealType}
                onChangeText={setNewMealType}
                placeholderTextColor="#B0B0B0"
              />
              <TouchableOpacity
                style={styles.addMealBtn}
                onPress={handleAddMeal}
              >
                <Ionicons name="add-circle" size={28} color={PALETTE.primary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  headerImproved: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: (StatusBar.currentHeight || 44) + 18,
    paddingBottom: 28,
    paddingHorizontal: 24,
    backgroundColor: PALETTE.card,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 10,
    position: "relative",
  },
  headerBackBtn: {
    position: "absolute",
    left: 24,
    top: (StatusBar.currentHeight || 44) + 18,
    backgroundColor: "#F6F8F3",
    borderRadius: 24,
    padding: 8,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  headerImprovedTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: width > 500 ? 28 : 22,
    fontWeight: "bold",
    color: PALETTE.text,
    letterSpacing: 0.2,
  },
  formContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    color: PALETTE.text,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 18,
  },
  input: {
    backgroundColor: PALETTE.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PALETTE.border,
    padding: 12,
    fontSize: 15,
    color: PALETTE.text,
    marginBottom: 4,
  },
  mealCard: {
    backgroundColor: PALETTE.card,
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: PALETTE.primary,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  mealIcon: {
    marginRight: 8,
    backgroundColor: "#E6EDDA",
    borderRadius: 20,
    padding: 6,
  },
  mealTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: PALETTE.accent,
    flex: 1,
  },
  mealTextarea: {
    backgroundColor: PALETTE.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PALETTE.border,
    padding: 10,
    fontSize: 15,
    color: PALETTE.text,
    minHeight: 70,
    textAlignVertical: "top",
    marginTop: 2,
  },
  addMealContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 8,
  },
  addMealInput: {
    flex: 1,
    backgroundColor: PALETTE.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PALETTE.border,
    padding: 10,
    fontSize: 15,
    color: PALETTE.text,
    marginRight: 8,
  },
  addMealBtn: {
    backgroundColor: "#F6F8F3",
    borderRadius: 20,
    padding: 2,
  },
  saveBtn: {
    backgroundColor: PALETTE.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PlanoAlimentar;
