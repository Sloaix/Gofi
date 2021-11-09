package db

import "gofi/env"

//version ,will be replaced at compile time by [-ldflags="-X 'gofi/db.version=vX.X.X'"]
var version = "UNKOWN VERSION"

func init() {
	if env.IsDevelop() {
		version = "DEV"
	}
}
