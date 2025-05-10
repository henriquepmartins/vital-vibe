import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/Colors";

interface StepButtonsProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  disableNext?: boolean;
  onConfirm?: () => void;
}

export const StepButtons = ({
  currentStep,
  setCurrentStep,
  disableNext = false,
  onConfirm,
}: StepButtonsProps) => {
  // First step: Continue button
  if (currentStep === 1) {
    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.nextButton, disableNext && styles.nextButtonDisabled]}
          onPress={() => setCurrentStep(2)}
          disabled={disableNext}
        >
          <Text style={styles.nextButtonText}>Continuar</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    );
  }

  // Second step: Back and Confirm buttons
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentStep(1)}
      >
        <Ionicons name="arrow-back" size={20} color={COLORS.taupe} />
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
        <Text style={styles.confirmButtonText}>Confirmar Agendamento</Text>
        <Ionicons name="checkmark" size={20} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: COLORS.sage,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    shadowColor: COLORS.taupe,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  nextButtonDisabled: {
    backgroundColor: "#CCCCCC",
    shadowOpacity: 0,
  },
  nextButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 10,
  },
  backButton: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.taupe,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    flex: 0.4,
  },
  backButtonText: {
    color: COLORS.taupe,
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  confirmButton: {
    backgroundColor: COLORS.sage,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flex: 0.6,
    shadowColor: COLORS.taupe,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 10,
  },
});

export default StepButtons;
