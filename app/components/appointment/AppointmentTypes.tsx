import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { COLORS } from "../../constants/Colors";

// Types
type AppointmentType = "initial" | "followup" | "assessment" | "consultation";

// Get appointment types
const getAppointmentTypes = (): {
  id: AppointmentType;
  label: string;
  description: string;
}[] => {
  return [
    {
      id: "initial",
      label: "Avaliação Inicial",
      description:
        "Primeira consulta para avaliação completa e definição de objetivos.",
    },
    {
      id: "followup",
      label: "Consulta de Acompanhamento",
      description: "Acompanhamento de progresso e ajustes no plano alimentar.",
    },
    {
      id: "assessment",
      label: "Avaliação Física",
      description:
        "Medições antropométricas e avaliação de composição corporal.",
    },
    {
      id: "consultation",
      label: "Orientação Nutricional",
      description: "Esclarecimento de dúvidas e orientações específicas.",
    },
  ];
};

interface AppointmentTypesProps {
  appointmentType: AppointmentType;
  handleAppointmentTypeSelect: (type: AppointmentType) => void;
}

export const AppointmentTypes = ({
  appointmentType,
  handleAppointmentTypeSelect,
}: AppointmentTypesProps) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Tipo de Consulta</Text>
      <View style={styles.appointmentTypeContainer}>
        {getAppointmentTypes().map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.appointmentTypeButton,
              appointmentType === type.id && styles.appointmentTypeButtonActive,
            ]}
            onPress={() => handleAppointmentTypeSelect(type.id)}
          >
            <Text
              style={[
                styles.appointmentTypeButtonText,
                appointmentType === type.id &&
                  styles.appointmentTypeButtonTextActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.appointmentTypeDescription}>
        {
          getAppointmentTypes().find((type) => type.id === appointmentType)
            ?.description
        }
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    margin: 20,
    marginTop: 0,
    padding: 15,
    shadowColor: COLORS.brown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.brown,
    marginBottom: 15,
  },
  appointmentTypeContainer: {
    marginBottom: 15,
  },
  appointmentTypeButton: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.lightSage,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  appointmentTypeButtonActive: {
    backgroundColor: COLORS.lightSage,
    borderColor: COLORS.sage,
  },
  appointmentTypeButtonText: {
    color: COLORS.taupe,
    fontWeight: "500",
  },
  appointmentTypeButtonTextActive: {
    color: COLORS.brown,
    fontWeight: "bold",
  },
  appointmentTypeDescription: {
    fontSize: 14,
    color: COLORS.taupe,
    fontStyle: "italic",
    marginTop: 5,
  },
});

export default AppointmentTypes;
export type { AppointmentType };
