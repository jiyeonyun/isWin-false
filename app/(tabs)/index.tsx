import SettingModal from "@/components/modal/SettingModal";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { firestore } from "@/firebaseConfig";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

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

    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
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
                // 에러 발생 시에도 기본값 설정
                setName("");
                setProfileImage(null);
            }
        };

        loadUserData();
    }, [isSetting]);

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
                <Text>일기 들어가야함</Text>
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
