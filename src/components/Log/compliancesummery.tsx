import { motion } from "framer-motion"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip"
import { useCallback, useEffect, useState } from "react"
import { Separator } from "../../ui/separator"
import { LogEntry, Logs } from "../../types/log"
import { getLogsByDateRange } from "../../service/log"

type ComplianceData = {
  drivingHours: {
    used:number,
    limit: number,
    percentage: number,
    remaining: number,
  },
  violations: string[],
  weeklyRecap: {
    monday: { hours: number, compliant: boolean },
    tuesday: { hours: number, compliant: boolean },
    wednesday: { hours: number, compliant: boolean },
    thursday: { hours: number, compliant: boolean },
    friday: { hours: number, compliant: boolean },
    saturday: { hours: number, compliant: boolean },
    sunday: { hours: number, compliant: boolean },
  },
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday","Sunday"];

export function ComplianceSummary({date,selectedDateLogs}:{date:Date,selectedDateLogs:LogEntry[]}) {
  const [weeklyLogs,setWeeklyLogs] = useState<Logs[]>([]);
  const [last8daysLogs,setLast8daysLogs] = useState<Logs[]>([]);
  const [complianceData,setComplianceData] = useState<ComplianceData>({
    drivingHours: {
      used: 0,
      limit: 70,
      percentage: Math.round((0 / 70) * 100),
      remaining: 70,
    },
    violations: [],
    weeklyRecap: {
      monday: { hours: 0, compliant: true },
      tuesday: { hours: 0, compliant: true },
      wednesday: { hours: 0, compliant: true },
      thursday: { hours: 0, compliant: true },
      friday: { hours: 0, compliant: true },
      saturday: { hours: 0, compliant: true },
      sunday: { hours: 0, compliant: true },
    },
  });

  const fetchData = useCallback(async ()=>{
    const start = new Date(date);
    start.setDate(start.getDate()-8) 
    const logs = await getLogsByDateRange(start.toISOString().split("T")[0],date.toISOString().split("T")[0]);
    
    if(logs) {
      setLast8daysLogs(logs);
      // Filter-out the 8th day(we only want 7 days for the weeklyLogs) 
      setWeeklyLogs(logs.filter((l)=> new Date(l.date).getTime()>start.getTime()));
    }
  },[date])

  useEffect(()=>{
    fetchData()
  },[fetchData])

  useEffect(()=>{
    const used = last8daysLogs.flatMap((log) => 
      log.logEntry.map(entry => ({
          day: new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' }),
          ...entry
      }))
    ).reduce((acc,sl)=>acc +  (sl.status && sl.status == 1? sl.duration:0),0);
 
    const today = date.toLocaleDateString('en-US',{weekday:'long'});
    const thisWeek = weeklyLogs.flatMap((log) => 
        log.logEntry.map(entry => ({
            day: new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' }),
            ...entry
        }))
    );

    const complianceData = {
      drivingHours: {
        used,
        limit: 70,
        percentage: Math.round((used / 70) * 100),
        remaining: 70 - used,
      },
      violations: [],
      weeklyRecap: {
        monday: { 
            compliant: true,
            hours: thisWeek.reduce((acc,val)=>{
              if(val.day=='Monday' && val.status == 1 && daysOfWeek.indexOf(today) >= daysOfWeek.indexOf('Monday')){
                return acc + val.duration
              }else{
                return acc
              }
            },0),
        },
        tuesday: { 
            compliant: true,
            hours: thisWeek.reduce((acc,val)=>{
              if(val.day=='Tuesday' && val.status == 1 && daysOfWeek.indexOf(today) >= daysOfWeek.indexOf('Tuesday')){
                return acc + val.duration
              }else{
                return acc
              }
            },0),
        },
        wednesday: { 
            compliant: true,
            hours: thisWeek.reduce((acc,val)=>{
              if(val.day=='Wednesday' && val.status == 1 && daysOfWeek.indexOf(today) >= daysOfWeek.indexOf('Wednesday')){
                return acc + val.duration
              }else{
                return acc
              }
            },0),
        },
        thursday: { 
            compliant: true,
            hours: thisWeek.reduce((acc,val)=>{
              if(val.day=='Thursday' && val.status == 1 && daysOfWeek.indexOf(today) >= daysOfWeek.indexOf('Thursday')){
                return acc + val.duration
              }else{
                return acc
              }
            },0),
        },
        friday: { 
            compliant: true,
            hours: thisWeek.reduce((acc,val)=>{
              if(val.day=='Friday' && val.status == 1 && daysOfWeek.indexOf(today) >= daysOfWeek.indexOf('Friday')){
                return acc + val.duration
              }else{
                return acc
              }
            },0)
        },
        saturday: { 
            compliant: true,
            hours: thisWeek.reduce((acc,val)=>{
              if(val.day=='Saturday' && val.status == 1 && daysOfWeek.indexOf(today) >= daysOfWeek.indexOf('Saturday')){
                return acc + val.duration
              }else{
                return acc
              }
            },0),
        },
        sunday: { 
            compliant: true,
            hours: thisWeek.reduce((acc,val)=>{
              if(val.day=='Sunday' && val.status == 1 && daysOfWeek.indexOf(today) >= daysOfWeek.indexOf('Sunday')){
                return acc + val.duration
              }else{
                return acc
              }
            },0),
        },
      },
    }

    setComplianceData(complianceData)

  },[date, last8daysLogs, selectedDateLogs, weeklyLogs])

  // Sample compliance data
  // const complianceData = {
    // drivingHours: {
    //   used: 8.5,
    //   limit: 70,
    //   percentage: Math.round((8.5 / 70) * 100),
    //   remaining: 2.5,
    // },
    // violations: [],
    // weeklyRecap: {
    //   monday: { hours: 10, compliant: true },
    //   tuesday: { hours: 11, compliant: true },
    //   wednesday: { hours: 9.5, compliant: true },
    //   thursday: { hours: 10.5, compliant: true },
    //   friday: { hours: 8.5, compliant: true },
    //   saturday: { hours: 0, compliant: true },
    //   sunday: { hours: 0, compliant: true },
    // },
  // }

  const progressVariants = {
    initial: { width: 0 },
    animate: (percentage: number) => ({
      width: `${percentage}%`,
      transition: { duration: 1, ease: "easeOut" },
    }),
  }

  return (
    <div className="space-y-6">
      {/* Hours of Service Summary */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Hours of Service Summary</h3>

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">Driving Hours ✅</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>70Hours/8days Driving Limit</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-medium">
                {complianceData.drivingHours.used} / {complianceData.drivingHours.limit} hours
              </span>
            </div>
            <div className="h-2 w-full bg-secondary overflow-hidden rounded-full">
              <motion.div
                className="h-full bg-green-500"
                initial="initial"
                animate="animate"
                custom={complianceData.drivingHours.percentage}
                variants={progressVariants}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{complianceData.drivingHours.remaining} hours remaining</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Weekly Recap */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Weekly Recap</h3>

        <div className="grid grid-cols-7 gap-1 text-center">
          {Object.entries(complianceData.weeklyRecap).map(([day, data], index) => (
            <motion.div
              key={day}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <div className="text-xs text-muted-foreground mb-1">{day.charAt(0).toUpperCase() + day.slice(1, 3)}</div>

              <div
                className={`flex h-16 w-8 flex-col justify-end rounded-t-sm overflow-hidden ${data.compliant ? "bg-muted" : "bg-destructive/20"}`}
              >
                <motion.div
                  className={`w-full ${data.compliant ? "bg-green-500" : "bg-destructive"}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.hours / 11) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              </div>

              <div className="text-xs font-medium mt-1">{data.hours > 0 ? data.hours : "-"}</div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span>Driving Hours</span>
          </div>
        </div>
      </div>

      <Separator />
    </div>
  )
}

