/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { Provider } from 'react-redux';
import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AI_CameraStackScreen, UserStackScreen } from './src/navigation/StackNavigators'

import store from './src/store';
import Inspiration from './src/screens/InspirationScreen';
import CustomTabBar from './src/screens/Common/CustomTabBar';

const Tab = createBottomTabNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
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
