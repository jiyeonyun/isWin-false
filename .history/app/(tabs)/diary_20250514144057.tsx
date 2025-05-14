import { useLocalSearchParams } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native";

const DiaryScreen = () => {
    const { event } = useLocalSearchParams();
    const parsedEvent = event ? JSON.parse(event as string) : null;
    console.log(parsedEvent);
    return <SafeAreaView></SafeAreaView>;
};

export default DiaryScreen;
