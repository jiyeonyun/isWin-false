import { IconSymbol } from "@/components/ui/IconSymbol";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Alert, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const SettingModal = ({
    isSetting,
    setIsSetting,
}: {
    isSetting: boolean;
    setIsSetting: (isSetting: boolean) => void;
}) => {
    const [name, setName] = useState("");
    const [intro, setIntro] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
            Alert.alert("권한 필요", "이미지를 선택하기 위해 갤러리 접근 권한이 필요합니다.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
            AsyncStorage.setItem("profileImage", result.assets[0].uri);
        }
    };

    const resetStorage = () => {
        Alert.alert("초기화", "정말 초기화 하시겠습니까?", [
            { text: "취소", onPress: () => {} },
            {
                text: "초기화",
                onPress: () => {
                    AsyncStorage.clear();
                    setName("");
                    setIntro("");
                    setProfileImage(null);
                    setIsSetting(false);
                },
            },
        ]);
    };

    const saveStorage = () => {
        AsyncStorage.setItem("name", name);
        AsyncStorage.setItem("intro", intro);
        setIsSetting(false);
    };

    useEffect(() => {
        AsyncStorage.getItem("name").then((value) => {
            setName(value || "");
        });
        AsyncStorage.getItem("intro").then((value) => {
            setIntro(value || "");
        });
        AsyncStorage.getItem("profileImage").then((value) => {
            setProfileImage(value);
        });
    }, []);

    return (
        <Modal animationType="fade" transparent={true} visible={isSetting} onRequestClose={() => setIsSetting(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>설정</Text>
                        <Pressable style={styles.closeButton} onPress={() => setIsSetting(false)}>
                            <IconSymbol size={22} name={"xmark"} color="gray" />
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
                    </View>
                    <View style={styles.modalFooter}>
                        <Pressable style={[styles.modalButton, { backgroundColor: "white" }]} onPress={resetStorage}>
                            <Text style={[styles.modalButtonText, { color: "#0059c5" }]}>초기화</Text>
                        </Pressable>
                        <Pressable style={styles.modalButton} onPress={saveStorage}>
                            <Text style={styles.modalButtonText}>저장</Text>
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
        width: 60,
        height: 60,
        borderRadius: 30,
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
