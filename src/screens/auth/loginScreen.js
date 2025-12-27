import React, { useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Alert,
    Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// 导入 Google 登录模块
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// 导入 Apple 登录模块
import appleAuth from '@invertase/react-native-apple-authentication';

const LoginScreen = ({ navigation }) => {
    // // --- 核心认证函数 (统一处理) ---
    // const sendTokenToBackend = (provider, token, userDetails) => {
    //     console.log(`[AUTH] 准备发送 ${provider} Token 到后端进行验证...`);
    //     // TODO: 1. 在此集成 Redux Toolkit Thunk 来调用你的后端 API
    //     //      API 示例: POST /api/auth/social-login
    //     //      Body: { provider: provider, token: token, user: userDetails }
    //     // TODO: 2. 后端返回 JWT Token 后，存储到 SecureStore 并更新 Redux State

    //     // 模拟成功，并导航到主页
    //     Alert.alert("登录成功", `通过 ${provider} 授权，已获取 Token。`, [
    //         {
    //             text: "进入应用",
    //             onPress: () => {
    //                 // 这里是登录成功的导航
    //                 navigation.navigate('Home');
    //             }
    //         }
    //     ]);
    // };

    // // --- 谷歌登录逻辑 ---
    // const handleGoogleLogin = async () => {
    //     try {
    //         await GoogleSignin.hasPlayServices();
    //         const userInfo = await GoogleSignin.signIn();

    //         // 确保获取到 ID Token (这是后端验证的关键)
    //         if (userInfo.idToken) {
    //             sendTokenToBackend(
    //                 'google',
    //                 userInfo.idToken,
    //                 {
    //                     email: userInfo.user.email,
    //                     name: userInfo.user.name
    //                 }
    //             );
    //         } else {
    //             Alert.alert("登录失败", "未获取到 Google ID Token。");
    //         }

    //     } catch (error) {
    //         console.error('[Google Login Error]', error);
    //         if (error.code === statusCodes.SIGN_IN_CANCELLED) {
    //             // 用户取消了登录流程
    //             console.log("用户取消了谷歌登录");
    //         } else if (error.code === statusCodes.IN_PROGRESS) {
    //             // 登录操作正在进行中
    //         } else {
    //             Alert.alert("谷歌登录错误", error.message || "登录流程发生未知错误。");
    //         }
    //     }
    // };

    // // --- 苹果登录逻辑 ---
    // const handleAppleLogin = async () => {
    //     if (Platform.OS !== 'ios') {
    //         Alert.alert("提示", "Apple 登录仅在 iOS 设备上可用。");
    //         return;
    //     }

    //     try {
    //         // 启动 Apple 认证流程
    //         const appleAuthRequestResponse = await appleAuth.performRequest({
    //             requestedOperation: appleAuth.Operation.LOGIN,
    //             // 请求邮箱和全名
    //             requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    //         });

    //         // 获取 authorizationCode 和 identityToken
    //         const { identityToken, authorizationCode, user } = appleAuthRequestResponse;

    //         if (identityToken) {
    //             // identityToken 是后端用来验证用户的关键
    //             sendTokenToBackend(
    //                 'apple',
    //                 identityToken,
    //                 {
    //                     // user 是 Apple 返回的稳定用户 ID
    //                     appleUserId: user,
    //                     // 注意：邮箱和姓名只在第一次授权时返回
    //                     name: appleAuthRequestResponse.fullName,
    //                     email: appleAuthRequestResponse.email
    //                 }
    //             );
    //         } else {
    //             Alert.alert("登录失败", "未获取到 Apple 身份令牌。");
    //         }

    //     } catch (error) {
    //         if (error.code === appleAuth.Error.CANCELED) {
    //             console.log("用户取消了苹果登录");
    //         } else {
    //             console.error('[Apple Login Error]', error);
    //             Alert.alert("苹果登录错误", error.message || "登录流程发生未知错误。");
    //         }
    //     }
    // };

    const handleGoogleLogin = async () => {
        console.log('Google login pressed');
    }

    const handleAppleLogin = async () => {
        console.log('Apple login pressed');
    }

    const handleEmailLogin = () => {
        console.log('Email login pressed');
        // 导航到邮箱登录/注册页面
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>登录</Text>
                <View style={styles.placeholder} />
            </View> */}
            <View style={styles.content}>
                <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
                    <Text style={styles.buttonText}>谷歌gmail账户授权登录</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleAppleLogin}>
                    <Text style={styles.buttonText}>苹果账户授权登录</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleEmailLogin}>
                    <Text style={styles.buttonText}>其他邮箱注册/登录</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#e0e0e0',
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
    },
    backButton: {
        padding: 5,
    },
    backButtonText: {
        fontSize: 24,
        color: '#333',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    placeholder: {
        width: 30, // 保持标题居中
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    button: {
        backgroundColor: '#a0a0a0',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LoginScreen;