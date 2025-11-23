-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "password" TEXT NOT NULL,
    "changePasswordKey" TEXT DEFAULT 'key8829',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Course" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "courseNumber" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseFieldId" INTEGER NOT NULL,
    "courseName" TEXT NOT NULL,
    "numberOfBeneficiaries" INTEGER NOT NULL,
    "numberOfGraduates" INTEGER NOT NULL,
    "courseDuration" INTEGER NOT NULL,
    "courseHours" INTEGER NOT NULL,
    "courseVenue" TEXT NOT NULL,
    "courseStartDate" DATETIME NOT NULL,
    "courseEndDate" DATETIME NOT NULL,
    "trainerName" TEXT NOT NULL,
    "trainerPhoneNumber" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Course_courseFieldId_fkey" FOREIGN KEY ("courseFieldId") REFERENCES "CourseField" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CourseImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "courseId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourseImage_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CourseDocument" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "courseId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "fileName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourseDocument_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CourseField" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_courseNumber_key" ON "Course"("courseNumber");

-- CreateIndex
CREATE INDEX "Course_courseStartDate_idx" ON "Course"("courseStartDate");

-- CreateIndex
CREATE INDEX "Course_courseEndDate_idx" ON "Course"("courseEndDate");

-- CreateIndex
CREATE INDEX "Course_courseFieldId_idx" ON "Course"("courseFieldId");

-- CreateIndex
CREATE INDEX "Course_trainerName_idx" ON "Course"("trainerName");

-- CreateIndex
CREATE INDEX "CourseImage_courseId_idx" ON "CourseImage"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseImage_courseId_url_key" ON "CourseImage"("courseId", "url");

-- CreateIndex
CREATE INDEX "CourseDocument_courseId_type_idx" ON "CourseDocument"("courseId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "CourseDocument_courseId_type_path_key" ON "CourseDocument"("courseId", "type", "path");

-- CreateIndex
CREATE UNIQUE INDEX "CourseField_name_key" ON "CourseField"("name");

-- CreateIndex
CREATE INDEX "CourseField_name_idx" ON "CourseField"("name");
