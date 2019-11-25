package test

import (
	"gofi/util"
	"testing"
)

func TestIsHiddenFile(t *testing.T) {
	fileNames := []string{
		"test",
		"/test",
		"a.test",
		"a.",
	}

	for _, name := range fileNames {
		if util.IsHiddenFile(name) {
			t.Error()
		}
	}

	fileNames = []string{
		".test",
		".a",
	}

	for _, name := range fileNames {
		if !util.IsHiddenFile(name) {
			t.Error()
		}
	}
}
