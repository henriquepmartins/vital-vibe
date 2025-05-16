import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { COLORS } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

interface Nutritionist {
  id: string;
  nome: string;
  avatar_url?: string;
}

interface NutritionistSelectorProps {
  nutricionistas: Nutritionist[];
  selectedNutri: string;
  setSelectedNutri: (id: string) => void;
}

const AVATAR_SIZE = 36;

const NutritionistAvatar = ({ avatar_url }: { avatar_url?: string }) =>
  avatar_url ? (
    <Image source={{ uri: avatar_url }} style={styles.avatar} />
  ) : (
    <View style={styles.avatarPlaceholder}>
      <Ionicons name="person" size={AVATAR_SIZE * 0.65} color="#fff" />
    </View>
  );

const NutritionistSelector = ({
  nutricionistas,
  selectedNutri,
  setSelectedNutri,
}: NutritionistSelectorProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<TextInput>(null);

  const selected = nutricionistas.find((n) => n.id === selectedNutri);

  const filtered = nutricionistas.filter((n) =>
    n.nome.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (modalVisible && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [modalVisible]);

  const handleBackdropPress = () => {
    setModalVisible(false);
    setSearch("");
  };

  const handleSelect = (id: string) => {
    setSelectedNutri(id);
    setModalVisible(false);
    setSearch("");
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Nutricionista</Text>
      <TouchableOpacity
        style={styles.selectBox}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        {selected ? (
          <View style={styles.selectedContent}>
            <NutritionistAvatar avatar_url={selected.avatar_url} />
            <Text style={styles.selectedText}>{selected.nome}</Text>
          </View>
        ) : (
          <Text style={styles.placeholderText}>Selecione um nutricionista</Text>
        )}
        <Ionicons
          name="chevron-down"
          size={22}
          color={COLORS.taupe}
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={handleBackdropPress}
      >
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContainer}>
          <View style={styles.dropdown}>
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={18}
                color={COLORS.taupe}
                style={{ marginRight: 6 }}
              />
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                placeholder="Buscar por nome"
                placeholderTextColor={COLORS.taupe + "99"}
                value={search}
                onChangeText={setSearch}
                autoFocus={Platform.OS === "web" ? false : true}
              />
            </View>
            {filtered.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Nenhum resultado encontrado
                </Text>
              </View>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 260 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleSelect(item.id)}
                  >
                    <NutritionistAvatar avatar_url={item.avatar_url} />
                    <Text style={styles.dropdownItemText}>{item.nome}</Text>
                    {selectedNutri === item.id && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={COLORS.sage}
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
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
  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lightSage,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    justifyContent: "space-between",
  },
  selectedContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.lightSage,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.taupe,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  selectedText: {
    color: COLORS.brown,
    fontSize: 16,
    fontWeight: "500",
    flexShrink: 1,
  },
  placeholderText: {
    color: COLORS.taupe,
    fontSize: 16,
    fontWeight: "400",
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  modalContainer: {
    position: "absolute",
    top: "25%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  dropdown: {
    width: "88%",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    shadowColor: COLORS.brown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 6,
    maxHeight: 340,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cream,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.brown,
    paddingVertical: 0,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginBottom: 2,
    backgroundColor: COLORS.white,
  },
  dropdownItemText: {
    color: COLORS.brown,
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 18,
  },
  emptyText: {
    color: COLORS.taupe,
    fontSize: 15,
    fontStyle: "italic",
  },
});

export default NutritionistSelector;
