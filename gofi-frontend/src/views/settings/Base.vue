<template>
  <a-form :form="form">
    <!--文件仓库-->
    <a-form-item :label="$t('setting.base.form.label.fileStoragePath')">
      <a-input-group style="display: inline-block; vertical-align: middle" :compact="true">
        <a-select
          style="width:95px"
          @select="onStorageTypeSelect"
          v-model="storageType"
        >
          <a-select-option value="default">{{ $t('setup.step1.form.select.option.fileStorageType.default') }}</a-select-option>
          <a-select-option value="custom">{{ $t('setup.step1.form.select.option.fileStorageType.custom') }}</a-select-option>
        </a-select>
        <a-input
          :placeholder="$t('form.input.fileStoragePath.placeholder')"
          :style="{ width: 'calc(100% - 95px)' }"
          :disabled="storagePathInputDisabled"
          v-decorator="[
            'customStoragePath',
            { initialValue: storagePathInitialValue, rules: [{ required: true, message: $t('form.input.fileStoragePath.errorMessage') }] }
          ]"
        />
      </a-input-group>
    </a-form-item>
    <a-form-item >
      <a-button :loading="loading" type="primary" @click="onSaveButtonClick">{{ $t('setting.base.form.button.save') }}</a-button>
    </a-form-item>
  </a-form>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  components: {
  },
  data () {
    return {
      storageType: 'default',
      loading: false,
      form: this.$form.createForm(this)
    }
  },
  mounted () {
    this.storageType = this.configuration.customStoragePath ? 'custom' : 'default'
  },
  computed: {
    ...mapGetters(['configuration', 'language']),
    storagePathInputDisabled () {
      return this.storageType === 'default'
    },
    storagePathInitialValue () {
      return this.storagePathInputDisabled ? this.configuration.defaultStoragePath : this.configuration.customStoragePath
    }
  },
  methods: {
    onSaveButtonClick () {
      this.loading = true
      const that = this
      this.form.validateFields((err, fields) => {
        if (!err) {
          this.$store.dispatch('UpdateStoragePath', fields.customStoragePath)
            .then(() => {
              that.$notification.success({
                message: that.$t('fallback.saveSuccess')
              })
              setTimeout(() => { that.loading = false }, 300)
            }).catch((err) => {
              that.$notification.error({
                message: that.$t('fallback.saveFailed'),
                description: err
              })
              that.loading = false
            })
        } else {
          that.loading = false
        }
      })
    },
    onStorageTypeSelect (storageType) {
      // 重置一下错误状态
      if (this.storageType !== storageType) {
        this.form.resetFields(['customStoragePath'])
      }
      this.storageType = storageType
    }
  }
}
</script>
