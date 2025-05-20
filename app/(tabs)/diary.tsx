import { IconSymbol } from "@/components/ui/IconSymbol";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
interface DiaryData {
    title: string;
    desc: string;
    date: string;
    place: string;

    mood: string;
    weather: string;
    inning: string;
    team1: string;
    food: string;
    team2: string;
    inningScores: Record<string, string>;
    best: string;
    worst: string;
    isWin: string;
}

const DiaryScreen = () => {
    const { event } = useLocalSearchParams();
    const router = useRouter();
    const [isExtraInning, setIsExtraInning] = useState(false);
    const [innigs, setInnings] = useState<any[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, "R", "H", "E", "B"]);
    const [isCancel, setIsCancel] = useState(false);
    const [diaryContent, setDiaryContent] = useState<string[]>([]);
    const [isDiary, setIsDiary] = useState<boolean>(false);
    const [parsed, setParsed] = useState<DiaryData>();
    const [isWin, setIsWin] = useState<string>("무");
    const [diaryForm, setDiaryForm] = useState<DiaryData>({
        title: "",
        desc: "",
        date: "",
        place: "",
        mood: "",
        weather: "",
        inning: "",
        food: "",
        team1: "",
        team2: "",
        inningScores: {},
        best: "",
        worst: "",
        isWin: "무",
    });

    useEffect(() => {
        if (event) {
            const parsed = JSON.parse(event as string);
            setParsed(parsed);
            setIsDiary(true);
            setDiaryForm({
                title: parsed.title,
                desc: parsed.desc,
                date: parsed.date,
                place: parsed.place,
                mood: parsed.mood,
                food: parsed.food,
                weather: parsed.weather,
                inning: parsed.inning,
                team1: parsed.title.split("vs")[0],
                team2: parsed.title.split("vs")[1],
                inningScores: {},
                best: parsed.best,
                worst: parsed.worst,
                isWin: "무",
            });
        }
    }, [event]);

    // 팀 스코어 계산 함수 추가
    const calculateTeamScore = (teamIndex: number) => {
        let total = 0;
        Object.entries(diaryForm.inningScores).forEach(([key, value]) => {
            if (key.includes("초") && teamIndex === 0) {
                total += parseInt(value) || 0;
            } else if (key.includes("말") && teamIndex === 1) {
                total += parseInt(value) || 0;
            }
        });
        return total;
    };

    // useEffect를 사용하여 스코어가 변경될 때만 isWin을 업데이트
    useEffect(() => {
        const team1Score = calculateTeamScore(0);
        const team2Score = calculateTeamScore(1);

        if (diaryForm.team1 === "삼성") {
            if (team1Score === team2Score) {
                setIsWin("무");
            } else if (team1Score > team2Score) {
                setIsWin("승");
            } else {
                setIsWin("패");
            }
        } else {
            if (team1Score === team2Score) {
                setIsWin("무");
            } else if (team2Score > team1Score) {
                setIsWin("승");
            } else {
                setIsWin("패");
            }
        }
    }, []);

    const getTeamBackgroundColor = (teamIndex: number) => {
        const team1Score = calculateTeamScore(0);
        const team2Score = calculateTeamScore(1);

        if (team1Score === team2Score) {
            return "#f0f0f0";
        }

        if (teamIndex === 0) {
            return team1Score > team2Score ? "#e6f3ff" : "#ffe6e6";
        } else {
            return team1Score < team2Score ? "#e6f3ff" : "#ffe6e6";
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {isDiary ? (
                <View style={{ flex: 1 }}>
                    <View style={styles.header}>
                        <Pressable onPress={() => setIsDiary(false)}>
                            <IconSymbol name="arrow.left" size={24} color="#505050" />
                        </Pressable>
                        <View style={styles.titleContainer}>
                            <View
                                style={{
                                    backgroundColor:
                                        isWin == "승" ? "#e6f3ff" : diaryForm.isWin == "패" ? "#ffe6e6" : "#f0f0f0",
                                    paddingHorizontal: 4,
                                    paddingVertical: 2,
                                    borderRadius: 4,
                                }}
                            >
                                <Text style={{ color: "#353535", fontSize: 12 }}>{diaryForm.isWin}</Text>
                            </View>
                            <Text>{parsed?.title}</Text>
                            <Text>{parsed?.date}</Text>
                        </View>
                    </View>
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={true}
                    >
                        <View style={styles.diaryContainer}>
                            <View style={styles.formContainer}>
                                <Text style={styles.label}>장소</Text>
                                <TextInput
                                    style={styles.input}
                                    value={diaryForm.place}
                                    onChangeText={(text) => setDiaryForm({ ...diaryForm, place: text })}
                                    placeholder="오늘의 장소를 입력하세요"
                                />
                            </View>

                            <View style={styles.formContainer}>
                                <Text style={styles.label}>
                                    이닝{" "}
                                    <Text style={{ fontSize: 11, color: "#808080", marginLeft: 4 }}>
                                        옆으로 슬라이드해서 기록지를 채워주세요(0도 입력해주세요)
                                    </Text>
                                </Text>
                                <View style={styles.inningContainer}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={styles.inningGrid}>
                                            <View style={styles.teamColumn}>
                                                <Text style={styles.inningNumber}>팀</Text>
                                                <View style={styles.inningInputContainer}>
                                                    <TextInput
                                                        style={[
                                                            styles.inningInput,
                                                            { backgroundColor: getTeamBackgroundColor(0) },
                                                        ]}
                                                        editable={!isCancel}
                                                        placeholder="팀1"
                                                        value={diaryForm.team1}
                                                        onChangeText={(text) =>
                                                            setDiaryForm({
                                                                ...diaryForm,
                                                                team1: text,
                                                            })
                                                        }
                                                    />
                                                    <TextInput
                                                        style={[
                                                            styles.inningInput,
                                                            { backgroundColor: getTeamBackgroundColor(1) },
                                                        ]}
                                                        placeholder="팀2"
                                                        value={diaryForm.team2}
                                                        onChangeText={(text) =>
                                                            setDiaryForm({
                                                                ...diaryForm,
                                                                team2: text,
                                                            })
                                                        }
                                                    />
                                                </View>
                                            </View>
                                            {!isCancel ? (
                                                innigs.map((inning) => (
                                                    <View key={inning} style={styles.inningColumn}>
                                                        <Text style={styles.inningNumber}>{inning}</Text>
                                                        <View style={styles.inningInputContainer}>
                                                            {inning === "R" ? (
                                                                <>
                                                                    <TextInput
                                                                        style={styles.inningInput}
                                                                        value={calculateTeamScore(0).toString()}
                                                                        editable={false}
                                                                    />
                                                                    <TextInput
                                                                        style={styles.inningInput}
                                                                        value={calculateTeamScore(1).toString()}
                                                                        editable={false}
                                                                    />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <TextInput
                                                                        style={styles.inningInput}
                                                                        placeholder="0"
                                                                        keyboardType="numeric"
                                                                        maxLength={2}
                                                                        editable={!isCancel}
                                                                        value={
                                                                            diaryForm.inningScores?.[`${inning}초`] ||
                                                                            ""
                                                                        }
                                                                        onChangeText={(text) =>
                                                                            setDiaryForm({
                                                                                ...diaryForm,
                                                                                inningScores: {
                                                                                    ...diaryForm.inningScores,
                                                                                    [`${inning}초`]: text,
                                                                                },
                                                                            })
                                                                        }
                                                                    />
                                                                    <TextInput
                                                                        style={styles.inningInput}
                                                                        placeholder="0"
                                                                        keyboardType="numeric"
                                                                        editable={!isCancel}
                                                                        maxLength={2}
                                                                        value={
                                                                            diaryForm.inningScores?.[`${inning}말`] ||
                                                                            ""
                                                                        }
                                                                        onChangeText={(text) =>
                                                                            setDiaryForm({
                                                                                ...diaryForm,
                                                                                inningScores: {
                                                                                    ...diaryForm.inningScores,
                                                                                    [`${inning}말`]: text,
                                                                                },
                                                                            })
                                                                        }
                                                                    />
                                                                </>
                                                            )}
                                                        </View>
                                                    </View>
                                                ))
                                            ) : (
                                                <View style={styles.cancelContainer}>
                                                    <Text style={styles.cancelText}>경기가 취소 되었습니다</Text>
                                                </View>
                                            )}
                                        </View>
                                    </ScrollView>
                                    <View style={styles.extraInningContainer}>
                                        <Pressable
                                            onPress={() => {
                                                if (isExtraInning) {
                                                    setInnings([1, 2, 3, 4, 5, 6, 7, 8, 9, "R", "H", "E", "B"]);
                                                } else {
                                                    setInnings([
                                                        1,
                                                        2,
                                                        3,
                                                        4,
                                                        5,
                                                        6,
                                                        7,
                                                        8,
                                                        9,
                                                        10,
                                                        11,
                                                        12,
                                                        "R",
                                                        "H",
                                                        "E",
                                                        "B",
                                                    ]);
                                                }
                                                setIsExtraInning(!isExtraInning);
                                            }}
                                            style={[
                                                styles.extraInningButton,
                                                isExtraInning && styles.extraInningButtonActive,
                                            ]}
                                        >
                                            <Text>{isExtraInning ? "정규" : "연장"}</Text>
                                        </Pressable>
                                        <Pressable
                                            style={[styles.cancelButton, isCancel && styles.iscancelBtn]}
                                            onPress={() => setIsCancel(!isCancel)}
                                        >
                                            <Text style={{ color: "#353535" }}>{isCancel ? "정상" : "취소"}</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.formContainer}>
                                <Text style={styles.label}>기분</Text>
                                <TextInput
                                    style={styles.input}
                                    value={diaryForm.mood}
                                    onChangeText={(text) => setDiaryForm({ ...diaryForm, mood: text })}
                                    placeholder="오늘의 기분을 입력하세요"
                                />
                            </View>
                            <View style={styles.formContainer}>
                                <Text style={styles.label}>날씨</Text>
                                <TextInput
                                    style={styles.input}
                                    value={diaryForm.weather}
                                    onChangeText={(text) => setDiaryForm({ ...diaryForm, weather: text })}
                                    placeholder="오늘의 날씨를 입력하세요"
                                />
                            </View>
                            <View style={styles.formContainer}>
                                <Text style={styles.label}>야푸</Text>
                                <TextInput
                                    style={styles.input}
                                    value={diaryForm.food}
                                    onChangeText={(text) => setDiaryForm({ ...diaryForm, food: text })}
                                    placeholder="오늘의 야푸를 입력하세요"
                                />
                            </View>
                            <View style={styles.formContainer}>
                                <Text style={styles.label}>일기</Text>
                                <TextInput
                                    style={styles.descInput}
                                    value={diaryForm.desc}
                                    onChangeText={(text) => setDiaryForm({ ...diaryForm, desc: text })}
                                    placeholder="오늘의 일기를 작성해보세요"
                                    multiline
                                    numberOfLines={6}
                                />
                            </View>
                            <View style={styles.formContainer}>
                                <Text style={styles.label}>베스트</Text>
                                <TextInput
                                    style={styles.input}
                                    value={diaryForm.best}
                                    onChangeText={(text) => setDiaryForm({ ...diaryForm, best: text })}
                                    placeholder="오늘의 베스트선수를 입력하세요"
                                />
                            </View>
                            <View style={styles.formContainer}>
                                <Text style={styles.label}>워스트</Text>
                                <TextInput
                                    style={styles.input}
                                    value={diaryForm.worst}
                                    onChangeText={(text) => setDiaryForm({ ...diaryForm, worst: text })}
                                    placeholder="오늘의 워스트선수를 입력하세요"
                                />
                            </View>
                        </View>
                    </ScrollView>
                </View>
            ) : diaryContent.length > 0 ? (
                <View>
                    <Text>ddd</Text>
                </View>
            ) : (
                <View style={styles.diaryContainer}>
                    <Text>아직 기록된 일기가 없어요 😢</Text>

                    <Text style={styles.selectText} onPress={() => router.push("/calendar")}>
                        기록하기
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    content: {
        padding: 16,
    },
    selectText: {
        color: "#0003a9",
        fontSize: 14,
        textDecorationLine: "underline",
    },
    diaryContainer: {
        padding: 20,
        gap: 16,
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    placeText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#353535",
    },
    placeContainer: {
        width: "100%",
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
        color: "#353535",
    },
    input: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        width: "100%",
    },
    descInput: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        width: "100%",
        height: 150,
        textAlignVertical: "top",
    },
    formContainer: {
        width: "100%",
        marginBottom: 16,
    },
    inningContainer: {
        marginTop: 8,
    },
    teamInputContainer: {
        marginBottom: 12,
    },
    teamInput: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        width: "100%",
    },
    inningGrid: {
        flexDirection: "row",
        paddingHorizontal: 8,
    },
    inningColumn: {
        alignItems: "center",
        minWidth: 40,
        marginHorizontal: 4,
    },
    inningNumber: {
        fontSize: 12,
        marginBottom: 4,
    },
    inningInputContainer: {
        width: "100%",
    },
    inningInput: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 4,
        padding: 4,
        marginBottom: 4,
        width: "100%",
        textAlign: "center",
        fontSize: 12,
        backgroundColor: "#ffffff",
    },
    teamColumn: {
        alignItems: "center",
        minWidth: 60,
        marginHorizontal: 4,
    },
    extraInningContainer: {
        marginTop: 8,
        flexDirection: "row",
        gap: 4,
        paddingHorizontal: 10,
    },
    extraInningButton: {
        borderWidth: 1,
        borderRadius: 4,
        padding: 4,
        backgroundColor: "#e5e5e5",
        borderColor: "#b9b9b9",
        width: 60,
        alignItems: "center",
        justifyContent: "center",
    },
    extraInningButtonActive: {
        backgroundColor: "#d0d0d0",
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: "#e46464",
        borderRadius: 4,
        width: 60,
        padding: 4,
        backgroundColor: "#ffa8a8",
        alignItems: "center",
        justifyContent: "center",
    },
    iscancelBtn: {
        backgroundColor: "#bed2f6",
        borderColor: "#6491e4",
    },
    cancelContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
    },
    cancelText: {
        fontSize: 12,
        color: "#353535",
    },
});

export default DiaryScreen;
