package test

import (
	"gofi/util"
	"testing"
)

func TestIsTestEnvironment(t *testing.T) {
	if !util.IsTestEnvironment() {
		t.Error("failed, current is test environment.")
	}
}
