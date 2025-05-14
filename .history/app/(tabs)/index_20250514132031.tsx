import { IconSymbol } from "@/components/ui/IconSymbol";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
    const [name, setName] = useState("");
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
                      {
                        name == "" ?<Text style={{ fontSize: 12, color: "gray" }}>이름을 설정해주세요</Text> :
                        
                      :안녕하세요<Text style={{ fontWeight: "bold" }}>{name}</Text>님
                      }
                    </Text>
                </View>
                <View>
                    <IconSymbol size={22} name="gearshape.fill" color="gray" />
                </View>
            </View>
        );
    };
    return <SafeAreaView style={styles.container}>{renderInfo()}</SafeAreaView>;
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
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    calendarContainer: {
        padding: 16,
        backgroundColor: "#fff",
    },
    list: {
        padding: 16,
    },
    eventItem: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ccc",
    },
});
