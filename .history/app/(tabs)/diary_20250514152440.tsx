import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

interface Event {
    Title: string;
    Description: string;
    Date: string;
    Time: string;
    Location: string;
    Weather: string;
    Mood: string;
    Note: string;
}

const DiaryScreen = () => {
    const { event } = useLocalSearchParams();
    const [parsedEvent, setParsedEvent] = useState<Event | null>(null);
    const [match, setMatch] = useState<string | null>(null);
    const [matchContent, setMatchContent] = useState({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        weather: "",
        mood: "",
        note: "",
    });

    useEffect(() => {
        if (event) {
            const parsed = JSON.parse(event as string);
            setParsedEvent(parsed);
            setMatch(parsed.Title);
            setMatchContent({
                title: parsed.Title ?? "",
                description: parsed.Description ?? "",
                date: parsed.Date ?? "",
                time: parsed.Time ?? "",
                location: parsed.Location ?? "",
                weather: parsed.Weather ?? "",
                mood: parsed.Mood ?? "",
                note: parsed.Note ?? "",
            });
        }
    }, [event]);

    const clearEvent = () => {
        setParsedEvent(null);
        setMatch(null);
        setMatchContent({
            title: "",
            description: "",
            date: "",
            time: "",
            location: "",
            weather: "",
            mood: "",
            note: "",
        });
    };

    const renderInputFiled = useMemo(() => {
        return <View></View>;
    }, [parsedEvent]);

    return (
        <SafeAreaView style={styles.container}>
            <ThemedView style={styles.header}>
                <Text>
                    오늘의 직관은... <Text>{match}</Text>
                    {!match && (
                        <Text style={styles.selectText} onPress={() => router.push("/calendar")}>
                            고르러 가기
                        </Text>
                    )}
                </Text>
                {match && (
                    <Pressable onPress={clearEvent}>
                        <IconSymbol name="xmark" size={24} color="#636363" />
                    </Pressable>
                )}
            </ThemedView>
            {renderInputFiled}
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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    content: {
        padding: 16,
    },
    selectText: {
        color: "#0003a9",
        fontSize: 14,
        textDecorationLine: "underline",
    },
});

export default DiaryScreen;
