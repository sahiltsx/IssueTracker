import prisma from "@/lib/db";
import { NextRequest ,NextResponse} from "next/server";
import {Resend} from "resend"

const resend=new Resend(process.env.RESEND_API_KEY);

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
       
        const code=Math.floor(100000+Math.random()*900000).toString();
        const expiresAt=new Date(Date.now()+10*60*1000);
     
         await prisma.otp.upsert({
            where:{email},
            update:{
                code,
                expiresAt,
                attempts:0
            },
            create:{
                email,
                code,
                expiresAt
            }
         })

         await resend.emails.send({
            from:"onboarding@resend.dev",
            to:email,
            subject:"Your login code",
            text:`Your login code is ${code}.It expires in 10 minutes.`
         })
        return NextResponse.json({
            message:"If that email exists, code has been sent"
        },{
            status:200
        })

    } catch (error) {
        console.log(error)
        return NextResponse.json({
            message:"Something went wrong"
        },{
            status:500
        })
    }
}