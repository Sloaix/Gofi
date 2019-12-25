package test

import (
	"gofi/context"
	"os"
	"testing"
)

var savedArgs = os.Args

func TestHasPort(t *testing.T) {
	os.Args = savedArgs
	os.Args = append(os.Args, "-port")
	os.Args = append(os.Args, "80")
	context.InitContext()
	if context.Get().Port != "80" {
		t.Errorf("ecpect is 80, actul is %s", context.Get().Port)
	}
}

func TestPortShort(t *testing.T) {
	os.Args = savedArgs
	os.Args = append(os.Args, "-p")
	os.Args = append(os.Args, "12345")
	context.InitContext()
	if context.Get().Port != "12345" {
		t.Errorf("ecpect is 80, actul is %s", context.Get().Port)
	}
}

func TestNoPort(t *testing.T) {
	os.Args = savedArgs
	context.Get().Port = context.DefaultPort
	context.InitContext()
	if context.Get().Port != context.DefaultPort {
		t.Errorf("ecpect is %s, actul is %s", context.DefaultPort, context.Get().Port)
	}
}

func TestHasIP(t *testing.T) {
	os.Args = savedArgs
	os.Args = append(os.Args, "-ip")
	os.Args = append(os.Args, "192.168.1.1")
	context.InitContext()
	if context.Get().ServerIP != "192.168.1.1" {
		t.Errorf("ecpect is 192.168.1.1, actul is %s", context.Get().Port)
	}
}

func TestCheckIP(t *testing.T) {
	os.Args = savedArgs
	os.Args = append(os.Args, "-ip")
	os.Args = append(os.Args, "haha")
	context.InitContext()
	if context.Get().ServerIP != context.Get().GetLanIP() {
		t.Errorf("ecpect is %s. actul is %s", context.Get().GetLanIP(), context.Get().ServerIP)
	}
}

func TestIsTestEnvironment(t *testing.T) {
	context.InitContext()
	if !context.Get().IsTestEnvironment() {
		t.Error("failed, current is test environment.")
	}
}
