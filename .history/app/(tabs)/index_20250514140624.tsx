import SettingModal from "@/components/modal/SettingModal";
import { IconSymbol } from "@/components/ui/IconSymbol";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
    const [name, setName] = useState("");
    const [intro, setIntro] = useState("");
    const [isSetting, setIsSetting] = useState(false);
    useEffect(() => {
        AsyncStorage.getItem("name").then((value) => {
            setName(value || "");
        });
        AsyncStorage.getItem("intro").then((value) => {
            setIntro(value || "");
        });
    }, [isSetting]);
    const renderInfo = () => {
        return (
            <View style={styles.infoContainer}>
                <View>
                    <Text style={{ fontSize: 16 }}>
                        {name == "" ? (
                            <Text style={{ fontSize: 16, color: "gray" }}>😢 이름을 설정해주세요</Text>
                        ) : (
                            <View>
                                <Text>
                                    안녕하세요<Text style={{ fontWeight: "bold" }}>{name}</Text>님
                                </Text>
                                <Text style={{ fontSize: 12, color: "gray" }}>{intro}</Text>
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
    return (
        <SafeAreaView style={styles.container}>
            {renderInfo()}
            {isSetting && <SettingModal isSetting={isSetting} setIsSetting={setIsSetting} />}
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
});
