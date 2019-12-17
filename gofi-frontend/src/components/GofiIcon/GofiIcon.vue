<template>
  <a-icon :type="iconName" theme="outlined"/>
</template>

<script>
const extIconMap = {
  fileIcons: {
    'default': 'file',
    'mp3|wav|mid|ape|flac|aa|aac|m4a|ogg': 'customer-service',
    'mp4|webm|mkv|flv|avi|mov|wmv|rmvb|3gp': 'video-camera',
    'jpg|jpeg|png|bmp|gif|webp': 'picture',
    'txt|text|config|conf|ini|yaml|properties|toml|plist|xml|json': 'file-text',
    'ppt|pptx': 'file-ppt',
    'doc|docx': 'file-word',
    'xls|xlsx': 'file-excel',
    'md|markdown': 'file-markdown',
    'pdf': 'file-pdf'
  },
  folderIcons: {
    'default': 'folder'
  }
}
export default {
  name: 'GofiIcon',
  props: {
    type: {
      type: String,
      required: false,
      default: 'default'
    },
    isFolder: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  data () {
    return {
    }
  },
  computed: {
    iconName: function () {
      const icons = this.isFolder ? extIconMap.folderIcons : extIconMap.fileIcons
      for (const ext of Object.keys(icons)) {
        if (ext && ext.toLocaleLowerCase().includes(this.type.toLocaleLowerCase())) {
          return icons[ext]
        }
      }
      return icons.default
    }
  }
}
</script>

<style scoped>

</style>
