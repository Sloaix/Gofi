<template>
  <div class="footer">
    <div class="links">
      <a
        href="https://github.com/Sloaix/ant-design-pro-vue"
        target="_blank"
      >
        <a-icon type="github" />
        Gofi
      </a>
      <a
        href="https://github.com/Sloaix"
        target="_blank"
      >
        {{ $t('footer.aboutMe') }}
      </a>
    </div>
    <div class="copyright">
      {{ $t('footer.version') }} {{ settings.version }} | {{ $t('footer.copyRight') }}
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'GlobalFooter',
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['settings'])
  }
}
</script>

<style lang="less" scoped>
.footer {
  padding: 0 16px;
  margin: 48px 0 24px;
  text-align: center;

  .links {
    margin-bottom: 8px;

    a {
      color: rgba(0, 0, 0, 0.45);

      &:hover {
        color: rgba(0, 0, 0, 0.65);
      }

      &:not(:last-child) {
        margin-right: 40px;
      }
    }
  }
  .copyright {
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
  }
}
</style>
