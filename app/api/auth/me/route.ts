import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic"; 

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || typeof decoded !== "object" || !("userId" in decoded)) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId as string },
      select: {
        id: true,
        email: true,
        name: true,  
        image: true,
        bio: true,    
      },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}