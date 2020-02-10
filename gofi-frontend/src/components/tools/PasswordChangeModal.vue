<template>
  <a-modal
    :visible="visible"
    :title="$t('title.changePassword')"
    :okText="$t('action.submit')"
    :cancelText="$t('action.cancel')"
    @cancel="() => { $emit('cancel') }"
    @ok="() => { $emit('create') }"
  >
    <a-form :form="form">
      <a-form-item :label="$t('title.newPassword')">
        <a-input
          v-decorator="[
            'password',
            {
              rules: [{ required: true,message: $t('description.placeHolderForNewPassword') }],
            }
          ]"
        />
      </a-form-item>
      <a-form-item :label="$t('title.confirmPassword')">
        <a-input
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
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
export default {
  name: 'PasswordChangeModal',
  props: [
    'visible'
  ],
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

<style scoped>

</style>
