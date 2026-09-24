import { Button } from "@/components/ui/button";

export default function Dashboard() {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto pt-3">
            <header className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center ml-2">
                    <h2 className="text-2xl font-semibold tracking-tight">Issue Tracker</h2>
                </div>
                <div className="flex items-center gap-2 mr-4">
                    <Button variant="outline" className=" text-sm font-medium">New Issue</Button>
                </div>
            </header>
        </div>
      </div>
    )
}