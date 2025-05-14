import { SafeAreaView, StyleSheet, Text } from "react-native";

export default function HomeScreen() {
    return (
        <SafeAreaView>
            <Text>정보</Text>
            <Text>통계</Text>

            <Text>최근 직관일</Text>
            <Text></Text>
            <Text>정보</Text>
        </SafeAreaView>
    );
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
