-- CreateEnum
CREATE TYPE "book_status_enum" AS ENUM ('started', 'finished');

-- AlterEnum
ALTER TYPE "reading_status_enum" ADD VALUE 'dropped';

-- AlterTable
ALTER TABLE "book" ADD COLUMN     "open_library_id" VARCHAR(255),
ADD COLUMN     "status" "book_status_enum" NOT NULL DEFAULT 'started';
