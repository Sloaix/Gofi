<template>
  <div>
    <a-form :form="form">
      <!--导航模式-->
      <a-form-item :label="$t('form.input.navMode.name')">
        <a-select
          @select="onNavModeSelect"
          v-decorator="[
            'navMode',
            { initialValue: settings.navMode, rules: [{ required: true,message:'请选择导航模式'}] }
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
      <a-form-item :label="$t('form.input.themeStyle.name')">
        <a-select
          @select="onThemeStyleSelect"
          v-decorator="[
            'themeStyle',
            { initialValue: settings.themeStyle, rules: [{ required: true,message:'请选择主题样式'}] }
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
      <a-form-item >
        <a-button :loading="loading" type="primary" @click="onSaveButtonClick">{{ $t('form.button.save.name') }}</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  components: {
  },
  destroyed () {
    this.resetIfNotSave()
  },
  data () {
    return {
      form: this.$form.createForm(this),
      loading: false
    }
  },
  computed: {
    ...mapGetters(['settings', 'storagePath'])
  },
  methods: {
    resetIfNotSave () {
      this.$store.dispatch('ToggleTheme', this.settings.themeStyle)
      this.$store.dispatch('ToggleLayoutMode', this.settings.navMode)
    },
    onThemeStyleSelect (theme) {
      this.$store.dispatch('ToggleTheme', theme)
    },
    onNavModeSelect (theme) {
      this.$store.dispatch('ToggleLayoutMode', theme)
    },
    onSaveButtonClick () {
      this.loading = true
      const that = this
      this.form.validateFields((err, forms) => {
        if (!err) {
          this.$store.dispatch('UpdateSettings', forms)
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
    }
  }
}
</script>

<style scoped>

</style>
