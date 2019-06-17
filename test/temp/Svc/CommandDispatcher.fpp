namespace Svc

componentCommandDispatcher {
    port compCmdSend {
        direction = out
        max_number = 10
        min_number = 1
        name = compCmdSend
        type = Fw.Cmd
    }
    port compCmdReg {
        direction = in
        kind = guarded
        max_number = 10
        min_number = 1
        name = compCmdReg
        type = Fw.CmdReg
    }
    port compCmdStat {
        direction = in
        kind = async
        max_number = 10
        min_number = 1
        name = compCmdStat
        type = Fw.CmdResponse
    }
    port seqCmdStatus {
        direction = out
        max_number = 10
        min_number = 1
        name = seqCmdStatus
        type = Fw.CmdResponse
    }
    port seqCmdBuff {
        direction = in
        kind = async
        max_number = 10
        min_number = 1
        name = seqCmdBuff
        type = Fw.Com
    }
    port pingOut {
        direction = out
        name = pingOut
        number = 1
        type = Svc.Ping
    }
}