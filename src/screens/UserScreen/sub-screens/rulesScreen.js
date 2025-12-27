import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

/**
 * xx币消耗规则 页面
 * - 通过 Stack header 提供返回按钮（App.tsx 已注册）
 * - 页面主体按图示显示多条规则说明，使用 ScrollView 以防内容超出
 */
export default function RulesScreen() {
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.ruleItem}>1. 根据场景生成一张参考图消耗 x 个币（待定）</Text>
                <Text style={styles.ruleItem}>2. 每次 POSE 实时指引 1 次消耗 2 个币。</Text>
                {/* 如需补充更多条款，可在此处继续添加 Text */}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 16 },
    ruleItem: {
        fontSize: 15,
        color: '#333',
        marginBottom: 12,
        lineHeight: 22,
    },
});