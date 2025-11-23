const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/auth");
const { uploadImage, uploadDocument } = require("../middleware/upload");
const { body, validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const UPLOADS_ROOT = path.join(__dirname, '..', 'storage', 'uploads');
const urlToDiskPath = (p) => path.join(UPLOADS_ROOT, String(p).replace(/^\/?uploads\//, ''));

// Get all courses with pagination and search
router.get("/", authMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      field = "",
      startDate = "",
      endDate = "",
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { courseNumber: { contains: search, mode: "insensitive" } },
        { courseName: { contains: search, mode: "insensitive" } },
        { trainerName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (field) {
      where.courseFieldId = parseInt(field);
    }

    if (startDate) {
      where.courseStartDate = { gte: new Date(startDate) };
    }

    if (endDate) {
      where.courseEndDate = { lte: new Date(endDate) };
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { courseStartDate: "desc" },
        include: {
          courseField: true,
          images: true,
          documents: true,
        },
      }),
      prisma.course.count({ where }),
    ]);

    res.json({
      success: true,
      data: courses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching courses",
    });
  }
});

// Get single course by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        courseField: true,
        images: true,
        documents: true,
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching course",
    });
  }
});

// Create new course
router.post(
  "/",
  authMiddleware,
  [
    body("courseNumber").notEmpty().withMessage("Course number is required"),
    body("courseCode").notEmpty().withMessage("Course code is required"),
    body("courseFieldId")
      .isInt({ min: 1 })
      .withMessage("Valid course field ID is required"),
    body("courseName").notEmpty().withMessage("Course name is required"),
    body("numberOfBeneficiaries")
      .isInt({ min: 0 })
      .withMessage("Invalid number of beneficiaries"),
    body("numberOfGraduates")
      .isInt({ min: 0 })
      .withMessage("Invalid number of graduates"),
    body("courseDuration")
      .isInt({ min: 1 })
      .withMessage("Invalid course duration"),
    body("courseHours").isInt({ min: 1 }).withMessage("Invalid course hours"),
    body("courseVenue").notEmpty().withMessage("Course venue is required"),
    body("courseStartDate").isISO8601().withMessage("Invalid start date"),
    body("courseEndDate").isISO8601().withMessage("Invalid end date"),
    body("trainerName").notEmpty().withMessage("Trainer name is required"),
    body("trainerPhoneNumber")
      .notEmpty()
      .withMessage("Trainer phone is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { courseFieldId, ...restData } = req.body;

      // Verify course field exists
      const fieldExists = await prisma.courseField.findUnique({
        where: { id: parseInt(courseFieldId) },
      });

      if (!fieldExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid course field ID. Field does not exist.",
        });
      }

      const course = await prisma.course.create({
        data: {
          ...restData,
          courseFieldId: parseInt(courseFieldId),
          courseStartDate: new Date(restData.courseStartDate),
          courseEndDate: new Date(restData.courseEndDate),
          numberOfBeneficiaries: parseInt(restData.numberOfBeneficiaries),
          numberOfGraduates: parseInt(restData.numberOfGraduates),
          courseDuration: parseInt(restData.courseDuration),
          courseHours: parseInt(restData.courseHours),
        },
        include: {
          courseField: true,
          images: true,
          documents: true,
        },
      });

      res.status(201).json({
        success: true,
        message: "Course created successfully",
        data: course,
      });
    } catch (error) {
      console.error("Create course error:", error);

      if (error.code === "P2002") {
        return res.status(400).json({
          success: false,
          message: "Course number already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error creating course",
      });
    }
  }
);

// Update course
router.put(
  "/:id",
  authMiddleware,
  [
    body("courseNumber").optional().notEmpty(),
    body("courseCode").optional().notEmpty(),
    body("courseFieldId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Valid course field ID is required"),
    body("courseName").optional().notEmpty(),
    body("numberOfBeneficiaries").optional().isInt({ min: 0 }),
    body("numberOfGraduates").optional().isInt({ min: 0 }),
    body("courseDuration").optional().isInt({ min: 1 }),
    body("courseHours").optional().isInt({ min: 1 }),
    body("courseVenue").optional().notEmpty(),
    body("courseStartDate").optional().isISO8601(),
    body("courseEndDate").optional().isISO8601(),
    body("trainerName").optional().notEmpty(),
    body("trainerPhoneNumber").optional().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const updateData = { ...req.body };

      // Verify course field exists if updating
      if (updateData.courseFieldId) {
        const fieldExists = await prisma.courseField.findUnique({
          where: { id: parseInt(updateData.courseFieldId) },
        });

        if (!fieldExists) {
          return res.status(400).json({
            success: false,
            message: "Invalid course field ID. Field does not exist.",
          });
        }
        updateData.courseFieldId = parseInt(updateData.courseFieldId);
      }

      if (updateData.courseStartDate) {
        updateData.courseStartDate = new Date(updateData.courseStartDate);
      }

      if (updateData.courseEndDate) {
        updateData.courseEndDate = new Date(updateData.courseEndDate);
      }

      if (updateData.numberOfBeneficiaries) {
        updateData.numberOfBeneficiaries = parseInt(
          updateData.numberOfBeneficiaries
        );
      }

      if (updateData.numberOfGraduates) {
        updateData.numberOfGraduates = parseInt(updateData.numberOfGraduates);
      }

      if (updateData.courseDuration) {
        updateData.courseDuration = parseInt(updateData.courseDuration);
      }

      if (updateData.courseHours) {
        updateData.courseHours = parseInt(updateData.courseHours);
      }

      const course = await prisma.course.update({
        where: { id: parseInt(req.params.id) },
        data: updateData,
        include: {
          courseField: true,
          images: true,
          documents: true,
        },
      });

      res.json({
        success: true,
        message: "Course updated successfully",
        data: course,
      });
    } catch (error) {
      console.error("Update course error:", error);

      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      if (error.code === "P2002") {
        return res.status(400).json({
          success: false,
          message: "Course number already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error updating course",
      });
    }
  }
);

