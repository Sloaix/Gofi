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

func TestCheckIpFunc(t *testing.T) {
	var invalidIpArray = []string{
		"123",
		"haha",
		"123.321",
		".123.321",
		".123.321.",
		".123",
		"3213.",
	}

	for _, v := range invalidIpArray {
		if context.CheckIp(v) {
			t.Errorf(" %s , ecpect is invalid. actul is valid", v)
		}
	}

	invalidIpArray = []string{
		"192.168.1.1",
		"10.10.10.1",
		"0.0.0.0",
	}

	for _, v := range invalidIpArray {
		if !context.CheckIp(v) {
			t.Errorf(" %s , ecpect is valid. actul is invalid", v)
		}
	}
}

func TestHasIp(t *testing.T) {
	os.Args = savedArgs
	os.Args = append(os.Args, "-ip")
	os.Args = append(os.Args, "192.168.1.1")
	context.InitContext()
	if context.Get().ServerIp != "192.168.1.1" {
		t.Errorf("ecpect is 192.168.1.1, actul is %s", context.Get().Port)
	}
}

func TestCheckIp(t *testing.T) {
	os.Args = savedArgs
	os.Args = append(os.Args, "-ip")
	os.Args = append(os.Args, "haha")
	context.InitContext()
	if context.Get().ServerIp != context.Get().GetLanIp() {
		t.Errorf("ecpect is %s. actul is %s", context.Get().GetLanIp(), context.Get().ServerIp)
	}
}

func TestIsTestEnvironment(t *testing.T) {
	context.InitContext()
	if !context.Get().IsTestEnvironment() {
		t.Error("failed, current is test environment.")
	}
}
