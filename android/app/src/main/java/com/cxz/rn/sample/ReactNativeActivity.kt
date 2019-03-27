package com.cxz.rn.sample

import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import android.view.KeyEvent
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactPackage
import com.facebook.react.ReactRootView
import com.facebook.react.common.LifecycleState
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler
import com.facebook.react.shell.MainReactPackage
import com.microsoft.codepush.react.CodePush

class ReactNativeActivity : AppCompatActivity(), DefaultHardwareBackBtnHandler {

    private var mReactRootView: ReactRootView? = null
    private var mReactInstanceManager: ReactInstanceManager? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val list = mutableListOf<ReactPackage>()
        list.add(MainReactPackage()) // 默认
        list.add(CodePush(BuildConfig.CODEPUSH_KEY, this, BuildConfig.DEBUG)) // codePush热更新

        mReactRootView = ReactRootView(this)
        mReactInstanceManager = ReactInstanceManager.builder()
            .setApplication(application)
            .setCurrentActivity(this)
            //.setBundleAssetName("index.android.bundle")
            .setJSBundleFile(CodePush.getJSBundleFile())// ! 此处为codePush加载JsBundle方式,默认为.setBundleAssetName("index.android.bundle")
            .setJSMainModulePath("index") // ! 注意这里的index指向入口的js文件
            //.addPackage(MainReactPackage())
            .addPackages(list) // ! 此处为扩展Packages,默认为.addPackage(new MainReactPackage())
            .setUseDeveloperSupport(BuildConfig.DEBUG)
            .setInitialLifecycleState(LifecycleState.RESUMED)
            .build()

        // 注意这里的 rn_sample 必须对应“index.js”中的 “AppRegistry.registerComponent()”的第一个参数
        mReactRootView?.startReactApplication(mReactInstanceManager, "rn_sample", null)

        setContentView(mReactRootView)

    }

    override fun invokeDefaultOnBackPressed() {
        super.onBackPressed()
    }

    override fun onBackPressed() {
        if (mReactInstanceManager != null) {
            mReactInstanceManager?.onBackPressed()
        } else {
            super.onBackPressed()
        }
    }

    override fun onKeyUp(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_MENU && mReactInstanceManager != null) {
            mReactInstanceManager?.showDevOptionsDialog()
            return true
        }
        return super.onKeyUp(keyCode, event)
    }

    override fun onResume() {
        super.onResume()
        mReactInstanceManager?.onHostResume(this, this)
    }

    override fun onPause() {
        super.onPause()
        mReactInstanceManager?.onHostPause(this)
    }

    override fun onDestroy() {
        super.onDestroy()
        mReactInstanceManager?.onHostDestroy(this)
        mReactRootView?.unmountReactApplication()
    }

}