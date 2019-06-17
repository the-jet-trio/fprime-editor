namespace Svc

componentActiveLogger {
    port LogRecv {
        direction = in
        kind = sync
        max_number = 10
        min_number = 1
        name = LogRecv
        type = Fw.Log
    }
    port PktSend {
        direction = out
        name = PktSend
        type = Fw.Com
    }
    port FatalAnnounce {
        direction = out
        name = FatalAnnounce
        type = Svc.FatalEvent
    }
    port pingIn {
        direction = in
        kind = async
        name = pingIn
        type = Svc.Ping
    }
    port pingOut {
        direction = out
        name = pingOut
        type = Svc.Ping
    }
    port LogText {
        direction = out
        name = LogText
        role = LogTextEvent
        type = Fw.LogText
    }
    port Log {
        direction = out
        name = Log
        role = LogEvent
        type = Fw.Log
    }
}