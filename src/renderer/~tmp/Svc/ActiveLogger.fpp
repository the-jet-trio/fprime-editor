namespace Svc

component ActiveLogger {
    kind = active
    port LogRecv:Fw.Log {
        direction = in
        kind = sync
        max_number = 10
        min_number = 1
    }
    port PktSend:Fw.Com {
        direction = out
        max_number = 1
        min_number = 0
    }
    port FatalAnnounce:Svc.FatalEvent {
        direction = out
        max_number = 1
        min_number = 0
    }
    port pingIn:Svc.Ping {
        direction = in
        kind = async
        max_number = 1
        min_number = 0
    }
    port pingOut:Svc.Ping {
        direction = out
        max_number = 1
        min_number = 0
    }
    port LogText:Fw.LogText {
        direction = out
        max_number = 1
        min_number = 0
        role = LogTextEvent
    }
    port Log:Fw.Log {
        direction = out
        max_number = 1
        min_number = 0
        role = LogEvent
    }
}