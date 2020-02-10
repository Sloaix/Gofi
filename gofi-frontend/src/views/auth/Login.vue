<template>
  <div class="main">
    <a-form
      id="formLogin"
      class="user-layout-login"
      ref="formLogin"
      :form="form"
      @submit="handleSubmit"
    >
      <a-alert
        v-if="isLoginError"
        type="error"
        showIcon
        style="margin-bottom: 24px;"
        :message="$t('description.usernameOrPasswordWrong')"/>
      <a-form-item>
        <a-input
          size="large"
          type="text"
          placeholder="用户名"
          v-decorator="[
            'username',
            {rules: [{ required: true,min:1, message: '请输入用户名' }], validateTrigger: 'change'}
          ]"
        >
          <a-icon slot="prefix" type="user" :style="{ color: 'rgba(0,0,0,.25)' }"/>
        </a-input>
      </a-form-item>

      <a-form-item>
        <a-input
          size="large"
          type="password"
          autocomplete="false"
          placeholder="密码"
          v-decorator="[
            'password',
            {rules: [{ required: true,min:1, message: '请输入密码' }], validateTrigger: 'blur'}
          ]"
        >
          <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }"/>
        </a-input>
      </a-form-item>

      <a-form-item style="margin-top:24px">
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="login-button"
          :loading="state.loginBtn"
          :disabled="state.loginBtn"
        >{{ $t('action.login') }}
        </a-button>
      </a-form-item>

      <a-form-item>
        <a-tooltip
          placement="left"
          style="float: right;cursor: pointer">
          <template slot="title">
            {{ $t('description.contactAdmin') }}
          </template>
          {{ $t('description.forgetPassword') }}
        </a-tooltip>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import i18n from '../../locales'
import { message } from 'ant-design-vue'

export default {
  name: 'Login',
  data () {
    return {
      loginBtn: false,
      isLoginError: false,
      form: this.$form.createForm(this),
      state: {
        time: 60,
        loginBtn: false
      }
    }
  },
  created () {
    // 如果已经处于登录状态，重定向到首页
    if (this.$store.getters.isLogin) {
      this.$router.push({ replace: true, path: '/' })
    }
  },
  methods: {
    ...mapActions(['Login', 'GetUser', 'Logout']),
    handleSubmit (e) {
      e.preventDefault()
      const {
        form: { validateFields },
        state,
        Login,
        GetUser
      } = this

      state.loginBtn = true

      const validateFieldsKey = ['username', 'password']

      validateFields(validateFieldsKey, { force: true }, (err, params) => {
        if (!err) {
          console.log('user form', params)
          Login(params)
            .then((res) => GetUser())
            .then((res) => this.loginSuccess(res))
            .catch(err => this.requestFailed(err))
            .finally(() => {
              state.loginBtn = false
            })
        } else {
          setTimeout(() => {
            state.loginBtn = false
          }, 600)
        }
      })
    },
    loginSuccess (res) {
      console.log(res)
      this.$router.push({ path: '/' })
      // 延迟 500ms 秒显示欢迎信息
      setTimeout(() => {
        message.success(i18n.t('auth.loginSuccess.content'))
      }, 500)
      this.isLoginError = false
    },
    requestFailed (err) {
      this.isLoginError = true
      console.log(err)
      message.error(((err.response || {}).data || {}).message || err || '请求出现错误，请稍后再试')
    }
  }
}
</script>

<style lang="less" scoped>
  .user-layout-login {
    label {
      font-size: 14px;
    }

    .forge-password {
      font-size: 14px;
    }

    button.login-button {
      padding: 0 15px;
      font-size: 16px;
      height: 40px;
      width: 100%;
    }

    .user-login-other {
      text-align: left;
      margin-top: 24px;
      line-height: 22px;

      .item-icon {
        font-size: 24px;
        color: rgba(0, 0, 0, 0.2);
        margin-left: 16px;
        vertical-align: middle;
        cursor: pointer;
        transition: color 0.3s;

        &:hover {
          color: #1890ff;
        }
      }

      .register {
        float: right;
      }
    }
  }
</style>
