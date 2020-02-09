package test

import (
	"gofi/boot"
	"gofi/env"
	"os"
	"testing"
)

var savedArgs = os.Args

func TestHasPort(t *testing.T) {
	os.Args = savedArgs
	os.Args = append(os.Args, "-port")
	os.Args = append(os.Args, "80")
	boot.ParseArguments()
	if boot.GetArguments().Port != "80" {
		t.Errorf("ecpect is 80, actul is %s", boot.GetArguments().Port)
	}
}

func TestPortShort(t *testing.T) {
	os.Args = savedArgs
	os.Args = append(os.Args, "-p")
	os.Args = append(os.Args, "12345")
	boot.ParseArguments()
	if boot.GetArguments().Port != "12345" {
		t.Errorf("ecpect is 80, actul is %s", boot.GetArguments().Port)
	}
}

func TestNoPort(t *testing.T) {
	os.Args = savedArgs
	boot.GetArguments().Port = boot.DefaultPort
	boot.ParseArguments()
	if boot.GetArguments().Port != boot.DefaultPort {
		t.Errorf("ecpect is %s, actul is %s", boot.DefaultPort, boot.GetArguments().Port)
	}
}

func TestHasIP(t *testing.T) {
	os.Args = savedArgs
	os.Args = append(os.Args, "-ip")
	os.Args = append(os.Args, "192.168.1.1")
	boot.ParseArguments()
	if boot.GetArguments().ServerIP != "192.168.1.1" {
		t.Errorf("ecpect is 192.168.1.1, actul is %s", boot.GetArguments().Port)
	}
}

func TestCheckIP(t *testing.T) {
	os.Args = savedArgs
	os.Args = append(os.Args, "-ip")
	os.Args = append(os.Args, "haha")
	boot.ParseArguments()
	if boot.GetArguments().ServerIP != boot.GetLanIP() {
		t.Errorf("ecpect is %s. actul is %s", boot.GetLanIP(), boot.GetArguments().ServerIP)
	}
}

func TestIsTestEnvironment(t *testing.T) {
	boot.ParseArguments()
	if !env.IsTest() {
		t.Error("failed, current is test environment.")
	}
}
