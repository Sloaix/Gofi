package repository

import (
	"gofi/db"
)

// UserRepository 用户数据访问接口
type UserRepository interface {
	// Create 创建用户
	Create(user *db.User) error

	// GetByID 根据ID获取用户
	GetByID(id int64) (*db.User, error)

	// GetByUsername 根据用户名获取用户
	GetByUsername(username string) (*db.User, error)

	// UpdatePassword 更新用户密码
	UpdatePassword(userID int64, password string) error

	// ExistsByRole 检查指定角色的用户是否存在
	ExistsByRole(roleType db.RoleType) (bool, error)

	// SyncAdmin 同步管理员用户
	SyncAdmin() error
}

// userRepository 用户数据访问实现
type userRepository struct{}

// NewUserRepository 创建用户Repository实例
func NewUserRepository() UserRepository {
	return &userRepository{}
}

func (r *userRepository) Create(user *db.User) error {
	_, err := db.Engine().InsertOne(user)
	return err
}

func (r *userRepository) GetByID(id int64) (*db.User, error) {
	user := new(db.User)
	has, err := db.Engine().ID(id).Get(user)
	if err != nil {
		return nil, err
	}
	if !has {
		return nil, db.ErrUserNotExist
	}
	return user, nil
}

func (r *userRepository) GetByUsername(username string) (*db.User, error) {
	user := new(db.User)
	has, err := db.Engine().Where("username=?", username).Get(user)
	if err != nil {
		return nil, err
	}
	if !has {
		return nil, db.ErrUserNotExist
	}
	return user, nil
}

func (r *userRepository) UpdatePassword(userID int64, password string) error {
	user := new(db.User)
	user.Password = password
	_, err := db.Engine().ID(userID).Cols("password").Update(user)
	return err
}

func (r *userRepository) ExistsByRole(roleType db.RoleType) (bool, error) {
	user := new(db.User)
	has, err := db.Engine().Where("role_type=?", roleType).Get(user)
	if err != nil {
		return false, err
	}
	return has, nil
}

func (r *userRepository) SyncAdmin() error {
	exists, err := r.ExistsByRole(db.RoleTypeAdmin)
	if err != nil {
		return err
	}
	if exists {
		return nil
	}

	adminUser := &db.User{
		RoleType: db.RoleTypeAdmin,
		Username: db.AdminUsername,
		Password: db.AdminPassword,
	}

	return r.Create(adminUser)
}
