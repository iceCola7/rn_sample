import RealmUtil from './RealmUtil';

const base_url = 'https://www.wanandroid.com'

function getFormData(params) {
    let formData = new FormData()
    for (let key in params) {
        formData.append(key, params[key])
    }
    return formData
}

function formatGetParams(params) {
    if (params === '') return ''
    let newParams = '?'
    for (let key in params) {
        newParams = newParams + key + '=' + params[key] + '&'
    }
    return newParams.substring(0, newParams.length - 1)
}

function formatPostParams(params) {
    if (params === '') return ''
    let newParams = ''
    for (let key in params) {
        newParams = newParams + key + '=' + params[key] + '&'
    }
    return newParams.substring(0, newParams.length - 1)
}

function request(method, url, params = '') {

    let request_url = base_url + url
    if (url.startsWith('http://') || url.startsWith('https://')) {
        request_url = url
    }

    let config = {
        method: method
    }

    if (params !== '') {
        if (method.toUpperCase() === "GET") {
            request_url = request_url + formatGetParams(params)
        } else if (method.toUpperCase() === "POST") {
            config['body'] = params
        }
    }

    let contentType = 'application/json;charset=UTF-8'
    if (method.toUpperCase() === 'POST') {
        contentType = 'application/x-www-form-urlencoded;charset=UTF-8'
    }

    config['headers'] = {
        'Content-Type': contentType,
        'Cookie': RealmUtil.getCookie(),
    }

    console.log('请求链接', method, request_url)
    console.log('请求参数', config)

    return new Promise((resole, reject) => {
        fetch(request_url, config)
            .then(res => {
                // console.log(JSON.stringify(res))
                return res.json()
            })
            .then(json => {
                console.log('请求成功', json)
                if (!json.code ||
                    json.code === 200) {
                    resole(json)
                } else {
                    reject(json)
                }
            })
            .catch(err => {
                console.log('请求错误', JSON.stringify(err))
                reject(err)
            })
    })
}


export default class HttpUtil {

    static get(url, params = '') {
        return request('GET', url, params)
    }

    static post(url, params = '') {
        return request('POST', url, formatPostParams(params))
    }

    static postJson(url, params = '') {
        return request('POST', url, params)
    }

}
