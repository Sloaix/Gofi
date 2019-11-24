<template>
  <page-view :title="title">
    <div class="table-operator">
      <a-button type="default" icon="home" @click="backRootDirectory()" :disabled="!hasParentDirectory" >{{ $t('allFile.rootDir') }}</a-button>
      <a-button type="default" icon="arrow-left" @click="backParentDirectory()" :disabled="!hasParentDirectory" >{{ $t('allFile.parentDir') }}</a-button>

      <!--上传文件-->
      <a-upload
        name="file"
        @change="uploadChange"
        :action="uploadUrl"
        :showUploadList="false"
        :multiple="true"
        :openFileDialogOnClick="!uploading"
        style="float: right"
      >
        <a-button :disabled="uploading" :loading="uploading" type="primary" icon="upload" style="margin-right: 0"> {{ $t('allFile.upload') }} </a-button>
      </a-upload>
    </div>
    <a-card
      :bodyStyle="{padding: 0}"
      :bordered="false"
      :hoverable="true">
      <a-table
        :rowKey="item => item.path"
        :dataSource="data"
        :pagination="pagination"
        :loading="loading"
      >
        <!--文件名-->
        <a-table-column
          dataIndex="name"
          key="name"
        >
          <span slot="title">{{ $t('allFile.name') }}</span>
          <template slot-scope="text, record">
            <span>
              <a-icon :type="record.isDirectory?'folder':'file'" style="margin-right: 8px"></a-icon>
              <router-link
                v-if="record.isDirectory"
                :to="{path:'',query: { path:record.path}}">{{ record.name }}</router-link>
              <template v-else>{{ record.name }}</template>
            </span>
          </template>
        </a-table-column>

        <!--大小-->
        <a-table-column
          dataIndex="size"
          key="size"
          width="20%"
        >
          <span slot="title">{{ $t('allFile.size') }}</span>
          <template slot-scope="text, record">
            {{ record.size | human-size }}
          </template>
        </a-table-column>

        <!--操作-->
        <a-table-column
          key="action"
          width="20%"
        >
          <span slot="title">{{ $t('allFile.action') }}</span>
          <template slot-scope="text, record">
            <span>
              <template v-if="record.isDirectory">-</template>
              <a v-else :href="generateDownloadUrl(record.path)">{{ $t('allFile.download') }}</a>
            </span>
          </template>
        </a-table-column>
      </a-table>
    </a-card>
  </page-view>
</template>
<style scoped lang="less">
</style>
<script>
import api, { getFileList } from '@/api/disk'
import { PageView } from '@/layouts'

export default {
  name: 'AllFile',
  components: {
    PageView
  },
  data () {
    return {
      data: [],
      pagination: {
        defaultPageSize: 50,
        showSizeChanger: true,
        pageSizeOptions: ['50', '100']
      },
      loading: false,
      uploading: false,
      fileList: []
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
  computed: {
    title () {
      return `Gofi://${this.currentDirectory}`
    },
    currentDirectory () {
      if (!this.$route || !this.$route.query) {
        return ''
      }

      const path = this.$route.query.path

      // 如果目录不存在
      if (!path) {
        return ''
      }

      // 上级目录
      return path
    },
    // 上级目录路径
    parentDirectoryPath () {
      return this.currentDirectory.split('/').slice(0, -1).join('/')
    },
    // 是否存在上级目录
    hasParentDirectory () {
      return !!this.$route.query.path
    }
  },
  methods: {
    uploadUrl () {
      return `${window.GOFI_MANIFEST.VUE_APP_API_BASE_URL}${api.Upload}?path=${encodeURIComponent(this.parentDirectoryPath)}`
    },
    backParentDirectory () {
      // 导航到上级目录
      this.$router.push({ path: '', query: { path: this.parentDirectoryPath } })
    },
    backRootDirectory () {
      // 导航到根目录
      this.$router.push({ path: '' })
    },
    generateDownloadUrl (filePath) {
      return `${window.GOFI_MANIFEST.VUE_APP_API_BASE_URL}${api.Download}?path=${encodeURIComponent(filePath)}`
    },
    uploadChange (item) {
      const file = item.file
      const status = item.file.status
      switch (status) {
        case 'uploading':
          this.fileList = item.fileList
          this.$notification.info({
            key: file.name,
            duration: null,
            message: `${file.name} 上传中...`
          })
          break
        case 'removed':
        case 'error':
          this.$notification.error({
            key: file.name,
            message: `${file.name} 上传失败`
          })
          break
        case 'done':
          if (file.response.success) {
            this.$notification.success({
              key: file.name,
              message: `${file.name} 上传成功`,
              description: ''
            })
            // 刷新列表
            this.fetch(this.$route.query.path)
          } else {
            this.$notification.error({
              key: file.name,
              message: `${file.name} 上传失败`,
              description: file.response.message
            })
          }
          break
        default:
      }

      let tempUploading = false
      this.fileList.forEach((file) => {
        if (file.status === 'uploading') {
          tempUploading = true
        }
      })

      this.uploading = tempUploading
    },
    fetch (directoryPath) {
      if (!directoryPath) {
        directoryPath = ''
      }
      this.loading = true
      return getFileList(directoryPath)
        .then(data => {
          const pagination = { ...this.pagination }
          pagination.total = data && data.length ? data.length : 0
          this.loading = false
          this.data = data
          this.pagination = pagination
        })
    }
  }
}
</script>
