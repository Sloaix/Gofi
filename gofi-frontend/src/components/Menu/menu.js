import Menu from 'ant-design-vue/es/menu'
import Icon from 'ant-design-vue/es/icon'
import Badge from 'ant-design-vue/es/badge'
import i18n from '@/locales'

const { Item, SubMenu } = Menu

export default {
  name: 'SMenu',
  props: {
    menu: {
      type: Array,
      required: true
    },
    theme: {
      type: String,
      required: false,
      default: 'dark'
    },
    mode: {
      type: String,
      required: false,
      default: 'inline'
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      openKeys: [],
      selectedKeys: [],
      cachedOpenKeys: []
    }
  },
  computed: {
    rootSubmenuKeys: vm => {
      const keys = []
      vm.menu.forEach(item => keys.push(item.path))
      return keys
    }
  },
  created () {
    this.updateMenu()
  },
  watch: {
    collapsed (val) {
      if (val) {
        this.cachedOpenKeys = this.openKeys.concat()
        this.openKeys = []
      } else {
        this.openKeys = this.cachedOpenKeys
      }
    },
    $route: function () {
      this.updateMenu()
    }
  },
  methods: {
    renderIcon: function (h, icon) {
      if (icon === 'none' || icon === undefined) {
        return null
      }
      const props = {}
      typeof (icon) === 'object' ? props.component = icon : props.type = icon
      return h(Icon, { props: { ...props } })
    },
    renderTitle: function (h, title, showDot) {
      const pureTitle = h('span', [i18n.t(title)])
      if (showDot) {
        return h(Badge, { props: { dot: '' } }, [pureTitle])
      } else {
        return pureTitle
      }
    },
    renderMenuItem: function (h, menu, pIndex, index) {
      const target = menu.meta.target || null
      const tag = target && 'a' || 'router-link'
      const showDot = menu.meta.dot || false
      const props = { to: { name: menu.name } }
      const attrs = { href: menu.path, target: menu.meta.target }

      return h(Item, { key: menu.path ? menu.path : 'item_' + pIndex + '_' + index }, [
        h(tag, { props: props, attrs: attrs, target: target }, [
          this.renderIcon(h, menu.meta.icon),
          this.renderTitle(h, menu.meta.title, showDot)
        ])
      ])
    },
    renderSubMenu: function (h, menu, pIndex, index) {
      const this2_ = this
      const subItem = [h('span', { slot: 'title' }, [this.renderIcon(h, menu.meta.icon), h('span', [menu.meta.title])])]
      const itemArr = []
      const pIndex_ = pIndex + '_' + index
      console.log('menu', menu)
      if (!menu.hideChildrenInMenu) {
        menu.children.forEach(function (item, i) {
          itemArr.push(this2_.renderItem(h, item, pIndex_, i))
        })
      }
      return h(SubMenu, { key: menu.path ? menu.path : 'submenu_' + pIndex + '_' + index }, subItem.concat(itemArr))
    },
    renderItem: function (h, menu, pIndex, index) {
      if (!menu.hidden) {
        return menu.children && !menu.hideChildrenInMenu
          ? this.renderSubMenu(h, menu, pIndex, index)
          : this.renderMenuItem(h, menu, pIndex, index)
      }
    },
    renderMenu: function (h, menuTree) {
      const this2_ = this
      const menuArr = []
      menuTree.forEach(function (menu, i) {
        if (!menu.hidden) {
          menuArr.push(this2_.renderItem(h, menu, '0', i))
        }
      })
      return menuArr
    },
    onOpenChange (openKeys) {
      // 在水平模式下时执行，并且不再执行后续
      if (this.mode === 'horizontal') {
        this.openKeys = openKeys
        return
      }
      // 非水平模式时
      const latestOpenKey = openKeys.find(key => !this.openKeys.includes(key))
      if (!this.rootSubmenuKeys.includes(latestOpenKey)) {
        this.openKeys = openKeys
      } else {
        this.openKeys = latestOpenKey ? [latestOpenKey] : []
      }
    },
    updateMenu () {
      const routes = this.$route.matched.concat()
      const { hidden } = this.$route.meta
      if (hidden) {
        routes.pop()
      }

      this.selectedKeys = routes.map(route => route.path).filter(path => !!path)

      const openKeys = []
      if (this.mode === 'inline') {
        routes.forEach(item => {
          openKeys.push(item.path)
        })
      }

      this.collapsed ? (this.cachedOpenKeys = openKeys) : (this.openKeys = openKeys)
    }
  },
  render (h) {
    return h(
      Menu,
      {
        props: {
          theme: this.$props.theme,
          mode: this.$props.mode,
          openKeys: this.openKeys,
          selectedKeys: this.selectedKeys
        },
        on: {
          openChange: this.onOpenChange,
          select: obj => {
            this.selectedKeys = obj.selectedKeys
            this.$emit('select', obj)
          }
        }
      },
      this.renderMenu(h, this.menu)
    )
  }
}
