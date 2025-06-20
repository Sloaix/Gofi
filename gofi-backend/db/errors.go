package db

import "errors"

// 数据库操作相关错误
var (
	ErrUserNotExist = errors.New("user is not exist")
)
