"use server"
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { IssueStatus, IssuePriority } from "../types/issue";

// fetch all issues
export async function getIssues() {
    try {
        const issues = await prisma.issue.findMany({
            include: {
                assignee: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { createdAt: "desc" },
        });
        return issues;
    } catch (error) {
        console.error("Failed to fetch the issues:", error);
        return [];
    }
}

// create new issue
export async function createIssues(data: {
    title: string,
    description?: string,
    priority: IssuePriority,
    tag: string,
    assigneeId?: string
}) {
    try {
        // Atomically get the next issue number from the counter table.
        // The first run creates the counter at 103 (your highest existing key is ISS-102).
        const counter = await prisma.counter.upsert({
            where: { name: "issue" },
            update: { value: { increment: 1 } },
            create: { name: "issue", value: 103 },
        });
        const issueKey = `ISS-${counter.value}`;

        const newIssue = await prisma.issue.create({
            data: {
                issueKey,
                title: data.title,
                description: data.description?.trim() || "",
                priority: data.priority,
                tag: data.tag || "task",
                status: "TODO",
                assigneeId: data.assigneeId
            },
            include: {
                assignee: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        revalidatePath("/");
        return { success: true, data: newIssue };
    } catch (error) {
        console.log("Failed to create a new issues:", error);
        return { success: false, error: "Failed to create issue" };
    }
}

// update an issue (title, description, priority and/or status)
export async function updateIssue(
    id: string,
    data: {
        title?: string,
        description?: string,
        priority?: IssuePriority,
        status?: IssueStatus,
    }
) {
    try {
        const updated = await prisma.issue.update({
            where: { id },
            data: {
                ...(data.title !== undefined && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.priority !== undefined && { priority: data.priority }),
                ...(data.status !== undefined && { status: data.status }),
            },
        });

        revalidatePath("/");
        return { success: true, data: updated };
    } catch (err) {
        console.log("Failed to update issue:", err);
        return { success: false, error: "Failed to update issue" };
    }
}

// delete an issue
export async function deleteIssue(id: string) {
    try {
        await prisma.issue.delete({
            where: { id }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.log("Failed to delete issue", error);
        return { success: false, error: "Failed to delete issue" };
    }
}