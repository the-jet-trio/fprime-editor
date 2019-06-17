namespace Svc

componentTlmChan {
    port TlmRecv {
        direction = in
        kind = guarded
        max_number = 10
        min_number = 1
        name = TlmRecv
        type = Fw.Tlm
    }
    port TlmGet {
        direction = in
        kind = guarded
        name = TlmGet
        type = Fw.Tlm
    }
    port Run {
        direction = in
        kind = async
        name = Run
        type = Svc.Sched
    }
}