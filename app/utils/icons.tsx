import React from "react";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

export function getIconForMeal(type: string) {
  switch (type.toLowerCase()) {
    case "café da manhã":
      return <Ionicons name="sunny-outline" size={22} color="#ADC178" />;
    case "almoço":
      return <MaterialIcons name="lunch-dining" size={22} color="#ADC178" />;
    case "jantar":
      return (
        <MaterialCommunityIcons name="food-variant" size={22} color="#ADC178" />
      );
    case "lanches":
      return <Ionicons name="fast-food-outline" size={22} color="#ADC178" />;
    default:
      return <Ionicons name="add-circle-outline" size={22} color="#ADC178" />;
  }
}

export const CutleryIcon = React.memo(() => (
  <Ionicons name="restaurant-outline" size={32} color="#ADC178" />
));
