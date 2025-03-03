import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet, SafeAreaView, Modal, TouchableOpacity, FlatList } from "react-native";
import { Calendar } from "react-native-calendars";
import eventData from "../../assets/events/event.json"; // assets에서 import한 JSON 데이터
import IsWinModal from "@/components/ui/IsWinModal"; // 일정 모달 컴포넌트

type EventsType = Record<string, { title: string; start: string }[]>;

const CalendarScreen: React.FC = () => {
    const todayDate = new Date().toISOString().split("T")[0]; // 오늘 날짜 설정
    const [selectedDate, setSelectedDate] = useState<string>(todayDate); // 기본값을 오늘 날짜로 설정
    const [currentDate, setCurrentDate] = useState<string>(todayDate); // 캘린더의 현재 날짜
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
        const newEvents: EventsType = {};
        eventData.forEach((event: any) => {
            const { "Given planned earliest start": start, Title: title, "Additional Title": location } = event;
            const date = formatDate(start.split(" ")[0]);
            const eventSummary = { title, start: formatTime(start), location };

            if (newEvents[date]) {
                newEvents[date].push(eventSummary);
            } else {
                newEvents[date] = [eventSummary];
            }
        });
        setEvents(newEvents);
    };

    const handleDayPress = (day: any) => {
        setSelectedDate(day.dateString);
        setCurrentDate(day.dateString); // 선택한 날짜로 캘린더 업데이트
        setModalVisible(true); // 날짜 선택 시 모달 열기
    };

    useEffect(() => {
        processEvents(); // 컴포넌트가 로드될 때 JSON 데이터 처리
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.calendarContainer}>
                <Calendar
                    current={currentDate} // 현재 날짜 상태 사용
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
            </View>
            <FlatList
                data={Object.keys(events).sort()}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.eventItem}
                        onPress={() => {
                            setSelectedDate(item);
                            setCurrentDate(item); // 리스트 클릭 시 캘린더 이동
                            setModalVisible(true); // 리스트 클릭 시 모달 열기
                        }}
                    >
                        <Text style={styles.eventDate}>{item}</Text>
                        <Text style={styles.eventTitle}>{events[item][0]?.title}</Text>
                    </TouchableOpacity>
                )}
                style={styles.eventList}
            />
            {/* 일정 모달 */}
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
    },
    calendarContainer: {
        flex: 1,
    },
    eventList: {
        flex: 1,
    },
    eventItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    eventDate: {
        fontSize: 16,
        fontWeight: "bold",
    },
    eventTitle: {
        fontSize: 14,
        color: "gray",
    },
});

export default CalendarScreen;
