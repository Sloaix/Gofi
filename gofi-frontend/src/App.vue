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
<style>
  #app {
    height: 100%;
  }
</style>
