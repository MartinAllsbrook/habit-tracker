/*
  Warnings:

  - You are about to drop the `HabitEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "HabitType" ADD VALUE 'TALLY';

-- DropForeignKey
ALTER TABLE "public"."HabitEntry" DROP CONSTRAINT "HabitEntry_habitId_fkey";

-- DropTable
DROP TABLE "public"."HabitEntry";

-- CreateTable
CREATE TABLE "BooleanHabitEntry" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "notes" TEXT,

    CONSTRAINT "BooleanHabitEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimedHabitEntry" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "TimedHabitEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BooleanHabitEntry_habitId_date_key" ON "BooleanHabitEntry"("habitId", "date");

-- AddForeignKey
ALTER TABLE "BooleanHabitEntry" ADD CONSTRAINT "BooleanHabitEntry_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimedHabitEntry" ADD CONSTRAINT "TimedHabitEntry_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
