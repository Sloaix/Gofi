package util

import (
	"gopkg.in/go-playground/validator.v9"
)

var validate *validator.Validate

func init() {
	validate = validator.New()
}

func GetValidator() *validator.Validate {
	return validate
}

func filePathValidate(fl validator.FieldLevel) bool {
	return false
}
