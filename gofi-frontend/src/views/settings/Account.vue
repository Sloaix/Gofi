<template>
  <div>
    <span style="font-weight: bold">{{ $t('description.ChangePasswordSoonTip') }}</span>
    <a-list
      itemLayout="horizontal"
      :dataSource="options"
    >
      <a-list-item slot="renderItem" slot-scope="item,index" :key="index">
        <a-list-item-meta>
          <a slot="title" :style="item.titleStyle">{{ item.title }}</a>
          <span slot="description">
            <span class="security-list-description">{{ item.description }}</span>
            <span v-if="item.value"> : </span>
            <span class="security-list-value">{{ item.value }}</span>
          </span>
        </a-list-item-meta>
        <template v-if="item.actions">
          <a slot="actions" @click="item.actions.callback">{{ item.actions.title }}</a>
        </template>
      </a-list-item>
    </a-list>
    <PasswordChangeModal
      ref="collectionForm"
      :visible="visible"
      @cancel="handleCancel"
      @create="handleCreate"/>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PasswordChangeModal from '../../components/tools/PasswordChangeModal'
import { message } from 'ant-design-vue'
import i18n from '../../locales'
export default {
  name: 'Account',
  components: { PasswordChangeModal },
  data () {
    return {
      visible: false
    }
  },
  methods: {
    ...mapActions(['ChangePassword']),
    handlePasswordEditClick () {
      this.showModal()
    },
    showModal () {
      this.visible = true
    },
    handleCancel () {
      this.visible = false
      const form = this.$refs.collectionForm.form
      form.resetFields()
    },
    handleCreate () {
      const form = this.$refs.collectionForm.form
      form.validateFields((err, values) => {
        if (err) {
          return
        }
        console.log('Received values of form: ', values)

        // 请求修改密码接口
        this.ChangePassword(values).then(() => {
          form.resetFields()
          this.visible = false
          message.success(this.$t('description.changeSuccess'))
        }).catch(err => {
          message.error(i18n.t(err))
        })
      })
    }
  },
  computed: {
    ...mapGetters(['isAdmin', 'username', 'userType']),
    options () {
      return [
        { title: this.$t('title.userType'),
          description: this.userType,
          value: ''
        },
        { title: this.$t('title.username'),
          description: this.username,
          value: ''
        },
        { title: this.$t('title.password'),
          description: this.$t('description.hasBeenSet'),
          value: '',
          actions: {
            title: this.$t('action.edit'),
            callback: this.handlePasswordEditClick
          }
        }
      ]
    }
  }
}
</script>

<style scoped>
</style>
