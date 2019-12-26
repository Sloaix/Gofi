<template>
  <div>
    <a-form :form="form" style="max-width: 700px; margin: 40px auto 0;">
      <!--默认语言-->
      <a-form-item :label="$t('form.select.language.name')" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-select
          @select="onLanguageSelect"
          v-decorator="[
            'defaultLanguage',
            { initialValue: language, rules: [{ required: true,message:$t('form.select.language.errorMessage')}] }
          ]"
        >
          <a-select-option value="zh-CN"><span role="img" aria-label="简体中文">🇨🇳</span> 简体中文</a-select-option>
          <a-select-option value="en-US"><span role="img" aria-label="English">🇺🇸</span> English</a-select-option>
        </a-select>
      </a-form-item>
      <!--文件仓库-->
      <a-form-item
        :label="$t('form.input.fileStoragePath.name')"
        :labelCol="labelCol"
        :wrapperCol="wrapperCol">
        <a-input-group style="display: inline-block; vertical-align: middle" :compact="true">
          <a-select
            style="width:95px"
            @select="onStorageTypeSelect"
            defaultValue="default"
          >
            <a-select-option value="default">{{ $t('form.select.fileStorageType.def') }}</a-select-option>
            <a-select-option value="custom">{{ $t('form.select.fileStorageType.custom') }}</a-select-option>
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
      <!--导航模式-->
      <a-form-item :label="$t('form.input.navMode.name')" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-select
          @select="onNavModeSelect"
          v-decorator="[
            'navMode',
            { initialValue: 'top', rules: [{ required: true,message:'请选择导航模式'}] }
          ]"
        >
          <a-select-option value="top">
            <img
              style="height: 20px;margin-right: 10px"
              src="@/assets/icons/nav_top.svg"
              alt="topmenu">
            <span>{{ $t('form.input.navMode.top') }}</span>
          </a-select-option>
          <a-select-option value="side">
            <img
              style="height: 20px;margin-right: 10px"
              src="@/assets/icons/nav_side.svg"
              alt="sidemenu">
            <span>{{ $t('form.input.navMode.side') }}</span>
          </a-select-option>
        </a-select>
      </a-form-item>
      <!--主题风格-->
      <a-form-item :label="$t('form.input.themeStyle.name')" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-select
          @select="onThemeStyleSelect"
          v-decorator="[
            'themeStyle',
            { initialValue: 'light', rules: [{ required: true,message:'请选择主题样式'}] }
          ]"
        >
          <a-select-option value="light">
            <img
              style="height: 20px;margin-right: 10px"
              src="@/assets/icons/theme_light.svg"
              alt="light">
            <span>{{ $t('form.input.themeStyle.light') }}</span>
          </a-select-option>
          <a-select-option value="dark">
            <img
              style="height: 20px;margin-right: 10px"
              src="@/assets/icons/theme_dark.svg"
              alt="dark">
            <span>{{ $t('form.input.themeStyle.dark') }}</span>
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :wrapperCol="{ span: 19, offset: 5 }">
        <a-button :loading="loading" type="primary" @click="nextStep">{{ $t('form.button.submit.name') }}</a-button>
      </a-form-item>
    </a-form>
    <a-divider/>
    <div class="step-form-style-desc" style="max-width: 800px; margin: 40px auto 0;">
      <h3>说明</h3>
      <h4>默认路径</h4>
      <p>默认路径为gofi应用程序所在文件夹下Storage目录，Gofi在第一次启动时会自动创建该目录。</p>
      <h4>自定义路径</h4>
      <p>你可以为Gofi指定任意文件目录，但是请确保Gofi对该文件夹具有读写权限。</p>
      <p>注意：请使用绝对路径,如/Users/lsxiao</p>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'SetupStep1',
  data () {
    return {
      storageType: 'default',
      labelCol: { lg: { span: 5 }, sm: { span: 5 } },
      wrapperCol: { lg: { span: 19 }, sm: { span: 19 } },
      form: this.$form.createForm(this),
      loading: false
    }
  },
  computed: {
    ...mapActions(['Setup']),
    ...mapGetters(['settings', 'color', 'language']),
    storagePathInputDisabled () {
      return this.storageType === 'default'
    },
    storagePathInitialValue () {
      return this.storagePathInputDisabled ? this.settings.defaultStoragePath : ''
    }
  },
  methods: {
    ...mapMutations({
      switchLanguage: 'SWITCH_LANGUAGE'
    }),
    onStorageTypeSelect (storageType) {
      // 重置一下错误状态
      if (this.storageType !== storageType) {
        this.form.resetFields(['customStoragePath'])
      }
      this.storageType = storageType
    },
    onLanguageSelect (language) {
      this.switchLanguage(language)
    },
    onThemeStyleSelect (theme) {
      this.$store.dispatch('ToggleTheme', theme)
    },
    onNavModeSelect (theme) {
      this.$store.dispatch('ToggleLayoutMode', theme)
    },
    nextStep () {
      this.loading = true
      const that = this
      this.form.validateFields((err, settings) => {
        if (!err) {
          console.log('表单 values', settings)
          this.$store.dispatch('Setup', settings).then(() => {
            that.loading = false
            that.$emit('nextStep')
          }).catch((err) => {
            that.$notification.error({
              message: that.$t('fallback.installFailed'),
              description: err
            })
            that.loading = false
          })
        } else {
          that.loading = false
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
    .step-form-style-desc {
        padding: 0 56px;
        color: rgba(0, 0, 0, 0.45);

        h3 {
            margin: 0 0 12px;
            color: rgba(0, 0, 0, 0.45);
            font-size: 16px;
            line-height: 32px;
        }

        h4 {
            margin: 0 0 4px;
            color: rgba(0, 0, 0, 0.45);
            font-size: 14px;
            line-height: 22px;
        }

        p {
            margin-top: 0;
            margin-bottom: 12px;
            line-height: 22px;
        }
    }
</style>
