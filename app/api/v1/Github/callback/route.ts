import axios from "axios";
import { NextRequest, NextResponse } from "next/server";



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
    } catch (error) {
        console.log(error)

        return NextResponse.json({
            message:"Internal server error"
        },{
            status:500
        })
    }
     
}