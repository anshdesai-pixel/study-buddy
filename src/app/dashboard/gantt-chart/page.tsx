import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { stackServerApp } from "@/lib/stack";
import GanttChartLegend from "@/components/dashboard/gantt-chart-legends";
import GanttChartPlanner from "@/components/dashboard/gantt-chart-planner";

export default async function GanttChart() {
  const user = await stackServerApp.getUser();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gantt Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <GanttChartPlanner userId={user ? user.id : ""} />
        <GanttChartLegend />
      </CardContent>
    </Card>
  );
}
