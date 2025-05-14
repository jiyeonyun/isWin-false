import React from "react";
import { SafeAreaView } from "react-native";

const DiaryScreen = (props: { route: { params: any } }) => {
    const { event } = props.route.params;
    console.log(event);
    return <SafeAreaView></SafeAreaView>;
};

export default DiaryScreen;
