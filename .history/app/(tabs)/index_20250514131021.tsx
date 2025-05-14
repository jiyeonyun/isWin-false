import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
    const renderInfo = () => {
        return (
            <View>
                <Text>정보</Text>
            </View>
        );
    };
    return <SafeAreaView style={styles.container}>{renderInfo()}</SafeAreaView>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
