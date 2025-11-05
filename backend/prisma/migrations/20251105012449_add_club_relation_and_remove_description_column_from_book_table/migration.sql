/*
  Warnings:

  - You are about to drop the column `description` on the `book` table. All the data in the column will be lost.
  - Added the required column `club_id` to the `book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "book" DROP COLUMN "description",
ADD COLUMN     "club_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "book" ADD CONSTRAINT "book_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "club"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
