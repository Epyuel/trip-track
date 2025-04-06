export type Logs = {
    id?:string,
    date: string,
    logEntry: LogEntry[]
}
export type LogEntry = {
    hour: string
    hourIndex: number
    status: number | null
    duration: number
    location: string
    startTime: string
    endTime: string
}