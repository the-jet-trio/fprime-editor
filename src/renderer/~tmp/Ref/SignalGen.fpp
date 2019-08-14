namespace Ref

component SignalGen {
    kind = queued
    port timeCaller:Fw.Time {
        direction = out
        max_number = 1
        min_number = 0
        number = 1
        role = TimeGet
    }
    port cmdRegOut:Fw.CmdReg {
        direction = out
        max_number = 1
        min_number = 0
        number = 1
        role = CmdRegistration
    }
    port cmdIn:Fw.Cmd {
        direction = in
        max_number = 1
        min_number = 0
        number = 1
        role = Cmd
    }
    port schedIn:Svc.Sched {
        direction = in
        kind = sync
        max_number = 1
        min_number = 0
        number = 1
    }
    port logTextOut:Fw.LogText {
        direction = out
        max_number = 1
        min_number = 0
        number = 1
        role = LogTextEvent
    }
    port logOut:Fw.Log {
        direction = out
        max_number = 1
        min_number = 0
        number = 1
        role = LogEvent
    }
    port cmdResponseOut:Fw.CmdResponse {
        direction = out
        max_number = 1
        min_number = 0
        number = 1
        role = CmdResponse
    }
    port tlmOut:Fw.Tlm {
        direction = out
        max_number = 1
        min_number = 0
        number = 1
        role = "Telemetry"
    }
}