import React, { useState } from "react";
import { View, StyleSheet, Text, TextInput, Button } from "react-native";
import { RadioButton } from "react-native-paper";
const IsWinModal = ({
    saveDiary,
    selectedDate,
    setModalVisible,
    diaryText,
    setDiaryText,
    title,
    setTitle,
    score,
    setScore,
    location,
    setLocation,
    mvp,
    setMvp,
    suspect,
    setSuspect,
    yafu,
    setYafu,
    events,
}: any) => {
    const [selectedWin, setSelectedWin] = useState<string>("");
    return (
        <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>직관 기록</Text>

                {/* 날짜 입력란 (선택된 날짜는 읽기 전용으로 표시) */}
                <Text style={styles.itemText}>
                    📅 선택된 날짜: {selectedDate ? `${selectedDate.slice(5, 7)}월 ${selectedDate.slice(8, 10)}일` : ""}
                </Text>

                {/* 일정 입력란 */}
                {/* 일정 입력란 */}
                <View style={styles.row}>
                    <Text style={styles.label}>⚾️ 경기</Text>
                    {events[selectedDate] && events[selectedDate].length > 0 ? (
                        events[selectedDate].map((event: any, index: number) => (
                            <Text key={index} style={styles.input}>
                                {event.title}
                            </Text>
                        ))
                    ) : (
                        <TextInput
                            style={styles.input}
                            placeholder="경기를 입력하세요"
                            value={score}
                            onChangeText={setScore}
                        />
                    )}
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>🏟️ 장소</Text>
                    {events[selectedDate] && events[selectedDate].length > 0 ? (
                        events[selectedDate].map((event: any, index: number) => (
                            <Text key={index} style={styles.input}>
                                {event.location}
                            </Text>
                        ))
                    ) : (
                        <TextInput
                            style={styles.input}
                            placeholder="장소를 입력하세요"
                            value={score}
                            onChangeText={setScore}
                        />
                    )}
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>✏️ 점수</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="스코어를 입력하세요"
                        value={score}
                        onChangeText={setScore}
                    />
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>📊 승패</Text>
                    <RadioButton.Group onValueChange={(value) => setSelectedWin(value)} value={selectedWin}>
                        <View style={styles.radioRow}>
                            <View style={styles.radioRow}>
                                <Text style={styles.radioLabel}>승</Text>
                                <RadioButton value="win" />
                            </View>
                            <View style={styles.radioRow}>
                                <Text style={styles.radioLabel}>패</Text>
                                <RadioButton value="lose" />
                            </View>
                        </View>
                    </RadioButton.Group>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>🍔 야푸</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="오늘의 야푸를 입력하세요"
                        value={yafu}
                        onChangeText={setYafu}
                    />
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>🥳 칭찬해</Text>
                    <TextInput style={styles.input} placeholder="이름을 입력하세요" value={mvp} onChangeText={setMvp} />
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>👊🏻 반성해</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="이름을 입력하세요"
                        value={suspect}
                        onChangeText={setSuspect}
                    />
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>🦁 후기</Text>
                    <TextInput
                        style={[styles.input, { height: 100 }]}
                        multiline
                        placeholder="후기를 작성하세요"
                        value={diaryText}
                        onChangeText={setDiaryText}
                    />
                </View>
                {/* 일기 입력란 */}

                {/* 일기 저장 버튼 */}
                <Button title="기록 저장" onPress={saveDiary} />

                {/* 모달 닫기 버튼 */}
                <Button title="취소" onPress={() => setModalVisible(false)} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    diaryContainer: {
        marginTop: 20,
    },
    dateText: {
        fontSize: 18,
        marginBottom: 10,
        fontWeight: "bold",
    },
    input: {
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        height: 35,
        marginBottom: 10,
        textAlignVertical: "top",
        flex: 1,
    },
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // 반투명 배경
    },
    modalContainer: {
        width: "80%",
        backgroundColor: "#fff", // 흰색 배경
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
    },
    itemText: {
        fontSize: 16,
        marginBottom: 10,
        color: "#333",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        width: "100%",
    },
    label: {
        fontWeight: "bold",
        width: 50,
    },
    radioRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    radioLabel: {
        marginRight: 10,
    },
});

export default IsWinModal;
