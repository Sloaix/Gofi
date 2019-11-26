package test

import (
	"gofi/context"
	"os"
	"testing"
)

var args = os.Args

func TestHasPort(t *testing.T) {
	os.Args = args
	os.Args = append(os.Args, "-port")
	os.Args = append(os.Args, "80")
	context.InitContext()
	if context.Get().Port != "80" {
		t.Errorf("ecpect is 80, actul is %s", context.Get().Port)
	}
}

func TestPortShort(t *testing.T) {
	os.Args = args
	os.Args = append(os.Args, "-p")
	os.Args = append(os.Args, "12345")
	context.InitContext()
	if context.Get().Port != "12345" {
		t.Errorf("ecpect is 80, actul is %s", context.Get().Port)
	}
}

func TestNoPort(t *testing.T) {
	os.Args = args
	context.InitContext()
	if context.Get().Port != context.DefaultPort {
		t.Errorf("ecpect is %s, actul is %s", context.DefaultPort, context.Get().Port)
	}
}

func TestIsTestEnvironment(t *testing.T) {
	context.InitContext()
	if !context.Get().IsTestEnvironment() {
		t.Error("failed, current is test environment.")
	}
}
