import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

interface Event {
    Title: string;
    "Given planned earliest start": string;
    "Given planned earliest end": string;
    Notes: string;
    "Assigned Resources": string;
    "Additional Title": string;
}

LocaleConfig.locales["ko"] = {
    monthNames: ["01월", "02월", "03월", "04월", "05월", "06월", "07월", "08월", "09월", "10월", "11월", "12월"],
    monthNamesShort: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
    dayNames: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
    dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
    today: "오늘",
};
LocaleConfig.defaultLocale = "ko";

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
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const markedDates = useMemo(() => getMarkedDates(events, selectedDate), [selectedDate]);

    const filteredEvents = useMemo(() => {
        if (!selectedDate) return events;
        return events.filter((event) => formatDate(event["Given planned earliest start"]).startsWith(selectedDate));
    }, [selectedDate]);
    const renderEvent = ({ item }: { item: Event }) => (
        <Pressable
            onPress={() => {
                setSelectedEvent(item);
                setModalVisible(true);
            }}
            style={styles.eventItem}
        >
            <ThemedText type="defaultSemiBold">{item.Title}</ThemedText>
            <ThemedText>장소: {item["Additional Title"]}</ThemedText>
            <ThemedText>시작: {formatDate(item["Given planned earliest start"])}</ThemedText>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="subtitle">경기 일정 🦁</ThemedText>
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

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        {selectedEvent && (
                            <View>
                                <ThemedText type="title" style={styles.modalTitle}>
                                    {selectedEvent.Title}
                                </ThemedText>
                                <View style={styles.modalInfo}>
                                    <ThemedText type="defaultSemiBold">경기장</ThemedText>
                                    <ThemedText>{selectedEvent["Additional Title"]}</ThemedText>
                                </View>
                                <View style={styles.modalInfo}>
                                    <ThemedText type="defaultSemiBold">시작 시간</ThemedText>
                                    <ThemedText>{formatDate(selectedEvent["Given planned earliest start"])}</ThemedText>
                                </View>
                                <View style={styles.modalInfo}>
                                    <ThemedText type="defaultSemiBold">종료 시간</ThemedText>
                                    <ThemedText>{formatDate(selectedEvent["Given planned earliest end"])}</ThemedText>
                                </View>
                                <View style={{ flexDirection: "row", gap: 10 }}>
                                    <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                        <ThemedText style={styles.closeButtonText}>기록 하기</ThemedText>
                                    </Pressable>
                                    <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                        <ThemedText style={styles.closeButtonText}>닫기</ThemedText>
                                    </Pressable>
                                </View>
                            </View>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
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
        backgroundColor: "#fff",
        borderColor: "#ccc",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 24,
        width: "90%",
        maxWidth: 400,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: "center",
    },
    modalInfo: {
        marginBottom: 16,
    },
    closeButton: {
        backgroundColor: "#0a7ea4",
        padding: 12,
        borderRadius: 8,
        marginTop: 20,
    },
    closeButtonText: {
        color: "white",
        textAlign: "center",
        fontWeight: "bold",
    },
});
