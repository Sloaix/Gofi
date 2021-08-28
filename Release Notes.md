# Release notes

# package.json

修改 package.json 的 version

## 提交

GitHub Action 的 commit 检查 action 存在 BUG,如果一次 push 有多个 commit,会逐一检查,会导致一个 release commit 失败.

在新建 release commit 之前需要将所有的更新都 push 到 remote repo,再新建 release commit 并 push,不然会导致失败.

注:只有 "chore: release v1.0.2" 这种格式的 commit 才会触发发布流程,注意冒号和 release 后面的空格'
