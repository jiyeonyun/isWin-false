import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";

const DiaryScreen = () => {
    const { event } = useLocalSearchParams();
    const pathname = usePathname();
    const [parsedEvent, setParsedEvent] = useState<any>(null);

    React.useEffect(() => {
        // 현재 경로가 diary가 아니면 초기화
        if (!pathname.includes("diary")) {
            setParsedEvent(null);
            router.replace({
                pathname: pathname,
                params: {},
            });
            return;
        }

        // diary 경로이고 event가 있을 때만 파싱
        if (event) {
            try {
                setParsedEvent(JSON.parse(event as string));
            } catch (e) {
                setParsedEvent(null);
            }
        } else {
            setParsedEvent(null);
        }
    }, [pathname, event]);

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
