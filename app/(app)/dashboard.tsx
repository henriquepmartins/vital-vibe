import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Stack } from "expo-router";

export default function Dashboard() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Dashboard",
          headerStyle: {
            backgroundColor: "#2E8B57",
          },
          headerTintColor: "#fff",
        }}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Dashboard</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E8B57",
    marginBottom: 20,
  },
});
