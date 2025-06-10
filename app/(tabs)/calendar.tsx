import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
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
    const router = useRouter();

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
            <Text style={styles.eventTitle}>{item.Title}</Text>
            <Text style={styles.eventPlace}>장소: {item["Additional Title"]}</Text>
            <Text style={styles.eventTime}>시작: {formatDate(item["Given planned earliest start"])}</Text>
        </Pressable>
    );
    const movetoDiary = () => {
        if (selectedEvent) {
            const diaryData = {
                title: selectedEvent.Title,
                desc: selectedEvent.Notes,
                date: formatDate(selectedEvent["Given planned earliest start"]),
                place: selectedEvent["Additional Title"],
            };
            router.push({
                pathname: "/diary",
                params: { event: JSON.stringify(diaryData) },
            });
            setModalVisible(false);
        }
    };
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>경기 일정 </Text>
            </View>
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
                                <Text style={styles.modalTitle}>{selectedEvent.Title}</Text>
                                <View style={styles.modalInfo}>
                                    <Text style={styles.modalInfoTitle}>경기장</Text>
                                    <Text style={styles.modalInfoText}>{selectedEvent["Additional Title"]}</Text>
                                </View>
                                <View style={styles.modalInfo}>
                                    <Text style={styles.modalInfoTitle}>시작 시간</Text>
                                    <Text style={styles.modalInfoText}>
                                        {formatDate(selectedEvent["Given planned earliest start"])}
                                    </Text>
                                </View>
                                <View style={styles.modalInfo}>
                                    <Text style={styles.modalInfoTitle}>종료 시간</Text>
                                    <Text style={styles.modalInfoText}>
                                        {formatDate(selectedEvent["Given planned earliest end"])}
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        gap: 10,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Pressable style={styles.modalButton} onPress={movetoDiary}>
                                        <Text style={styles.closeButtonText}>기록 하기</Text>
                                    </Pressable>
                                    <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                        <Text style={styles.closeButtonText}>닫기</Text>
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
    },
    calendarContainer: {
        padding: 16,
        borderRadius: 16,
        margin: 16,
        backgroundColor: "white",
    },
    list: {
        padding: 16,
    },
    eventItem: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,

        backgroundColor: "#fff",
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
        backgroundColor: "#040404",
        padding: 12,
        borderRadius: 8,
        flex: 1,
    },
    closeButtonText: {
        color: "white",
        textAlign: "center",
        fontWeight: "bold",
    },
    modalButton: {
        backgroundColor: "#0a4da4",
        padding: 12,
        borderRadius: 8,
        flex: 1,
    },
    modalButtonText: {
        color: "white",
        textAlign: "center",
        fontWeight: "bold",
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    eventPlace: {
        fontSize: 14,
    },
    eventTime: {
        fontSize: 14,
    },
    modalInfoTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    modalInfoText: {
        fontSize: 14,
    },
});
