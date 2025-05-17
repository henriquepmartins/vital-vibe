import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

interface AppointmentContextType {
  appointmentCount: number;
  refreshAppointmentCount: () => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(
  undefined
);

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [appointmentCount, setAppointmentCount] = useState<number>(0);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchAppointmentCount = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      console.log("[AppointmentContext] userId:", userId);

      if (!userId) {
        setAppointmentCount(0);
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      console.log("[AppointmentContext] today:", today);

      const { data, error } = await supabase
        .from("appointments")
        .select("id, user_id, date")
        .eq("user_id", userId)
        .gte("date", today)
        .order("date", { ascending: true });

      console.log("[AppointmentContext] data:", data);
      console.log("[AppointmentContext] error:", error);

      if (error) {
        console.error("Erro ao buscar consultas:", error);
        setAppointmentCount(0);
        return;
      }

      setAppointmentCount(data?.length || 0);
    } catch (error) {
      console.error("Erro ao buscar consultas:", error);
      setAppointmentCount(0);
    }
  };

  useEffect(() => {
    fetchAppointmentCount();
    // Live reload com Supabase Realtime
    let sub: RealtimeChannel | null = null;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;
      sub = supabase
        .channel("public:appointments")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "appointments",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            // Só atualiza se for relevante (insert, update, delete)
            fetchAppointmentCount();
          }
        )
        .subscribe();
      setChannel(sub);
    })();
    return () => {
      if (sub) {
        supabase.removeChannel(sub);
      }
    };
  }, []);

  const refreshAppointmentCount = async () => {
    await fetchAppointmentCount();
  };

  return (
    <AppointmentContext.Provider
      value={{ appointmentCount, refreshAppointmentCount }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointment = () => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error(
      "useAppointment must be used within an AppointmentProvider"
    );
  }
  return context;
};
