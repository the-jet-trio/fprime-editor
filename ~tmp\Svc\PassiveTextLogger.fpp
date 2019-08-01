namespace Svc

component PassiveTextLogger {
    kind = passive
    port TextLogger:Fw.LogText {
        direction = in
        kind = sync
        max_number = 10
        min_number = 1
    }
}