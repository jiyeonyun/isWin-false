import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

const DiaryScreen = () => {
    const { event } = useLocalSearchParams();
    const parsedEvent = event ? JSON.parse(event as string) : null;
    const [match, setMatch] = useState(parsedEvent ? parsedEvent.Title : null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");
    const [weather, setWeather] = useState("");
    const [mood, setMood] = useState("");
    const [note, setNote] = useState("");

    const clearEvent = () => {
        setMatch(null);
        setTitle("");
        setDescription("");
        setDate("");
        setTime("");
        setLocation("");
        setWeather("");
        setMood("");
        setNote("");
    };
    const renderInputFiled = useMemo(() => {
        return <View></View>;
    }, [parsedEvent]);

    return (
        <SafeAreaView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText>
                    오늘의 직관은... <Text>{match}</Text>
                </ThemedText>
                <Pressable onPress={clearEvent}>
                    <IconSymbol name="xmark" size={24} color="#000000" />
                </Pressable>
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
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    content: {
        padding: 16,
    },
});
export default DiaryScreen;
