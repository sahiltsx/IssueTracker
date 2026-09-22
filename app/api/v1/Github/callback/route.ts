import prisma from "@/lib/db";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import  jwt from "jsonwebtoken";



export async function GET(req:NextRequest){

    try {
        const code= await req.nextUrl.searchParams.get("code")

     if(!code){
        return NextResponse.json({
            message:"Message missing"
        },{
            status:400
        })
     }
     
     const tokenRes=await axios.post("https://github.com/login/oauth/access_token",{
        client_id:process.env.GITHUB_CLIENT_ID,
        client_secret:process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: "http://localhost:3000/api/v1/Github/callback",
     },{
        headers:{
            Accept:"application/json"
        }
     })

     const access_token=tokenRes.data.access_token

     if(!access_token){
        return NextResponse.json({
            message:"Failed to get access token"
        },{
            status:400
        })
     }

     const profileRes=await axios.get("https://api.github.com/user",{
        headers:{
            Authorization:`Bearer ${access_token}`
        }
     })
        const githubProfile=await profileRes.data

        let email=githubProfile.email;
        if(!email){
            const emailRes=await axios.get("https://api.github.com/user/emails",{
                headers:{
                    Authorization:`Bearer ${access_token}`
                }
            })
            let primaryEmail=emailRes.data.find((e:any)=>e.primary);

            if(!primaryEmail){
                return NextResponse.json({
                    message:"Could not get email from github"
                },{
                    status:400
                })
            }
            email=primaryEmail.email;
        }

        let user=await prisma.user.findUnique({
            where:{
                githubId:githubProfile.id.toString()
            }
        })
        if(user){
          user= await prisma.user.update({
                where:{
                    githubId:githubProfile.id.toString()
                },
                data:{
                    githubAccessToken:access_token,
                    image:githubProfile.avatar_url
                }
            });
        }else{
          user= await prisma.user.create({
            data:{
                email,
                githubId:githubProfile.id.toString(),
                githubAccessToken:access_token,
                image:githubProfile.avatar_url
            }
           })
        }

        const token=await jwt.sign({userId:user?.id,email:user?.email},process.env.JWT_SECRET as string ,{expiresIn:"7d"})

        const response=NextResponse.redirect("http://localhost:3000/dashboard")

        response.cookies.set("token",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:"lax",
            maxAge:60*60*24*7,
            path:'/'
        });
        return response;

    } catch (error) {
        console.log(error)

        return NextResponse.json({
            message:"Internal server error"
        },{
            status:500
        })
    }
     
}