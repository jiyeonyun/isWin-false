import { IconSymbol } from "@/components/ui/IconSymbol";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

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
                    <Text style={styles.modalTitle}>설정</Text>
                    <Text style={styles.modalInfo}>설정 내용</Text>
                    <Pressable style={styles.closeButton} onPress={() => setIsSetting(false)}>
                        <IconSymbol size={22} name={"xmark"} color="gray" />
                        <Text style={styles.closeButtonText}>닫기</Text>
                    </Pressable>
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
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
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
});
