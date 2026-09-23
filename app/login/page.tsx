"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Login() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [step, setStep] = useState<"email" | "code">("email");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSendCode(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await axios.post("/api/v1/login", { email });
            setStep("code");
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyCode(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await axios.post("/api/verify-otp", { email, code });
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
            <Card className="w-full max-w-sm p-6">
                <div className="space-y-4">
                    <div className="text-center">
                        <h3 className="text-2xl font-semibold">Welcome back</h3>
                    </div>

                    {step === "email" && (
                        <form className="space-y-4" onSubmit={handleSendCode}>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                />
                            </div>
                            <Button
                                type="submit"
                                variant="outline"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send code"}
                            </Button>
                        </form>
                    )}

                    {step === "code" && (
                        <form className="space-y-4" onSubmit={handleVerifyCode}>
                            <div className="space-y-2">
                                <Label htmlFor="code">Code</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    maxLength={6}
                                    required
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="Enter the 6-digit code"
                                />
                            </div>
                            <Button
                                type="submit"
                                variant="outline"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? "Verifying..." : "Verify"}
                            </Button>
                        </form>
                    )}

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex items-center gap-3">
                        <Separator className="flex-1" />
                        <span className="text-xs text-muted-foreground">OR</span>
                        <Separator className="flex-1" />
                    </div>

                    <Button variant="outline" className="w-full">
                        Continue with Github
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                        Don't have an account?{" "}
                        <Link
                            href="/register"
                            className="text-foreground text-sm font-medium hover:underline"
                        >
                            Register
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    )
}