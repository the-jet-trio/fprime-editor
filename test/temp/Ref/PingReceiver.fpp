namespace Ref

componentPingReceiver {
    port PingIn {
        direction = in
        kind = async
        name = PingIn
        number = 1
        type = Svc.Ping
    }
    port PingOut {
        direction = out
        name = PingOut
        number = 1
        type = Svc.Ping
    }
}