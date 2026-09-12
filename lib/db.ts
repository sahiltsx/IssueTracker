import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter= new PrismaPg({
    connectionString:process.env.DATABASE_URL
})

const prismaClientSingleton=()=>{
    return  new PrismaClient({adapter});
}

type prismaClientSingleton=ReturnType<typeof prismaClientSingleton>

const globalForPrisma=globalThis as  unknown as{
    prisma:prismaClientSingleton | undefined
}

const prisma =globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if(process.env.NODE_ENV !=="production"){
   globalForPrisma.prisma=prisma
};