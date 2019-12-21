<template>
  <div class="logo">
    <router-link :to="{name:'file-list'}">
      <LogoSvg alt="logo" :style="colorStyle" />
      <h1 v-if="showTitle"><span :style="colorStyle">{{ title }}</span></h1>
    </router-link>
  </div>
</template>
<style lang="less" scoped>
  h1{
    color: rgba(0, 0, 0, 0.9) !important;
  }
</style>
<script>
import LogoSvg from '@/assets/logo.svg?inline'
import { mapGetters } from 'vuex'
export default {
  name: 'Logo',
  components: {
    LogoSvg
  },
  computed: {
    ...mapGetters(['theme']),
    colorStyle () {
      return {
        color: this.theme === 'light' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)'
      }
    }
  },
  props: {
    title: {
      type: String,
      default: 'Go File Indexer',
      required: false
    },
    showTitle: {
      type: Boolean,
      default: true,
      required: false
    }
  }
}
</script>