// Delete course
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    // Get course with files to delete them
    const course = await prisma.course.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        courseField: true,
        images: true,
        documents: true,
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Safely delete associated files (images & documents)
    const deleteIfSafe = async (fileUrlOrPath) => {
      if (!fileUrlOrPath) return;
      const diskPath = urlToDiskPath(fileUrlOrPath);
      const resolved = path.resolve(diskPath);

      // Prevent accidental deletion outside uploads root
      if (!resolved.startsWith(UPLOADS_ROOT)) {
      console.warn(`Skipping deletion outside uploads root: ${resolved}`);
      return;
      }

      try {
      await fs.promises.unlink(resolved);
      } catch (err) {
      // Ignore missing files, log other errors
      if (err.code !== "ENOENT") {
        console.error("Failed to delete file:", resolved, err);
      }
      }
    };

    await Promise.allSettled([
      ...(course.images || []).map((img) => deleteIfSafe(img.url)),
      ...(course.documents || []).map((doc) => deleteIfSafe(doc.path)),
    ]);

    // Delete course (cascades to images and documents)
    await prisma.course.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting course",
    });
  }
});

// Upload course images
router.post(
  "/:id/images",
  authMiddleware,
  uploadImage.array("images", 10),
  async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);

      // Verify course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No files uploaded" });
      }

      if (!course) {
        // Delete uploaded files
        req.files.forEach((file) => fs.unlinkSync(file.path));

        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Create image records
      const images = await Promise.all(
        req.files.map((file) =>
          prisma.courseImage.create({
            data: {
              courseId,
              url: `/uploads/images/${file.filename}`,
              altText: req.body.altText || file.originalname,
            },
          })
        )
      );

      res.status(201).json({
        success: true,
        message: "Images uploaded successfully",
        data: images,
      });
    } catch (error) {
      console.error("Upload images error:", error);

      // Clean up uploaded files on error
      if (req.files) {
        req.files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      res.status(500).json({
        success: false,
        message: "Error uploading images",
      });
    }
  }
);

// Delete course image
router.delete("/:id/images/:imageId", authMiddleware, async (req, res) => {
  try {
    const image = await prisma.courseImage.findUnique({
      where: { id: parseInt(req.params.imageId) },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Delete file
    const imagePath = urlToDiskPath(image.url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete record
    await prisma.courseImage.delete({
      where: { id: parseInt(req.params.imageId) },
    });

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting image",
    });
  }
});

// Upload course document
router.post(
  "/:id/documents",
  authMiddleware,
  uploadDocument.single("document"),
  [
    body("type")
      .isIn([
        "TRAINEES_DATA_FORM",
        "TRAINER_DATA_FORM",
        "ATTENDANCE_FORM",
        "GENERAL_REPORT_FORM",
        "COURSE_CERTIFICATE",
      ])
      .withMessage("Invalid document type"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (req.file && fs.existsSync(req.file.path))
          fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      // ensure a file was actually uploaded
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No document file uploaded" });
      }

      const courseId = parseInt(req.params.id, 10);

      // Verify course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) {
        fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
        return res
          .status(404)
          .json({ success: false, message: "Course not found" });
      }

      // ✅ Always create a new record; allow multiple docs per (courseId, type)
      const document = await prisma.courseDocument.create({
        data: {
          courseId,
          type: req.body.type,
          path: `/uploads/documents/${req.file.filename}`,
          fileName: req.file.originalname,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Document uploaded successfully",
        data: document,
      });
    } catch (error) {
      console.error("Upload document error:", error);
      if (req.file && fs.existsSync(req.file.path))
        fs.unlinkSync(req.file.path);
      return res
        .status(500)
        .json({ success: false, message: "Error uploading document" });
    }
  }
);

// Delete course document
router.delete(
  "/:id/documents/:documentId",
  authMiddleware,
  async (req, res) => {
    try {
      const document = await prisma.courseDocument.findUnique({
        where: { id: parseInt(req.params.documentId) },
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      // Delete file
      const docPath = urlToDiskPath(document.path);
      if (fs.existsSync(docPath)) {
        fs.unlinkSync(docPath);
      }

      // Delete record
      await prisma.courseDocument.delete({
        where: { id: parseInt(req.params.documentId) },
      });

      res.json({
        success: true,
        message: "Document deleted successfully",
      });
    } catch (error) {
      console.error("Delete document error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting document",
      });
    }
  }
);

module.exports = router;
