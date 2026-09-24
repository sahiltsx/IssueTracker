import { Button } from "@/components/ui/button";

export default function dashboard() {
    return (
        <div className="max-w-md mx-auto p-6 ">
           <header className="flex items-center justify-center pb-5 border-b">
            <div>
                 <h2 className="font-semibold text-2xl">Issue tracker</h2>
            </div>
           
           </header>

           <div className="flex gap-3 pt-4">
             <Button variant="outline">Recently created</Button>
             <Button variant="outline">Recently updated</Button>
           </div>
        </div>
    )
}