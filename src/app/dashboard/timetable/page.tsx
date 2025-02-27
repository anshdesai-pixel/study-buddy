import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TimetablePlanner from "@/components/dashboard/timetable-planner";
import { stackServerApp } from "@/lib/stack";

export default async function Timetable() {
  const user = await stackServerApp.getUser();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timetable (Only End Dates)</CardTitle>
      </CardHeader>
      <CardContent>
        <TimetablePlanner userId={user ? user.id : ""} />
      </CardContent>
    </Card>
  );
}
