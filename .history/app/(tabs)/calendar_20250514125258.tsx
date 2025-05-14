import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

interface Event {
    Title: string;
    "Given planned earliest start": string;
    "Given planned earliest end": string;
    Notes: string;
    "Assigned Resources": string;
    "Additional Title": string;
}

// JSON 파일을 직접 import
const events = require("@/assets/event.json") as Event[];

// 날짜 형식 변환 함수
const formatDate = (dateStr: string) => {
    const [date, time] = dateStr.split(" ");
    const [day, month, year] = date.split(".");
    return `${year}-${month}-${day} ${time}`;
};

// 달력에 표시할 이벤트 데이터 변환
const getMarkedDates = (events: Event[], selectedDate: string) => {
    const markedDates: {
        [key: string]: { marked: boolean; dotColor: string; selected?: boolean; selectedColor?: string };
    } = {};

    events.forEach((event) => {
        const date = formatDate(event["Given planned earliest start"]).split(" ")[0];
        markedDates[date] = {
            marked: true,
            dotColor: "#0a7ea4",
            selected: date === selectedDate,
            selectedColor: "#0a7ea4",
        };
    });

    // 오늘 날짜 표시
    const today = new Date().toISOString().split("T")[0];
    if (!markedDates[today]) {
        markedDates[today] = {
            marked: false,
            dotColor: "#0a7ea4",
            selected: today === selectedDate,
            selectedColor: "#0a7ea4",
        };
    }

    return markedDates;
};

export default function CalendarScreen() {
    const [selectedDate, setSelectedDate] = useState("");

    const markedDates = useMemo(() => getMarkedDates(events, selectedDate), [selectedDate]);

    const filteredEvents = useMemo(() => {
        if (!selectedDate) return events;
        return events.filter((event) => formatDate(event["Given planned earliest start"]).startsWith(selectedDate));
    }, [selectedDate]);

    const renderEvent = ({ item }: { item: Event }) => (
        <ThemedView style={styles.eventItem}>
            <ThemedText type="defaultSemiBold">{item.Title}</ThemedText>
            <ThemedText>장소: {item["Additional Title"]}</ThemedText>
            <ThemedText>시작: {formatDate(item["Given planned earliest start"])}</ThemedText>
            <ThemedText>종료: {formatDate(item["Given planned earliest end"])}</ThemedText>
        </ThemedView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="subtitle">경기 일정</ThemedText>
            </ThemedView>
            <View style={styles.calendarContainer}>
                <Calendar
                    onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                    markedDates={markedDates}
                    theme={{
                        todayTextColor: "#0a7ea4",
                        selectedDayBackgroundColor: "#0a7ea4",
                        selectedDayTextColor: "#ffffff",
                        dotColor: "#0a7ea4",
                        arrowColor: "#0a7ea4",
                        todayBackgroundColor: "#e6f3f8",
                        textDayFontWeight: "500",
                        textMonthFontWeight: "bold",
                        textDayHeaderFontWeight: "500",
                    }}
                />
            </View>
            <FlatList
                data={filteredEvents}
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
    calendarContainer: {
        padding: 16,
        backgroundColor: "#fff",
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
