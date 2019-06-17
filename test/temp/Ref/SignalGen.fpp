namespace Ref

componentSignalGen {
    port timeCaller {
        direction = out
        name = timeCaller
        number = 1
        role = TimeGet
        type = Fw.Time
    }
    port cmdRegOut {
        direction = out
        name = cmdRegOut
        number = 1
        role = CmdRegistration
        type = Fw.CmdReg
    }
    port cmdIn {
        direction = in
        name = cmdIn
        number = 1
        type = Fw.Cmd
    }
    port schedIn {
        direction = in
        kind = sync
        name = schedIn
        number = 1
        type = Svc.Sched
    }
    port logTextOut {
        direction = out
        name = logTextOut
        number = 1
        role = LogTextEvent
        type = Fw.LogText
    }
    port logOut {
        direction = out
        name = logOut
        number = 1
        role = LogEvent
        type = Fw.Log
    }
    port cmdResponseOut {
        direction = out
        name = cmdResponseOut
        number = 1
        role = CmdResponse
        type = Fw.CmdResponse
    }
    port tlmOut {
        direction = out
        name = tlmOut
        number = 1
        role = Telemetry
        type = Fw.Tlm
    }
}