namespace Ref

component PingReceiver {
    kind = active
    port PingIn:Svc.Ping {
        direction = in
        kind = async
        max_number = 1
        min_number = 0
        number = 1
    }
    port PingOut:Svc.Ping {
        direction = out
        max_number = 1
        min_number = 0
        number = 1
    }
}