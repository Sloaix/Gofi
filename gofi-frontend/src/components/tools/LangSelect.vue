<template>
  <a-dropdown>
    <span class="action global-lang">
      <a-icon type="global" />
      {{ $t('menu.language') }}
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
import { mapMutations, mapGetters } from 'vuex'
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
    ...mapMutations({
      switchLanguage: 'SWITCH_LANGUAGE'
    }),
    onItemSelect (item) {
      const hideMessage = message.loading(this.$t('notice.switchLanguage', item.key), 0)

      if (item.key === this.language) {
        setTimeout(() => hideMessage(), 300)
        return
      }
      this.switchLanguage(item.key)
      setTimeout(() => hideMessage(), 300)
    }
  }
}
</script>
