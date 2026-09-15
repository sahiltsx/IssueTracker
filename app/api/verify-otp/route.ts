import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    try {
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({
                message: "Email or code is required for login"
            }, {
                status: 400
            });
        }

        const otp = await prisma.otp.findUnique({
            where: { email }
        });

        if (!otp) {
            return NextResponse.json({
                message: "No code requested for this email"
            }, {
                status: 404
            });
        }

        if (new Date() > otp.expiresAt) {
            await prisma.otp.delete({ where: { email } });
            return NextResponse.json({
                message: "Code expired, please request a new one"
            }, {
                status: 400
            });
        }

        if (otp.attempts >= 5) {
            await prisma.otp.delete({ where: { email } });
            return NextResponse.json({
                message: "Too many attempts, please request a new code"
            }, {
                status: 429
            });
        }

        if (otp.code !== code) {
            await prisma.otp.update({
                where: { email },
                data: { attempts: { increment: 1 } }
            });
            return NextResponse.json({
                message: "Invalid code"
            }, {
                status: 400
            });
        }

        await prisma.otp.delete({ where: { email } });

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: { email }
            });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        const response = NextResponse.json({
            message: "Login successful",
            user: { id: user.id, email: user.email }
        }, {
            status: 200
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/"
        });

        return response;

    } catch (error) {
        console.log(error);
        return NextResponse.json({
            message: "Something went wrong"
        }, {
            status: 500
        });
    }
}