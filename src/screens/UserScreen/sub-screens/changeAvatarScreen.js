import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

/**
 * 修改用户头像页面
 * - 可选择本地图片作为新头像
 * - 预览当前头像，点击按钮更换
 */
export default function ChangeAvatarScreen() {
    // 默认头像（可替换为你的 assets 路径或网络图片）
    const [avatar, setAvatar] = useState(require('../../../assets/images/default_avatar.png'));

    // 选择图片
    const pickImage = () => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                maxWidth: 400,
                maxHeight: 400,
                quality: 0.8,
            },
            (response) => {
                if (response.assets && response.assets.length > 0) {
                    setAvatar({ uri: response.assets[0].uri });
                }
            }
        );
    };

    return (
        <View style={styles.container}>
            <Image source={avatar} style={styles.avatarImg} />
            <TouchableOpacity style={styles.changeBtn} onPress={pickImage}>
                <Text style={styles.changeBtnText}>选择新头像</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
    title: { fontSize: 18, fontWeight: '600', marginBottom: 24 },
    avatarImg: { width: 200, height: 200, borderRadius: 100, backgroundColor: '#eee', marginBottom: 24 },
    changeBtn: {
        backgroundColor: '#4a90e2',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    changeBtnText: { color: '#fff', fontSize: 16 },
});