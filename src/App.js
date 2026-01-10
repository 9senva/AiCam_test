/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { Provider } from 'react-redux';
import * as React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { HomeIndicator } from 'react-native-home-indicator';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AI_CameraStackScreen, UserStackScreen } from './navigation/StackNavigators'

import store from './store';
import Inspiration from './screens/InspirationScreen';
import CustomTabBar from './screens/Common/CustomTabBar';

const Tab = createBottomTabNavigator();

function App() {
    const isDarkMode = useColorScheme() === 'dark';

    React.useEffect(() => {
        // Android: 启用沉浸式模式，隐藏底部导航栏（包括手势白条）
        SystemNavigationBar.stickyImmersive();
    }, []);

    return (
        <Provider store={store}>
            {/* iOS: 自动隐藏 Home Indicator (小白条) */}
            <HomeIndicator autoHidden />
            <SafeAreaProvider>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
                <NavigationContainer>
                    <Tab.Navigator
                        screenOptions={{ headerShown: false }}
                        tabBar={(props) => <CustomTabBar {...props} />}
                    >
                        <Tab.Screen
                            name="AI_Cam"
                            component={AI_CameraStackScreen}
                            options={({ route }) => ({
                                tabBarStyle: ((route) => {
                                    const routeName = getFocusedRouteNameFromRoute(route) ?? 'AICamera';
                                    if (['AICamera'].includes(routeName)) {
                                        return undefined;
                                    }
                                    return { display: 'none' };
                                })(route),
                            })}
                        />
                        <Tab.Screen name="Inspiration" component={Inspiration} />
                        <Tab.Screen
                            name="User"
                            component={UserStackScreen}
                            options={({ route }) => ({
                                tabBarStyle: ((route) => {
                                    const routeName = getFocusedRouteNameFromRoute(route) ?? 'UserMain';
                                    if (['UserMain'].includes(routeName)) {
                                        return undefined;
                                    }
                                    return { display: 'none' };
                                })(route),
                            })}
                        />
                    </Tab.Navigator>

                </NavigationContainer>
            </SafeAreaProvider>
        </Provider>

    );
}

export default App;
