import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// 计算文本区域的最大宽度：屏幕宽度的90% - (按钮宽度*2 + 按钮边距*2 + 容器内边距)
// 按钮宽度 40，marginHorizontal 5 (即左右各5，共10)，两个按钮共 100
// 容器 paddingHorizontal 8 (即左右各8，共16)
// 总扣除 = 116。预留一点余量取 120。
const MAX_TEXT_WIDTH = SCREEN_WIDTH * 0.9 - 100;

/**
 * PoseGuideOverlay 组件
 */
const PoseGuideOverlay = ({ guideTexts = [] }) => {
    const [currentGuideIndex, setCurrentGuideIndex] = useState(0);
    const isExpanded = useSharedValue(true);

    useEffect(() => {
        setCurrentGuideIndex(0);
    }, [guideTexts]);

    const handlePrevGuide = () => {
        if (guideTexts.length === 0) return;
        setCurrentGuideIndex(prev => (prev > 0 ? prev - 1 : guideTexts.length - 1));
    };

    const handleNextGuide = () => {
        if (guideTexts.length === 0) return;
        setCurrentGuideIndex(prev => (prev < guideTexts.length - 1 ? prev + 1 : 0));
    };

    const toggleExpand = () => {
        isExpanded.value = !isExpanded.value;
    };

    // 1. 外部容器：控制整体位移和圆角切换
    const containerAnimatedStyle = useAnimatedStyle(() => {
        const translateY = isExpanded.value
            ? withSpring(0)
            : withDelay(100, withSpring(15));

        return {
            transform: [{ translateY }],
            borderRadius: withTiming(isExpanded.value ? 30 : 15, { duration: 250 }),
        };
    });

    // 2. 左右按钮：收缩时完全消失且不占位
    const buttonAnimatedStyle = useAnimatedStyle(() => {
        const duration = 250;
        const active = isExpanded.value;
        return {
            opacity: active ? withDelay(100, withTiming(1, { duration })) : withTiming(0, { duration }),
            width: active ? withDelay(100, withTiming(40, { duration })) : withTiming(0, { duration }),
            height: active ? withDelay(100, withTiming(40, { duration })) : withTiming(0, { duration }),
            transform: [{ scale: active ? withDelay(100, withTiming(1)) : withTiming(0) }],
            // 关键：消除 margin 防止占位
            marginHorizontal: active ? withTiming(5, { duration }) : withTiming(0, { duration }),
        };
    });

    // 3. 中间文本内容：控制高度和宽度收缩
    const contentAnimatedStyle = useAnimatedStyle(() => {
        const duration = 250;
        const active = isExpanded.value;
        return {
            opacity: active ? withDelay(150, withTiming(1, { duration })) : withTiming(0, { duration }),
            height: active ? withDelay(100, withTiming(50, { duration })) : withTiming(0, { duration }), // 增加高度以容纳两行文本 (30 -> 50)
            marginTop: active ? withTiming(4, { duration }) : withTiming(0, { duration }),
            // 限制展开时的宽度，收缩时归零
            width: active ? withTiming(MAX_TEXT_WIDTH, { duration }) : withTiming(0, { duration }),
        };
    });

    if (!guideTexts || guideTexts.length === 0) return null;

    return (
        <Animated.View style={[styles.guideContainer, containerAnimatedStyle]}>
            {/* 左侧切换按钮 */}
            <Animated.View style={[styles.buttonWrapper, buttonAnimatedStyle]}>
                <TouchableOpacity onPress={handlePrevGuide} style={styles.guideButton}>
                    <Icon name="chevron-back" size={20} color="#fff" />
                </TouchableOpacity>
            </Animated.View>

            {/* 中间文本区域 */}
            <View style={styles.guideTextContainer}>
                <TouchableOpacity onPress={toggleExpand} activeOpacity={0.8} style={styles.labelClickArea}>
                    <View style={styles.guideLabelContainer}>
                        <Text style={styles.guideLabel}>Pose指导</Text>
                    </View>
                </TouchableOpacity>

                <Animated.View style={[styles.textContent, contentAnimatedStyle]}>
                    <Text style={styles.guideText} numberOfLines={2} ellipsizeMode="tail">
                        {guideTexts[currentGuideIndex]}
                    </Text>
                </Animated.View>
            </View>

            {/* 右侧切换按钮 */}
            <Animated.View style={[styles.buttonWrapper, buttonAnimatedStyle]}>
                <TouchableOpacity onPress={handleNextGuide} style={styles.guideButton}>
                    <Icon name="chevron-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    guideContainer: {
        position: 'absolute',
        bottom: 135,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: 8,
        paddingVertical: 8,
        zIndex: 10,
        // 不要设置 width: '90%'，让子元素决定宽度
    },
    buttonWrapper: {
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    guideButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    guideTextContainer: {
        // 删除了 flex: 1，使其自适应内容宽度
        alignItems: 'center',
        justifyContent: 'center',
    },
    labelClickArea: {
        alignItems: 'center',
        paddingVertical: 2,
    },
    guideLabelContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
    },
    guideLabel: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    textContent: {
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    guideText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
        width: '100%', // 保持与 contentAnimatedStyle 宽度一致
    },
});

export default PoseGuideOverlay;