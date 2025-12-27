import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native'; // 导入 Alert 用于模拟分享反馈
import { useSelector } from 'react-redux';
import LoginReminderModal from '../Common/LoginReminderModal';
import ShareModal from '../Common/ShareModal';

/**
 * 用户页（我的）
 * 该页面展示用户信息、余额、充值选项和功能列表。
 * @param {object} navigation - React Navigation 导航对象，用于页面跳转。
 */
export default function UserScreen({ navigation }) {
  // 1. 从 Redux 状态中获取用户的登录状态
  const isLoggedIn = useSelector((state) => state.auth?.isLoggedIn || false);
  // 2. 状态：控制登录提醒弹窗的显示与隐藏
  const [isModalVisible, setModalVisible] = useState(false);
  // 3. 状态：控制分享弹窗的显示与隐藏
  const [isShareModalVisible, setShareModalVisible] = useState(false);

  // --- 逻辑函数 ---

  // 处理实际的分享逻辑
  const handleShare = (channelId) => {
    // 实际应用中：这里会调用 react-native-share 或原生模块进行分享
    Alert.alert("分享成功", `内容已分享到: ${channelId}`);
    // 注意：ShareModal 内部会在调用 onShare 后自动关闭
  };

  /**
   * 购买/充值币的逻辑。这是一个需要登录才能执行的操作。
   * @param {string} pkg - 购买的套餐标识 (e.g., 'small', 'mid', 'large')
   */
  const onBuy = (pkg) => {
    if (!isLoggedIn) {
      setModalVisible(true);
      return;
    }
    // TODO: 执行实际的购买逻辑
    console.log('购买', pkg);
  };

  // 导航函数：跳转到更换头像页面
  const goToChangeAvatar = () => {
    navigation.navigate('ChangeAvatar');
  };

  // 导航函数：跳转到规则页面
  const goToRules = () => {
    navigation.navigate('Rules');
  };

  // 导航函数：跳转到说明页面
  const goToInstructions = () => {
    navigation.navigate('Instructions');
  };

  // 导航函数：跳转到收藏页面
  const goToFavorite = () => {
    navigation.navigate('Favorite');
  };

  // 导航函数：处理弹窗点击“去登录”后的逻辑
  const goToLogin = () => {
    setModalVisible(false);
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      {/* 头部区域：头像和用户信息 */}
      <View style={styles.header}>
        {/* 点击头像区域跳转到更换头像页面 */}
        <TouchableOpacity onPress={goToChangeAvatar}>
          <View style={styles.avatar}>
            <Image
              source={require('../../assets/images/default_avatar.png')}
              style={styles.avatarImg}
            />
          </View>
        </TouchableOpacity>

        {/* 用户信息展示区（用户名和余额） */}
        <View style={styles.userInfo}>
          <TouchableOpacity>
            <Text style={styles.username}>用户名</Text>
          </TouchableOpacity>
          <Text style={styles.balance}>剩余：xx</Text>
        </View>
      </View>

      {/* 充值套餐行 */}
      <View style={styles.packRow}>
        <TouchableOpacity style={styles.pack} onPress={() => onBuy('small')}>
          <Text style={styles.packPrice}>$19.9</Text>
          <Text style={styles.packCoin}>200币</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pack} onPress={() => onBuy('mid')}>
          <Text style={styles.packPrice}>$39.9</Text>
          <Text style={styles.packCoin}>500币</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pack} onPress={() => onBuy('large')}>
          <Text style={styles.packPrice}>$199</Text>
          <Text style={styles.packCoin}>3000币</Text>
        </TouchableOpacity>
      </View>

      {/* 邀请按钮：点击打开分享弹窗 */}
      <TouchableOpacity
        style={styles.inviteBtn}
        onPress={() => { setShareModalVisible(true) }}
      >
        <Text style={styles.inviteText}>邀请新客户获取免费币</Text>
      </TouchableOpacity>

      {/* 功能列表 */}
      <View style={styles.list}>
        {/* 查看规则 */}
        <TouchableOpacity
          style={styles.listItem}
          onPress={goToRules}
        >
          <Text>查看xx币消费规则</Text>
        </TouchableOpacity>
        {/* 我收藏的模板 */}
        <TouchableOpacity
          style={styles.listItem}
          onPress={goToFavorite}
        >
          <Text>我收藏的模板</Text>
        </TouchableOpacity>
        {/* 说明/帮助 */}
        <TouchableOpacity
          style={styles.listItem}
          onPress={goToInstructions}
        >
          <Text>说明</Text>
        </TouchableOpacity>
      </View>

      {/* 登录提醒弹窗组件 */}
      <LoginReminderModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onLogin={goToLogin}
      />

      {/* 分享弹窗组件*/}
      <ShareModal
        visible={isShareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onShare={handleShare}
      />
    </View>
  );
}

// --- 样式定义 ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 20 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: 'cover',
  },
  userInfo: { marginLeft: 12 },
  username: { fontSize: 16, fontWeight: '600' },
  balance: { color: '#666', marginTop: 6 },

  packRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  pack: {
    flex: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 6,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  packPrice: { fontWeight: '700' },
  packCoin: { color: '#444', marginTop: 6 },

  inviteBtn: {
    backgroundColor: '#bbb',
    padding: 12,
    borderRadius: 8,
    marginTop: 14,
    alignItems: 'center',
  },
  inviteText: { color: '#fff' },

  list: { marginTop: 18 },
  listItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});