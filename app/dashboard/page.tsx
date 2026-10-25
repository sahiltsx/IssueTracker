import { getIssues } from "@/app/actions/issues";
import DashboardClient from "../dashboardClient/page";
export const dynamic = "force-dynamic";

export default async function Page() {
  const issues = await getIssues();

  return <DashboardClient initialIssues={issues} />;
}