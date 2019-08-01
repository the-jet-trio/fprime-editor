namespace Fw

porttype Tlm {
    arg id:Fw.FwChanIdType
    arg timeTag:Fw.Time { pass_by = reference }
    arg val:Fw.TlmBuffer { pass_by = reference }
}