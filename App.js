import React from 'react';
import {Alert, Button, NativeModules, StyleSheet, View} from 'react-native';
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
            })
            .catch((error) => {
                console.log("error---->" + JSON.stringify(error))
            })
    }

    getBanner() {
        HttpUtil.get('/banner/json')
            .then((res) => {
                console.log("success---->" + res)
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
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    }
});

