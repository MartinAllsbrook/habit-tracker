-- DropIndex
DROP INDEX "public"."HabitEntry_habitId_date_key";

-- AlterTable
ALTER TABLE "HabitEntry" ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(3);
