import { IconSymbol } from "@/components/ui/IconSymbol";
import { firestore } from "@/firebaseConfig";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { getAuth, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } = Constants.expoConfig?.extra ?? {};
console.log("CLOUDINARY_CLOUD_NAME", CLOUDINARY_CLOUD_NAME);
console.log("CLOUDINARY_UPLOAD_PRESET", CLOUDINARY_UPLOAD_PRESET);

const SettingModal = ({
    isSetting,
    setIsSetting,
}: {
    isSetting: boolean;
    setIsSetting: (isSetting: boolean) => void;
}) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const [name, setName] = useState<string>("");
    const [intro, setIntro] = useState<string>("");
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        console.log("useEffect 실행됨");

        const loadUserData = async () => {
            console.log("loadUserData 함수 시작");

            if (!user?.uid) {
                console.log("user.uid가 없습니다");
                return;
            }
            console.log("현재 user 객체:", user);
            console.log("user.uid:", user.uid);

            try {
                const docRef = doc(firestore, "users", user.uid);
                console.log("docRef 생성됨");

                const docSnap = await getDoc(docRef);
                console.log("docSnap 가져옴");

                if (docSnap.exists()) {
                    console.log("문서가 존재합니다");
                    const docData = docSnap.data();
                    console.log("Firestore 데이터:", docData);

                    setName(docData?.nickName || docData?.name || user.displayName || "");
                    setIntro(docData?.intro || "");
                    setProfileImage(docData?.profileImage || user.photoURL || null);
                } else {
                    console.log("문서가 존재하지 않습니다");
                    setName(user.displayName || "");
                    setProfileImage(user.photoURL || null);
                }
            } catch (error) {
                console.error("Firestore 데이터 가져오기 실패:", error);
                // 에러 발생 시에도 기본값 설정
                setName(user.displayName || "");
                setProfileImage(user.photoURL || null);
            }
        };

        loadUserData();
    }, []);

    const pickImage = async () => {
        if (profileImage) {
            Alert.alert("이미 설정됨", "삭제하시겠습니까?", [
                { text: "취소" },
                {
                    text: "삭제",
                    onPress: async () => {
                        setProfileImage(null);
                        if (user) {
                            await updateProfile(user, { photoURL: null });
                            await setDoc(doc(firestore, "users", user.uid), { profileImage: null }, { merge: true });
                        }
                    },
                },
            ]);
            return;
        }

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("권한 필요", "이미지를 선택하려면 권한이 필요합니다.");
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.4,
                base64: true,
            });

            if (!result.canceled && user) {
                // 로딩 상태 표시
                Alert.alert("업로드 중", "이미지를 업로드하고 있습니다...");

                const base64Image = result.assets[0].base64;

                // Cloudinary 업로드
                const formData = new FormData();
                formData.append("file", `data:image/jpeg;base64,${base64Image}`);
                formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET || "");

                const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();
                console.log("data", data);
                if (data.secure_url) {
                    // Firebase Auth 프로필 업데이트
                    await updateProfile(user, { photoURL: data.secure_url });

                    // Firestore 업데이트
                    await setDoc(doc(firestore, "users", user.uid), { profileImage: data.secure_url }, { merge: true });

                    setProfileImage(data.secure_url);
                    Alert.alert("성공", "프로필 이미지가 업데이트되었습니다.");
                } else {
                    throw new Error("이미지 업로드 실패");
                }
            }
        } catch (error) {
            console.error("이미지 업로드 오류:", error);
            Alert.alert("오류", "이미지 업로드 중 문제가 발생했습니다.");
        }
    };

    const saveStorage = async () => {
        if (!user) return;

        try {
            await updateProfile(user, { displayName: name });

            await setDoc(doc(firestore, "users", user.uid), { name, intro }, { merge: true });

            setIsSetting(false);
        } catch (error) {
            console.error("사용자 저장 오류:", error);
            Alert.alert("오류", "저장 중 문제가 발생했습니다.");
        }
    };

    return (
        <Modal animationType="fade" transparent={true} visible={isSetting} onRequestClose={() => setIsSetting(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>설정</Text>
                        <Pressable style={styles.closeButton} onPress={() => setIsSetting(false)}>
                            <IconSymbol size={22} name="xmark" color="gray" />
                        </Pressable>
                    </View>

                    <View style={styles.modalInfo}>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 20,
                            }}
                        >
                            <Pressable onPress={pickImage} style={styles.profileImageContainer}>
                                {profileImage ? (
                                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                                ) : (
                                    <View style={styles.profileImagePlaceholder}>
                                        <IconSymbol size={30} name="person.fill" color="gray" />
                                    </View>
                                )}
                            </Pressable>
                        </View>

                        <View style={styles.modalInfoItem}>
                            <Text style={styles.modalInfoItemTitle}>이름</Text>
                            <TextInput style={styles.modalInput} value={name} onChangeText={setName} />
                        </View>

                        <View style={styles.modalInfoItem}>
                            <Text style={styles.modalInfoItemTitle}>소개</Text>
                            <TextInput style={styles.modalInput} value={intro} onChangeText={setIntro} />
                        </View>

                        <View style={styles.modalInfoItem}>
                            <Pressable
                                onPress={() => {
                                    signOut(auth);
                                    setName("");
                                    setIntro("");
                                    setProfileImage(null);
                                    setIsSetting(false);
                                    router.replace("/(auth)");
                                }}
                            >
                                <Text>로그아웃</Text>
                            </Pressable>
                        </View>
                    </View>

                    <View style={styles.modalFooter}>
                        <Pressable style={[styles.modalButton, { backgroundColor: "white" }]} onPress={saveStorage}>
                            <Text style={[styles.modalButtonText, { color: "#0059c5" }]}>저장</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default SettingModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    modalInfo: {
        marginBottom: 16,
    },
    closeButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        marginTop: 10,
    },
    closeButtonText: {
        marginLeft: 8,
        color: "gray",
    },
    modalInput: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 5,
        padding: 8,
        flex: 1,
        marginLeft: 10,
    },
    modalInfoItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    modalInfoItemTitle: {
        fontSize: 14,
        color: "#666",
        fontWeight: "bold",
    },
    modalButton: {
        backgroundColor: "#0059c5",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    modalButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
    profileImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: "hidden",
        marginLeft: 10,
    },
    profileImage: {
        width: "100%",
        height: "100%",
    },
    profileImagePlaceholder: {
        width: "100%",
        height: "100%",
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
});
