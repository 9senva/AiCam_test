import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const dummyTemplates = Array.from({ length: 6 }).map((_, i) => ({
    id: String(i),
}));

export default function FavoriteScreen() {
    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card}>
            {/* 用 View 作为图片占位，避免 require 丢失的静态资源报错 */}
            <View style={styles.placeholderBox}>
                <Text style={styles.placeholderText}>模板预览</Text>
            </View>
            <Text style={styles.cardLabel}>AI提前生成的模板图</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={dummyTemplates}
                keyExtractor={(i) => i.id}
                numColumns={2}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    list: { padding: 12 },
    card: {
        flex: 1,
        margin: 8,
        height: 150,
        backgroundColor: '#fafafa',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    /* 占位视图：替代缺失的图片文件 */
    placeholderBox: {
        width: '100%',
        height: '70%',
        backgroundColor: '#eaeaea',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: { color: '#999', fontSize: 12 },
    cardLabel: { fontSize: 12, color: '#999', marginTop: 6 },
});