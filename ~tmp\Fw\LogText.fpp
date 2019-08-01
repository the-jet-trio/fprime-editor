namespace Fw

porttype LogText {
    arg id:Fw.FwEventIdType
    arg timeTag:Fw.Time { pass_by = reference }
    arg severity:TextLogSeverity
    arg text:Fw.TextLogString { pass_by = reference }
}