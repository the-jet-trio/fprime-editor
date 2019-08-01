namespace Fw

porttype CmdResponse {
    arg opCode:Fw.FwOpcodeType
    arg cmdSeq:fprime.U32
    arg response:CommandResponse
}