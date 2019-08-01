namespace Fw

porttype Com {
    arg data:Fw.ComBuffer { pass_by = reference }
    arg context:fprime.U32
}