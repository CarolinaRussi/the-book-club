/*
  Warnings:

  - You are about to drop the column `club_id` on the `book` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `book` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."book" DROP CONSTRAINT "book_club_id_fkey";

-- AlterTable
ALTER TABLE "book" DROP COLUMN "club_id",
DROP COLUMN "status";

-- CreateTable
CREATE TABLE "ClubBook" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "status" "book_status_enum" NOT NULL DEFAULT 'suggested',
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubBook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClubBook_club_id_book_id_key" ON "ClubBook"("club_id", "book_id");

-- AddForeignKey
ALTER TABLE "ClubBook" ADD CONSTRAINT "ClubBook_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubBook" ADD CONSTRAINT "ClubBook_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
