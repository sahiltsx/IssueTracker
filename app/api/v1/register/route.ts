import prisma from "@/lib/db";
import { NextRequest ,NextResponse } from "next/server";
import bcrypt from "bcrypt"


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
             const existingUser=await prisma.user.findUnique({
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
     
             return NextResponse.json({
                 message:"User created successfully",
                 userId:User.id
             },{
                 status:201
             })

     } catch (error) {
        console.log(error)
        return NextResponse.json({
            message:"Internal server error"
        },{
            status:500
        })
     }

}