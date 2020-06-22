<template>
  <div>
    <a-form style="margin: 40px auto 0;">
      <result :title="$t('setup.step2.label.success')" :is-success="true" :description="description" style="max-width: 560px;">
        <div class="information">
          <a-row>
            <a-col :sm="8" :xs="24">{{ $t('setup.step2.label.fileStoragePath') }}</a-col>
            <a-col :sm="16" :xs="24">{{ storagePath }}</a-col>
          </a-row>
          <a-row>
            <a-col :sm="8" :xs="24">{{ $t('setup.step2.label.logDirectoryPath') }}</a-col>
            <a-col :sm="16" :xs="24">{{ configuration.logDirectoryPath }}</a-col>
          </a-row>
          <a-row>
            <a-col :sm="8" :xs="24">{{ $t('setup.step2.label.sqlite3DbFilePath') }}</a-col>
            <a-col :sm="16" :xs="24">{{ configuration.databaseFilePath }}</a-col>
          </a-row>
        </div>
        <div slot="action">
          <a-button type="primary" @click="finish">{{ $t('setup.step2.button.home') }}</a-button>
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
    ...mapGetters(['configuration', 'storagePath']),
    description () {
      return this.$t('setup.step2.label.timer', [this.seconds])
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
