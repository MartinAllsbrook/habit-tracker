/*
  Warnings:

  - You are about to drop the `BooleanHabitEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TimedHabitEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."BooleanHabitEntry" DROP CONSTRAINT "BooleanHabitEntry_habitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TimedHabitEntry" DROP CONSTRAINT "TimedHabitEntry_habitId_fkey";

-- DropTable
DROP TABLE "public"."BooleanHabitEntry";

-- DropTable
DROP TABLE "public"."TimedHabitEntry";

-- CreateTable
CREATE TABLE "HabitEntry" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "HabitEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HabitEntry_habitId_date_idx" ON "HabitEntry"("habitId", "date");

-- AddForeignKey
ALTER TABLE "HabitEntry" ADD CONSTRAINT "HabitEntry_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
