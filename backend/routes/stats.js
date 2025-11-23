const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// Get dashboard statistics
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    // Get total courses
    const totalCourses = await prisma.course.count();

    // Get total graduates
    const graduatesResult = await prisma.course.aggregate({
      _sum: {
        numberOfGraduates: true
      }
    });

    // Get total hours
    const hoursResult = await prisma.course.aggregate({
      _sum: {
        courseHours: true
      }
    });

    // Get total beneficiaries
    const beneficiariesResult = await prisma.course.aggregate({
      _sum: {
        numberOfBeneficiaries: true
      }
    });

    // Get courses by field
    const coursesByField = await prisma.courseField.findMany({
      include: {
        _count: {
          select: { courses: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Get recent courses
    const recentCourses = await prisma.course.findMany({
      take: 5,
      orderBy: {
        courseStartDate: 'desc'
      },
      include: {
        courseField: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Get courses by month (last 6 months) - SQLite compatible
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const allCourses = await prisma.course.findMany({
      where: {
        courseStartDate: {
          gte: sixMonthsAgo
        }
      },
      select: {
        courseStartDate: true,
        numberOfGraduates: true
      }
    });

    // Group by month in JavaScript
    const coursesByMonth = allCourses.reduce((acc, course) => {
      const month = course.courseStartDate.toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { month, count: 0, graduates: 0 };
      }
      acc[month].count += 1;
      acc[month].graduates += course.numberOfGraduates;
      return acc;
    }, {});

    const monthlyData = Object.values(coursesByMonth).sort((a, b) => 
      b.month.localeCompare(a.month)
    );

    res.json({
      success: true,
      data: {
        overview: {
          totalCourses,
          totalGraduates: graduatesResult._sum.numberOfGraduates || 0,
          totalHours: hoursResult._sum.courseHours || 0,
          totalBeneficiaries: beneficiariesResult._sum.numberOfBeneficiaries || 0
        },
        coursesByField: coursesByField.map(item => ({
          id: item.id,
          name: item.name,
          count: item._count.courses
        })),
        recentCourses,
        coursesByMonth: monthlyData
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// Get field statistics
router.get('/fields', authMiddleware, async (req, res) => {
  try {
    const fieldStats = await prisma.courseField.findMany({
      include: {
        _count: {
          select: { courses: true }
        },
        courses: {
          select: {
            numberOfGraduates: true,
            numberOfBeneficiaries: true,
            courseHours: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: fieldStats.map(field => ({
        id: field.id,
        name: field.name,
        totalCourses: field._count.courses,
        totalGraduates: field.courses.reduce((sum, c) => sum + c.numberOfGraduates, 0),
        totalBeneficiaries: field.courses.reduce((sum, c) => sum + c.numberOfBeneficiaries, 0),
        totalHours: field.courses.reduce((sum, c) => sum + c.courseHours, 0)
      }))
    });

  } catch (error) {
    console.error('Get field stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching field statistics'
    });
  }
});

// Get trainer statistics
router.get('/trainers', authMiddleware, async (req, res) => {
  try {
    const allCourses = await prisma.course.findMany({
      select: {
        trainerName: true,
        trainerPhoneNumber: true,
        numberOfGraduates: true,
        courseHours: true
      }
    });

    // Group by trainer in JavaScript
    const trainerStats = allCourses.reduce((acc, course) => {
      const key = `${course.trainerName}|${course.trainerPhoneNumber}`;
      if (!acc[key]) {
        acc[key] = {
          name: course.trainerName,
          phone: course.trainerPhoneNumber,
          totalCourses: 0,
          totalGraduates: 0,
          totalHours: 0
        };
      }
      acc[key].totalCourses += 1;
      acc[key].totalGraduates += course.numberOfGraduates;
      acc[key].totalHours += course.courseHours;
      return acc;
    }, {});

    const data = Object.values(trainerStats).sort((a, b) => 
      b.totalCourses - a.totalCourses
    );

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Get trainer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trainer statistics'
    });
  }
});

// Get yearly statistics
router.get('/yearly/:year?', authMiddleware, async (req, res) => {
  try {
    const year = parseInt(req.params.year) || new Date().getFullYear();
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    const yearlyStats = await prisma.course.aggregate({
      where: {
        courseStartDate: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      },
      _sum: {
        numberOfGraduates: true,
        numberOfBeneficiaries: true,
        courseHours: true
      }
    });

    // Get monthly breakdown
    const yearCourses = await prisma.course.findMany({
      where: {
        courseStartDate: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        courseStartDate: true,
        numberOfGraduates: true,
        courseHours: true
      }
    });

    // Group by month
    const monthlyBreakdown = yearCourses.reduce((acc, course) => {
      const month = course.courseStartDate.getMonth() + 1;
      if (!acc[month]) {
        acc[month] = { month, courses: 0, graduates: 0, hours: 0 };
      }
      acc[month].courses += 1;
      acc[month].graduates += course.numberOfGraduates;
      acc[month].hours += course.courseHours;
      return acc;
    }, {});

    const monthlyData = Object.values(monthlyBreakdown).sort((a, b) => 
      a.month - b.month
    );

    res.json({
      success: true,
      data: {
        year,
        overview: {
          totalCourses: yearlyStats._count.id,
          totalGraduates: yearlyStats._sum.numberOfGraduates || 0,
          totalBeneficiaries: yearlyStats._sum.numberOfBeneficiaries || 0,
          totalHours: yearlyStats._sum.courseHours || 0
        },
        monthlyBreakdown: monthlyData
      }
    });

  } catch (error) {
    console.error('Get yearly stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching yearly statistics'
    });
  }
});

module.exports = router;