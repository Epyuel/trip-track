export function TripProgress({ progressPercent }: { progressPercent: number }) {
    return (
      <div className="pt-2">
        <div className="flex justify-between mb-1 text-sm">
          <span>Trip Progress</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-4 bg-blue-100 dark:bg-blue-900/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    );
  }
  