import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";

const DiaryScreen = () => {
    const { event } = useLocalSearchParams();
    const [parsedEvent, setParsedEvent] = useState<any>(null);
    const navigation = useNavigation();

    useFocusEffect(
        useCallback(() => {
            // 화면에 포커스될 때 실행
            if (event) {
                setParsedEvent(JSON.parse(event as string));
            }

            // 화면에서 포커스가 벗어날 때 실행
            return () => {
                setParsedEvent(null);
                // URL 파라미터도 초기화
                router.setParams({});
            };
        }, [event])
    );

    // 추가적인 cleanup
    React.useEffect(() => {
        const unsubscribe = navigation.addListener("blur", () => {
            setParsedEvent(null);
            router.setParams({});
        });

        return unsubscribe;
    }, [navigation]);

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
