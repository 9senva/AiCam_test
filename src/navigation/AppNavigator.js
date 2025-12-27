/**
 * App 入口，所有导航由 AppNavigator 管理
 */
import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
    const isDarkMode = useColorScheme() === 'dark';

    return (
        <SafeAreaProvider>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            {/* 路由入口，内部已包含 NavigationContainer 和所有页面 */}
            <AppNavigator />
        </SafeAreaProvider>
    );
}

export default App;