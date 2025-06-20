# 配置说明

Gofi 后端支持通过环境变量进行灵活配置，常用变量如下：

| 变量名 | 说明 | 示例 |
| ------ | ---- | ---- |
| GOFI_JWT_SECRET | JWT 密钥 | your-secret-key |
| GOFI_JWT_EXPIRE_HOURS | Token 有效期（小时） | 168 |
| GOFI_ENABLE_DEBUG | 是否开启调试 | false |
| GOFI_LOG_LEVEL | 日志级别 | info |

可在启动前设置环境变量，例如：

```bash
export GOFI_JWT_SECRET="your-secret-key"
export GOFI_JWT_EXPIRE_HOURS="168"
export GOFI_ENABLE_DEBUG="false"
``` 