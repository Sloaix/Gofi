package test

import (
	"os"
	"testing"

	"gofi/boot"

	"github.com/stretchr/testify/assert"
)

func TestArgumentParsing(t *testing.T) {
	originalArgs := os.Args
	defer func() { os.Args = originalArgs }()

	t.Run("默认参数", func(t *testing.T) {
		os.Args = []string{"test"}
		boot.ParseArguments()
		config := boot.GetArguments()
		assert.Equal(t, "8080", config.Port)
	})

	t.Run("自定义端口", func(t *testing.T) {
		os.Args = []string{"test", "-port", "9090"}
		boot.ParseArguments()
		config := boot.GetArguments()
		assert.Equal(t, "9090", config.Port)
	})

	t.Run("短端口参数", func(t *testing.T) {
		os.Args = []string{"test", "-p", "9090"}
		boot.ParseArguments()
		config := boot.GetArguments()
		assert.Equal(t, "9090", config.Port)
	})
}

func TestPortUsage(t *testing.T) {
	t.Run("端口使用说明", func(t *testing.T) {
		assert.Equal(t, "8080", boot.DefaultPort)
	})
}

func TestArgumentSingleton(t *testing.T) {
	t.Run("参数单例", func(t *testing.T) {
		arg1 := boot.GetArguments()
		arg2 := boot.GetArguments()
		assert.Equal(t, arg1, arg2)
	})
}
