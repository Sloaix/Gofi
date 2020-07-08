package db

type RoleType int

const (
	RoleTypeAdmin RoleType = iota // 管理员
	RoleTypeUser                  // 用户
	RoleTypeGuest                 // 访客
)
