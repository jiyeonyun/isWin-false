import SettingModal from "@/components/modal/SettingModal";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { firestore } from "@/firebaseConfig";
import { useIsFocused } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { DiaryData } from "./diary";

export default function HomeScreen() {
    const [name, setName] = useState("");
    const [intro, setIntro] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isSetting, setIsSetting] = useState(false);
    const [total, setTotal] = useState(0);
    const [win, setWin] = useState(0);
    const [lose, setLose] = useState(0);
    const [winRate, setWinRate] = useState(0);
    const [sequnceResultNumber, setSequnceResultNumber] = useState(0);
    const [sequnceResult, setSequnceResult] = useState("win");
    const [diaryContent, setDiaryContent] = useState<DiaryData[]>([]);
    const isFocused = useIsFocused();
    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        const db = getFirestore();
        const loadUserData = async () => {
            if (!user?.uid) {
                return;
            }
            try {
                const docRef = doc(firestore, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const docData = docSnap.data();
                    setName(docData?.name || "");
                    setIntro(docData?.intro || "");
                    setProfileImage(docData?.profileImage || null);
                } else {
                    setName("");
                    setProfileImage(null);
                }
            } catch (error) {
                console.error("Firestore 데이터 가져오기 실패:", error);
                setName("");
                setProfileImage(null);
            }
        };

        const fetchDiaries = async () => {
            if (!user || !user.uid) {
                return;
            }

            try {
                // 일기 데이터 가져오기
                const querySnapshot = await getDocs(collection(db, "users", user.uid, "diaries"));
                const diariesData: DiaryData[] = [];
                querySnapshot.forEach((doc) => {
                    diariesData.push({ ...(doc.data() as DiaryData), date: doc.id });
                });
                diariesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setDiaryContent(diariesData.slice(0, 3));

                // 승무패 카운트 가져오기
                const countRef = doc(db, "users", user.uid, "count", "stats");
                const countDoc = await getDoc(countRef);

                if (countDoc.exists()) {
                    const countData = countDoc.data();
                    setWin(countData.win || 0);
                    setLose(countData.lose || 0);
                    setTotal((countData.win || 0) + (countData.lose || 0) + (countData.draw || 0));
                    setWinRate(
                        countData.win
                            ? Math.round(
                                  (countData.win /
                                      ((countData.win || 0) + (countData.lose || 0) + (countData.draw || 0))) *
                                      100
                              )
                            : 0
                    );
                }

                // 연승/연패 계산
                let currentStreak = 0;
                let isWinStreak = true;

                for (const diary of diariesData) {
                    if (currentStreak === 0) {
                        // 첫 번째 게임
                        currentStreak = 1;
                        isWinStreak = diary.isWin === "승";
                    } else {
                        // 연속된 결과 체크
                        if ((isWinStreak && diary.isWin === "승") || (!isWinStreak && diary.isWin === "패")) {
                            currentStreak++;
                        } else if (diary.isWin === "무") {
                            // 무승부는 연속 기록을 끊지 않음
                            continue;
                        } else {
                            break;
                        }
                    }
                }

                setSequnceResultNumber(currentStreak);
                setSequnceResult(isWinStreak ? "win" : "lose");
            } catch (error) {
                console.error("데이터 불러오기 오류: ", error);
                Alert.alert("오류", "데이터를 불러오는데 실패했습니다.");
            }
        };

        loadUserData();
        fetchDiaries();
    }, [isSetting, isFocused]);

    const renderInfo = () => {
        return (
            <View style={styles.infoContainer}>
                <View style={styles.profileContainer}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    ) : (
                        <View style={styles.profileImagePlaceholder}>
                            <IconSymbol size={30} name="person.fill" color="gray" />
                        </View>
                    )}
                    <Text style={{ fontSize: 16, marginLeft: 10 }}>
                        {name == "" ? (
                            <Text style={{ fontSize: 16, color: "gray" }}>😢 이름을 설정해주세요</Text>
                        ) : (
                            <View style={{ gap: 4 }}>
                                <Text>
                                    안녕하세요 <Text style={{ fontWeight: "bold" }}>{name}</Text> 님
                                </Text>
                                <Text style={{ color: "gray", fontSize: 12 }}>{intro}</Text>
                            </View>
                        )}
                    </Text>
                </View>
                <View>
                    <Pressable
                        onPress={() => {
                            setIsSetting(!isSetting);
                        }}
                    >
                        <IconSymbol size={22} name={"gearshape.fill"} color="gray" />
                    </Pressable>
                </View>
            </View>
        );
    };

    const renderGraph = () => {
        return (
            <View style={styles.graphContainer}>
                <Text>지금까지 {name || "설정해주세요"} 님의 직관 승률은 </Text>
                <Text>
                    <Text style={{ fontWeight: "bold" }}>
                        {total}전{win}승{lose}패
                    </Text>
                    로 <Text style={{ fontWeight: "bold" }}>{winRate}%</Text> 입니다.
                </Text>
                <Text>
                    현재 직관 <Text style={{ fontWeight: "bold" }}>{sequnceResultNumber}</Text>{" "}
                    {sequnceResult == "win" ? "연승" : "연패"} 중입니다.
                </Text>
                <View style={styles.graphContainer}>
                    <View style={styles.graph}>
                        <Text>그래프 들어가야함</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderDiary = () => {
        return (
            <View style={styles.diaryContainer}>
                {diaryContent.map((diary) => (
                    <Text key={diary.date}>
                        {diary.date} / {diary.title}
                    </Text>
                ))}
            </View>
        );
    };
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {renderInfo()}
                {renderGraph()}
                {renderDiary()}
                {isSetting && <SettingModal isSetting={isSetting} setIsSetting={setIsSetting} />}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    infoContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    profileContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    profileImagePlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    graphContainer: {
        flex: 1,
        backgroundColor: "white",
        padding: 16,
        margin: 16,
        borderRadius: 16,
    },
    graph: {
        flexDirection: "row",
        alignItems: "center",
    },
    graphBar: {
        flex: 1,
        height: 10,
        backgroundColor: "gray",
    },
    diaryContainer: {
        flex: 1,
        backgroundColor: "white",
        padding: 16,
        margin: 16,
        borderRadius: 16,
    },
});
