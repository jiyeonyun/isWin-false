import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { auth, firestore } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput } from "react-native";

const index = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [name, setName] = useState("");
    const createUser = () => {
        if (email == "" || password == "" || passwordCheck == "" || name == "") {
            Alert.alert("오류", "이메일과 비밀번호, 닉네임을 입력해주세요.");
            return;
        }
        if (password !== passwordCheck) {
            Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
            return;
        }
        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const currentUser = auth.currentUser;
                const db = firestore;
                if (currentUser) {
                    try {
                        // setDoc으로 uid를 문서 ID로 지정
                        const userDocRef = doc(db, "users", currentUser.uid);
                        await setDoc(userDocRef, {
                            email: currentUser.email,
                            nickName: name,
                            uid: currentUser.uid,
                        });
                    } catch (e) {
                        console.error("Error setting document: ", e);
                    }

                    Alert.alert("회원가입 성공", "회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
                    setIsLogin(true);
                }
            })
            .catch((error) => {
                console.error("회원가입 중 오류 발생: ", error);
            });
    };

    const handleAuth = () => {
        if (email == "" || password == "") {
            Alert.alert("오류", "이메일과 비밀번호를 입력해주세요.");
            return;
        }
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in

                AsyncStorage.setItem("email", email);
                AsyncStorage.setItem("password", password);
                const user = userCredential.user;
                router.replace("/(tabs)");
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                Alert.alert("오류", errorMessage);
            });
    };

    useEffect(() => {
        const checkAuth = async () => {
            const name = await AsyncStorage.getItem("name");
            if (name) {
                router.replace("/(tabs)");
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

                <TextInput
                    style={styles.input}
                    placeholder="이메일"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#666"
                />
                {!isLogin && (
                    <TextInput
                        style={styles.input}
                        placeholder="닉네임"
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor="#666"
                    />
                )}
                <TextInput
                    style={styles.input}
                    placeholder="비밀번호"
                    value={password}
                    placeholderTextColor="#666"
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {!isLogin && (
                    <TextInput
                        style={styles.input}
                        placeholder="비밀번호 확인"
                        value={passwordCheck}
                        onChangeText={setPasswordCheck}
                        secureTextEntry
                        placeholderTextColor="#666"
                    />
                )}
                <Pressable style={styles.button} onPress={isLogin ? handleAuth : createUser}>
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
};

export default index;

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
