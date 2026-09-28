// src/app/page.tsx
import { getIssues } from "@/app/actions/issues";
import DashboardClient from "../dashboardClient/page";
export const dynamic = "force-dynamic";

export default async function Page() {
  // Fetch real records from PostgreSQL via Prisma
  const issues = await getIssues();

  return <DashboardClient initialIssues={issues} />;
}