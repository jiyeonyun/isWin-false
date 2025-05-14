import { IconSymbol } from "@/components/ui/IconSymbol";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
    const renderInfo = () => {
        return (
            <View style={styles.infoContainer}>
                <View>
                    <Text>
                        안녕하세요<Text>{/**이름 */}</Text>님
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
