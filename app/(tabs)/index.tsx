import SettingModal from "@/components/modal/SettingModal";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { firestore } from "@/firebaseConfig";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import { WebView } from "react-native-webview";
import { DiaryData } from "./diary";

type RootStackParamList = {
    diary: { date: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
    const [name, setName] = useState("");
    const [intro, setIntro] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isSetting, setIsSetting] = useState(false);
    const [total, setTotal] = useState(0);
    const [win, setWin] = useState(0);
    const [lose, setLose] = useState(0);
    const [draw, setDraw] = useState(0);
    const [winRate, setWinRate] = useState(0);
    const [sequnceResultNumber, setSequnceResultNumber] = useState(0);
    const [sequnceResult, setSequnceResult] = useState("win");
    const [diaryContent, setDiaryContent] = useState<DiaryData[]>([]);
    const [monthlyData, setMonthlyData] = useState<
        { date: string; winRate: number; totalWinRate: number; winCount: number; totalGames: number }[]
    >([]);
    const [weeklyData, setWeeklyData] = useState<
        { date: string; winRate: number; totalWinRate: number; winCount: number; totalGames: number }[]
    >([]);
    const [dailyData, setDailyData] = useState<
        { date: string; winRate: number; totalWinRate: number; winCount: number; totalGames: number }[]
    >([]);
    const [selectedPeriod, setSelectedPeriod] = useState<"month" | "week" | "day">("month");
    const [selectedStat, setSelectedStat] = useState<"winRate" | "winCount" | "totalGames" | "winLoss">("winRate");
    const isFocused = useIsFocused();
    const auth = getAuth();
    const user = auth.currentUser;
    const webViewRef = useRef<WebView>(null);
    const [isWebViewLoading, setIsWebViewLoading] = useState(true);
    const [webViewError, setWebViewError] = useState(false);
    const navigation = useNavigation<NavigationProp>();

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

                // 승률 데이터 계산
                calculateWinRates(diariesData);

                // 승무패 카운트 가져오기
                const countRef = doc(db, "users", user.uid, "count", "stats");
                const countDoc = await getDoc(countRef);

                if (countDoc.exists()) {
                    const countData = countDoc.data();
                    setWin(countData.win || 0);
                    setLose(countData.lose || 0);
                    setDraw(countData.draw || 0);
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

    const calculateWinRates = (diariesData: DiaryData[]) => {
        const monthlyStats = new Map<string, { win: number; total: number }>();
        const weeklyStats = new Map<string, { win: number; total: number }>();
        const dailyStats = new Map<string, { win: number; total: number }>();

        // 전체 승률 계산
        let totalWin = 0;
        let totalGames = 0;

        diariesData.forEach((diary) => {
            // 전체 통계 계산
            totalGames++;
            if (diary.isWin === "승") totalWin++;

            const date = new Date(diary.date);
            // 월간 통계는 연도와 월을 함께 사용 (예: "2024-6")
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            // 주간 통계는 주차만 사용 (예: "1주차")
            const weekKey = `${getWeekNumber(date)}주차`;
            // 일간 통계는 날짜 사용 (예: "6/1")
            const dayKey = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;

            // 월간 통계
            const monthStat = monthlyStats.get(monthKey) || { win: 0, total: 0 };
            monthStat.total++;
            if (diary.isWin === "승") monthStat.win++;
            monthlyStats.set(monthKey, monthStat);

            // 주간 통계
            const weekStat = weeklyStats.get(weekKey) || { win: 0, total: 0 };
            weekStat.total++;
            if (diary.isWin === "승") weekStat.win++;
            weeklyStats.set(weekKey, weekStat);

            // 일간 통계
            const dayStat = dailyStats.get(dayKey) || { win: 0, total: 0 };
            dayStat.total++;
            if (diary.isWin === "승") dayStat.win++;
            dailyStats.set(dayKey, dayStat);
        });

        // 전체 승률 계산
        const totalWinRate = totalGames > 0 ? Math.round((totalWin / totalGames) * 100) : 0;

        // 데이터 포맷팅
        interface MonthlyData {
            date: string;
            winRate: number;
            totalWinRate: number;
            winCount: number;
            totalGames: number;
            year: number;
            month: number;
        }

        interface OtherData {
            date: string;
            winRate: number;
            totalWinRate: number;
            winCount: number;
            totalGames: number;
        }

        const formatData = (stats: Map<string, { win: number; total: number }>) => {
            return Array.from(stats.entries())
                .map(([date, stat]): MonthlyData | OtherData => {
                    // 월간 데이터 포맷팅
                    if (date.includes("-")) {
                        const [year, month] = date.split("-");
                        const monthNum = parseInt(month);
                        return {
                            date: `${monthNum}월`,
                            winRate: stat.total > 0 ? Math.round((stat.win / stat.total) * 100) : 0,
                            totalWinRate: totalWinRate,
                            winCount: stat.win,
                            totalGames: stat.total,
                            year: parseInt(year),
                            month: monthNum,
                        };
                    }
                    return {
                        date,
                        winRate: stat.total > 0 ? Math.round((stat.win / stat.total) * 100) : 0,
                        totalWinRate: totalWinRate,
                        winCount: stat.win,
                        totalGames: stat.total,
                    };
                })
                .sort((a, b) => {
                    // 월간 정렬 (연도와 월 기준)
                    if ("year" in a && "year" in b && "month" in a && "month" in b) {
                        if (a.year !== b.year) return a.year - b.year;
                        return a.month - b.month;
                    }
                    // 주간 정렬
                    if (a.date.includes("주차")) {
                        return parseInt(a.date) - parseInt(b.date);
                    }
                    // 일간 정렬
                    return a.date.localeCompare(b.date);
                });
        };

        // 데이터 설정 전에 로그 출력
        console.log("Monthly Stats:", Array.from(monthlyStats.entries()));
        const formattedMonthlyData = formatData(monthlyStats);
        console.log("Formatted Monthly Data:", formattedMonthlyData);
        setMonthlyData(formattedMonthlyData);
        setWeeklyData(formatData(weeklyStats));
        setDailyData(formatData(dailyStats));
    };

    // 주차 계산 함수
    const getWeekNumber = (date: Date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };

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
        const data = selectedPeriod === "month" ? monthlyData : selectedPeriod === "week" ? weeklyData : dailyData;

        type ChartDataType = number[] | { win: number[]; lose: number[] };

        const getChartData = (): ChartDataType => {
            switch (selectedStat) {
                case "winRate":
                    // 승률: 월간/주간은 라인, 일간은 파이
                    return data.map((d) => {
                        const rate = d.winRate;
                        return isNaN(rate) || !isFinite(rate) ? 0 : rate;
                    });
                case "winCount":
                    // 승리: 일간/주간은 막대, 월간은 누적 막대
                    return data.map((d) => {
                        const count = d.winCount;
                        return isNaN(count) || !isFinite(count) ? 0 : count;
                    });
                case "totalGames":
                    // 경기수: 일간은 막대, 주간/월간은 라인
                    return data.map((d) => {
                        const total = d.totalGames;
                        return isNaN(total) || !isFinite(total) ? 0 : total;
                    });

                default:
                    return data.map((d) => {
                        const rate = d.winRate;
                        return isNaN(rate) || !isFinite(rate) ? 0 : rate;
                    });
            }
        };

        const renderChart = () => {
            // 데이터가 비어있는 경우 처리
            if (!data || data.length === 0) {
                return (
                    <View style={[styles.chart, { justifyContent: "center", alignItems: "center" }]}>
                        <Text>데이터가 없습니다</Text>
                    </View>
                );
            }

            switch (selectedStat) {
                case "winRate":
                    if (selectedPeriod === "day") {
                        // 일간 승률: 파이 차트
                        return (
                            <PieChart
                                data={[
                                    {
                                        name: "승",
                                        population: data[0]?.winCount || 0,
                                        color: "#459bf8",
                                        legendFontColor: "#7F7F7F",
                                        legendFontSize: 12,
                                    },
                                    {
                                        name: "패",
                                        population: (data[0]?.totalGames || 0) - (data[0]?.winCount || 0),
                                        color: "#c8eff7",
                                        legendFontColor: "#7F7F7F",
                                        legendFontSize: 12,
                                    },
                                ]}
                                width={Dimensions.get("window").width - 80}
                                height={220}
                                chartConfig={{
                                    backgroundColor: "#ffffff",
                                    backgroundGradientFrom: "#ffffff",
                                    backgroundGradientTo: "#ffffff",
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                }}
                                accessor="population"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                absolute
                            />
                        );
                    } else {
                        // 월간/주간 승률: 라인 차트
                        return (
                            <LineChart
                                data={{
                                    labels: data.map((d) => d.date),
                                    datasets: [{ data: getChartData() as number[] }],
                                }}
                                width={Math.max(Dimensions.get("window").width - 40, data.length * 50)}
                                height={220}
                                chartConfig={{
                                    backgroundColor: "#ffffff",
                                    backgroundGradientFrom: "#ffffff",
                                    backgroundGradientTo: "#ffffff",
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                }}
                                bezier
                                style={styles.chart}
                                yLabelsOffset={-12}
                            />
                        );
                    }

                case "winCount":
                    if (selectedPeriod === "month") {
                        // 월간 승리: 누적 막대 그래프
                        return (
                            <BarChart
                                data={{
                                    labels: data.map((d) => d.date),
                                    datasets: [{ data: getChartData() as number[] }],
                                }}
                                width={Math.max(Dimensions.get("window").width - 40, data.length * 50)}
                                height={220}
                                yAxisLabel=""
                                yAxisSuffix=""
                                chartConfig={{
                                    backgroundColor: "#ffffff",
                                    backgroundGradientFrom: "#ffffff",
                                    backgroundGradientTo: "#ffffff",
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                }}
                                style={styles.chart}
                                yLabelsOffset={-15}
                            />
                        );
                    } else {
                        // 일간/주간 승리: 단일 막대 그래프
                        return (
                            <BarChart
                                data={{
                                    labels: data.map((d) => d.date),
                                    datasets: [{ data: getChartData() as number[] }],
                                }}
                                width={Math.max(Dimensions.get("window").width - 40, data.length * 50)}
                                height={220}
                                yAxisLabel=""
                                yAxisSuffix=""
                                chartConfig={{
                                    backgroundColor: "#ffffff",
                                    backgroundGradientFrom: "#ffffff",
                                    backgroundGradientTo: "#ffffff",
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                }}
                                style={styles.chart}
                                yLabelsOffset={-15}
                            />
                        );
                    }

                case "totalGames":
                    if (selectedPeriod === "day") {
                        // 일간 경기수: 막대 그래프
                        return (
                            <BarChart
                                data={{
                                    labels: data.map((d) => d.date),
                                    datasets: [{ data: getChartData() as number[] }],
                                }}
                                width={Math.max(Dimensions.get("window").width - 40, data.length * 50)}
                                height={220}
                                yAxisLabel=""
                                yAxisSuffix=""
                                chartConfig={{
                                    backgroundColor: "#ffffff",
                                    backgroundGradientFrom: "#ffffff",
                                    backgroundGradientTo: "#ffffff",
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                }}
                                style={styles.chart}
                                yLabelsOffset={-10}
                            />
                        );
                    } else {
                        // 주간/월간 경기수: 라인 그래프
                        return (
                            <LineChart
                                data={{
                                    labels: data.map((d) => d.date),
                                    datasets: [{ data: getChartData() as number[] }],
                                }}
                                width={Math.max(Dimensions.get("window").width - 40, data.length * 50)}
                                height={220}
                                chartConfig={{
                                    backgroundColor: "#ffffff",
                                    backgroundGradientFrom: "#ffffff",
                                    backgroundGradientTo: "#ffffff",
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                }}
                                bezier
                                style={styles.chart}
                                yLabelsOffset={-15}
                            />
                        );
                    }
            }
        };

        return (
            <View style={styles.graphContainer}>
                <View style={styles.chartTextContainer}>
                    <Text>
                        지금까지 <Text style={{ fontWeight: "bold" }}>{name || "설정해주세요"}</Text> 님의 직관 승률은{" "}
                    </Text>
                    <Text>
                        <Text style={{ fontWeight: "bold" }}>
                            {total}전{win}승{lose}패{draw}무
                        </Text>
                        로 <Text style={{ fontWeight: "bold" }}>{winRate}%</Text> 입니다.
                    </Text>
                    <Text>
                        현재 직관{" "}
                        {sequnceResult == "win" ? (
                            <Text style={{ fontWeight: "bold", color: "#0082d3dd" }}>{sequnceResultNumber}연승</Text>
                        ) : (
                            <Text style={{ fontWeight: "bold", color: "#a10000dd" }}>{sequnceResultNumber}연패</Text>
                        )}{" "}
                        중입니다.
                    </Text>
                </View>

                {/* 통계 선택 버튼 */}
                <View style={styles.statSelector}>
                    <Pressable
                        style={[styles.statButton, selectedStat === "winRate" && styles.selectedStat]}
                        onPress={() => setSelectedStat("winRate")}
                    >
                        <Text style={selectedStat === "winRate" ? styles.selectedStatText : styles.statText}>승률</Text>
                    </Pressable>

                    <Pressable
                        style={[styles.statButton, selectedStat === "winCount" && styles.selectedStat]}
                        onPress={() => setSelectedStat("winCount")}
                    >
                        <Text style={selectedStat === "winCount" ? styles.selectedStatText : styles.statText}>
                            승리
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.statButton, selectedStat === "totalGames" && styles.selectedStat]}
                        onPress={() => setSelectedStat("totalGames")}
                    >
                        <Text style={selectedStat === "totalGames" ? styles.selectedStatText : styles.statText}>
                            경기수
                        </Text>
                    </Pressable>
                </View>
                <View style={styles.chartContainer}>{renderChart()}</View>

                {/* 기간 선택 버튼 */}
                <View style={styles.periodSelector}>
                    <Pressable
                        style={[styles.periodButton, selectedPeriod === "month" && styles.selectedPeriod]}
                        onPress={() => setSelectedPeriod("month")}
                    >
                        <Text style={selectedPeriod === "month" ? styles.selectedPeriodText : styles.periodText}>
                            월간
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.periodButton, selectedPeriod === "week" && styles.selectedPeriod]}
                        onPress={() => setSelectedPeriod("week")}
                    >
                        <Text style={selectedPeriod === "week" ? styles.selectedPeriodText : styles.periodText}>
                            주간
                        </Text>
                    </Pressable>
                </View>
            </View>
        );
    };

    const renderDiary = () => {
        return (
            <View style={styles.diaryContainer}>
                {diaryContent.map((diary) => (
                    <Pressable key={diary.date} style={styles.diaryItemContainer}>
                        <View>
                            <Text>{diary.date} </Text>
                            <Text>{diary.title}</Text>
                        </View>
                        <View
                            style={[
                                styles.diaryWinTag,
                                diary.isWin == "승"
                                    ? { backgroundColor: "#d3f0ff", borderColor: "#5588d4" }
                                    : diary.isWin == "패"
                                    ? { backgroundColor: "#ffaeae", borderColor: "#ff5e5e" }
                                    : { backgroundColor: "#dddddd" },
                            ]}
                        >
                            <Text
                                style={{
                                    color:
                                        diary.isWin == "승" ? "#5588d4" : diary.isWin == "패" ? "#ff5e5e" : "#666666",
                                }}
                            >
                                {diary.isWin}
                            </Text>
                        </View>
                    </Pressable>
                ))}
                <Pressable
                    onPress={() => {
                        navigation.navigate("diary", { date: "" });
                    }}
                    style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                >
                    <Text>+ 더 보기</Text>
                </Pressable>
            </View>
        );
    };

    const renderWebView = () => {
        return (
            <View style={styles.webviewContainer}>
                {isWebViewLoading && (
                    <View style={styles.loadingContainer}>
                        <Text>순위를 불러오는 중...</Text>
                    </View>
                )}
                {webViewError && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>순위를 불러오는데 실패했습니다.</Text>
                        <Text style={styles.errorSubText}>새로고침해주세요.</Text>
                    </View>
                )}
                <WebView
                    style={[styles.webview, (isWebViewLoading || webViewError) && styles.hiddenWebView]}
                    source={{ uri: "https://m.sports.naver.com/kbaseball/record/kbo?seasonCode=2025&tab=teamRank" }}
                    startInLoadingState={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    onLoadStart={() => {
                        setIsWebViewLoading(true);
                        setWebViewError(false);
                    }}
                    onLoadEnd={() => {
                        console.log("WebView 로드 완료");
                        webViewRef.current?.injectJavaScript(`
                           setTimeout(() => {
                             const tableGroup = document.querySelector('[class^="Table_inner"]');
                             if (tableGroup) {
                                 document.body.innerHTML = '';
                                 document.body.appendChild(tableGroup.cloneNode(true));
                                 document.body.style.backgroundColor = 'white';
                                 document.body.style.margin = '0';
                                 document.body.style.padding = '0';
                                 
                                 // TableHead_table_head로 시작하는 모든 요소 찾기
                                 const tableHeads = document.querySelectorAll('[class^="TableHead_table_head"]');
                                 tableHeads.forEach(head => {
                                     head.style.position = 'static';
                                 });
                                 
                                 window.ReactNativeWebView.postMessage("✅ tableGroup 복사 완료!");
                             } else {
                                 window.ReactNativeWebView.postMessage("⛔️ tableGroup 못 찾음");
                             }
                           }, 1000);
                            true;
                        `);
                    }}
                    onMessage={(event) => {
                        console.log("💌 WebView 메시지:", event.nativeEvent.data);
                        if (event.nativeEvent.data.includes("✅")) {
                            setIsWebViewLoading(false);
                        } else if (event.nativeEvent.data.includes("⛔️")) {
                            setWebViewError(true);
                        }
                    }}
                    onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.log("WebView error: ", nativeEvent);
                        setWebViewError(true);
                    }}
                    originWhitelist={["*"]}
                    ref={webViewRef}
                />
            </View>
        );
    };
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {renderInfo()}
                {renderGraph()}
                {renderWebView()}
                {renderDiary()}
                {isSetting && <SettingModal isSetting={isSetting} setIsSetting={setIsSetting} />}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f1f1f1dd",
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
        marginBottom: 60,
        gap: 10,
    },
    periodSelector: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginVertical: 10,
    },
    periodButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
    },
    selectedPeriod: {
        backgroundColor: "#007AFF",
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
        paddingRight: 16,
        paddingLeft: 20,
    },
    statSelector: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginVertical: 10,
    },
    statButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
    },
    selectedStat: {
        backgroundColor: "#007AFF",
    },
    statText: {
        color: "#000000",
    },
    selectedStatText: {
        color: "#ffffff",
    },
    periodText: {
        color: "#000000",
    },
    selectedPeriodText: {
        color: "#ffffff",
    },
    pieChartContainer: {
        marginTop: 20,
        alignItems: "center",
    },
    lineChartContainer: {
        marginTop: 20,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    chartContainer: {
        marginTop: 20,
    },
    chartTextContainer: {
        marginBottom: 20,
    },
    webviewContainer: {
        height: 400,
        margin: 16,
        backgroundColor: "white",
        borderRadius: 16,
        overflow: "hidden",
    },
    webview: {
        flex: 1,
    },
    loadingContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        zIndex: 1,
    },
    errorContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        zIndex: 1,
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FF3B30",
        marginBottom: 8,
    },
    errorSubText: {
        fontSize: 14,
        color: "#666",
    },
    hiddenWebView: {
        opacity: 0,
    },
    diaryItemContainer: {
        display: "flex",
        flexDirection: "row",
        gap: 5,
        justifyContent: "space-between",
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        borderColor: "#dddd",
        backgroundColor: "#f9f9f988",
    },
    diaryWinTag: {
        borderWidth: 1,
        flexDirection: "column",
        alignContent: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
        borderRadius: 8,
    },
});
