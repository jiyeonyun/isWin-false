import { IconSymbol } from "@/components/ui/IconSymbol";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

interface DiaryData {
    title: string;
    desc: string;
    date: string;
    place: string;
    mood?: string;
    weather?: string;
    team1: string;
    food?: string;
    team2: string;
    inningScores: Record<string, string>;
    best?: string;
    worst?: string;
    isWin: string;
    team1Lineup: string[];
    team2Lineup: string[];
    cost: number;
    image: any;
}

const DiaryScreen = () => {
    const { event } = useLocalSearchParams();
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } = Constants.expoConfig?.extra ?? {};
    const auth = getAuth();
    const user = auth.currentUser;
    const router = useRouter();
    const [isExtraInning, setIsExtraInning] = useState(false);
    const [innigs, setInnings] = useState<any[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, "R", "H", "E", "B"]);
    const [isCancel, setIsCancel] = useState(false);
    const [diaryContent, setDiaryContent] = useState<DiaryData[]>([]);
    const [isDiary, setIsDiary] = useState<boolean>(false);
    const [parsed, setParsed] = useState<DiaryData>();
    const [isWin, setIsWin] = useState<string>("무");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [image, setImage] = useState<string | null>(null);
    const [diaryForm, setDiaryForm] = useState<DiaryData>({
        title: "",
        desc: "",
        date: "",
        place: "",
        mood: "",
        weather: "",
        food: "",
        team1: "",
        team2: "",
        inningScores: {},
        best: "",
        worst: "",
        isWin: "무",
        team1Lineup: ["", "", "", "", "", "", "", "", "", ""],
        team2Lineup: ["", "", "", "", "", "", "", "", "", ""],
        cost: 0,
        image: "",
    });

    const [optionalFields, setOptionalFields] = useState({
        lineup: true,
        mood: false,
        weather: false,
        food: false,
        best: false,
        worst: false,
        cost: false,
        image: false,
    });

    const toggleField = (field: keyof typeof optionalFields) => {
        setOptionalFields((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const pickImage = async () => {
        if (diaryForm.image) {
            Alert.alert("사진 설정됨", "사진을 삭제하시겠습니까?", [
                { text: "취소" },
                {
                    text: "삭제",
                    onPress: () => {
                        setDiaryForm((prev) => ({ ...prev, image: "" }));
                    },
                },
            ]);
            return;
        }

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("권한 필요", "이미지를 선택하려면 권한이 필요합니다.");
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.4,
                base64: true,
            });

            if (!result.canceled) {
                setIsLoading(true);

                const base64Image = result.assets[0].base64;

                const formData = new FormData();
                formData.append("file", `data:image/jpeg;base64,${base64Image}`);
                formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET || "");

                const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();

                if (data.secure_url) {
                    setDiaryForm((prev) => ({ ...prev, image: data.secure_url }));
                } else {
                    throw new Error("이미지 업로드 실패");
                }
            }
        } catch (error) {
            console.error("이미지 업로드 오류:", error);
            Alert.alert("오류", "이미지 업로드 중 문제가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderOptionalField = (
        fieldKey: keyof typeof optionalFields,
        label: string,
        field: keyof DiaryData,
        placeholder: string,
        isMultiline: boolean = false
    ) => {
        if (!optionalFields[fieldKey]) return null;

        if (fieldKey === "image") {
            return (
                <View style={styles.formContainer}>
                    <View style={styles.fieldHeader}>
                        <Text style={styles.label}>{label}</Text>
                        <Pressable onPress={() => toggleField(fieldKey)} style={styles.removeButton}>
                            <Text style={styles.removeButtonText}>-</Text>
                        </Pressable>
                    </View>
                    <Pressable onPress={pickImage} style={styles.imageBox}>
                        {isLoading ? (
                            <Text>업로드 중...</Text>
                        ) : diaryForm.image ? (
                            <Image
                                source={{ uri: diaryForm.image as string }}
                                style={styles.imageBox}
                                resizeMode="cover"
                            />
                        ) : (
                            <Text style={styles.imageText}>터치하여 사진 추가</Text>
                        )}
                    </Pressable>
                </View>
            );
        }

        return (
            <View style={styles.formContainer}>
                <View style={styles.fieldHeader}>
                    <Text style={styles.label}>{label}</Text>
                    <Pressable onPress={() => toggleField(fieldKey)} style={styles.removeButton}>
                        <Text style={styles.removeButtonText}>-</Text>
                    </Pressable>
                </View>
                <TextInput
                    style={[styles.input, isMultiline && styles.descInput]}
                    value={diaryForm[field] as string}
                    onChangeText={(text) => setDiaryForm({ ...diaryForm, [field]: text })}
                    placeholder={placeholder}
                    multiline={isMultiline}
                    numberOfLines={isMultiline ? 6 : 1}
                    keyboardType={field === "cost" ? "numeric" : "default"}
                />
            </View>
        );
    };

    useEffect(() => {
        const loadDiaryFromEvent = async () => {
            if (event) {
                const parsed = JSON.parse(event as string);
                setParsed(parsed);
                setIsDiary(true);

                if (!user || !user.uid) {
                    setDiaryForm({
                        title: parsed.title || "",
                        desc: parsed.desc || "",
                        date: parsed.date || "",
                        place: parsed.place || "",
                        mood: parsed.mood || "",
                        weather: parsed.weather || "",
                        food: parsed.food || "",
                        team1: parsed.title?.split("vs")[0]?.trim() || "",
                        team2: parsed.title?.split("vs")[1]?.trim() || "",
                        inningScores: parsed.inningScores || {},
                        best: parsed.best || "",
                        worst: parsed.worst || "",
                        isWin: parsed.isWin || "무",
                        team1Lineup: parsed.team1Lineup || Array(10).fill(""),
                        team2Lineup: parsed.team2Lineup || Array(10).fill(""),
                        cost: parsed.cost || 0,
                        image: parsed.image || "",
                    });
                    return;
                }

                const diaryDocRef = doc(db, "users", user.uid, "diaries", parsed.date);
                const diaryDocSnap = await getDoc(diaryDocRef);

                if (diaryDocSnap.exists()) {
                    const existingDiaryData = diaryDocSnap.data() as DiaryData;
                    setDiaryForm(existingDiaryData);
                } else {
                    setDiaryForm({
                        title: parsed.title || "",
                        desc: parsed.desc || "",
                        date: parsed.date || "",
                        place: parsed.place || "",
                        mood: parsed.mood || "",
                        weather: parsed.weather || "",
                        food: parsed.food || "",
                        team1: parsed.title?.split("vs")[0]?.trim() || "",
                        team2: parsed.title?.split("vs")[1]?.trim() || "",
                        inningScores: parsed.inningScores || {},
                        best: parsed.best || "",
                        worst: parsed.worst || "",
                        isWin: parsed.isWin || "무",
                        team1Lineup: parsed.team1Lineup || Array(10).fill(""),
                        team2Lineup: parsed.team2Lineup || Array(10).fill(""),
                        cost: parsed.cost || 0,
                        image: parsed.image || "",
                    });
                }
            }
        };

        loadDiaryFromEvent();
    }, [event, user?.uid]);

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

    useEffect(() => {
        const team1Score = calculateTeamScore(0);
        const team2Score = calculateTeamScore(1);

        if (diaryForm.team1.includes("삼성")) {
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
    }, [diaryForm.inningScores]);

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

    const updateLineup = (team: "team1" | "team2", index: number, value: string) => {
        const lineupKey = team === "team1" ? "team1Lineup" : "team2Lineup";
        const newLineup = [...(diaryForm[lineupKey] || Array(10).fill(""))];
        newLineup[index] = value;
        setDiaryForm({
            ...diaryForm,
            [lineupKey]: newLineup,
        });
    };

    const db = getFirestore();

    const saveDiary = async () => {
        if (!user || !user.uid) {
            Alert.alert("오류", "사용자 정보를 찾을 수 없습니다.");
            return;
        }

        if (!diaryForm.date || !diaryForm.place || !diaryForm.desc) {
            Alert.alert("필수 정보 누락", "장소, 일기 내용은 필수 입력 항목입니다.");
            return;
        }

        setIsLoading(true);
        try {
            const diaryDocRef = doc(db, "users", user.uid, "diaries", diaryForm.date);
            await setDoc(diaryDocRef, diaryForm);

            Alert.alert("저장 성공", "일기가 성공적으로 저장되었습니다.");
            setIsDiary(false);
        } catch (error) {
            console.error("일기 저장 오류: ", error);
            Alert.alert("저장 실패", "일기 저장 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const deleteDiary = async () => {
        if (!user || !user.uid) {
            Alert.alert("오류", "사용자 정보를 찾을 수 없습니다.");
            return;
        }

        if (!diaryForm.date) {
            Alert.alert("오류", "삭제할 일기 정보를 찾을 수 없습니다.");
            return;
        }

        Alert.alert(
            "일기 삭제",
            "정말 이 일기를 삭제하시겠습니까?",
            [
                { text: "취소", style: "cancel" },
                {
                    text: "삭제",
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            const diaryDocRef = doc(db, "users", user.uid, "diaries", diaryForm.date);
                            await deleteDoc(diaryDocRef);

                            Alert.alert("삭제 성공", "일기가 성공적으로 삭제되었습니다.");
                            setIsDiary(false);
                        } catch (error) {
                            console.error("일기 삭제 오류: ", error);
                            Alert.alert("삭제 실패", "일기 삭제 중 오류가 발생했습니다.");
                        } finally {
                            setIsLoading(false);
                        }
                    },
                    style: "destructive",
                },
            ],
            { cancelable: true }
        );
    };

    useEffect(() => {
        const fetchDiaries = async () => {
            if (!user || !user.uid) {
                return;
            }

            try {
                const querySnapshot = await getDocs(collection(db, "users", user.uid, "diaries"));
                const diariesData: DiaryData[] = [];
                querySnapshot.forEach((doc) => {
                    diariesData.push({ ...(doc.data() as DiaryData), date: doc.id });
                });
                diariesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setDiaryContent(diariesData);
            } catch (error) {
                console.error("일기 목록 불러오기 오류: ", error);
                Alert.alert("오류", "일기 목록을 불러오는데 실패했습니다.");
            }
        };

        if (!isDiary && user && user.uid) {
            fetchDiaries();
        }
    }, [isDiary, user?.uid]);

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
                                    backgroundColor: isWin == "승" ? "#e6f3ff" : isWin == "패" ? "#ffe6e6" : "#f0f0f0",
                                    paddingHorizontal: 4,
                                    paddingVertical: 2,
                                    borderRadius: 4,
                                }}
                            >
                                <Text style={{ color: "#353535", fontSize: 12 }}>{isWin}</Text>
                            </View>
                            <Text>{parsed?.title}</Text>
                            <Text>{parsed?.date}</Text>
                        </View>

                        <Pressable onPress={saveDiary} disabled={isLoading} style={styles.saveButton}>
                            <Text style={styles.saveButtonText}>{isLoading ? "저장 중..." : "저장"}</Text>
                        </Pressable>
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
                                                        editable={!isCancel}
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
                                                            ) : inning === "H" || inning === "E" || inning === "B" ? (
                                                                <>
                                                                    <TextInput
                                                                        style={styles.inningInput}
                                                                        placeholder="0"
                                                                        keyboardType="numeric"
                                                                        maxLength={2}
                                                                        editable={!isCancel}
                                                                        value={
                                                                            diaryForm.inningScores?.[
                                                                                `team1${inning}`
                                                                            ] || ""
                                                                        }
                                                                        onChangeText={(text) =>
                                                                            setDiaryForm({
                                                                                ...diaryForm,
                                                                                inningScores: {
                                                                                    ...diaryForm.inningScores,
                                                                                    [`team1${inning}`]: text,
                                                                                },
                                                                            })
                                                                        }
                                                                    />
                                                                    <TextInput
                                                                        style={styles.inningInput}
                                                                        placeholder="0"
                                                                        keyboardType="numeric"
                                                                        maxLength={2}
                                                                        editable={!isCancel}
                                                                        value={
                                                                            diaryForm.inningScores?.[
                                                                                `team2${inning}`
                                                                            ] || ""
                                                                        }
                                                                        onChangeText={(text) =>
                                                                            setDiaryForm({
                                                                                ...diaryForm,
                                                                                inningScores: {
                                                                                    ...diaryForm.inningScores,
                                                                                    [`team2${inning}`]: text,
                                                                                },
                                                                            })
                                                                        }
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
                            {optionalFields.lineup && (
                                <View style={styles.formContainer}>
                                    <View style={styles.fieldHeader}>
                                        <Text style={styles.label}>스타팅 라인업</Text>
                                        <Pressable onPress={() => toggleField("lineup")} style={styles.removeButton}>
                                            <Text style={styles.removeButtonText}>-</Text>
                                        </Pressable>
                                    </View>
                                    <View style={styles.lineupContainer}>
                                        <View style={styles.teamLineup}>
                                            <TextInput
                                                style={[
                                                    styles.inningInput,
                                                    { backgroundColor: getTeamBackgroundColor(0) },
                                                ]}
                                                editable={!isCancel}
                                                placeholder="팀1"
                                                value={diaryForm.team1}
                                            />
                                            {Array.from({ length: 10 }).map((_, index) => (
                                                <View key={index} style={styles.lineupItem}>
                                                    <Text style={styles.lineupInput}>
                                                        {index == 9 ? "P" : index + 1}
                                                    </Text>
                                                    <TextInput
                                                        style={[styles.lineupInput, { flex: 1 }]}
                                                        placeholder="이름"
                                                        value={diaryForm.team1Lineup?.[index] || ""}
                                                        onChangeText={(text) => updateLineup("team1", index, text)}
                                                    />
                                                </View>
                                            ))}
                                        </View>
                                        <View style={styles.teamLineup}>
                                            <TextInput
                                                style={[
                                                    styles.inningInput,
                                                    { backgroundColor: getTeamBackgroundColor(1) },
                                                ]}
                                                editable={!isCancel}
                                                placeholder="팀2"
                                                value={diaryForm.team2}
                                            />
                                            {Array.from({ length: 10 }).map((_, index) => (
                                                <View key={index} style={styles.lineupItem}>
                                                    <Text style={styles.lineupInput}>
                                                        {index == 9 ? "P" : index + 1}
                                                    </Text>
                                                    <TextInput
                                                        style={[styles.lineupInput, { flex: 1 }]}
                                                        placeholder="이름"
                                                        value={diaryForm.team2Lineup?.[index] || ""}
                                                        onChangeText={(text) => updateLineup("team2", index, text)}
                                                    />
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            )}
                            {renderOptionalField("image", "사진", "image", "오늘의 사진을 입력하세요")}
                            {renderOptionalField("mood", "기분", "mood", "오늘의 기분을 입력하세요")}
                            {renderOptionalField("cost", "지출", "cost", "오늘의 지출을 입력하세요")}
                            {renderOptionalField("weather", "날씨", "weather", "오늘의 날씨를 입력하세요")}
                            {renderOptionalField("food", "야푸", "food", "오늘의 야푸를 입력하세요")}
                            {renderOptionalField("best", "베스트", "best", "오늘의 베스트선수를 입력하세요")}
                            {renderOptionalField("worst", "워스트", "worst", "오늘의 워스트선수를 입력하세요")}
                            <View style={styles.optionalFieldsContainer}>
                                <Text style={styles.optionalFieldsTitle}>추가 정보</Text>
                                <View style={styles.addButtonsContainer}>
                                    {Object.entries(optionalFields).map(
                                        ([fieldKey, isVisible]) =>
                                            !isVisible && (
                                                <Pressable
                                                    key={fieldKey}
                                                    onPress={() => toggleField(fieldKey as keyof typeof optionalFields)}
                                                    style={styles.addButton}
                                                >
                                                    <Text style={styles.addButtonText}>
                                                        +{" "}
                                                        {fieldKey === "mood"
                                                            ? "기분"
                                                            : fieldKey === "weather"
                                                            ? "날씨"
                                                            : fieldKey === "food"
                                                            ? "야푸"
                                                            : fieldKey === "best"
                                                            ? "베스트"
                                                            : fieldKey === "worst"
                                                            ? "워스트"
                                                            : fieldKey === "lineup"
                                                            ? "라인업"
                                                            : fieldKey === "cost"
                                                            ? "지출"
                                                            : fieldKey === "image"
                                                            ? "사진"
                                                            : fieldKey}
                                                    </Text>
                                                </Pressable>
                                            )
                                    )}
                                </View>
                            </View>
                        </View>
                        {diaryForm.date && (
                            <Pressable onPress={deleteDiary} disabled={isLoading} style={styles.deleteButton}>
                                <IconSymbol name="trash" size={20} color="#dc3545" />
                                <Text style={styles.deleteButtonText}>삭제</Text>
                            </Pressable>
                        )}
                    </ScrollView>
                </View>
            ) : diaryContent.length > 0 ? (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 20 }}>
                    {diaryContent.map((diary) => (
                        <Pressable
                            key={diary.date}
                            style={styles.diaryListItem}
                            onPress={() => {
                                setParsed(diary);
                                setDiaryForm({
                                    ...diary,
                                    team1: diary.title.split("vs")[0] || "",
                                    team2: diary.title.split("vs")[1] || "",
                                    inningScores: diary.inningScores || {},
                                    team1Lineup: diary.team1Lineup || Array(10).fill(""),
                                    team2Lineup: diary.team2Lineup || Array(10).fill(""),
                                    cost: diary.cost || 0,
                                    image: diary.image || "",
                                });
                                setIsDiary(true);
                            }}
                        >
                            <Text style={styles.diaryItemDate}>{diary.date}</Text>
                            <Text style={styles.diaryItemTitle}>{diary.title}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
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
    lineupContainer: {
        flexDirection: "row",
        gap: 10,
        marginTop: 8,
    },
    teamLineup: {
        flex: 1,
    },
    lineupInput: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 4,
        padding: 4,
        marginBottom: 4,
        textAlign: "center",
    },
    lineupItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        flexWrap: "wrap",
    },
    fieldHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    removeButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#ff6b6b",
        alignItems: "center",
        justifyContent: "center",
    },
    removeButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    optionalFieldsContainer: {
        marginTop: 20,
        marginBottom: 10,
    },
    optionalFieldsTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#353535",
        marginBottom: 10,
    },
    addButtonsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    addButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: "#e6f3ff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#b3d9ff",
    },
    addButtonText: {
        color: "#0066cc",
        fontSize: 14,
    },
    imageBox: {
        width: 300,
        height: 300,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "#f0f0f0",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
        marginBottom: 8,
    },
    imageContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    imageText: {
        fontSize: 12,
        color: "#353535",
    },
    saveButton: {
        backgroundColor: "#007bff",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    saveButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    diaryListItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    diaryItemDate: {
        fontSize: 14,
        color: "#555",
    },
    diaryItemTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        flex: 1,
        marginLeft: 10,
    },
    deleteButton: {
        flexDirection: "row",
        gap: 4,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginRight: 10,
    },
    deleteButtonText: {
        color: "#dc3545",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "normal",
    },
});

export default DiaryScreen;
