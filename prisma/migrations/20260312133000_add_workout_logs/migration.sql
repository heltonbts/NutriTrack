-- CreateEnum
CREATE TYPE "WorkoutType" AS ENUM (
    'WALK',
    'RUN',
    'BIKE',
    'GYM',
    'STRENGTH',
    'HIIT',
    'YOGA',
    'PILATES',
    'SWIMMING',
    'SPORTS',
    'OTHER'
);

-- CreateTable
CREATE TABLE "WorkoutLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "photoUrl" TEXT,
    "notes" TEXT,
    "activityType" "WorkoutType" NOT NULL DEFAULT 'OTHER',
    "feeling" TEXT,
    "checkedIn" BOOLEAN NOT NULL DEFAULT true,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkoutLog"
ADD CONSTRAINT "WorkoutLog_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
