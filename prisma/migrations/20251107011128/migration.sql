/*
  Warnings:

  - You are about to drop the column `date` on the `HabitEntry` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."HabitEntry_habitId_date_idx";

-- AlterTable
ALTER TABLE "HabitEntry" DROP COLUMN "date";
