package controller

type Resource struct {
	Success bool        `json:"success"`
	Message interface{} `json:"message"`
	Code    int         `json:"code"` // 200 means success, other means fail
	Data    interface{} `json:"data"`
}

const StatusOk int = 200             // success
const StatusUnknown int = -1         // fail,reason is unknown
const StatusNotFound int = 404       // fail,reason is not found
const StatusTokenMiss int = 10000    // token miss
const StatusTokenInvalid int = 10001 // token is invalid

type ResourceBuilder struct {
	resource *Resource
}

// success default is true, code default is 200
func NewResource() ResourceBuilder {
	return ResourceBuilder{resource: &Resource{Success: true, Code: StatusOk, Message: nil, Data: nil}}
}

func (builder ResourceBuilder) Code(code int) ResourceBuilder {
	builder.resource.Code = code
	builder.resource.Success = code == StatusOk
	return builder
}

func (builder ResourceBuilder) Message(message interface{}) ResourceBuilder {
	builder.resource.Message = message
	return builder
}

func (builder ResourceBuilder) Success() ResourceBuilder {
	builder.resource.Success = true
	builder.resource.Code = StatusOk
	return builder
}

func (builder ResourceBuilder) Fail() ResourceBuilder {
	builder.resource.Success = false
	builder.resource.Code = StatusUnknown
	return builder
}

func (builder ResourceBuilder) Payload(data interface{}) ResourceBuilder {
	builder.resource.Data = data
	return builder
}

func (builder ResourceBuilder) Build() *Resource {
	return builder.resource
}
