import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";

const DiaryScreen = () => {
    const { event } = useLocalSearchParams();
    const parsedEvent = event ? JSON.parse(event as string) : null;
    console.log(parsedEvent);
    return (
        <SafeAreaView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">{parsedEvent.Title}</ThemedText>
                <ThemedText>{parsedEvent.Location}</ThemedText>
                <ThemedText>{parsedEvent.Date}</ThemedText>
                <ThemedText>{parsedEvent.Time}</ThemedText>
                <ThemedText>{parsedEvent.Description}</ThemedText>
            </ThemedView>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
});
export default DiaryScreen;
