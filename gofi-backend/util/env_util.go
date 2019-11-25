package util

import (
	"os"
	"strings"
)

func IsTestEnvironment() bool {
	for _, value := range os.Args {
		if strings.Contains(value, "-test.v") {
			return true
		}
	}
	return true
}
