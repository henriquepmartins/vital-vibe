import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../../constants/Colors";

const { width } = Dimensions.get("window");

interface AppointmentHeaderProps {
  goBack: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const AppointmentHeader: React.FC<AppointmentHeaderProps> = ({
  goBack,
  currentStep,
  setCurrentStep,
}) => {
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else goBack();
  };

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* SafeAreaView ABSOLUTO garante topo seguro + largura total */}
      <SafeAreaView style={styles.absoluteHeader}>
        <LinearGradient
          colors={["#ADC178", "#ADC178"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color={COLORS.white} />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>Agendar Consulta</Text>
              <View style={styles.stepIndicator}>
                <View
                  style={[
                    styles.stepDot,
                    currentStep >= 1 && styles.activeStep,
                  ]}
                />
                <View
                  style={[
                    styles.stepDot,
                    currentStep >= 2 && styles.activeStep,
                  ]}
                />
                <View
                  style={[
                    styles.stepDot,
                    currentStep >= 3 && styles.activeStep,
                  ]}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons name="calendar" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCurve} />
        </LinearGradient>
      </SafeAreaView>
    </>
  );
};

export default AppointmentHeader;

const styles = StyleSheet.create({
  absoluteHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: COLORS.sage, // garante cor por trás do notch
  },
  headerGradient: {
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 40,
    // nada de paddingTop manual, SafeAreaView já cuida
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10, // espaçamento interno após SafeArea
    paddingBottom: 20, // espaçamento antes da curva
  },
  iconButton: {
    width: width > 500 ? 42 : 36,
    height: width > 500 ? 42 : 36,
    borderRadius: width > 500 ? 21 : 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 4,
  },
  activeStep: {
    backgroundColor: COLORS.white,
    width: 24,
    borderRadius: 4,
  },
  headerCurve: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: width > 500 ? 35 : 30,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});
