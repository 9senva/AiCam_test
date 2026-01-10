# MyAPP_v1 开发指南

## ⚠️ 开发环境安全性配置 (重要)

本项目为了方便开发调试（特别是连接使用自签名证书或 IP 地址的后端服务器），在原生代码层面对网络安全性进行了**降级处理**。

**注意：以下配置仅适用于开发环境 (Debug)。在构建生产环境版本 (Release) 发布前，必须移除或修改这些配置，否则会存在严重的安全漏洞（如中间人攻击）。**

### Android 平台改动

1.  **全局 SSL 证书信任 (MainApplication.kt)**
    *   **文件位置**: [`android/app/src/main/java/com/myapp_v1/MainApplication.kt`](android/app/src/main/java/com/myapp_v1/MainApplication.kt)
    *   **改动内容**: 在 `onCreate` 方法中注入了自定义的 `OkHttpClient`。
    *   **作用**:
        *   信任所有 SSL 证书（包括自签名证书）。
        *   `HostnameVerifier` 返回 `true`，允许访问域名与证书不匹配的服务器（例如直接通过 IP 访问 HTTPS）。

2.  **网络安全配置 (Network Security Config)**
    *   **配置文件**: [`android/app/src/main/res/xml/network_security_config.xml`](android/app/src/main/res/xml/network_security_config.xml)
    *   **清单引用**: [`android/app/src/main/AndroidManifest.xml`](android/app/src/main/AndroidManifest.xml)
    *   **作用**:
        *   允许明文流量 (`cleartextTrafficPermitted="true"`).
        *   信任用户安装的根证书（方便使用 Charles/Fiddler 等抓包工具调试）。

### iOS 平台改动

1.  **App Transport Security (ATS)**
    *   **文件位置**: [`ios/MyAPP_v1/Info.plist`](ios/MyAPP_v1/Info.plist)
    *   **改动内容**: 配置了 `NSAppTransportSecurity`。
    *   **作用**: 设置 `NSAllowsArbitraryLoads` 为 `true`，允许应用发起非 HTTPS 请求或不符合苹果安全标准的 HTTPS 请求。

---

## 项目运行

### 环境准备
确保已安装 Node.js, Java JDK, Android SDK (及模拟器), CocoaPods (iOS).

### 安装依赖
```bash
npm install
# iOS 额外步骤
cd ios && pod install && cd ..
```

### 启动项目

**Android:**
```bash
npx react-native run-android
```

**iOS:**
```bash
npx react-native run-ios
```

**启动 Metro 服务 (如果未自动启动):**
```bash
npx react-native start
```

## 测试脚本
项目中包含用于测试后端连通性的 Node.js 脚本：
*   位置: `src/test/`
*   运行: `node src/test/testBackendConnectivity.js`
