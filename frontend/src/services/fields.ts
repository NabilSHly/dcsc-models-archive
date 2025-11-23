// src/services/fields.ts
import api from "@/services/api";

export type Field = { id: number; name: string };
export type FieldWithCount = Field & { _count?: { courses: number } };

export async function listFields(params?: { search?: string; includeCount?: boolean }) {
  const res = await api.get("/fields", {
    params: { ...params, includeCount: String(params?.includeCount ?? false) },
  });
  const payload = res?.data?.data ?? res?.data;      // ← يدعم API يعيد data أو data.data
  return Array.isArray(payload) ? (payload as FieldWithCount[]) : []; // ← يضمن مصفوفة
}

export async function createField(name: string) {
  const res = await api.post("/fields", { name });
  return (res?.data?.data ?? res?.data) as Field;     // ← اتساق مع الـ API
}

export async function deleteField(id: number) {
  await api.delete(`/fields/${id}`);
}

export async function getField(id: number) {
  const res = await api.get(`/fields/${id}`);
  return res.data.data as FieldWithCount;             // كما كان
}
