import Realm from 'realm'

export default class RealmUtil {

    static getRealm() {
        const CookieSchema = {
            name: 'Cookie',
            properties: {
                cookie: 'string'
            }
        }

        const TokenSchema = {
            name: 'Token',
            properties: {
                token: 'string'
            }
        }

        return new Realm({schema: [CookieSchema, TokenSchema]})
    }

    static saveToken(token) {
        let realm = this.getRealm()
        realm.write(() => {
            let tokens = realm.objects('Token')
            if (tokens.length > 0) {
                tokens[0].token = token
            } else {
                realm.create('Token', {token: token})
            }
        })
    }

    static getToken() {
        let realm = this.getRealm()
        const tokens = realm.objects('Token')
        if (tokens.length > 0) {
            return tokens[0].token
        } else {
            return ''
        }
    }

    static getCookie() {
        let realm = this.getRealm()
        const cookies = realm.objects('Cookie')
        if (cookies.length > 0) {
            return cookies[0].cookie
        } else {
            return ''
        }
    }

    static saveCookie(cookie) {
        let realm = this.getRealm()
        realm.write(() => {
            let cookies = realm.objects('Cookie')
            if (cookies.length > 0) {
                cookies[0].cookie = cookie
            } else {
                realm.create('Cookie', {cookie: cookie})
            }
        })
    }

}