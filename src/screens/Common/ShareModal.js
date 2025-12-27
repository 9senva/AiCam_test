import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform, // 用于处理平台特定样式
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// 假设的分享渠道图标数据
const shareChannels = [
    { id: 'wechat', name: '微信好友', icon: 'WeChatIcon' },
    { id: 'moments', name: '朋友圈', icon: 'MomentsIcon' },
    { id: 'qq', name: 'QQ', icon: 'QQIcon' },
    { id: 'link', name: '复制链接', icon: 'LinkIcon' },
];

/**
 * 常规分享弹窗组件 (ShareActionSheet)
 * 从屏幕底部弹出的操作表样式模态框，用于选择分享渠道。
 * * @param {boolean} visible - 控制弹窗是否可见
 * @param {function} onClose - 关闭弹窗的回调函数
 * @param {function} onShare - 点击特定渠道分享时的回调函数 (接收 channelId)
 */
const ShareModal = ({ visible, onClose, onShare }) => {

    // 模拟的图标组件（在实际应用中，你需要导入和使用真实的图标库，如 react-native-vector-icons）
    const IconPlaceholder = ({ name }) => (
        <View style={styles.iconPlaceholder}>
            <Text style={styles.iconText}>{name[0]}</Text>
        </View>
    );

    return (
        <SafeAreaProvider>
            <Modal
                transparent={true}
                // 使用 slide 动画从底部滑出
                animationType="slide"
                visible={visible}
                onRequestClose={onClose}
            >
                {/* 外部的 TouchableOpacity 用于点击遮罩层关闭弹窗 */}
                <TouchableOpacity
                    style={styles.container}
                    activeOpacity={1} // 禁用点击时的透明度变化
                    onPress={onClose} // 点击背景关闭
                >
                    {/*
          阻止点击内部视图时触发关闭事件，防止点击内容区域关闭
          SafeAreaView 确保内容不会被 iOS 齐刘海或底部 Home 指示条遮挡
        */}
                    <SafeAreaView style={styles.modalContent} onStartShouldSetResponder={() => true}>

                        <Text style={styles.title}>分享到</Text>

                        {/* 渠道列表容器 */}
                        <View style={styles.channelRow}>
                            {shareChannels.map((channel) => (
                                <TouchableOpacity
                                    key={channel.id}
                                    style={styles.channelItem}
                                    onPress={() => {
                                        onShare(channel.id);
                                        onClose(); // 分享后关闭弹窗
                                    }}
                                >
                                    {/* 渠道图标 */}
                                    <IconPlaceholder name={channel.icon} />
                                    {/* 渠道名称 */}
                                    <Text style={styles.channelName}>{channel.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* 取消按钮 */}
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>取消</Text>
                        </TouchableOpacity>

                    </SafeAreaView>
                </TouchableOpacity>
            </Modal>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    // 模态框背景遮罩样式
    container: {
        flex: 1,
        justifyContent: 'flex-end', // 将内容推到底部
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // 半透明黑色背景
    },

    // 模态框内容区域样式
    modalContent: {
        backgroundColor: 'white',
        // 确保内容从底部安全区域开始
        paddingTop: 10,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: 15,
    },

    // 标题样式
    title: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingVertical: 10,
        marginBottom: 10,
    },

    // 渠道图标行容器
    channelRow: {
        flexDirection: 'row',
        justifyContent: 'space-around', // 均匀分布图标
        paddingBottom: 20,
        paddingHorizontal: 5,
    },

    // 单个渠道项样式
    channelItem: {
        alignItems: 'center', // 图标和文本居中
        width: 70, // 固定宽度以保持一致
    },

    // 图标占位符样式 (实际应用中替换为 Image 或 Icon)
    iconPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    iconText: {
        color: '#999',
        fontSize: 18,
        fontWeight: 'bold',
    },

    // 渠道名称文本样式
    channelName: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
    },

    // 取消按钮样式
    cancelButton: {
        paddingVertical: 15,
        backgroundColor: '#f8f8f8',
        marginTop: 10,
        marginBottom: Platform.OS === 'ios' ? 0 : 10, // 底部留出空间，Android 可以少留一点
        borderTopWidth: 1,
        borderTopColor: '#eee',
        borderRadius: 8,
    },
    cancelButtonText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
});

export default ShareModal;