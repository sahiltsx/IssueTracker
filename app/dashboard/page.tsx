import { Button } from "@/components/ui/button";

export default function dashboard() {
    return (
      <div className="max-w-5xl mx-auto pt-4">
        <header className="flex items-center justify-between pb-5 border border-b-2 border-neutral-500">
            <div>
                <h2 className="text-2xl font-semibold">Issue tracker</h2>
            </div>
            <div className="flex gap-3">
                <Button>New Issue</Button>
                <h3>User profile</h3>
            </div>
        </header>
      </div>
    )
}