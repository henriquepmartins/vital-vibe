import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Alert } from "react-native";

interface HydrationContextType {
  waterProgress: number;
  totalWaterGoal: number;
  waterIntake: WaterIntake[];
  handleWaterIntake: (id: string) => Promise<void>;
  refreshHydration: () => Promise<void>;
  isLoading: boolean;
}

interface WaterIntake {
  id: string;
  time: string;
  completed: boolean;
}

const HydrationContext = createContext<HydrationContextType | undefined>(
  undefined
);

const DEFAULT_WATER_GOAL = 8;
const WATER_INTAKE_TIMES = [
  { id: "1", time: "08:00" },
  { id: "2", time: "10:00" },
  { id: "3", time: "12:00" },
  { id: "4", time: "14:00" },
  { id: "5", time: "16:00" },
  { id: "6", time: "18:00" },
  { id: "7", time: "20:00" },
  { id: "8", time: "22:00" },
];

export const HydrationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [waterProgress, setWaterProgress] = useState<number>(0);
  const [waterIntake, setWaterIntake] = useState<WaterIntake[]>([]);
  const [totalWaterGoal] = useState<number>(DEFAULT_WATER_GOAL);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchHydrationData = async () => {
    try {
      setIsLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        setIsLoading(false);
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      console.log("Buscando dados para o usuário:", userId, "na data:", today);

      const { data, error } = await supabase
        .from("hydration")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log(
            "Nenhum registro encontrado para hoje. Criando novo registro..."
          );

          const newHydrationData = {
            user_id: userId,
            date: today,
            completed_intakes: [],
            total_goal: DEFAULT_WATER_GOAL,
          };

          const { error: insertError } = await supabase
            .from("hydration")
            .insert([newHydrationData]);

          if (insertError) {
            console.error("Erro ao criar registro de hidratação:", insertError);
            Alert.alert(
              "Erro",
              "Não foi possível criar o registro de hidratação. Por favor, tente novamente."
            );
            return;
          }

          console.log("Novo registro de hidratação criado com sucesso");
          setWaterProgress(0);
          setWaterIntake(
            WATER_INTAKE_TIMES.map((item) => ({ ...item, completed: false }))
          );
        } else {
          console.error("Erro ao buscar dados de hidratação:", error);
        }
        return;
      }

      console.log("Dados de hidratação encontrados:", data);

      setWaterProgress(data.completed_intakes.length);
      setWaterIntake(
        WATER_INTAKE_TIMES.map((item) => ({
          ...item,
          completed: data.completed_intakes.includes(item.id),
        }))
      );
    } catch (error) {
      console.error("Erro inesperado ao buscar dados de hidratação:", error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro inesperado. Por favor, tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHydrationData();
  }, []);

  const handleWaterIntake = async (id: string) => {
    try {
      setIsLoading(true);
      console.log("Atualizando consumo de água para o copo:", id);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        console.error("Usuário não autenticado (hydration update)");
        setIsLoading(false);
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const currentIntake = waterIntake.find((item) => item.id === id);

      if (!currentIntake) {
        console.error("Copo não encontrado:", id);
        return;
      }

      const newCompletedIntakes = currentIntake.completed
        ? waterIntake
            .filter((item) => item.completed && item.id !== id)
            .map((item) => item.id)
        : [
            ...waterIntake
              .filter((item) => item.completed)
              .map((item) => item.id),
            id,
          ];

      console.log("Atualizando intakes completados:", newCompletedIntakes);

      const { error } = await supabase
        .from("hydration")
        .update({ completed_intakes: newCompletedIntakes })
        .eq("user_id", userId)
        .eq("date", today);

      if (error) {
        console.error("Erro ao atualizar hidratação:", error);
        Alert.alert(
          "Erro",
          "Não foi possível atualizar o consumo de água. Por favor, tente novamente."
        );
        return;
      }

      console.log("Consumo de água atualizado com sucesso");

      setWaterIntake(
        waterIntake.map((item) => ({
          ...item,
          completed: newCompletedIntakes.includes(item.id),
        }))
      );
      setWaterProgress(newCompletedIntakes.length);
    } catch (error) {
      console.error("Erro inesperado ao atualizar hidratação:", error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro inesperado. Por favor, tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const refreshHydration = async () => {
    await fetchHydrationData();
  };

  return (
    <HydrationContext.Provider
      value={{
        waterProgress,
        totalWaterGoal,
        waterIntake,
        handleWaterIntake,
        refreshHydration,
        isLoading,
      }}
    >
      {children}
    </HydrationContext.Provider>
  );
};

export const useHydration = () => {
  const context = useContext(HydrationContext);
  if (context === undefined) {
    throw new Error("useHydration must be used within a HydrationProvider");
  }
  return context;
};
