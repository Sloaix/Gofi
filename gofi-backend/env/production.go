// +build production

package env

import embed "embed"

const current = Production

//go:embed dist/*
var EmbedStaticAssets embed.FS
