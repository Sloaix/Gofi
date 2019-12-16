<div align="center">
<img src="https://github.com/Sloaix/Gofi/blob/master/preview/logo-192x192.png?raw=true">
</div>

# [Gofi](https://gofi-doc.sloaix.com/en-US) &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Sloaix/Gofi/blob/master/LICENSE) ![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/Sloaix/Gofi)

[English](./README.md) | 简体中文

Gofi (gəʊfi:) 是一个用于构建个人云盘的应用.

* **易部署:** 使用Sqlite3数据库存储,所有静态资源内嵌进单二进制可执行文件内
* **跨平台:** 依托于Go,除Mac/Linux/Windows外，你甚至可以在Android手机上运行Gofi
* **现代化:** 基于Ant Design Vue Pro 的现代化界面以及多语言支持

[了解如何在服务器中部署Gofi](https://gofi-doc.sloaix.com/guide/getting-started)

[查看Gofi的预览站点](http://gofi.sloaix.com)

![preview-en](https://github.com/Sloaix/Gofi/blob/master/preview/preview-en.png?raw=true)

## 安装

Gofi已经针对多平台发布, **您可以根据需要从[发布页面](https://github.com/Sloaix/Gofi/releases)下载二进制文件.**

```bash
# download MacOS plaftform gofi, rename it.
wget -O gofi https://github.com/Sloaix/Gofi/releases/latest/download/gofi-darwin-10.6-amd64

# run it
./gofi -p 80 -ip 251.251.251.251
```

## 文档

你可以在这个[网站](https://gofi-doc.sloaix.com/guide)找到Gofi文档 

查看[入门教程](https://gofi-doc.sloaix.com/guide/getting-started)以获得快速概述。

文档分为几个部分:

* [介绍](https://gofi-doc.sloaix.com/guide/)
* [上手](https://gofi-doc.sloaix.com/guide/getting-started)
* [Android上的Gofi部署](https://gofi-doc.sloaix.com/guide/run-on-android)
* [Gofi的愿景](https://gofi-doc.sloaix.com/guide/mission)

您可以通过向这个[Repo](https://github.com/Sloaix/Gofi-doc)发PR来完善它。

## 愿景
够用，易用。

## 贡献

此repo的主要用途是创建个人云盘的应用。Gofi的开发是在GitHub上公开进行的，我们非常感谢社区对bug修复和改进的贡献。

## 开源协议

Gofi 使用 [MIT License](./LICENSE).
