# RN 与原生通信（Android篇）


### 一、RN 调用安卓代码（简单的实现方式）

> `RN` 调用 `android` 代码大致分为以下几个步骤：

1、用`android studio` 打开一个已经创建好的 `RN` 项目；

2、创建一个类 `CommonModule` 继承自 `ReactContextBaseJavaModule` ，并重写 `getName()` 方法，在该类中我们要暴露一些方法供 `RN` 调用；

```
class CommonModule(private val reactContext: ReactApplicationContext)
    : ReactContextBaseJavaModule(reactContext) {
}
```

- 实现 `getName()` 方法，改方法用来返回 `RN` 代码需要寻找的类的名称；
```
override fun getName(): String {
    // 一定要有名字 RN代码要通过名字来调用该类的方法
    return "CommonModule"
}
```

- 创建暴露给 `RN` 调用的方法，并用 `@ReactMethod` 注解修饰；

```
/**
 * 加上 @ReactMethod 注解是为了暴露给RN调用的方法；
 *
 * 方法不能返回值，因为被调用的原生代码是异步的，原生代码执行结束之后只能通过回调函数或者发送消息给RN
 */
@ReactMethod
fun rnCallNative(msg: String) {
    // 这个方法是说弹出一个弹窗到界面
    Toast.makeText(reactContext, msg, Toast.LENGTH_LONG).show()
}
```

3、创建类 `CommonPackage` 实现接口 `ReactPackage` 包管理器，并把第2步中创建好的 `CommonModule` 类添加进来；

```
class CommonPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        val list = ArrayList<NativeModule>()
        list.add(CommonModule(reactContext))
        return list
    }
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
```

4、将创建好的 `CommonPackage` 包管理器添加到 `ReactPackage` 列表中；也就是在 `ReactNativeActivity` 中的 `onCreate` 方法中添加：

```
class ReactNativeActivity : AppCompatActivity(), DefaultHardwareBackBtnHandler {
    private var mReactRootView: ReactRootView? = null
    private var mReactInstanceManager: ReactInstanceManager? = null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val list = mutableListOf<ReactPackage>()
        list.add(MainReactPackage()) // 默认
        list.add(CommonPackage()) // 自定义Package

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
	...
}
```

5、在 `RN` 代码中用 `NativeModules` 组件去调用原生模块；

- 导入组件，设置方法调用原生方法；
```
import {Alert, Button, NativeModules, StyleSheet, View} from 'react-native';
const commonModule = NativeModules.CommonModule;
function callAndroid() {
    commonModule.rnCallNative('RN 调用 Android 原生~~');
}
```

- 在 `render` 方法里设置 `button` 的点击事件直接调用自定义方法 `callAndroid` 即可；
```
render() {
    return (
        <View style={styles.container}>
            <Button title='call_android' onPress={callAndroid}/>
        </View>
    );
}
```

到此，基本的 `RN` 调用安卓原生代码的方式就得以实现。


### 二、RN 用 Promise 机制与安卓原生代码通信

> 在原生代码 `CommonModule` 类中创建桥接方法，当桥接的方法最后一个参数是 `Promise` 对象，那么该方法就会返回一个`JS` 的 `Promise` 对象给对应的 `JS` 方法。

1、首先需要在 `CommonModule` 中定义一个暴露给 `RN` 的方法，并且要用 `@ReactMethod` 标识；

```
@ReactMethod
fun rnCallNativePromise(msg: String, promise: Promise) {
    Toast.makeText(reactContext, msg, Toast.LENGTH_LONG).show()
    val componentName = name
    promise.resolve(componentName)
}
```

2、在 `RN` 代码中也是需要用 `NativeModules` 组件调用原生模块；

```
import {Alert, Button, NativeModules, StyleSheet, View} from 'react-native';
const commonModule = NativeModules.CommonModule;function callAndroidPromise() {
commonModule.rnCallNativePromise('RN Promise 调用 Android 原生~~')
    .then((msg) => {
        Alert.alert('promise 收到消息', msg)
        console.log("promise 收到消息", msg)
    })
    .catch((error) => {
        console.log(error)
    })
}
```

```
render() {
    return (
        <View style={styles.container}>
            <Button title='call_android' onPress={callAndroid}/>
            <Button title='call_android_promise' onPress={callAndroidPromise}/>
        </View>
    );
}
```

### 三、RN 用 callback 回调方式与安卓原生代码通信

1、 同样也是按照上面的方式，在原生模块中暴露一个桥接的方法给 `RN` 调用，参数传入一个成功的回调和一个失败的回调；

```
@ReactMethod
fun rnCallNativeCallback(success: Callback, error: Callback) {
    try {
        success.invoke(100, 200)
    } catch (e: Exception) {
        error.invoke(e.message)
    }
}
```

2、在 `RN` 代码中也是需要用 `NativeModules` 组件调用原生模块；

```
import {Alert, Button, NativeModules, StyleSheet, View} from 'react-native';
const commonModule = NativeModules.CommonModule;function callAndroidCallback() {
    commonModule.rnCallNativeCallback((x, y) => {
        Alert.alert('callback 收到消息', x + ',' + y)
        console.log('callback 收到消息', x, y)
    }, (error) => {
        console.log(error)
    })
}
```

```
render() {
    return (
        <View style={styles.container}>
            <Button title='call_android' onPress={callAndroid}/>
            <Button title='call_android_promise' onPress={callAndroidPromise}/>
            <Button title='call_android_callback' onPress={callAndroidCallback}/>
        </View>
    );
}
```

**最后，RN与安卓原生之间的通信方式已经介绍完了，如有不对的地方，欢迎指正~~**