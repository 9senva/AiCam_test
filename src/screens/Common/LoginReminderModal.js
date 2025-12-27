import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * 登录提醒弹窗组件
 * * 当用户尝试访问需要登录才能使用的功能时，用于提醒用户并提供登录或稍后操作的选项。
 * * @param {boolean} visible - 控制弹窗是否可见
 * @param {function} onClose - 用户点击“稍后”或弹窗外部关闭时触发的回调
 * @param {function} onLogin - 用户点击“去登录”按钮时触发的回调
 */
const LoginReminderModal = ({ visible, onClose, onLogin }) => {
  return (
    // Modal 是 React Native 中用于显示覆盖内容的组件
    <Modal
      // transparent={true} 允许底层内容可见，常用于自定义背景遮罩
      transparent={true}
      // animationType="fade" 设置弹窗出现时的动画效果
      animationType="fade"
      // visible 控制弹窗的显示与隐藏
      visible={visible}
      // onRequestClose 是 Android 上的标准属性，用于处理硬件返回按钮事件
      onRequestClose={onClose}
    >
      {/* 外部 View 负责全屏遮罩和居中显示内容 */}
      <View style={styles.centeredView}>
        {/* 弹窗内容容器 */}
        <View style={styles.modalView}>
          {/* 弹窗标题 */}
          <Text style={styles.modalTitle}>提示</Text>
          {/* 弹窗主要提示文本 */}
          <Text style={styles.modalText}>您还未登录，请先登录</Text>

          {/* 按钮容器，用于横向排列两个按钮 */}
          <View style={styles.buttonContainer}>
            {/* “稍后”按钮 */}
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onClose} // 点击关闭弹窗
            >
              <Text style={styles.textStyle}>稍后</Text>
            </TouchableOpacity>

            {/* “去登录”按钮 */}
            <TouchableOpacity
              style={[styles.button, styles.buttonLogin]}
              onPress={onLogin} // 点击触发登录跳转逻辑
            >
              {/* 注意：通常需要覆盖 buttonLogin 样式中的颜色，以适应 textStyle 的默认颜色 */}
              <Text style={[styles.textStyle, { color: 'white' }]}>去登录</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- 样式定义 ---
const styles = StyleSheet.create({
  // 居中视图样式：实现全屏半透明遮罩并居中对齐子元素
  centeredView: {
    flex: 1, // 占满整个屏幕
    justifyContent: 'center', // 垂直居中
    alignItems: 'center', // 水平居中
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明黑色遮罩
  },
  // 弹窗主体样式
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10, // 圆角
    padding: 25,
    alignItems: 'center', // 内容居中
    shadowColor: '#000', // iOS 阴影颜色
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25, // iOS 阴影不透明度
    shadowRadius: 4, // iOS 阴影半径
    elevation: 5, // Android 阴影（海拔）
    width: '80%', // 弹窗宽度占屏幕宽度的80%
  },
  // 标题样式
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  // 正文文本样式
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  // 按钮容器样式：用于横向排列按钮
  buttonContainer: {
    flexDirection: 'row', // 横向布局
    justifyContent: 'space-between', // 按钮之间留白，保持两端对齐
    width: '100%',
  },
  // 基础按钮样式
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2,
    flex: 1, // 确保两个按钮平分宽度
    marginHorizontal: 10, // 按钮之间留出间距
  },
  // “稍后”/取消按钮样式
  buttonCancel: {
    backgroundColor: '#f0f0f0', // 浅灰色背景
  },
  // “去登录”按钮样式（主操作按钮）
  buttonLogin: {
    backgroundColor: '#2196F3', // 蓝色背景
  },
  // 按钮内部文字样式
  textStyle: {
    color: '#333', // 默认文字颜色
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LoginReminderModal;