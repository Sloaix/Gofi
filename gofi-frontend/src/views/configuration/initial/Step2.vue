<template>
  <div>
    <a-form style="margin: 40px auto 0;">
      <result :title="$t('setup.step2.title')" :is-success="true" :description="description" style="max-width: 560px;">
        <div class="information">
          <a-row>
            <a-col :sm="8" :xs="24">{{ $t('setup.step2.fileStoragePath') }}</a-col>
            <a-col :sm="16" :xs="24">{{ storagePath }}</a-col>
          </a-row>
          <a-row>
            <a-col :sm="8" :xs="24">{{ $t('setup.step2.logDirectoryPath') }}</a-col>
            <a-col :sm="16" :xs="24">{{ settings.logDirectoryPath }}</a-col>
          </a-row>
          <a-row>
            <a-col :sm="8" :xs="24">{{ $t('setup.step2.sqlite3DbFilePath') }}</a-col>
            <a-col :sm="16" :xs="24">{{ settings.databaseFilePath }}</a-col>
          </a-row>
          <a-row>
            <a-col :sm="8" :xs="24">{{ $t('setup.step2.defaultLanguage') }}</a-col>
            <a-col :sm="16" :xs="24">{{ settings.defaultLanguage }}</a-col>
          </a-row>
        </div>
        <div slot="action">
          <a-button type="primary" @click="finish">{{ $t('form.button.home.name') }}</a-button>
        </div>
      </result>
    </a-form>
  </div>
</template>

<script>
import { Result } from '@/components'
import { mapGetters } from 'vuex'

export default {
  name: 'SetupStep2',
  components: {
    Result
  },
  data () {
    return {
      loading: false,
      seconds: 15
    }
  },
  computed: {
    ...mapGetters(['settings', 'storagePath']),
    description () {
      return this.$t('setup.step2.description', [this.seconds])
    }
  },
  mounted () {
    const that = this
    const interval = setInterval(() => {
      this.seconds--
      if (this.seconds <= 0) {
        clearInterval(interval)
        that.finish()
      }
    }, 1000)
  },
  methods: {
    finish () {
      this.$emit('finish')
    }
  }
}
</script>
<style lang="less" scoped>
  .information {
    line-height: 22px;

    .ant-row:not(:last-child) {
      margin-bottom: 24px;
    }
  }
  .money {
    font-family: "Helvetica Neue",sans-serif;
    font-weight: 500;
    font-size: 20px;
    line-height: 14px;
  }
</style>
