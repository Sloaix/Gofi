<template>
  <a-modal
    :closable="false"
    :width="350"
    :destroyOnClose="true"
    :mask="true"
    :visible="visible"
    :title="$t('setting.account.form.label.changePassword')"
    :okText="$t('action.submit')"
    :cancelText="$t('action.cancel')"
    @cancel="() => { $emit('cancel') }"
    @ok="() => { $emit('create') }"
  >
    <a-form
      :form="form"
    >
      <a-form-item >
        <a-input
          :placeholder="$t('setting.account.form.label.newPassword')"
          v-decorator="[
            'password',
            {
              rules: [{ required: true,message: $t('description.placeHolderForNewPassword') }],
            }
          ]"
        >
          <a-icon slot="addonBefore" type="lock" />
        </a-input>
      </a-form-item>
      <!-- <a-form-item :label="$t('setting.account.form.label.confirmPassword')"> -->
      <a-form-item >
        <a-input
          :placeholder="$t('setting.account.form.label.confirmPassword')"
          v-decorator="[
            'confirm',
            {
              rules: [
                {
                  required: true,
                  message: $t('description.placeHolderForConfirmPassword')
                },
                {
                  validator: compareToFirstPassword
                },
              ],
            }
          ]"
        >
          <a-icon slot="addonBefore" type="check-circle" />
        </a-input>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
export default {
  name: 'PasswordChangeModal',
  props: {
    'visible': {
      required: true,
      type: Boolean
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this, { name: 'password_change_form_in_modal' })
  },
  methods: {
    compareToFirstPassword (rule, value, callback) {
      const form = this.form
      if (value && value !== form.getFieldValue('password')) {
        callback(this.$t('description.confirmPasswordError'))
      } else {
        callback()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
