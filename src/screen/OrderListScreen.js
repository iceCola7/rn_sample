import React from "react";
import {ActivityIndicator, Button, FlatList, RefreshControl, StyleSheet, Text, ToastAndroid, View} from "react-native";
import net from '../utils/HttpUtil'
import {format2YMD} from "../utils/DateUtil";

export default class OrderListScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            isLoading: true,
            error: false, // 网络请求状态
            errorInfo: '',
            dataArray: [],
            showFooter: 0, // 控制 foot ， 0：隐藏 footer ，1：已加载完成，没有更多数据，2：显示加载中
            isRefreshing: false, // 下拉控制
        }
    }

    componentDidMount() {
        this.fetchData()
    }

    // 请求数据
    fetchData() {
        net.get('/article/list/' + this.state.page + '/json', {})
            .then(res => {
                let isEnd = res.data.over;
                let list = res.data.datas;

                let footer = 0;
                if (isEnd) {
                    footer = 1;
                }
                this.setState({
                    dataArray: this.state.dataArray.concat(list),
                    isLoading: false,
                    showFooter: footer,
                    isRefreshing: false,
                });
                list = null;
            })
            .catch(error => {
                this.setState({
                    error: true,
                    errorInfo: error
                })
            })
    }

    // 加载等待页
    renderLoadingView() {
        return (
            <View style={styles.container}>
                <ActivityIndicator
                    animating={true}
                    color='blue'
                    size='large'
                />
            </View>
        );
    }

    // 加载失败的View
    renderErrorView() {
        return (
            <View style={styles.container}>
                <Text>
                    {this.state.errorInfo}
                </Text>
            </View>
        );
    }

    // 底部视图
    _renderFooter() {
        if (this.state.isRefreshing || this.state.showFooter === 0) {
            return (
                <View styl={styles.footer}>
                    <Text/>
                </View>
            );
        } else if (this.state.showFooter === 1) {
            return (
                <View style={{height: 30, alignItems: 'center', justifyContent: 'flex-start'}}>
                    <Text style={{color: '#999999', fontSize: 14, marginTop: 6, marginBottom: 6}}>
                        没有更多数据了
                    </Text>
                </View>
            );
        } else if (this.state.showFooter === 2) {
            return (
                <View style={styles.footer}>
                    <ActivityIndicator/>
                    <Text>正在加载更多数据...</Text>
                </View>
            );
        }
    }

    _keyExtractor = (item, index) => index;

    handleRefresh = () => {
        this.setState({
            page: 1,
            isRefreshing: true,
            dataArray: [],
            showFooter: 0
        });
        this.fetchData()
    };

    _separator() {
        return <View style={{height: 0.5, backgroundColor: '#999999'}}/>;
    }

    renderData() {
        return (
            <FlatList
                data={this.state.dataArray}
                renderItem={this._renderItemView}
                keyExtractor={this._keyExtractor}
                ListFooterComponent={this._renderFooter.bind(this)}
                onEndReached={this._onEndReached(this)}
                onEndReachedThreshold={1}
                ItemSeparatorComponent={this._separator}
                //为刷新设置颜色
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.isRefreshing}
                        onRefresh={this.handleRefresh.bind(this)} // 因为涉及到this.state
                        colors={['#ff0000', '#00ff00', '#0000ff', '#3ad564']}
                        progressBackgroundColor="#ffffff"
                    />
                }
            />
        );
    }

    // item view
    _renderItemView({item}) {
        let useState = '';
        let useStateBg = '#999';
        switch (item.UseState) {
            case '1':
                useState = '使用中';
                useStateBg = '#35c643';
                break;
            case '2':
                useState = '寄存';
                useStateBg = '#35c643';
                break;
            case '3':
                useState = '已完成';
                useStateBg = '#999';
                break;
            case '4':
                useState = '已取消';
                useStateBg = '#999';
                break;
            case '5':
                useState = '未支付';
                useStateBg = '#f16d58';
                break;
            default:
                useState = '';
                useStateBg = '#999';
                break;
        }
        let btnDetailBg = '';
        let btnDetailText = '';
        if (item.UseState === '5') {
            btnDetailBg = '#f16d58';
            btnDetailText = '去支付';
        } else {
            btnDetailBg = '#40c963';
            btnDetailText = '详情';
        }

        let payDisplay = 'flex';
        let detailDisplay = 'flex';

        // 判断订单是否欠费
        let orderMoney = '';
        let orderDisplay = 'none';
        if (item.IsArrears) {
            orderMoney = '欠费金额 ' + item.ArrearsMoney + '元';
            orderDisplay = 'flex';
            payDisplay = 'flex';
        } else {
            orderMoney = '';
            orderDisplay = 'none';
            payDisplay = 'none'
        }
        if (item.UseState === '3' || item.UseState === '4') {
            if (item.PackageId === '-1') {
                detailDisplay = 'none';
                payDisplay = 'none';
            }
        }
        return (
            <View style={{flex: 1, flexDirection: 'column', marginVertical: 1}}>
                <View style={{flex: 3, flexDirection: 'row', padding: 8}}>
                    <Text style={{flex: 2}}>订单号 {item.OrderNo}</Text>
                    <Text style={{justifyContent: 'flex-end'}}>{format2YMD(item.StartTime)}</Text>
                </View>

                <View style={{
                    flexDirection: 'column',
                    borderRadius: 6,
                    marginBottom: 8,
                    marginLeft: 10,
                    marginRight: 10,
                    backgroundColor: '#f4f4f4'
                }}>
                    <View style={{flex: 2, flexDirection: 'row', padding: 8}}>
                        <Text style={{flex: 1, fontSize: 16, color: 'black'}}>{item.PackageName}</Text>
                        <Text style={{
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            color: useStateBg
                        }}>{useState}</Text>
                    </View>

                    <View style={{height: 0.5, backgroundColor: '#d8d8d8', marginRight: 10, marginLeft: 10}}/>

                    <View style={{
                        flex: 2,
                        flexDirection: 'row',
                        padding: 8,
                        alignItems: 'center'
                    }}>
                        <View style={{flex: 1, flexDirection: 'column'}}>
                            <Text style={{}}>有效期至{format2YMD(item.EndTime)}</Text>
                            <Text style={{display: orderDisplay}}>{orderMoney}</Text>
                        </View>
                        <View style={{display: payDisplay}}>
                            <Button title='续费' color='#f16d58'
                                    onPress={() => {

                                    }}
                            />
                        </View>
                        <View style={{display: detailDisplay}}>
                            <Button title={btnDetailText} color={btnDetailBg}
                                    onPress={() => {
                                        ToastAndroid.show("点击事件-->>" + item.Id, ToastAndroid.SHORT);
                                    }}
                            />
                        </View>
                    </View>
                </View>

            </View>
        );
    }

    render() {
        // 第一次加载等待的View
        if (this.state.isLoading && !this.state.error) {
            return this.renderLoadingView()
        } else if (this.state.error) {
            return this.renderErrorView()
        }
        return this.renderData()
    }

    _onEndReached() {

        // 如果是正在加载中或没有更多数据了，则返回
        if (this.state.showFooter !== 0) {
            return;
        }

        // TODO ??????????????
        if ((this.state.page !== 1) && (this.state.showFooter === 1)) {
            return;
        } else {
            this.state.page++;
        }
        // 底部显示正在加载更多数据
        this.setState({showFooter: 2});
        // 获取数据，在componentDidMount()已经请求过数据了
        if (this.state.page > 1) {
            this.fetchData();
        }
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4'
    },
    title: {
        marginTop: 8,
        marginLeft: 8,
        marginRight: 8,
        marginBottom: 8,
        fontSize: 15,
        color: '#ffa700',
    },
    footer: {
        flexDirection: 'row',
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
});
