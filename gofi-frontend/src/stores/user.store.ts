import { navigate } from '@reach/router'
import { action, makeObservable, observable } from 'mobx'
import repo, { LoginParam } from '../api/repository'
import { UserResult } from '../api/result'
import { TOKEN } from '../constants/storage'
import TextUtil from '../utils/text.util'
import Toast from '../utils/toast.util'
class UserStore {
    token: string = ''
    user: UserResult | undefined = undefined

    constructor() {
        makeObservable(this, {
            token: observable,
            login: action,
            logout: action,
            clearToken: action,
            fetchUser: action,
        })
        this.token = `${localStorage.getItem(TOKEN)}`
        this.fetchUser()
    }

    async fetchUser() {
        if (TextUtil.isEmpty(this.token)) {
            console.log('current token is invalid, fetch user failed.')
            return
        }
        try {
            this.user = await repo.fetchUser()
        } catch (error) {
            Toast.e(`${error}`)
        }
    }

    /**
     * 登录
     * @param loginParam
     * @param remeberme
     * @returns true for login success, false for login failed
     */
    async login(loginParam: LoginParam, remeberme: boolean): Promise<boolean> {
        try {
            const token = await repo.login(loginParam)
            if (remeberme) {
                localStorage.setItem(TOKEN, token)
            }
            this.token = token
            return true
        } catch (err) {
            this.clearToken()
            console.log(err)
            return false
        }
    }

    get isLogin() {
        return !this.isGuest
    }

    get isGuest() {
        return TextUtil.isEmpty(this.token)
    }

    clearToken() {
        localStorage.removeItem(TOKEN)
        this.token = ''
    }

    logout() {
        this.clearToken()
        Toast.i('您已退出')
        navigate('/', {
            replace: true,
        })
    }
}
export default UserStore
