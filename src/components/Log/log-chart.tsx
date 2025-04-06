

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Button } from "../../ui/button"
import { Save, Trash2, Plus, Clock } from "lucide-react"
import { message, Spin } from "antd";
import { createLog, getLogsByDate, updateLog } from "../../service/log"
import { LoadingOutlined } from '@ant-design/icons';

export type LogEntry = {
  hour: string
  hourIndex: number
  status: number | null
  duration: number
  location: string
  startTime: string
  endTime: string
}

type LogChartProps = {
  date?: Date,
  logData: LogEntry[],
  setLogData:(val:LogEntry[])=>void
}

export function LogChart({logData,setLogData,date = new Date() }: LogChartProps) {
  // const [logData, setLogData] = useState<LogEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartHour, setDragStartHour] = useState<number | null>(null)
  const [dragEndHour, setDragEndHour] = useState<number | null>(null)
  const [newEntry, setNewEntry] = useState<Partial<LogEntry>>({
    status: 1,
    location: "",
    startTime: "00:00",
    endTime: "01:00",
  })
  const [totalStats, setTotalStats] = useState({
    driving: 0,
    onDuty: 0,
    sleeperBerth: 0,
    offDuty: 0,
  })
  const chartRef = useRef<HTMLDivElement>(null)
  const [nextLoading, setNextLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // Calculate totals whenever logData changes
  useEffect(() => {
    const newStats = {
      driving: 0,
      onDuty: 0,
      sleeperBerth: 0,
      offDuty: 0,
    }

    logData.forEach((entry) => {
      if (entry.status === null) return

      switch (entry.status) {
        case 1:
          newStats.driving += entry.duration
          break
        case 2:
          newStats.onDuty += entry.duration
          break
        case 3:
          newStats.sleeperBerth += entry.duration
          break
        case 4:
          newStats.offDuty += entry.duration
          break
      }
    })

    // Only update if the stats have actually changed
    if (JSON.stringify(newStats) !== JSON.stringify(totalStats)) {
      setTotalStats(newStats)
    }
  }, [logData,totalStats])

  // Initialize empty log data
  useEffect(() => {
    // Skip if we already have data (prevents unnecessary re-renders)
    if (logData.length > 0) return

    // Create empty log data for all 24 hours
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hourStr = i < 12 ? `${i === 0 ? 12 : i} AM` : `${i === 12 ? 12 : i - 12} PM`

      return {
        hour: hourStr,
        hourIndex: i,
        status: null, // Empty status
        duration: 1,
        location: "",
        startTime: `${i.toString().padStart(2, "0")}:00`,
        endTime: `${(i + 1).toString().padStart(2, "0")}:00`,
      }
    })

    setLogData(hours)
  }, [logData.length, setLogData])

  const getStatusColor = (status: number | null) => {
    if (status === null) return "transparent"

    switch (status) {
      case 1:
        return "#22c55e" // green-500
      case 2:
        return "#3b82f6" // blue-500
      case 3:
        return "#eab308" // yellow-500
      case 4:
        return "#d1d5db" // gray-300
      default:
        return "#d1d5db"
    }
  }

  const getStatusName = (status: number | null) => {
    if (status === null) return "Empty"

    switch (status) {
      case 1:
        return "Driving 🟢"
      case 2:
        return "On Duty 🔵"
      case 3:
        return "Sleeper Berth 🟡"
      case 4:
        return "Off Duty ⚪"
      default:
        return "Unknown"
    }
  }

  const handleCellClick = (entry: LogEntry) => {
    if (isDragging) return

    setSelectedEntry(entry)
    setIsDialogOpen(true)
  }

  const handleSaveChange = () => {
    if (selectedEntry) {
      setLogData(logData.map((item) => (item.hourIndex === selectedEntry.hourIndex ? selectedEntry : item)))
      setIsDialogOpen(false)

      message.success("Log entry updated")
    }
  }

  const handleStatusChange = (value: string) => {
    if (selectedEntry) {
      setSelectedEntry({
        ...selectedEntry,
        status: Number.parseInt(value),
      })
    }
  }

  const handleLocationChange = (value: string) => {
    if (selectedEntry) {
      setSelectedEntry({
        ...selectedEntry,
        location: value,
      })
    }
  }

  // Handle drag start
  const handleDragStart = (hourIndex: number) => {
    setIsDragging(true)
    setDragStartHour(hourIndex)
    setDragEndHour(hourIndex)
  }

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false)

    if (dragStartHour !== null && dragEndHour !== null) {
      // Ensure start is before end
      const startHour = Math.min(dragStartHour, dragEndHour)
      const endHour = Math.max(dragStartHour, dragEndHour)

      // // Open dialog to set status for the range
      // setSelectedEntry({
      //   hour: `${startHour}:00 - ${endHour}:00`,
      //   hourIndex: startHour,
      //   status: 1, // Default to Driving
      //   duration: endHour - startHour + 1,
      //   location: "",
      //   startTime: `${startHour.toString().padStart(2, "0")}:00`,
      //   endTime: `${(endHour + 1).toString().padStart(2, "0")}:00`,
      // })
      // setIsDialogOpen(true)
      if(startHour!=endHour){
        setNewEntry({
            status: 1,
            location: "",
            startTime: startHour<10 ?`0${startHour}:00`:`${startHour}:00`,
            endTime: endHour<10 ?`0${endHour}:00`:`${endHour}:00`,
        })
        setIsAddDialogOpen(true)
      }
    }

    setDragStartHour(null)
    setDragEndHour(null)
  }

  // Handle drag move
  const handleDragMove = (hourIndex: number) => {
    if (isDragging && dragStartHour !== null) {
      setDragEndHour(hourIndex)
    }
  }

  // Add new log entry
  const handleAddEntry = () => {
    // Parse start and end times
    const startTimeParts = newEntry.startTime?.split(":").map(Number) || [0, 0]
    const endTimeParts = newEntry.endTime?.split(":").map(Number) || [0, 0]

    const startHour = startTimeParts[0]
    const endHour = endTimeParts[0]

    // Validate times
    if (startHour >= endHour) {

      message.warning("Invalid time range")
      return
    }

    // Update all hours in the range
    const updatedLogData = [...logData]
    for (let i = startHour; i < endHour; i++) {
      updatedLogData[i] = {
        ...updatedLogData[i],
        status: newEntry.status || 1,
        location: newEntry.location || "",
      }
    }

    setLogData(updatedLogData)
    setIsAddDialogOpen(false)

    // Reset new entry form
    setNewEntry({
      status: 1,
      location: "",
      startTime: "00:00",
      endTime: "01:00",
    })

    message.success("Log entry added, make sure to save")
  }

  // Save logs to localStorage
  const handleSaveLogs = async () => {
    setSaveLoading(true);
    const log = await getLogsByDate(date.toISOString().split("T")[0])
    let res:boolean;
    if(log){
      res = await updateLog(log.id??'',logData)
    }else{
      res = await createLog({
        date: date.toISOString().split("T")[0],
        logEntry: logData
      })
    }

    if(res){
      message.success("Logs saved")
    }else{
      message.error("Error saving logs")
    }
    setSaveLoading(false);
  }

  // Clear all logs
  const handleClearLogs = () => {
    // Reset to empty logs
    const emptyLogs = Array.from({ length: 24 }, (_, i) => {
      const hourStr = i < 12 ? `${i === 0 ? 12 : i} AM` : `${i === 12 ? 12 : i - 12} PM`

      return {
        hour: hourStr,
        hourIndex: i,
        status: null, // Empty status
        duration: 1,
        location: "",
        startTime: `${i.toString().padStart(2, "0")}:00`,
        endTime: `${(i + 1).toString().padStart(2, "0")}:00`,
      }
    })

    setLogData(emptyLogs)

    message.success("Logs cleared, make sure to save")
  }

  const loadLogData = useCallback(async (date:Date)=>{
    setNextLoading(true);
    const logs = await getLogsByDate(date.toISOString().split("T")[0]);
    if(logs && logs) setLogData(logs?.logEntry??[])
    else{
      const hours = Array.from({ length: 24 }, (_, i) => {
        const hourStr = i < 12 ? `${i === 0 ? 12 : i} AM` : `${i === 12 ? 12 : i - 12} PM`

        return {
          hour: hourStr,
          hourIndex: i,
          status: null, // Empty status
          duration: 1,
          location: "",
          startTime: `${i.toString().padStart(2, "0")}:00`,
          endTime: `${(i + 1).toString().padStart(2, "0")}:00`,
        }
      })

      setLogData(hours)
    }
    setNextLoading(false);
  },[setLogData])

  // Load saved logs on mount
  useEffect(() => {
    loadLogData(date)
  }, [date, loadLogData, setLogData])

  


  return (
    <>
      <div
        ref={chartRef}
        className="relative"
        onMouseUp={() => isDragging && handleDragEnd()}
        onMouseLeave={() => isDragging && handleDragEnd()}
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="border rounded-lg p-4 min-w-[700px]"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="text-center font-bold text-lg">
                Driver&apos;s Duty Log {nextLoading?<span className="ml-3"><Spin indicator={<LoadingOutlined spin />}  /></span>:<></>}
                <div className="text-sm font-normal text-gray-500">{date ? date.toLocaleDateString() : "Today"}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddDialogOpen(true)}
                  className="flex items-center gap-1 text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4" /> Add Entry
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearLogs}
                  className="flex items-center gap-1 text-red-500 hover:text-red-700 border-red-500"
                >
                  <Trash2 className="h-4 w-4" /> Clear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  loading={saveLoading}
                  onClick={handleSaveLogs}
                  className="flex items-center gap-1 text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Save className="h-4 w-4" /> Save
                </Button>
              </div>
            </div>

            {/* Hours header */}
            <div className="flex">
              <div className="w-24 flex-shrink-0"></div>
              <div className="flex-1 flex border-b">
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="flex-1 text-center text-xs">
                    {i}
                  </div>
                ))}
              </div>
            </div>

            {/* Status rows */}
            <div className="flex flex-col">
              {[4, 1, 2, 3].map((statusCode) => (
                <div key={statusCode} className="flex h-10 items-center">
                  <div className="w-24 flex-shrink-0 text-sm pr-2">
                    {getStatusName(statusCode)
                      .replace(" 🟢", "")
                      .replace(" 🔵", "")
                      .replace(" 🟡", "")
                      .replace(" ⚪", "")}
                  </div>
                  <div className="flex-1 flex border-b">
                    {Array.from({ length: 24 }, (_, hourIndex) => {
                      const entry = logData.find((e) => e.hourIndex === hourIndex)
                      const isActive = entry && entry.status === statusCode

                      return (
                        <div
                          key={hourIndex}
                          className="flex-1 flex items-center justify-center cursor-pointer"
                          onClick={() => entry && handleCellClick(entry)}
                          onMouseDown={() => handleDragStart(hourIndex)}
                          onMouseOver={() => handleDragMove(hourIndex)}
                        >
                          <div
                            className={`w-full h-6 ${isActive ? "" : "border border-dashed border-gray-300"}`}
                            style={{
                              backgroundColor: isActive ? getStatusColor(statusCode) : "transparent",
                              borderRadius: isActive ? "4px" : "0",
                            }}
                          ></div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Drag selection overlay */}
            {isDragging && dragStartHour !== null && dragEndHour !== null && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="h-full w-full flex items-center justify-center">
                  <div className="bg-blue-500/20 border border-blue-500 rounded-md px-4 py-2">
                    Selecting: {Math.min(dragStartHour, dragEndHour)}:00 - {Math.max(dragStartHour, dragEndHour)}:00
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-green-500"></span>
            <span className="text-sm">Driving</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-blue-500"></span>
            <span className="text-sm">On Duty</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
            <span className="text-sm">Sleeper Berth</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-gray-300"></span>
            <span className="text-sm">Off Duty</span>
          </div>
        </div>

        {/* Daily summary */}
        <div className="mt-4 p-4 border rounded-lg">
          <h3 className="text-md font-semibold flex items-center gap-1 mb-2 text-blue-600">
            <Clock className="h-4 w-4" /> Daily Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="p-2 bg-green-100 rounded-md">
              <div className="text-xs text-green-800">Driving</div>
              <div className="text-lg font-bold text-green-700">{totalStats.driving}h</div>
            </div>
            <div className="p-2 bg-blue-100 rounded-md">
              <div className="text-xs text-blue-800">On Duty</div>
              <div className="text-lg font-bold text-blue-700">{totalStats.onDuty}h</div>
            </div>
            <div className="p-2 bg-yellow-100 rounded-md">
              <div className="text-xs text-yellow-800">Sleeper Berth</div>
              <div className="text-lg font-bold text-yellow-700">{totalStats.sleeperBerth}h</div>
            </div>
            <div className="p-2 bg-gray-100 rounded-md">
              <div className="text-xs text-gray-800">Off Duty</div>
              <div className="text-lg font-bold text-gray-700">{totalStats.offDuty}h</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-2 text-sm text-muted-foreground">
          <p>Click on a time slot to edit or drag to select multiple hours</p>
        </div>
      </div>

      {/* Edit Entry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Log Entry</DialogTitle>
            <DialogDescription>
              {selectedEntry?.duration === 1
                ? `Update duty status for ${selectedEntry?.hour}`
                : `Update duty status from ${selectedEntry?.startTime} to ${selectedEntry?.endTime}`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Duty Status</Label>
              <Select value={selectedEntry?.status?.toString() || ""} onValueChange={handleStatusChange}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Driving 🟢</SelectItem>
                  <SelectItem value="2">On Duty 🔵</SelectItem>
                  <SelectItem value="3">Sleeper Berth 🟡</SelectItem>
                  <SelectItem value="4">Off Duty ⚪</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={selectedEntry?.location || ""}
                onChange={(e) => handleLocationChange(e.target.value)}
                placeholder="Enter location"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChange} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Entry Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Log Entry</DialogTitle>
            <DialogDescription>Create a new duty status entry for a specific time range</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-status">Duty Status</Label>
              <Select
                value={newEntry.status?.toString() || "1"}
                onValueChange={(value) => setNewEntry({ ...newEntry, status: Number.parseInt(value) })}
              >
                <SelectTrigger id="new-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Driving 🟢</SelectItem>
                  <SelectItem value="2">On Duty 🔵</SelectItem>
                  <SelectItem value="3">Sleeper Berth 🟡</SelectItem>
                  <SelectItem value="4">Off Duty ⚪</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Select
                  value={newEntry.startTime}
                  onValueChange={(value) => setNewEntry({ ...newEntry, startTime: value })}
                >
                  <SelectTrigger id="start-time">
                    <SelectValue placeholder="Start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                        {`${i.toString().padStart(2, "0")}:00`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-time">End Time</Label>
                <Select
                  value={newEntry.endTime}
                  onValueChange={(value) => setNewEntry({ ...newEntry, endTime: value })}
                >
                  <SelectTrigger id="end-time">
                    <SelectValue placeholder="End time" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={`${(i + 1).toString().padStart(2, "0")}:00`}>
                        {`${(i + 1).toString().padStart(2, "0")}:00`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-location">Location</Label>
              <Input
                id="new-location"
                value={newEntry.location || ""}
                onChange={(e) => setNewEntry({ ...newEntry, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEntry} className="bg-blue-600 hover:bg-blue-700">
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

