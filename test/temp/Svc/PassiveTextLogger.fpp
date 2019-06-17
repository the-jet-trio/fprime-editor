namespace Svc

componentPassiveTextLogger {
    port TextLogger {
        direction = in
        kind = sync
        max_number = 10
        min_number = 1
        name = TextLogger
        type = Fw.LogText
    }
}