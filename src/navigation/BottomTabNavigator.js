import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import AICamera from '../screens/AI_CameraScreen';
import Inspiration from '../screens/InspirationScreen';
import User from '../screens/UserScreen';
import CustomTabBar from '../screens/Common/CustomTabBar';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tab.Screen name="AI_Cam" component={AICamera} />
            <Tab.Screen name="Inspiration" component={Inspiration} />
            <Tab.Screen name="User" component={User} />
        </Tab.Navigator>
    );
}