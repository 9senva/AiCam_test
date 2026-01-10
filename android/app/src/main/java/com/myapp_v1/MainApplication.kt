package com.myapp_v1

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.modules.network.OkHttpClientProvider
import com.facebook.react.modules.network.ReactCookieJarContainer
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import java.security.SecureRandom
import java.security.cert.X509Certificate
import java.util.concurrent.TimeUnit
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager
import okhttp3.OkHttpClient

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
          object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                    PackageList(this).packages.apply {
                      // Packages that cannot be autolinked yet can be added manually here, for
                      // example:
                      // add(MyReactNativePackage())
                    }

            override fun getJSMainModuleName(): String = "src/index"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
          }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    // Configure OkHttp to trust all SSL certificates (Dev only)
    // Put this BEFORE super.onCreate to ensure it applies before any RN initialization
    try {
      val trustAllCerts =
              arrayOf<TrustManager>(
                      object : X509TrustManager {
                        override fun checkClientTrusted(
                                chain: Array<out X509Certificate>?,
                                authType: String?
                        ) {}
                        override fun checkServerTrusted(
                                chain: Array<out X509Certificate>?,
                                authType: String?
                        ) {}
                        override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
                      }
              )

      val sslContext = SSLContext.getInstance("SSL")
      sslContext.init(null, trustAllCerts, SecureRandom())

      val builder =
              OkHttpClient.Builder()
                      .connectTimeout(0, TimeUnit.MILLISECONDS)
                      .readTimeout(0, TimeUnit.MILLISECONDS)
                      .writeTimeout(0, TimeUnit.MILLISECONDS)
                      .cookieJar(ReactCookieJarContainer())
                      .sslSocketFactory(
                              sslContext.socketFactory,
                              trustAllCerts[0] as X509TrustManager
                      )
                      .hostnameVerifier { _, _ -> true }

      OkHttpClientProvider.setOkHttpClientFactory { builder.build() }
    } catch (e: Exception) {
      e.printStackTrace()
    }

    super.onCreate()

    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
  }
}
