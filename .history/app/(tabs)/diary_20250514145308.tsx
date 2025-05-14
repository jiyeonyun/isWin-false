import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";

const DiaryScreen = () => {
    const { event } = useLocalSearchParams();
    const [parsedEvent, setParsedEvent] = useState(null);

    useFocusEffect(
        useCallback(() => {
            // 화면에 포커스될 때 이벤트 파싱
            if (event) {
                setParsedEvent(JSON.parse(event as string));
            }

            // cleanup 함수 - 화면에서 벗어날 때 실행
            return () => {
                setParsedEvent(null);
            };
        }, [event])
    );

    return (
        <SafeAreaView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText>오늘의 직관은...</ThemedText>
            </ThemedView>
            {parsedEvent ? (
                <ThemedView style={styles.content}>
                    <ThemedText>{parsedEvent.Title}</ThemedText>
                    <ThemedText>{parsedEvent.Description}</ThemedText>
                </ThemedView>
            ) : (
                <ThemedText>일정이 없습니다.</ThemedText>
            )}
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
