import { IconSymbol } from "@/components/ui/IconSymbol";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const SettingModal = ({
    isSetting,
    setIsSetting,
}: {
    isSetting: boolean;
    setIsSetting: (isSetting: boolean) => void;
}) => {
    const [name, setName] = useState("");
    const [intro, setIntro] = useState("");
    const resetStorage = () => {
        AsyncStorage.clear();
        setName("");
        setIntro("");
    };
    const saveStorage = () => {
        AsyncStorage.setItem("name", name);
        AsyncStorage.setItem("intro", intro);
        setIsSetting(false);
    };
    useEffect(() => {
        AsyncStorage.getItem("name").then((value) => {
            setName(value || "");
        });
        AsyncStorage.getItem("intro").then((value) => {
            setIntro(value || "");
        });
    }, []);
    return (
        <Modal animationType="fade" transparent={true} visible={isSetting} onRequestClose={() => setIsSetting(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>설정</Text>
                        <Pressable style={styles.closeButton} onPress={() => setIsSetting(false)}>
                            <IconSymbol size={22} name={"xmark"} color="gray" />
                        </Pressable>
                    </View>
                    <View style={styles.modalInfo}>
                        <View style={styles.modalInfoItem}>
                            <Text style={styles.modalInfoItemTitle}>이름</Text>
                            <TextInput style={styles.modalInput} value={name} onChangeText={setName} />
                        </View>
                        <View style={styles.modalInfoItem}>
                            <Text style={styles.modalInfoItemTitle}>소개</Text>
                            <TextInput style={styles.modalInput} value={intro} onChangeText={setIntro} />
                        </View>
                    </View>
                    <View style={styles.modalFooter}>
                        <Pressable style={[styles.modalButton, { backgroundColor: "white" }]} onPress={resetStorage}>
                            <Text style={[styles.modalButtonText, { color: "#0059c5" }]}>초기화</Text>
                        </Pressable>
                        <Pressable style={styles.modalButton} onPress={saveStorage}>
                            <Text style={styles.modalButtonText}>저장</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default SettingModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    modalInfo: {
        marginBottom: 16,
    },
    closeButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        marginTop: 10,
    },
    closeButtonText: {
        marginLeft: 8,
        color: "gray",
    },
    modalInput: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 5,
        padding: 8,
        flex: 1,
        marginLeft: 10,
    },
    modalInfoItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    modalInfoItemTitle: {
        fontSize: 14,
        color: "#666",
        fontWeight: "bold",
    },
    modalButton: {
        backgroundColor: "#0059c5",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    modalButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
});
