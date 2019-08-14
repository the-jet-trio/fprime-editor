namespace Svc

component Time {
    kind = passive
    port timeGetPort:Fw.Time {
        direction = in
        kind = sync
        max_number = 10
        min_number = 1
    }
}