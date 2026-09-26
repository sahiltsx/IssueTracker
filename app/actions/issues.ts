import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export type IssueStatus="TODO" | "IN_PROGRESS" | "DONE" ;
export type IssuePriority="Low" | "Medium" | "High" ;

// fetch all issues

export async function getIssues() {
    try {
        const issues=await prisma.issue.findMany({
            orderBy:{createdAt:"desc"},
        });
        return issues;
    } catch (error) {
        console.error("Failed to fetch the issues:",error);

        return [];
    }
}

// create new issue

export async function createIssues(data:{
    title:string,
    priority:IssuePriority,
    tag:string
}) {
    try {
        const count=await prisma.issue.count();
        const issueKey=`ISS-${100+count+1}`;

        const newIssues=await prisma.issue.create({
            data:{
                issueKey,
                title:data.title,
                priority:data.priority,
                tag:data.tag ||"task",
                status:"TODO"
            },
        });
        revalidatePath("/");
        return{success:true,data:newIssues};
    } catch (error) {
        console.log("Failed to create a new issues:",error);

        return{success:false,error:"Failed to create issue"};
    }
}

// update a issue

export async function updateIssue(id:string,status:IssueStatus) {
    try{
      const updated=await prisma.issue.update({
        where:{id},
        data:{status}
      });
      revalidatePath("/");
      return {succes:true,data:updated}
    }catch(err){
        console.log("Failed to update issue:",err)
        return{success:false,error:"Failed to update issue"}
    }
}

export async function deleteIssue(id:string) {
    try {
        const deleted=await prisma.issue.delete({
            where:{id}
        });
        revalidatePath("/");
        return{success:true}
    } catch (error) {
        console.log("Failed to delete issue",error)
        return {success:false,error:"Failed to delete issue"}
    }
}