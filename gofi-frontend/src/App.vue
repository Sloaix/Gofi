<template>
  <a-locale-provider :locale="locale">
    <div id="app">
      <router-view/>
    </div>
  </a-locale-provider>
</template>

<script>
import { AppDeviceEnquire } from '@/utils/mixin'
import { ANT_DESIGN_VUE_LOCALE_MAPS } from './locales'

export default {
  mixins: [AppDeviceEnquire],
  data () {
    return {
    }
  },
  computed: {
    locale () {
      return ANT_DESIGN_VUE_LOCALE_MAPS[this.$store.getters.language]
    }
  },
  mounted () {

  }
}
</script>
<style lang="less">
  #app {
    height: 100%;
  }

  // 对话框样式调整
  .ant-modal{
    .ant-modal-footer{
      padding-top: 0 !important;
      padding-bottom: 20px !important;
      border-top: none !important;
    }
  }
</style>
