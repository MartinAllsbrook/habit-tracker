/*
  Warnings:

  - You are about to drop the column `completed` on the `HabitEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'boolean',
ADD COLUMN     "unit" TEXT;

-- AlterTable
ALTER TABLE "HabitEntry" DROP COLUMN "completed",
ADD COLUMN     "value" DOUBLE PRECISION;
