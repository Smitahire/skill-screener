/*
  Warnings:

  - You are about to drop the `Evaluation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Response` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Evaluation" DROP CONSTRAINT "Evaluation_interviewId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Question" DROP CONSTRAINT "Question_interviewId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Response" DROP CONSTRAINT "Response_questionId_fkey";

-- AlterTable
ALTER TABLE "public"."Interview" ADD COLUMN     "categories" JSONB,
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "totalScore" DOUBLE PRECISION;

-- DropTable
DROP TABLE "public"."Evaluation";

-- DropTable
DROP TABLE "public"."Question";

-- DropTable
DROP TABLE "public"."Response";

-- CreateTable
CREATE TABLE "public"."Answer" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "public"."QuestionType" NOT NULL,
    "expectedAnswer" TEXT,
    "answerText" TEXT,
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Answer" ADD CONSTRAINT "Answer_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "public"."Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
