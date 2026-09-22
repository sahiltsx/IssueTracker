import prisma from "@/lib/db";
import { NextRequest ,NextResponse } from "next/server";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


export async function POST(req:NextRequest) {

     try {
        
         const {email,password}=await req.json();
         
         if(!email || !password){
             return NextResponse.json({
                 message:"Email and password is required"
             },{
                 status:400
             });
         }
             const existingUser=await prisma.user.findFirst({
                 where:{
                     email:email
                 }
             });
     
             if(existingUser){
                 return NextResponse.json({
                   message:"User already exist with this email"
                 },{
                     status:409
                 })
             }
     
             const hashPassword=await bcrypt.hash(password,10)
         
             const User=await prisma.user.create({
                 data:{
                     email,
                     password:hashPassword
                 }
             });

             const token=jwt.sign(
                {userId:User.id,email:User.email},
                process.env.JWT_SECRET as string,
                {expiresIn:"7d"}
             )
     
            const response= NextResponse.json({
                 message:"User created successfully",
                 userId:User.id
             },{
                 status:201
             })

             response.cookies.set("token",token,{
                httpOnly:true,
                secure:process.env.NODE_ENV==="production",
                sameSite:"lax",
                maxAge:60*60*24*7,
                path:"/"
             });

             return response

     }
      catch (error) {
        console.log(error)
        return NextResponse.json({
            message:"Internal server error"
        },{
            status:500
        })
     }

}