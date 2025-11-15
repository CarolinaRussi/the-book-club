-- CreateEnum
CREATE TYPE "ReadingStatusEnum" AS ENUM ('not_started', 'dropped', 'started', 'finished');

-- CreateEnum
CREATE TYPE "StatusEnum" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "BookStatusEnum" AS ENUM ('suggested', 'started', 'dropped', 'finished');

-- CreateEnum
CREATE TYPE "MeetingStatusEnum" AS ENUM ('scheduled', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ConfirmationStatusEnum" AS ENUM ('going', 'not_going', 'maybe');

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "author" VARCHAR(255),
    "cover_url" VARCHAR(255),
    "open_library_id" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cover_public_id" VARCHAR(255),

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "invitation_code" VARCHAR(255) NOT NULL,
    "owner_id" TEXT NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "meeting_date" DATE NOT NULL,
    "meeting_time" TIME(0) NOT NULL,
    "description" TEXT,
    "status" "MeetingStatusEnum" NOT NULL DEFAULT 'scheduled',
    "book_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "reading_status" "ReadingStatusEnum" NOT NULL,
    "rating" INTEGER,
    "review" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "profile_picture" VARCHAR(255),
    "favorites_genres" TEXT[],
    "bio" TEXT,
    "status" "StatusEnum" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nickname" VARCHAR(255) NOT NULL,
    "profile_picture_public_id" VARCHAR(255),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubBook" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "status" "BookStatusEnum" NOT NULL DEFAULT 'suggested',
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingConfirmation" (
    "id" TEXT NOT NULL,
    "meeting_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "status" "ConfirmationStatusEnum" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Club_invitation_code_key" ON "Club"("invitation_code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ClubBook_club_id_book_id_key" ON "ClubBook"("club_id", "book_id");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingConfirmation_meeting_id_member_id_key" ON "MeetingConfirmation"("meeting_id", "member_id");

-- AddForeignKey
ALTER TABLE "Club" ADD CONSTRAINT "Club_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ClubBook" ADD CONSTRAINT "ClubBook_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubBook" ADD CONSTRAINT "ClubBook_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingConfirmation" ADD CONSTRAINT "MeetingConfirmation_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingConfirmation" ADD CONSTRAINT "MeetingConfirmation_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
