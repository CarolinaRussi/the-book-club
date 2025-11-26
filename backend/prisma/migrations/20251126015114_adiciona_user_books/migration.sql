/*
  Warnings:

  - You are about to drop the column `member_id` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `reading_status` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `review` on the `Review` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "ReadingStatusEnum" ADD VALUE 'want_to_read';

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_member_id_fkey";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "member_id",
DROP COLUMN "reading_status",
DROP COLUMN "review",
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "UserBook" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "reading_status" "ReadingStatusEnum" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserBook_user_id_book_id_key" ON "UserBook"("user_id", "book_id");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserBook" ADD CONSTRAINT "UserBook_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBook" ADD CONSTRAINT "UserBook_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
