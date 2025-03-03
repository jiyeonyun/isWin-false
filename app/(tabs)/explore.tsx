import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet, SafeAreaView, ScrollView, Modal } from "react-native";
import { Calendar } from "react-native-calendars";
import eventData from "../../assets/events/event.json"; // assets에서 import한 JSON 데이터
import IsWinModal from "@/components/ui/IsWinModal"; // 일정 모달 컴포넌트

type EventsType = Record<string, { title: string; start: string }[]>;

const CalendarScreen: React.FC = () => {
    const todayDate = new Date().toISOString().split("T")[0]; // 오늘 날짜 설정
    const [selectedDate, setSelectedDate] = useState<string>(todayDate); // 기본값을 오늘 날짜로 설정
    const [events, setEvents] = useState<EventsType>({}); // 날짜별 일정 저장
    const [modalVisible, setModalVisible] = useState<boolean>(false); // 모달 표시 여부
    const [diaryText, setDiaryText] = useState<string>(""); // 일기 텍스트 입력 상태

    const formatDate = (dateStr: string): string => {
        const [day, month, year] = dateStr.split(".");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    };

    const formatTime = (datetimeStr: string): string => {
        const [date, time] = datetimeStr.split(" ");
        const formattedDate = formatDate(date);
        return `${formattedDate} ${time}`;
    };

    const processEvents = () => {
        eventData.forEach((event: any) => {
            const { "Given planned earliest start": start, Title: title, "Additional Title": location } = event;
            const date = formatDate(start.split(" ")[0]);
            const eventSummary = { title, start: formatTime(start), location };

            setEvents((prevEvents) => {
                const newEvents = { ...prevEvents };
                if (newEvents[date]) {
                    newEvents[date].push(eventSummary);
                } else {
                    newEvents[date] = [eventSummary];
                }
                return newEvents;
            });
        });
    };

    const handleDayPress = (day: any) => {
        setSelectedDate(day.dateString);
        setModalVisible(true); // 날짜 선택 시 모달 열기
    };

    useEffect(() => {
        processEvents(); // 컴포넌트가 로드될 때 JSON 데이터 처리
    }, []);

    const renderEvents = () => {
        if (!events[selectedDate] || events[selectedDate].length === 0) {
            return <Text>선택된 날짜에 일정이 없습니다.</Text>;
        }
        return events[selectedDate].map((event, index) => (
            <View key={index} style={styles.eventContainer}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventTime}>{event.start}</Text>
            </View>
        ));
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Calendar
                    current={todayDate} // 오늘 날짜로 초기화
                    onDayPress={handleDayPress}
                    markedDates={{
                        [selectedDate]: {
                            selected: true,
                            selectedColor: "blue",
                            selectedTextColor: "white",
                        },
                    }}
                    theme={{
                        selectedDayBackgroundColor: "blue",
                        selectedDayTextColor: "white",
                        todayTextColor: "green",
                    }}
                    dayNames={["일", "월", "화", "수", "목", "금", "토"]}
                    monthFormat={"yyyy년 MM월"}
                />
                <View style={styles.eventsContainer}>
                    <Text>선택된 날짜: {selectedDate}</Text>
                    {renderEvents()}
                </View>
            </ScrollView>

            {/* 모달을 활용하여 일기 작성 UI 표시 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <IsWinModal
                    saveDiary={() => {}}
                    selectedDate={selectedDate}
                    setModalVisible={setModalVisible}
                    diaryText={diaryText}
                    setDiaryText={setDiaryText}
                    title=""
                    setTitle={() => {}}
                    score=""
                    setScore={() => {}}
                    location=""
                    setLocation={() => {}}
                    mvp=""
                    setMvp={() => {}}
                    suspect=""
                    setSuspect={() => {}}
                    yafu=""
                    setYafu={() => {}}
                    events={events}
                />
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    eventsContainer: {
        marginTop: 20,
    },
    dateContainer: {
        marginVertical: 10,
    },
    date: {
        fontSize: 18,
        fontWeight: "bold",
    },
    eventSummary: {
        fontSize: 14,
        color: "gray",
    },
    eventContainer: {
        marginVertical: 5,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    eventTime: {
        fontSize: 14,
        color: "gray",
    },
});

export default CalendarScreen;
