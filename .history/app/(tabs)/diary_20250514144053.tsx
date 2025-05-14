import { useLocalSearchParams } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native";

const DiaryScreen = () => {
    // useLocalSearchParams를 사용하여 파라미터를 받아옵니다
    const { event } = useLocalSearchParams();
    const parsedEvent = event ? JSON.parse(event as string) : null;
    console.log(parsedEvent);
    return <SafeAreaView></SafeAreaView>;
};

export default DiaryScreen;
