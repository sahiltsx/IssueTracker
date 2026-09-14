import { NextRequest,NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";


export function middleware(req:NextRequest){
    const token =req.cookies.get("token")?.value;

    if(!token){
        return NextResponse.redirect(new URL("/login",req.url))
    }

    const payload=verifyToken(token);

    if(!payload){
        return NextResponse.redirect(new URL("/login",req.url));
    }

    return NextResponse.next();
}

export const config={
    matcher:[
        "/dashboard/:path*",
        "/projects/:path*",
        "/issues/:path*",
    ],
}