package repository

import (
	"gofi/db"
)

// ConfigurationRepository 配置数据访问接口
type ConfigurationRepository interface {
	// Get 获取配置
	Get() (*db.Configuration, error)

	// Update 更新配置
	Update(config *db.Configuration) error

	// Create 创建配置
	Create(config *db.Configuration) error
}

// configurationRepository 配置数据访问实现
type configurationRepository struct{}

// NewConfigurationRepository 创建配置Repository实例
func NewConfigurationRepository() ConfigurationRepository {
	return &configurationRepository{}
}

func (r *configurationRepository) Get() (*db.Configuration, error) {
	var config = new(db.Configuration)
	has, err := db.Engine().Get(config)
	if err != nil {
		return nil, err
	}
	if !has {
		// 创建默认配置
		config = &db.Configuration{
			Initialized: false,
		}
		err = r.Create(config)
		if err != nil {
			return nil, err
		}
	}
	return config, nil
}

func (r *configurationRepository) Update(config *db.Configuration) error {
	_, err := db.Engine().UseBool().AllCols().Update(config)
	return err
}

func (r *configurationRepository) Create(config *db.Configuration) error {
	_, err := db.Engine().InsertOne(config)
	return err
}
