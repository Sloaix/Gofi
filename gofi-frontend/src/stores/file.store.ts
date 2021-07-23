import { action, makeObservable, observable } from 'mobx'
import repo, { FileInfo } from '../api/repository'
class FileStore {
    fileInfos: FileInfo[] | undefined = undefined

    constructor() {
        makeObservable(this, {
            fileInfos: observable,
            fetchFileList: action,
            setFileInfos: action,
        })
    }

    setFileInfos(fileInfos: FileInfo[]) {
        this.fileInfos = fileInfos
    }

    async fetchFileList(dirPath: string) {
        try {
            const fileInfos = await repo.fetchFileList(dirPath)
            this.setFileInfos(fileInfos)
        } catch (e) {}
    }
}
export default FileStore
