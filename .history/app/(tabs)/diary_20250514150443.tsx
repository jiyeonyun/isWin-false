import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useLocalSearchParams, usePathname } from "expo-router";
import React, { useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

const DiaryScreen = () => {
    const { event } = useLocalSearchParams();
    const pathname = usePathname();
    const [parsedEvent, setParsedEvent] = useState<any>(null);

    const renderInputFiled = useMemo(() => {
        const [match, setMatch] = useState(parsedEvent ? parsedEvent.Title : null);
        const [title, setTitle] = useState("");
        const [description, setDescription] = useState("");
        const [date, setDate] = useState("");
        const [time, setTime] = useState("");
        const [location, setLocation] = useState("");
        const [weather, setWeather] = useState("");
        const [mood, setMood] = useState("");
        const [note, setNote] = useState("");

        return (
            <View>
                <Text>{match}</Text>
            </View>
        );
    }, [parsedEvent]);
    return (
        <SafeAreaView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText>오늘의 직관은...</ThemedText>
            </ThemedView>
            {renderInputFiled()}
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
