const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

const prisma = new PrismaClient();

// Get all course fields
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { search = "", includeCount = "false" } = req.query;

    const where = search
      ? {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {};

    const fields = await prisma.courseField.findMany({
      where,
      orderBy: { name: "asc" },
      ...(includeCount === "true" && {
        include: {
          _count: {
            select: { courses: true },
          },
        },
      }),
    });
    console.log("Fetched course fields:", fields);

    res.json({
      success: true,
      data: fields,
    });
  } catch (error) {
    console.error("Get course fields error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching course fields",
    });
  }
});

// Get single course field by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const field = await prisma.courseField.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    if (!field) {
      return res.status(404).json({
        success: false,
        message: "Course field not found",
      });
    }

    res.json({
      success: true,
      data: field,
    });
  } catch (error) {
    console.error("Get course field error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching course field",
    });
  }
});

// Get courses for a specific field
router.get("/:id/courses", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const fieldId = parseInt(req.params.id);

    const field = await prisma.courseField.findUnique({
      where: { id: fieldId },
    });

    if (!field) {
      return res.status(404).json({
        success: false,
        message: "Course field not found",
      });
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: { courseFieldId: fieldId },
        skip,
        take: parseInt(limit),
        orderBy: { courseStartDate: "desc" },
        include: {
          images: true,
          documents: true,
        },
      }),
      prisma.course.count({
        where: { courseFieldId: fieldId },
      }),
    ]);

    res.json({
      success: true,
      data: {
        field,
        courses,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get field courses error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching courses for field",
    });
  }
});

// Create new course field
router.post(
  "/",
  authMiddleware,
  [
    body("name")
      .notEmpty()
      .withMessage("Field name is required")
      .isLength({ min: 2, max: 64 })
      .withMessage("Field name must be between 2 and 64 characters")
      .trim(),
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

      const { name } = req.body;

      const field = await prisma.courseField.create({
        data: { name },
      });

      res.status(201).json({
        success: true,
        message: "Course field created successfully",
        data: field,
      });
    } catch (error) {
      console.error("Create course field error:", error);

      if (error.code === "P2002") {
        return res.status(400).json({
          success: false,
          message: "A course field with this name already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error creating course field",
      });
    }
  }
);

// Update course field
router.put(
  "/:id",
  authMiddleware,
  [
    body("name")
      .notEmpty()
      .withMessage("Field name is required")
      .isLength({ min: 2, max: 64 })
      .withMessage("Field name must be between 2 and 64 characters")
      .trim(),
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

      const { name } = req.body;

      const field = await prisma.courseField.update({
        where: { id: parseInt(req.params.id) },
        data: { name },
        include: {
          _count: {
            select: { courses: true },
          },
        },
      });

      res.json({
        success: true,
        message: "Course field updated successfully",
        data: field,
      });
    } catch (error) {
      console.error("Update course field error:", error);

      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          message: "Course field not found",
        });
      }

      if (error.code === "P2002") {
        return res.status(400).json({
          success: false,
          message: "A course field with this name already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error updating course field",
      });
    }
  }
);

// Delete course field
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const fieldId = parseInt(req.params.id);

    const courseCount = await prisma.course.count({
      where: { courseFieldId: fieldId },
    });

    if (courseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `لا يمكن حذف المجال. يحتوي على ${courseCount} دورة (دورات) مرتبطة به. يرجى إعادة تعيين أو حذف تلك الدورات أولاً.`,
        courseCount,
      });
    }

    await prisma.courseField.delete({
      where: { id: fieldId },
    });

    res.json({
      success: true,
      message: "Course field deleted successfully",
    });
  } catch (error) {
    console.error("Delete course field error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Course field not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting course field",
    });
  }
});

// Bulk create course fields
router.post(
  "/bulk",
  authMiddleware,
  [
    body("fields")
      .isArray({ min: 1 })
      .withMessage("Fields array is required")
      .custom((fields) => {
        return fields.every(
          (field) =>
            field.name &&
            typeof field.name === "string" &&
            field.name.trim().length >= 2 &&
            field.name.trim().length <= 64
        );
      })
      .withMessage("All fields must have valid names (2-64 characters)"),
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

      const { fields } = req.body;

      const results = {
        created: [],
        skipped: [],
        errors: [],
      };

      for (const field of fields) {
        try {
          const created = await prisma.courseField.create({
            data: { name: field.name.trim() },
          });
          results.created.push(created);
        } catch (error) {
          if (error.code === "P2002") {
            results.skipped.push({
              name: field.name,
              reason: "Already exists",
            });
          } else {
            results.errors.push({
              name: field.name,
              error: error.message,
            });
          }
        }
      }

      res.status(201).json({
        success: true,
        message: `Bulk operation completed. Created: ${results.created.length}, Skipped: ${results.skipped.length}, Errors: ${results.errors.length}`,
        data: results,
      });
    } catch (error) {
      console.error("Bulk create fields error:", error);
      res.status(500).json({
        success: false,
        message: "Error during bulk create operation",
      });
    }
  }
);

module.exports = router;
