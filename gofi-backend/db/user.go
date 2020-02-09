package db

import "time"

type User struct {
	Id       int64     `json:"-"`
	Username string    `json:"username"`
	Password string    `json:"password"`
	Created  time.Time `json:"-" xorm:"created"` // 创建时间
	Updated  time.Time `json:"-" xorm:"updated"` // 更新时间
}
