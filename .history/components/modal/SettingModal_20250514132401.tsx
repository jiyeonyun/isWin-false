import React from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";

const SettingModal = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Text>설정모달임</Text>
        </SafeAreaView>
    );
};

export default SettingModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
});
