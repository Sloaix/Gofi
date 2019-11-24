<template>
  <a-dropdown>
    <span class="action global-lang">
      <a-icon type="global" style="font-size: 16px"/>
    </span>
    <a-menu slot="overlay" style="width: 150px;" @click="onItemSelect">
      <a-menu-item key="zh-CN">
        <a rel="noopener noreferrer">
          <span role="img" aria-label="简体中文">🇨🇳</span> 简体中文
        </a>
      </a-menu-item>
      <a-menu-item key="en-US">
        <a rel="noopener noreferrer">
          <span role="img" aria-label="English">🇺🇸</span> English
        </a>
      </a-menu-item>
    </a-menu>
  </a-dropdown>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import i18n from '../../locales'
import { message } from 'ant-design-vue'
export default {
  name: 'LangSelect',
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['language'])
  },
  methods: {
    ...mapActions({
      switchLanguage: 'SwitchLanguage'
    }),
    onItemSelect (item) {
      const hideMessage = message.loading(i18n.t('notice.switchLanguage', item.key), 0)

      if (item.key === this.language) {
        setTimeout(() => hideMessage(), 300)
        return
      }
      const that = this
      this.switchLanguage(item.key)
        .then(() => {
          setTimeout(() => hideMessage(), 300)
        }).catch((e) => {
          hideMessage()
          that.$notification.error({
            message: '错误',
            description: e
          })
        })
    }
  }
}
</script>
