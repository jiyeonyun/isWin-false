import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Event {
    Title: string;
    "Given planned earliest start": string;
    "Given planned earliest end": string;
    Notes: string;
    "Assigned Resources": string;
    "Additional Title": string;
}

export default function CalendarScreen() {
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        // Load events from JSON file
        const loadEvents = async () => {
            try {
                const response = await fetch("/assets/event.json");
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error("Error loading events:", error);
            }
        };

        loadEvents();
    }, []);

    const renderEvent = ({ item }: { item: Event }) => (
        <ThemedView style={styles.eventItem}>
            <ThemedText type="defaultSemiBold">{item.Title}</ThemedText>
            <ThemedText>장소: {item["Additional Title"]}</ThemedText>
            <ThemedText>시작: {item["Given planned earliest start"]}</ThemedText>
            <ThemedText>종료: {item["Given planned earliest end"]}</ThemedText>
        </ThemedView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">경기 일정</ThemedText>
            </ThemedView>
            <FlatList
                data={events}
                renderItem={renderEvent}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    list: {
        padding: 16,
    },
    eventItem: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ccc",
    },
});
