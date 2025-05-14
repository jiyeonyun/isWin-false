import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native";

const DiaryScreen = () => {
    const { event } = useLocalSearchParams();
    const parsedEvent = event ? JSON.parse(event as string) : null;
    console.log(parsedEvent);
    return (
        <SafeAreaView>
            <ThemedView>
                <ThemedText>{parsedEvent.Title}</ThemedText>
            </ThemedView>
        </SafeAreaView>
    );
};

export default DiaryScreen;
