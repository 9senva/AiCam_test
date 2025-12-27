import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 相机页的子页面导航器
import AI_CameraScreen from '../screens/AI_CameraScreen';
import BackgroundCamera from '../screens/AI_CameraScreen/sub_screens/BackgroundCameraScreen';
import ImgGenerateScreen from '../screens/AI_CameraScreen/sub_screens/ImgGenerateScreen';
import BackgroundPreview from '../screens/AI_CameraScreen/sub_screens/BackgroundPreviewScreen';

// 用户页的子页面导航器
import User from '../screens/UserScreen';
import ChangeAvatarScreen from '../screens/UserScreen/sub-screens/changeAvatarScreen';
import RulesScreen from '../screens/UserScreen/sub-screens/rulesScreen';
import FavoriteScreen from '../screens/UserScreen/sub-screens/favoriteScreen';
import InstructionsScreen from '../screens/UserScreen/sub-screens/instructionsScreen';
import LoginScreen from '../screens/auth/loginScreen';



const UserStack = createNativeStackNavigator(); // 为用户页创建栈导航
const AI_CameraStack = createNativeStackNavigator(); // 为相机页创建栈导航

// AI相机页的栈导航器
function AI_CameraStackScreen() {
    return (
        <AI_CameraStack.Navigator>
            <AI_CameraStack.Screen
                name="AICamera"
                component={AI_CameraScreen}
                options={{ headerShown: false }}
            />
            <AI_CameraStack.Screen
                name="BackgroundCamera"
                component={BackgroundCamera}
                options={{ title: 'AI相机' }}
            />
            <AI_CameraStack.Screen
                name="ImgGenerate"
                component={ImgGenerateScreen}
                options={{ title: '' }}
            />
            <AI_CameraStack.Screen
                name="BackgroundPreview"
                component={BackgroundPreview}
                options={{ headerShown: false }}
            />
        </AI_CameraStack.Navigator>
    )
}

// 用户页的栈导航器
function UserStackScreen() {
    return (
        <UserStack.Navigator
            screenOptions={{
                headerShown: true,
            }}
        >
            <UserStack.Screen
                name="UserMain"
                component={User}
                options={{ headerShown: false }} // 在标签页中隐藏头部
            />
            <UserStack.Screen
                name="ChangeAvatar"
                component={ChangeAvatarScreen}
                options={{ title: '修改头像' }}
            />
            <UserStack.Screen
                name="Rules"
                component={RulesScreen}
                options={{ title: '使用规则' }}
            />
            <UserStack.Screen
                name="Instructions"
                component={InstructionsScreen}
                options={{ title: '版本说明' }}
            />
            <UserStack.Screen
                name="Favorite"
                component={FavoriteScreen}
                options={{ title: '收藏模板' }}
            />
            <UserStack.Screen
                name="Login"
                component={LoginScreen}
                options={{ title: '登录' }}
            />
        </UserStack.Navigator>
    );
}

// 导出相机页和用户页的栈导航器
export { AI_CameraStackScreen, UserStackScreen };
