/*
  Warnings:

  - You are about to drop the column `club_id` on the `review` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `review` table. All the data in the column will be lost.
  - Added the required column `member_id` to the `review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."review" DROP CONSTRAINT "review_club_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."review" DROP CONSTRAINT "review_user_id_fkey";

-- AlterTable
ALTER TABLE "review" DROP COLUMN "club_id",
DROP COLUMN "user_id",
ADD COLUMN     "member_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
