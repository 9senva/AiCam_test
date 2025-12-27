import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * 自定义底部导航栏：
 * - 接收 navigation state，渲染三个 tab（AI cam / 灵感 / 我）
 * - 高亮当前激活项
 */
export default function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  const focusedRoute = state.routes[state.index];
  const focusedDescriptor = descriptors[focusedRoute.key];
  const focusedOptions = focusedDescriptor.options;

  if (focusedOptions.tabBarStyle && focusedOptions.tabBarStyle.display === 'none') {
    return null;
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 8 }]}>
      {state.routes.map((route, index) => {
        const label =
          route.name === 'AI_Cam' ? 'AI cam' : route.name === 'Inspiration' ? '灵感' : '我';
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={[styles.tabItem, isFocused && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, isFocused && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: '#bbb',
  },
  tabText: {
    color: '#333',
  },
  tabTextActive: {
    color: '#000',
    fontWeight: '600',
  },
});