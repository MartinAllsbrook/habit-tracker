/*
  Warnings:

  - The `type` column on the `Habit` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "HabitType" AS ENUM ('BOOLEAN', 'VALUE');

-- AlterTable
ALTER TABLE "Habit" DROP COLUMN "type",
ADD COLUMN     "type" "HabitType" NOT NULL DEFAULT 'BOOLEAN';
