// src/services/stats.ts
import api from "@/services/api";

export type DashboardStats = {
  overview: {
    totalCourses: number;
    totalGraduates: number;
    totalHours: number;
    totalBeneficiaries: number;
  };
  coursesByField: Array<{
    id: number;
    name: string;
    count: number;
  }>;
  recentCourses: Array<{
    id: number;
    courseNumber: string;
    courseName: string;
    courseField: { id: number; name: string };
    courseStartDate: string;
    courseEndDate: string;
    numberOfGraduates: number;
  }>;
  coursesByMonth: Array<{
    month: string;
    count: number;
    graduates: number;
  }>;
};

// Get dashboard statistics
export async function getDashboardStats() {
  const res = await api.get("/stats/dashboard");
  return res.data.data as DashboardStats;
}

// Get field statistics
export async function getFieldStats() {
  const res = await api.get("/stats/fields");
  return res.data.data;
}

// Get trainer statistics
export async function getTrainerStats() {
  const res = await api.get("/stats/trainers");
  return res.data.data;
}

// Get yearly statistics
export async function getYearlyStats(year?: number) {
  const res = await api.get(`/stats/yearly/${year || ""}`);
  return res.data.data;
}