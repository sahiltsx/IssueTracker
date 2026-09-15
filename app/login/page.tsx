import { Card  } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function register (){
    const[email,setEmail]=useState("")
    const[code,setCode]=useState("")
    const[step,setStep]=useState<"email"|"code">("email")
    const[error,setError]=useState(null)
    const[loading,setLoading]=useState(false)
 
    async function handleSendCode(e:React.FormEvent){
         e.preventDefault();
         setError(null)
         setLoading(true)

        //  try {
        //     await 
        //  } catch (error) {
            
        //  }
    }
    const router=useRouter()
    return (
        <div className="  min-h-screen bg-background text-foreground flex items-center justify-center px-4">
           <Card className="w-full max-w-sm p-6">
               <div className="space-y-4">
                <div className="text-center">
                   <h3 className=" text-2xl font-semibold ">Welcome back</h3>
                </div>
                <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                      id="email"
                      type="email"
                      required
                      placeholder="Enter your email"/>
                    </div>
                    <Button 
                    variant="outline"
                    className="w-full"
                    >
                     Login
                    </Button>
                </form>
                     
                     {/* separator */}
                 <div className="flex items-center gap-3">
                    <Separator className="flex-1"/>

                    <span className="text-xs text-muted-foreground">
                        OR
                    </span>
                    <Separator className="flex-1"/>
                 </div>  
                 <Button 
                   variant="outline"
                   className="w-full">
                   Continue with Github
                 </Button>  

                 <p className="text-center text-xs text-muted-foreground">
                    Don't have an account?{""}
                    <Link 
                    href="/register"
                    className="text-foreground text-sm font-medium hover:underline"
                    >Register</Link>
                 </p>
               </div>
           </Card>
        </div>
    )
}