namespace Svc

componentTime {
    port timeGetPort {
        direction = in
        kind = sync
        max_number = 10
        min_number = 1
        name = timeGetPort
        type = Fw.Time
    }
}