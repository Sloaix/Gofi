<template>
  <a-dropdown v-if="isLogin">
    <span class="action">
      <a-icon type="user" />
      {{ username }}
    </span>
    <a-menu slot="overlay" class="user-dropdown-menu-wrapper">
      <a-menu-item key="0">
        <a href="javascript:;" @click="handleLogout">
          <a-icon type="logout"/>
          <span>{{ $t('action.logout') }}</span>
        </a>
      </a-menu-item>
    </a-menu>
  </a-dropdown>
  <router-link v-else :to="{name:'login'}">
    <span class="action">
      <a-icon type="login"></a-icon> {{ $t('action.login') }}
    </span>
  </router-link>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { message } from 'ant-design-vue'
import i18n from '../../locales'
export default {
  name: 'AccountOption',
  computed: {
    ...mapGetters(['isLogin', 'username'])
  },
  methods: {
    ...mapActions(['Logout']),
    handleLogout () {
      const that = this
      this.$confirm({
        title: that.$t('auth.logoutConfirm.title'),
        content: that.$t('auth.logoutConfirm.content'),
        onOk: () => {
          return that.Logout().then(() => {
            message.info(this.$t('auth.logoutSuccess.content'))
            this.$router.push({ name: 'index' })
          }).catch(err => {
            message.error(i18n.t(err))
          })
        },
        onCancel () {
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
