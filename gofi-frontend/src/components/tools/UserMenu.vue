<template>
  <div class="user-wrapper">
    <div class="content-box">
      <!--      todo-->
      <!--      <a @click.prevent>-->
      <!--        <span class="action">-->
      <!--          <a-icon type="question-circle-o" style="font-size: 16px"></a-icon>-->
      <!--        </span>-->
      <!--      </a>-->
      <lang-select></lang-select>
    </div>
  </div>
</template>

<script>
import NoticeIcon from '@/components/NoticeIcon'
import { mapActions, mapGetters } from 'vuex'
import LangSelect from './LangSelect'

export default {
  name: 'UserMenu',
  components: {
    LangSelect,
    NoticeIcon
  },
  computed: {
    ...mapGetters(['nickname', 'avatar'])

  },
  methods: {
    ...mapActions(['Logout']),
    handleLogout () {
      this.$confirm({
        title: '提示',
        content: '真的要注销登录吗 ?',
        onOk: () => {
          return this.Logout({}).then(() => {
            setTimeout(() => {
              window.location.reload()
            }, 16)
          }).catch(err => {
            this.$message.error({
              title: '错误',
              description: err.message
            })
          })
        },
        onCancel () {
        }
      })
    }
  }
}
</script>
