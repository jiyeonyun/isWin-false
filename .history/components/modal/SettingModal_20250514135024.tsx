import { IconSymbol } from "@/components/ui/IconSymbol";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const SettingModal = ({
    isSetting,
    setIsSetting,
}: {
    isSetting: boolean;
    setIsSetting: (isSetting: boolean) => void;
}) => {
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
                            <TextInput style={styles.modalInput} />
                        </View>
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
        borderColor: "gray",
        borderRadius: 5,
        padding: 5,
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
        fontWeight: "bold",
    },
});
