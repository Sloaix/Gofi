package util

import (
	"github.com/sirupsen/logrus"
	"gofi/binary"
	"strings"
)

func IsHiddenFile(name string) bool {
	if strings.TrimSpace(name) == "" {
		return false
	}

	return strings.HasPrefix(name, ".")
}

// dynamic replace server ip address for index.html static assets.
func AssetProxy(name string) ([]byte, error) {
	assetsBytes, err := binary.Asset(name)

	if err != nil {
		return nil, err
	}

	if indexHtmlName := "public/index.html"; name == indexHtmlName {
		indexHtmlString := strings.Replace(string(assetsBytes[:]), "127.0.0.1:8080", GetLocalAddress(), -1)
		assetsBytes = []byte(indexHtmlString)
		logrus.Info("server ip address replace success")
	}

	return assetsBytes, nil
}
