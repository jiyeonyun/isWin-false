import SettingModal from "@/components/modal/SettingModal";
import { IconSymbol } from "@/components/ui/IconSymbol";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
    const [name, setName] = useState("");
    const [isSetting, setIsSetting] = useState(false);
    useEffect(() => {
        AsyncStorage.getItem("name").then((value) => {
            setName(value || "");
        });
    }, []);
    const renderInfo = () => {
        return (
            <View style={styles.infoContainer}>
                <View>
                    <Text style={{ fontSize: 16 }}>
                        {name == "" ? (
                            <Text style={{ fontSize: 16, color: "gray" }}>😢 이름을 설정해주세요</Text>
                        ) : (
                            <Text>
                                안녕하세요<Text style={{ fontWeight: "bold" }}>{name}</Text>님
                            </Text>
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
    return (
        <SafeAreaView style={styles.container}>
            {renderInfo()}
            {isSetting && (
                <View style={styles.modalOverlay}>
                    <SettingModal isSetting={isSetting} setIsSetting={setIsSetting} />
                </View>
            )}
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
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
});
