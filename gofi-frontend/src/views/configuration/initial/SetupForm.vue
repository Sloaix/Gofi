<template>
  <a-card :bordered="false">
    <a-steps class="steps" :current="currentTab">
      <a-step :title="$t('setup.step1.name')"/>
      <a-step :title="$t('setup.step2.name')"/>
    </a-steps>
    <div class="content">
      <step1 v-if="currentTab === 0" @nextStep="nextStep"/>
      <step2 v-if="currentTab === 1" @prevStep="prevStep" @finish="finish"/>
    </div>
    <global-footer></global-footer>
  </a-card>
</template>

<script>
import Step1 from './Step1'
import Step2 from './Step2'
import GlobalFooter from '@/components/GlobalFooter'

export default {
  name: 'InitialForm',
  components: {
    Step1,
    Step2,
    GlobalFooter
  },
  data () {
    return {
      description: '将一个冗长或用户不熟悉的表单任务分成多个步骤，指导用户完成。',
      currentTab: 0,
      form: null
    }
  },
  mounted () {
    this.fetch(this.$route.query.path)
  },
  methods: {

    // handler
    nextStep () {
      if (this.currentTab < 2) {
        this.currentTab += 1
      }
    },
    prevStep () {
      if (this.currentTab > 0) {
        this.currentTab -= 1
      }
    },
    finish () {
      this.$router.push({ path: '/' })
    },
    fetch (directoryPath) {
      if (!directoryPath) {
        directoryPath = ''
      }
      this.loading = true
    }
  }
}
</script>

<style lang="less" scoped>
    .steps {
        /*max-width: 750px;*/
        max-width: 300px;
        margin: 16px auto;
    }
</style>
