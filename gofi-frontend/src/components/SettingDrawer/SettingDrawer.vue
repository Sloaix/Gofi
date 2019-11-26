<template>
  <div class="setting-drawer" ref="settingDrawer">
    <a-drawer
      width="300"
      placement="right"
      @close="onClose"
      :closable="false"
      :visible="visible"
      :handle="handle"
    >
      <div class="setting-drawer-index-content">

        <div :style="{ marginBottom: '24px' }">
          <h3 class="setting-drawer-index-title">整体风格设置</h3>

          <div class="setting-drawer-index-blockChecbox">
            <a-tooltip>
              <template slot="title">
                暗色菜单风格
              </template>
              <div class="setting-drawer-index-item" @click="handleMenuTheme('dark')">
                <img
                  src="https://gw.alipayobjects.com/zos/rmsportal/LCkqqYNmvBEbokSDscrm.svg"
                  alt="dark">
                <div class="setting-drawer-index-selectIcon" v-if="navTheme === 'dark'">
                  <a-icon type="check"/>
                </div>
              </div>
            </a-tooltip>

            <a-tooltip>
              <template slot="title">
                亮色菜单风格
              </template>
              <div class="setting-drawer-index-item" @click="handleMenuTheme('light')">
                <img
                  src="https://gw.alipayobjects.com/zos/rmsportal/jpRkZQMyYRryryPNtyIC.svg"
                  alt="light">
                <div class="setting-drawer-index-selectIcon" v-if="navTheme !== 'dark'">
                  <a-icon type="check"/>
                </div>
              </div>
            </a-tooltip>
          </div>
        </div>

        <a-divider/>

        <div :style="{ marginBottom: '24px' }">
          <h3 class="setting-drawer-index-title">导航模式</h3>

          <div class="setting-drawer-index-blockChecbox">
            <a-tooltip>
              <template slot="title">
                侧边栏导航
              </template>
              <div class="setting-drawer-index-item" @click="handleLayout('side')">
                <img
                  src="https://gw.alipayobjects.com/zos/rmsportal/JopDzEhOqwOjeNTXkoje.svg"
                  alt="sidemenu">
                <div class="setting-drawer-index-selectIcon" v-if="navMode === 'side'">
                  <a-icon type="check"/>
                </div>
              </div>
            </a-tooltip>

            <a-tooltip>
              <template slot="title">
                顶部栏导航
              </template>
              <div class="setting-drawer-index-item" @click="handleLayout('top')">
                <img
                  src="https://gw.alipayobjects.com/zos/rmsportal/KDNDBbriJhLwuqMoxcAr.svg"
                  alt="topmenu">
                <div class="setting-drawer-index-selectIcon" v-if="navMode !== 'side'">
                  <a-icon type="check"/>
                </div>
              </div>
            </a-tooltip>
          </div>
        </div>
        <a-divider/>
        <div :style="{ marginBottom: '24px' }">
          <a-alert type="warning" :style="{ marginTop: '24px' }">
            <span slot="message">
              配置栏只在开发环境用于预览，生产环境不会展现，请手动修改配置文件
              <a
                href="https://github.com/sendya/ant-design-pro-vue/blob/master/src/config/defaultSettings.js"
                target="_blank">src/config/defaultSettings.js</a>
            </span>
          </a-alert>
        </div>
      </div>
      <div class="setting-drawer-index-handle" @click="toggle">
        <a-icon type="setting" v-if="!visible"/>
        <a-icon type="close" v-else/>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import { DetailList } from '@/components'
import SettingItem from './SettingItem'
import { mixin, mixinDevice } from '@/utils/mixin'

export default {
  components: {
    DetailList,
    SettingItem
  },
  mixins: [mixin, mixinDevice],
  data () {
    return {
      visible: false,
      handle: <div />
    }
  },
  watch: {},
  methods: {
    showDrawer () {
      this.visible = true
    },
    onClose () {
      this.visible = false
    },
    toggle () {
      this.visible = !this.visible
    },
    handleMenuTheme (theme) {
      this.$store.dispatch('ToggleTheme', theme)
    },
    handleLayout (mode) {
      this.$store.dispatch('ToggleLayoutMode', mode)
    }
  }
}
</script>

<style lang="less" scoped>

    .setting-drawer-index-content {

        .setting-drawer-index-blockChecbox {
            display: flex;

            .setting-drawer-index-item {
                margin-right: 16px;
                position: relative;
                border-radius: 4px;
                cursor: pointer;

                img {
                    width: 48px;
                }

                .setting-drawer-index-selectIcon {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 100%;
                    padding-top: 15px;
                    padding-left: 24px;
                    height: 100%;
                    color: #1890ff;
                    font-size: 14px;
                    font-weight: 700;
                }
            }
        }

        .setting-drawer-theme-color-colorBlock {
            width: 20px;
            height: 20px;
            border-radius: 2px;
            float: left;
            cursor: pointer;
            margin-right: 8px;
            padding-left: 0px;
            padding-right: 0px;
            text-align: center;
            color: #fff;
            font-weight: 700;

            i {
                font-size: 14px;
            }
        }
    }

    .setting-drawer-index-handle {
        position: absolute;
        top: 240px;
        background: #1890ff;
        width: 48px;
        height: 48px;
        right: 300px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        pointer-events: auto;
        z-index: 1001;
        text-align: center;
        font-size: 16px;
        border-radius: 4px 0 0 4px;

        i {
            color: rgb(255, 255, 255);
            font-size: 20px;
        }
    }
</style>
