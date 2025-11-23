// src/services/courses.ts
import api from "@/services/api";

export type Course = {
  id: number;
  courseNumber: string;
  courseCode: string;
  courseFieldId: number;
  courseName: string;
  numberOfBeneficiaries: number;
  numberOfGraduates: number;
  courseDuration: number;
  courseHours: number;
  courseVenue: string;
  courseStartDate: string;
  courseEndDate: string;
  trainerName: string;
  trainerPhoneNumber: string;
  notes?: string;
  courseField: { id: number; name: string };
  images: Array<{ id: number; url: string; altText?: string }>;
  documents: Array<{
    id: number;
    type: string;
    fileName: string;
    path: string;
  }>;
};

export type CourseFormData = {
  courseNumber: string;
  courseCode: string;
  courseFieldId: number;
  courseName: string;
  numberOfBeneficiaries: number;
  numberOfGraduates: number;
  courseDuration: number;
  courseHours: number;
  courseVenue: string;
  courseStartDate: string;
  courseEndDate: string;
  trainerName: string;
  trainerPhoneNumber: string;
  notes?: string;
};

export type CourseListParams = {
  page?: number;
  limit?: number;
  search?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
};

// List courses with pagination
export async function listCourses(params?: CourseListParams) {
  const res = await api.get("/courses", { params });
  return res.data;
}

// Get single course
export async function getCourse(id: number) {
  const res = await api.get(`/courses/${id}`);
  return res.data.data as Course;
}

// Create course
export async function createCourse(data: CourseFormData) {
  const res = await api.post("/courses", data);
  return res.data.data as Course;
}

// Update course
export async function updateCourse(id: number, data: Partial<CourseFormData>) {
  const res = await api.put(`/courses/${id}`, data);
  return res.data.data as Course;
}

// Delete course
export async function deleteCourse(id: number) {
  await api.delete(`/courses/${id}`);
}

// Upload images
export async function uploadCourseImages(courseId: number, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  const res = await api.post(`/courses/${courseId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

// Delete image
export async function deleteCourseImage(courseId: number, imageId: number) {
  await api.delete(`/courses/${courseId}/images/${imageId}`);
}

// Upload document
export async function uploadCourseDocument(
  courseId: number,
  type: string,
  file: File
) {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("type", type);

  const res = await api.post(`/courses/${courseId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

// Delete document
export async function deleteCourseDocument(
  courseId: number,
  documentId: number
) {
  await api.delete(`/courses/${courseId}/documents/${documentId}`);
}