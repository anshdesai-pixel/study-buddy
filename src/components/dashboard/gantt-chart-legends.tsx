export default function GanttChartLegend() {
  return (
    <div className="flex justify-end space-x-4 mt-4">
      <div className="flex items-center">
        <div className="w-4 h-4 bg-blue-400 dark:bg-blue-600 rounded mr-2" />
        <span className="text-sm">Task</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 bg-green-400 dark:bg-green-600 rounded mr-2" />
        <span className="text-sm">Project</span>
      </div>
    </div>
  );
}
