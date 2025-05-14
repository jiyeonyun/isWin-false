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
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>설정</Text>
                <Text style={styles.modalInfo}>설정 내용</Text>
                <Pressable style={styles.closeButton} onPress={() => setIsSetting(false)}>
                    <IconSymbol size={22} name={"xmark"} color="black" />
                    <Text style={styles.closeButtonText}>닫기</Text>
                </Pressable>
            </View>
        </Modal>
    );
};

export default SettingModal;

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 24,
        width: "90%",
        maxWidth: 400,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: "center",
    },
    modalInfo: {
        marginBottom: 16,
    },
    closeButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    closeButtonText: {
        color: "white",
        textAlign: "center",
        fontWeight: "bold",
    },
});
