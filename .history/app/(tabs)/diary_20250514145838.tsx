import { useLocalSearchParams, usePathname } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";

const DiaryScreen = () => {
    const { event } = useLocalSearchParams();
    const pathname = usePathname();
    const [parsedEvent, setParsedEvent] = useState<any>(null);

    return (
        <SafeAreaView style={styles.container}>
            {/* <ThemedView style={styles.header}>
                <ThemedText>오늘의 직관은...</ThemedText>
            </ThemedView>
            {parsedEvent ? (
                <ThemedView style={styles.content}>
                    <ThemedText>{parsedEvent.Title}</ThemedText>
                    <ThemedText>{parsedEvent.Description}</ThemedText>
                </ThemedView>
            ) : (
                <ThemedText>일정이 없습니다.</ThemedText>
            )} */}
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
    content: {
        padding: 16,
    },
});
export default DiaryScreen;
