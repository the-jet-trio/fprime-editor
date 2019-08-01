namespace Fw

porttype Cmd {
    arg opCode:Fw.FwOpcodeType
    arg cmdSeq:fprime.U32
    arg args:Fw.CmdArgBuffer { pass_by = reference }
}