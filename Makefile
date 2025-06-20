# Gofi 项目 Makefile

# 变量定义
FRONTEND_DIR=gofi-frontend
BACKEND_DIR=gofi-backend
FRONTEND_DIST=$(FRONTEND_DIR)/dist
BACKEND_DIST=$(BACKEND_DIR)/env/dist
BACKEND_OUTPUT=$(BACKEND_DIR)/output
OUTPUT=output
GOFI_BIN=gofi

# 构建模式，支持 production/preview，默认 production
MODE?=production
GO_BUILD_TAGS=$(MODE)

# 版本号自动获取
VERSION=$(shell git log -1 --pretty=%h)

.PHONY: all clean preview production printinfo build-all build-backend build-frontend clean-output clean-frontend-dist copy-frontend-to-backend after-build generate-checksums

all: build-all

build-all: clean-output build-frontend copy-frontend-to-backend build-backend after-build generate-checksums

production:
	@echo "🚀 [生产模式] 打包前端和后端..."
	$(MAKE) MODE=production build-all

preview:
	@echo "🎭 [演示模式] 打包前端和后端..."
	$(MAKE) MODE=preview build-all

clean-output:
	@echo "🧹 清空输出目录..."
	@rm -rf $(OUTPUT)
	@mkdir -p $(OUTPUT)

clean-frontend-dist:
	@echo "🧹 清理前端产物目录..."
	@rm -rf $(FRONTEND_DIST)

build-frontend: clean-frontend-dist
	@echo "🔧 打包前端... (模式: $(MODE))"
	cd $(FRONTEND_DIR) && \
		pnpm install && \
		pnpm run build$(if $(filter preview,$(MODE)),:demo,)

copy-frontend-to-backend:
	@echo "📁 复制前端产物到后端目录..."
	@rm -rf $(BACKEND_DIST)
	@cp -r $(FRONTEND_DIST) $(BACKEND_DIST)

build-backend:
	@echo "🔧 打包后端... (模式: $(MODE))"
	cd $(BACKEND_DIR) && \
		go mod tidy && \
		CGO_ENABLED=1 CGO_CFLAGS="-Wno-return-local-addr" go build -tags=$(GO_BUILD_TAGS) -ldflags='-w -s -X gofi/db.version=$(VERSION)' -o $(GOFI_BIN)-linux-amd64-$(MODE)
	@mkdir -p $(BACKEND_OUTPUT)
	@mv $(BACKEND_DIR)/$(GOFI_BIN)-linux-amd64-$(MODE) $(BACKEND_OUTPUT)/
	@echo "[安全提示] 后端模式由 build tag 决定，前端无法绕过！"

after-build:
	@echo "📦 整理最终产物到 output 目录..."
	@cp -r $(BACKEND_OUTPUT)/* $(OUTPUT)/
	@rm -rf $(BACKEND_OUTPUT)
	@rm -rf $(BACKEND_DIR)/env/dist
	@echo "✅ 构建完成！产物位置: $(OUTPUT)/"

generate-checksums:
	@echo "🔐 生成 SHA256 校验文件..."
	@cd $(OUTPUT) && \
		for file in $(GOFI_BIN)*; do \
			if [ -f "$$file" ]; then \
				sha256sum "$$file" > "$$file.sha256"; \
				echo "✅ 生成校验: $$file.sha256"; \
			fi; \
		done

clean:
	@echo "🧹 清理构建产物..."
	@rm -rf $(FRONTEND_DIST) $(BACKEND_DIST) $(BACKEND_OUTPUT) $(OUTPUT)

printinfo:
	@echo "====> 当前构建模式: $(MODE)"
	@echo "====> 版本: $(VERSION)"
	@echo "====> 前端目录: $(FRONTEND_DIR)"
	@echo "====> 后端目录: $(BACKEND_DIR)"
	@echo "====> 输出目录: $(OUTPUT)" 