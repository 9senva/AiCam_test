import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Dimensions,
    Modal,
    TouchableOpacity
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const IMAGE_MARGIN = 20;
const IMAGE_WIDTH = width - (IMAGE_MARGIN * 2);

/**
 * 图片生成结果展示页面
 * 
 * @param {{ navigation: object, route: object }} props
 * - route.params.templateImage: 用户选择的模板图信息 { uri, text }
 * - route.params.generatedImageUrl: AI 生成的图片 URL
 */
export default function ImgGenerateScreen({ navigation, route }) {
    // 从导航参数获取数据，并提供默认值以防出错
    const { templateImage, generatedImageUrl } = route.params || {};
    const [modalVisible, setModalVisible] = useState(false);

    // 渲染图片，如果 URI 无效则显示占位符
    const renderImage = (uri, isTemplate = false) => {
        if (uri) {
            return (
                <Image
                    source={{ uri }}
                    style={styles.image}
                    resizeMode="cover"
                />
            );
        }
        return (
            <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>
                    {isTemplate ? '模板图加载失败' : 'AI 生成的图片'}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.container}>
                    {/* 生成图区域 */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => generatedImageUrl && setModalVisible(true)}
                    >
                        <View style={styles.imageContainer}>
                            {renderImage(generatedImageUrl)}
                        </View>
                    </TouchableOpacity>
                </ScrollView>

                {/* 图片放大弹窗 */}
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalContainer}
                        activeOpacity={1}
                        onPress={() => setModalVisible(false)}
                    >
                        {generatedImageUrl ? (
                            <Image
                                source={{ uri: generatedImageUrl }}
                                style={styles.modalImage}
                                resizeMode="contain"
                            />
                        ) : null}

                        {/* 确认按钮 */}
                        <TouchableOpacity
                            style={styles.modalConfirmButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Icon name="checkmark-circle" size={60} color="white" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        alignItems: 'center',
        padding: IMAGE_MARGIN,
    },
    imageContainer: {
        width: IMAGE_WIDTH,
        aspectRatio: 3 / 4, // 保持图片比例
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden', // 确保子元素不会超出圆角
        backgroundColor: '#f0f0f0', // 占位符背景色
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e9e9e9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#aaa',
        fontSize: 16,
    },
    textOverlay: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    imageText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.3)', // 半透明背景以增强可读性
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        overflow: 'hidden', // 确保背景不会超出圆角
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: width,
        height: '80%',
    },
    modalConfirmButton: {
        marginTop: 20,
        padding: 10,
    },
});
