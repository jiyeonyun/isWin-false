import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from "react-native";
import { BarChart } from "react-native-chart-kit"; // BarChart import
import { PieChart } from "react-native-chart-kit"; // PieChart import

const Index = () => {
    const [index, setIndex] = useState(0);

    // 승패 통계 데이터
    const winLossData = {
        labels: ["승", "패", "무", "취소"],
        datasets: [
            {
                data: [65, 25, 5, 5], // 예시 데이터: 승 65%, 패 25%, 무 5%, 취소 5%
            },
        ],
    };

    // 구장별 승률 데이터
    const stadiumWinRateData = {
        labels: ["대구삼성라이온즈파크", "대전(신)", "서울종합운동장 야구장"], // 예시 구장
        datasets: [
            {
                data: [75, 50, 80], // 예시 데이터: 구장별 승률
            },
        ],
    };

    // 홈/어웨이 승률 데이터
    const homeAwayWinRateData = [
        {
            name: "홈 승률",
            population: 70, // 홈 승률 70%
            color: "#2196F3", // 홈 승률 색상 (초록)
            legendFontColor: "#7F7F7F",
            legendFontSize: 15,
        },
        {
            name: "어웨이 승률",
            population: 60, // 어웨이 승률 60%
            color: "#a7cff1", // 어웨이 승률 색상 (파랑)
            legendFontColor: "#7F7F7F",
            legendFontSize: 15,
        },
    ];

    // 예시 값들
    const currentRank = 1; // 현재 순위
    const totalMatches = 20; // 직관 횟수
    const myWinRate = 70; // 내 승률
    const teamWinRate = 45; // 내팀 승률

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.infoContainer}>
                <Image
                    source={require("../../assets/images/profile.png")} // 프로필 이미지
                    style={styles.profileImage} // 프로필 이미지 스타일
                    resizeMode="center"
                />
                <View>
                    <Text style={styles.rankText}>📊 현재 순위: {currentRank}</Text>
                    <Text style={styles.rankText}>🏟️ 내 직관 횟수: {totalMatches}</Text>
                    <Text style={styles.rankText}>🥳 내 승률: {myWinRate}%</Text>
                    <Text style={styles.rankText}>🦁 내팀 승률: {teamWinRate}%</Text>
                </View>
            </View>
            <View style={styles.graphContainer}>
                <View style={styles.tabContainer}>
                    <TouchableOpacity style={styles.tab} onPress={() => setIndex(0)}>
                        <Text style={[styles.tabText, index === 0 && styles.activeTabText]}>승패 통계</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tab} onPress={() => setIndex(1)}>
                        <Text style={[styles.tabText, index === 1 && styles.activeTabText]}>구장별 승률</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tab} onPress={() => setIndex(2)}>
                        <Text style={[styles.tabText, index === 2 && styles.activeTabText]}>홈/어웨이 승률</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollView}>
                    {/* 승패 통계 탭 */}
                    {index === 0 && (
                        <View style={styles.page}>
                            <Text style={styles.title}>승패 통계</Text>
                            <BarChart
                                data={winLossData}
                                width={300}
                                height={220}
                                chartConfig={{
                                    backgroundColor: "#fff", // 배경을 흰색으로 설정
                                    backgroundGradientFrom: "#fff", // 배경 그라디언트 시작
                                    backgroundGradientTo: "#fff", // 배경 그라디언트 끝
                                    decimalPlaces: 2,
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // 그래프 색을 검정으로 설정
                                    style: {
                                        borderRadius: 16,
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 6,
                                    },
                                    yAxisLabel: "$", // Y축에 $를 추가
                                    yAxisSuffix: "%",
                                }}
                                style={styles.chartStyle}
                            />
                        </View>
                    )}

                    {/* 구장별 승률 탭 */}
                    {index === 1 && (
                        <View style={styles.page}>
                            <Text style={styles.title}>구장별 승률</Text>
                            <BarChart
                                data={stadiumWinRateData}
                                width={300}
                                height={220}
                                chartConfig={{
                                    backgroundColor: "#fff", // 배경을 흰색으로 설정
                                    backgroundGradientFrom: "#fff", // 배경 그라디언트 시작
                                    backgroundGradientTo: "#fff", // 배경 그라디언트 끝
                                    decimalPlaces: 2,
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // 그래프 색을 검정으로 설정
                                    style: {
                                        borderRadius: 16,
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 6,
                                    },
                                    yAxisLabel: "", // Y축에 라벨 추가 (예시로 빈 문자열)
                                    yAxisSuffix: "%",
                                }}
                                style={styles.chartStyle}
                            />
                        </View>
                    )}

                    {/* 홈/어웨이 승률 탭 */}
                    {index === 2 && (
                        <View style={styles.page}>
                            <Text style={styles.title}>홈/어웨이 승률</Text>
                            <PieChart
                                data={homeAwayWinRateData}
                                width={300}
                                height={220}
                                chartConfig={{
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // 그래프 색을 검정으로 설정
                                }}
                                accessor="population"
                                backgroundColor="transparent"
                                style={[styles.chartStyle, { paddingLeft: 20 }]}
                            />
                        </View>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    infoContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginTop: 30,
        width: "100%",
        padding: 30,
    },
    rankText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingTop: 20,
        backgroundColor: "#f0f0f0",
        paddingBottom: 10,
    },
    tab: {
        paddingVertical: 10,
    },
    tabText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#666",
    },
    activeTabText: {
        color: "#000",
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: "flex-start",
    },
    page: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 30,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
    },
    chartStyle: {
        borderRadius: 16,
    },
    graphContainer: {
        flex: 3,
    },
    profileImage: {
        width: 100, // 이미지 너비
        height: 100, // 이미지 높이
        borderRadius: 50, // 동그라미로 만들기
        marginRight: 16, // 이미지와 텍스트 간격
        borderColor: "#666",
        borderWidth: 2,
    },
});

export default Index;
