import { StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/Colors";

export const CancellationPolicy = () => {
  return (
    <View style={styles.cancellationPolicyContainer}>
      <Ionicons name="information-circle" size={20} color={COLORS.taupe} />
      <Text style={styles.cancellationPolicyText}>
        Política de cancelamento: Cancelamentos devem ser feitos com pelo menos
        24 horas de antecedência para evitar cobranças.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cancellationPolicyContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF8E1",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  cancellationPolicyText: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.taupe,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default CancellationPolicy;
