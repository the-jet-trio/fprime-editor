namespace Svc

component TlmChan {
    kind = active
    port TlmRecv:Fw.Tlm {
        direction = in
        kind = guarded
        max_number = 10
        min_number = 1
    }
    port TlmGet:Fw.Tlm {
        direction = in
        kind = guarded
        max_number = 1
        min_number = 0
    }
    port Run:Svc.Sched {
        direction = in
        kind = async
        max_number = 1
        min_number = 0
    }
}