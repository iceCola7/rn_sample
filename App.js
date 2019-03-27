import React from 'react';
import {Alert, Button, NativeModules, StyleSheet, View} from 'react-native';

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
    render() {
        return (
            <View style={styles.container}>
                <Button title='call_android' onPress={callAndroid}/>
                <Button title='call_android_promise' onPress={callAndroidPromise}/>
                <Button title='call_android_callback' onPress={callAndroidCallback}/>
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

