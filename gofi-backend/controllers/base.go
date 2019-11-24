package controllers

type Resource struct {
	Success bool        `json:"success"`
	Message interface{} `json:"message"`
	Data    interface{} `json:"data"`
}

func ResponseSuccess(objects interface{}) (response *Resource) {
	response = ResponseWithMessage(true, objects, "")
	return
}

func ResponseSuccessWithMessage(objects interface{}, message string) (response *Resource) {
	response = &Resource{Success: true, Data: objects, Message: message}
	return
}

func ResponseFail() (response *Resource) {
	response = ResponseWithMessage(false, nil, "")
	return
}

func ResponseFailWithMessage(message string) (response *Resource) {
	response = &Resource{Success: false, Data: nil, Message: message}
	return
}

func Response(status bool, objects interface{}) (response *Resource) {
	response = ResponseWithMessage(status, objects, "")
	return
}

func ResponseWithMessage(status bool, objects interface{}, message string) (response *Resource) {
	response = &Resource{Success: status, Data: objects, Message: message}
	return
}
