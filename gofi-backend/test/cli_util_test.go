package test

import (
	"gofi/util"
	"os"
	"testing"
)

var args = os.Args

func TestHasPort(t *testing.T) {
	os.Args = args
	os.Args = append(os.Args, "-port")
	os.Args = append(os.Args, "80")
	util.ParseArgs()
	if util.GetPort() != "80" {
		t.Errorf("ecpect is 80, actul is %s", util.GetPort())
	}
}

func TestPortShort(t *testing.T) {
	os.Args = args
	os.Args = append(os.Args, "-p")
	os.Args = append(os.Args, "12345")
	util.ParseArgs()
	if util.GetPort() != "12345" {
		t.Errorf("ecpect is 80, actul is %s", util.GetPort())
	}
}

func TestNoPort(t *testing.T) {
	os.Args = args
	util.ResetPort()
	util.ParseArgs()
	if util.GetPort() != util.DefaultPort {
		t.Errorf("ecpect is %s, actul is %s", util.DefaultPort, util.GetPort())
	}
}
