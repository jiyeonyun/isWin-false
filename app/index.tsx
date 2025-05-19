import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput } from "react-native";

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const handleAuth = () => {
        // TODO: 실제 인증 로직 구현
        router.replace("/(tabs)/main");
    };

    useEffect(() => {
        const checkAuth = async () => {
            const name = await AsyncStorage.getItem("name");
            if (name) {
                router.replace("/(tabs)/main");
            }
        };
        checkAuth();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ThemedView style={styles.content}>
                <ThemedText type="title" style={styles.title}>
                    {isLogin ? "로그인" : "회원가입"}
                </ThemedText>

                {!isLogin && (
                    <TextInput
                        style={styles.input}
                        placeholder="이름"
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor="#666"
                    />
                )}

                <TextInput
                    style={styles.input}
                    placeholder="이메일"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#666"
                />

                <TextInput
                    style={styles.input}
                    placeholder="비밀번호"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor="#666"
                />

                <Pressable style={styles.button} onPress={handleAuth}>
                    <Text style={styles.buttonText}>{isLogin ? "로그인" : "회원가입"}</Text>
                </Pressable>

                <Pressable style={styles.switchButton} onPress={() => setIsLogin(!isLogin)}>
                    <Text style={styles.switchButtonText}>
                        {isLogin ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
                    </Text>
                </Pressable>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 30,
        textAlign: "center",
    },
    input: {
        backgroundColor: "#f5f5f5",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#0a7ea4",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    switchButton: {
        marginTop: 20,
        alignItems: "center",
    },
    switchButtonText: {
        color: "#0a7ea4",
        fontSize: 14,
    },
});
