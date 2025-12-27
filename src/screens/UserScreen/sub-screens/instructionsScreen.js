import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

/**
 * 版本说明 页面
 * - 通过 Stack header 提供返回按钮（App.tsx 已注册）
 * - 页面主体按图示显示多条规则说明，使用 ScrollView 以防内容超出
 */
export default function InstructionsScreen() {
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.ruleItem}>版本号：v0.0.1</Text>
                <Text style={styles.ruleItem}>发布时间：</Text>
                {/* 如需补充更多条款，可在此处继续添加 Text */}
                <Text style={styles.ruleItem}>联系我们：</Text>
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