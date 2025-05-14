import React from "react";
import { Modal, StyleSheet, Text } from "react-native";

const SettingModal = () => {
    return (
        <Modal animationType="fade" transparent={true} visible={true} onRequestClose={() => {}}>
            <Text>설정모달임</Text>
        </Modal>
    );
};

export default SettingModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
});
