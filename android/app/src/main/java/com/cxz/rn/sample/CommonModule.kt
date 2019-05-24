package com.cxz.rn.sample

import android.content.Intent
import android.widget.Toast
import com.facebook.react.bridge.*

/**
 * @author chenxz
 * @date 2019/3/27
 * @desc
 */
class CommonModule(private val reactContext: ReactApplicationContext)
    : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        // 一定要有名字 RN代码要通过名字来调用该类的方法
        return "CommonModule"
    }

    @ReactMethod
    fun toast(msg: String) {
        Toast.makeText(reactContext, msg, Toast.LENGTH_SHORT).show()
    }

    /**
     * 加上 @ReactMethod 注解是为了暴露给RN调用的方法；
     *
     * 方法不能返回值，因为被调用的原生代码是异步的，原生代码执行结束之后只能通过回调函数或者发送消息给RN
     */
    @ReactMethod
    fun rnCallNative(msg: String) {
        // 这个方法是说弹出一个弹窗到界面
        Toast.makeText(reactContext, msg, Toast.LENGTH_LONG).show()

        // 创建一个意图，意图是android进程之间、线程之间、交换数据的载体
        val intent = Intent(reactApplicationContext, OtherActivity::class.java)
        // 一定要加上这句
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        reactContext.startActivity(intent)

    }

    @ReactMethod
    fun rnCallNativePromise(msg: String, promise: Promise) {
        Toast.makeText(reactContext, msg, Toast.LENGTH_LONG).show()
        if (currentActivity == null) return
        val componentName = name
        promise.resolve(componentName)
    }

    @ReactMethod
    fun rnCallNativeCallback(success: Callback, error: Callback) {
        try {
            success.invoke(100, 200)
        } catch (e: Exception) {
            error.invoke(e.message)
        }

    }

}
