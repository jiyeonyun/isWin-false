import React from "react";
import { SafeAreaView } from "react-native";

const DiaryScreen = (props: { route?: { params?: { event?: any } } }) => {
    // 옵셔널 체이닝을 사용하여 안전하게 접근
    const event = props?.route?.params?.event;
    console.log(event);
    return <SafeAreaView></SafeAreaView>;
};

export default DiaryScreen;
