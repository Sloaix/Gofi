<template>
  <div class="page-header-index-wide">
    <div class="table-operator">
      <a-button type="default" icon="home" @click="navToFileList">
        {{ $t('allFile.rootDir') }}
      </a-button>
      <a-button type="default" icon="arrow-left" @click="navBack">
        {{ $t('allFile.parentDir') }}
      </a-button>
      <a-button type="primary" icon="download" :href="downloadUrl" style="float: right">
        {{ $t('allFile.download') }}
      </a-button>
    </div>
    <a-card size="small" :title="`Gofi://${data.path}`">
      <description-list size="small">
        <description-list-item term="文件名">{{ data.name }}</description-list-item>
        <description-list-item term="大小">{{ data.size | human-size }}</description-list-item>
        <description-list-item term="最后修改时间"> {{ data.lastModified * 1000 | moment }}</description-list-item>
      </description-list>
    </a-card>
    <a-card :style="contentStyle">
      <img
        v-if="isImage"
        alt="example"
        :src="previewUrl"
        style="max-width: 100%"
      />
      <video
        v-if="isVideo"
        width="100%"
        style="border: none;outline: none"
        :src="previewUrl"
        controls="controls">
        您的浏览器不支持 video 标签。
      </video>
      <audio v-if="isAudio" :src="previewUrl" controls style="outline: none"/>
      <pre v-if="isText" style="max-width: 100%;white-space:pre-line">
        {{ data.content }}
      </pre>
    </a-card>
  </div>
</template>

<script>
import { PageView } from '@/layouts'
import api, { getFileDetail } from '@/api/disk'
import PageHeader from '@/components/PageHeader/PageHeader'
import DescriptionList from '@/components/DescriptionList/DescriptionList'

const DescriptionListItem = DescriptionList.Item
export default {
  name: 'FilePreview',
  components: {
    DescriptionListItem,
    DescriptionList,
    PageHeader,
    PageView
  },
  computed: {
    contentStyle () {
      return {
        'text-align': this.isImage || this.isAudio ? 'center' : 'none',
        'border-top': 'none'
      }
    },
    title () {
      return this.$route.query.path
    },
    isImage () {
      return this.data.mime && this.data.mime.includes('image')
    },
    isVideo () {
      return this.data.mime && this.data.mime.includes('video')
    },
    isAudio () {
      return this.data.mime && this.data.mime.includes('audio')
    },
    isText () {
      return !!this.data.content
    },
    downloadUrl () {
      return `${window.GOFI_MANIFEST.VUE_APP_API_BASE_URL}${api.Download}?path=${encodeURIComponent(this.$route.query.path)}`
    },
    previewUrl () {
      return `${this.downloadUrl}&raw=true`
    }
  },
  data () {
    return {
      data: {}
    }
  },
  mounted () {
    this.fetch(this.$route.query.path)
  },
  watch: {
    '$route' (to, from) {
      const path = to.query.path
      this.fetch(path)
    }
  },
  methods: {
    navToFileList () {
      this.$router.push({ name: 'file-list' })
    },
    navBack () {
      this.$router.back()
    },
    fetch (filePath) {
      if (!filePath) {
        filePath = ''
      }
      this.loading = true
      return getFileDetail(filePath).then(data => {
        const pagination = { ...this.pagination }
        pagination.total = data && data.length ? data.length : 0
        this.loading = false
        this.data = data
        this.pagination = pagination
      }).catch(err => {
        this.$notification.error({
          duration: null,
          message: err
        })
        this.loading = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .table-operator {
    margin-bottom: 20px;

    button {
      margin-right: 8px;
    }
  }
</style>
