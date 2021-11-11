# gofi会在工作目录生成gofi.db文件用于存储gofi相关配置,可以将/app目录映射到host中以便持久化
# 由于gofi的默认文件仓库为工作目录下的storage文件夹,所以可以将/app/storage映射到host中,以便初始化Gofi时无需再指定storage path
FROM alpine:3.14
COPY ./output/gofi-linux-amd64 /usr/local/bin/gofi
WORKDIR /app
#定义时区环境变量
ENV  TIME_ZONE Asia/Shanghai
# 添加edge软件源
RUN apk update \
    # 安装最新版本的软件
    && apk --no-cache add tzdata \
    # 配置时区
    && echo "${TIME_ZONE}" > /etc/timezone && ln -sf /usr/share/zoneinfo/${TIME_ZONE} /etc/localtime && date
ENTRYPOINT [ "gofi"]