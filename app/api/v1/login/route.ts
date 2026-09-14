import prisma from "@/lib/db";
import { NextRequest ,NextResponse} from "next/server";


export async function POST(req:NextRequest){
    try {
        const {email}=await req.json()

        if(!email){
            return NextResponse.json({
                message:"Email is required for login"
            },{
                status:400
            })
        }

        const user=await prisma.user.findUnique({
            where:{
                email:email
            }
        })

        return NextResponse.json({
            message:"User login successfully",
            user
        },{
            status:200
        })

    } catch (error) {
        console.log(error)
    }
}