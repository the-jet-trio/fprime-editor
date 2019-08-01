namespace fprime

datatype U32
datatype NATIVE_UINT_TYPE
enum TextLogSeverity {
    TEXT_LOG_FATAL = 1
    TEXT_LOG_WARNING_HI = 2
    TEXT_LOG_WARNING_LO = 3
    TEXT_LOG_COMMAND = 4
    TEXT_LOG_ACTIVITY_HI = 5
    TEXT_LOG_ACTIVITY_LO = 6
    TEXT_LOG_DIAGNOSTIC = 7
}

enum CommandResponse {
    COMMAND_OK = 0
    COMMAND_INVALID_OPCODE = 1
    COMMAND_VALIDATION_ERROR = 2
    COMMAND_FORMAT_ERROR = 3
    COMMAND_EXECUTION_ERROR = 4
    COMMAND_BUSY = 5
}

