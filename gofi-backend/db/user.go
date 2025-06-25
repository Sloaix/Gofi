package db

import (
	"errors"
	tool "gofi/tool"
	"time"
)

const (
	AdminUsername = "admin"
	AdminPassword = "password"
)

type User struct {
	Id       int64     `json:"id"`
	RoleType RoleType  `json:"roleType"`
	Username string    `json:"username" validate:"required"`
	Password string    `json:"-" validate:"required"`
	Created  time.Time `json:"-" xorm:"created"` // 创建时间
	Updated  time.Time `json:"-" xorm:"updated"` // 更新时间
}

type LoginParam struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type PasswordChangeParam struct {
	Password string `json:"password" validate:"required"`
	Confirm  string `json:"confirm" validate:"required"`
}

// SyncAdmin 在初始化的时候,录入管理员数据
func SyncAdmin() {
	if adminExist() {
		return
	}

	adminUser := newAdmin()

	_, _ = engine.InsertOne(&adminUser)
}

// 管理员是否存在
func adminExist() bool {
	user := new(User)
	has, err := engine.Where("role_type=?", RoleTypeAdmin).Get(user)
	if err != nil {
		tool.GetLogger().Error(err)
		return true
	}

	return has
}

// 实例化新的管理员
func newAdmin() User {
	return User{
		RoleType: RoleTypeAdmin,
		Username: AdminUsername,
		Password: tool.MD5(AdminPassword),
		Created:  time.Time{},
		Updated:  time.Time{},
	}
}

// ChangeUserPassword 修改用户密码
func ChangeUserPassword(userId int64, password string) error {
	user := new(User)
	user.Password = password
	_, err := engine.ID(userId).Cols("password").Update(user)
	return err
}

// QueryUserByUsername 通过用户名查询用户
func QueryUserByUsername(username string) (*User, error) {
	user := new(User)
	has, err := engine.Where("username=?", username).Get(user)
	if err != nil || !has {
		return nil, errors.New("user is not exist")
	}

	return user, nil
}

// QueryUserById 通过用户id查询用户
func QueryUserById(userId int64) (*User, error) {
	user := new(User)
	has, err := engine.ID(userId).Get(user)
	if err != nil || !has {
		return nil, errors.New("user is not exist")
	}

	return user, nil
}
