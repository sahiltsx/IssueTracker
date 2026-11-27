import { NextResponse } from "next/server";

export async function GET() {
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        redirect_uri: "https://issue-tracker-9h5i.vercel.app/api/v1/Github/callback",
        scope:"read:user user:email"
    });

    return NextResponse.redirect(
        `https://github.com/login/oauth/authorize?${params.toString()}`
    );
}