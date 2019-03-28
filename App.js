import React from 'react';
import {Alert, Button, NativeModules, StyleSheet, View} from 'react-native';
import CodePush from "react-native-code-push";
import HttpUtil from "./src/utils/HttpUtil";

const commonModule = NativeModules.CommonModule;

function callAndroid() {
    commonModule.rnCallNative('RN 调用 Android 原生~~');
}

function callAndroidPromise() {
    commonModule.rnCallNativePromise('RN Promise 调用 Android 原生~~')
        .then((msg) => {
            Alert.alert('promise 收到消息', msg)
            console.log("promise 收到消息", msg)
        })
        .catch((error) => {
            console.log(error)
        })
}

function callAndroidCallback() {
    commonModule.rnCallNativeCallback((x, y) => {
        Alert.alert('callback 收到消息', x + ',' + y)
        console.log('callback 收到消息', x, y)
    }, (error) => {
        console.log(error)
    })
}

export default class App extends React.Component {

    login() {
        HttpUtil.post('/user/login', {username: '', password: ''})
            .then((res) => {
                console.log("success---->" + res)
                Alert.alert("success", res.code)
            })
            .catch((error) => {
                console.log("error---->" + JSON.stringify(error))
            })
    }

    getBanner() {
        HttpUtil.get('/banner/json')
            .then((res) => {
                console.log("success---->" + res)
                Alert.alert("success", res.code)
            })
            .catch((error) => {
                console.log("error---->" + JSON.stringify(error))
            })
    }

    render() {
        return (
            <View style={styles.container}>
                <Button title='call_android' onPress={callAndroid}/>
                <Button title='call_android_promise' onPress={callAndroidPromise}/>
                <Button title='call_android_callback' onPress={callAndroidCallback}/>
                <Button title='login' onPress={this.login}/>
                <Button title='get_banner' onPress={this.getBanner}/>
            </View>
        );
    }

    //如果有更新的提示
    syncImmediate() {
        CodePush.sync({
                //安装模式
                //ON_NEXT_RESUME 下次恢复到前台时
                //ON_NEXT_RESTART 下一次重启时
                //IMMEDIATE 马上更新
                installMode: CodePush.InstallMode.IMMEDIATE,
                //对话框
                updateDialog: {
                    //是否显示更新描述
                    appendReleaseDescription: true,
                    //更新描述的前缀。 默认为"Description"
                    descriptionPrefix: "更新内容：",
                    //强制更新按钮文字，默认为continue
                    mandatoryContinueButtonLabel: "立即更新",
                    //强制更新时的信息. 默认为"An update is available that must be installed."
                    mandatoryUpdateMessage: "必须更新后才能使用",
                    //非强制更新时，按钮文字,默认为"ignore"
                    optionalIgnoreButtonLabel: '稍后',
                    //非强制更新时，确认按钮文字. 默认为"Install"
                    optionalInstallButtonLabel: '后台更新',
                    //非强制更新时，检查到更新的消息文本
                    optionalUpdateMessage: '有新版本了，是否更新？',
                    //Alert窗口的标题
                    title: '更新提示'
                },
            },
        );
    }

    componentWillMount() {
        CodePush.disallowRestart(); // 禁止重启
        this.syncImmediate(); // 开始检查更新
    }

    componentDidMount() {
        CodePush.allowRestart(); // 在加载完了，允许重启
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    }
});

