namespace Fw

porttype Log {
    arg id:Fw.FwEventIdType
    arg timeTag:Fw.Time { pass_by = reference }
    arg severity:TextLogSeverity
    arg text:Fw.LogBuffer { pass_by = reference }
}