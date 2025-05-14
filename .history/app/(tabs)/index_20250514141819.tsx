import SettingModal from "@/components/modal/SettingModal";
import { IconSymbol } from "@/components/ui/IconSymbol";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
    const [name, setName] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isSetting, setIsSetting] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem("name").then((value) => {
            setName(value || "");
        });
        AsyncStorage.getItem("profileImage").then((value) => {
            setProfileImage(value);
        });
    }, [isSetting]);

    const renderInfo = () => {
        return (
            <View style={styles.infoContainer}>
                <View style={styles.profileContainer}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    ) : (
                        <View style={styles.profileImagePlaceholder}>
                            <IconSymbol size={30} name="person.fill" color="gray" />
                        </View>
                    )}
                    <Text style={{ fontSize: 16, marginLeft: 10 }}>
                        {name == "" ? (
                            <Text style={{ fontSize: 16, color: "gray" }}>😢 이름을 설정해주세요</Text>
                        ) : (
                            <Text>
                                안녕하세요<Text style={{ fontWeight: "bold" }}>{name}</Text>님
                            </Text>
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
    profileContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    profileImagePlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
});
