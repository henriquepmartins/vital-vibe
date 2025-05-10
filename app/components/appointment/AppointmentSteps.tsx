import { StyleSheet, View, Text, Dimensions } from "react-native";
import { COLORS } from "../../constants/Colors";
import Svg, { Path } from "react-native-svg";

interface AppointmentStepsProps {
  currentStep: number;
}

export const AppointmentSteps = ({ currentStep }: AppointmentStepsProps) => {
  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      <View>
        <Svg height={20} width={screenWidth} viewBox={`0 0 ${screenWidth} 20`}>
          <Path
            d={`M0,20 
               L0,15 
               C${screenWidth / 3},5 
               ${(2 * screenWidth) / 3},5 
               ${screenWidth},15 
               L${screenWidth},20 
               Z`}
            fill={COLORS.white}
          />
        </Svg>
      </View>

      <View style={styles.stepContainer}>
        <View style={styles.stepProgressContainer}>
          <View style={styles.stepIndicatorsContainer}>
            <View style={styles.stepIndicatorWrapper}>
              <View style={[styles.stepIndicator, styles.stepIndicatorActive]}>
                <Text style={styles.stepIndicatorText}>1</Text>
              </View>
              <Text style={styles.stepLabel}>Data e Horário</Text>
            </View>

            <View
              style={[
                styles.stepConnector,
                currentStep >= 2 && styles.stepConnectorActive,
              ]}
            />

            <View style={styles.stepIndicatorWrapper}>
              <View
                style={[
                  styles.stepIndicator,
                  currentStep >= 2 && styles.stepIndicatorActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepIndicatorText,
                    currentStep >= 2 && styles.stepIndicatorTextActive,
                  ]}
                >
                  2
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  currentStep >= 2 && styles.stepLabelActive,
                ]}
              >
                Detalhes
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 90,
  },
  stepContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightSage,
    marginBottom: 10,
    paddingTop: 5,
  },
  stepProgressContainer: {
    paddingHorizontal: 10,
  },
  stepIndicatorsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepIndicatorWrapper: {
    alignItems: "center",
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightSage,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
    elevation: 2,
    shadowColor: COLORS.brown,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  stepIndicatorActive: {
    backgroundColor: COLORS.sage,
  },
  stepIndicatorText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  stepIndicatorTextActive: {
    color: COLORS.white,
  },
  stepLabel: {
    fontSize: 12,
    color: COLORS.taupe,
    fontWeight: "500",
  },
  stepLabelActive: {
    color: COLORS.brown,
    fontWeight: "600",
  },
  stepConnector: {
    flex: 1,
    height: 3,
    backgroundColor: COLORS.lightSage,
    marginHorizontal: 10,
  },
  stepConnectorActive: {
    backgroundColor: COLORS.sage,
  },
});

export default AppointmentSteps;
