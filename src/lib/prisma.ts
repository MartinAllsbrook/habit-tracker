import { PrismaClient } from "@/generated/prisma/client"
// import process from "node:process"

const globalForPrisma = globalThis as unknown as { 
    prisma: PrismaClient
}

const prisma = globalForPrisma.prisma || new PrismaClient({
    log: ['error', 'warn'],
})

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma