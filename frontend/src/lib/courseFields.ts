const COURSE_FIELDS_KEY = 'courseFields';

export interface CourseField {
  id: number;
  name: string;
}

export const getDefaultCourseFields = (): CourseField[] => [
  { id: 1, name: " البلدية" },
  { id: 2, name: "الإدارة المالية" },
  { id: 3, name: "اللامركزية" },
];

export const getCourseFields = (): CourseField[] => {
  const stored = localStorage.getItem(COURSE_FIELDS_KEY);
  if (!stored) {
    const defaults = getDefaultCourseFields();
    localStorage.setItem(COURSE_FIELDS_KEY, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(stored);
};

export const addCourseField = (name: string): CourseField => {
  const fields = getCourseFields();
  const newId = fields.length > 0 ? Math.max(...fields.map(f => f.id)) + 1 : 1;
  const newField: CourseField = { id: newId, name };
  const updatedFields = [...fields, newField];
  localStorage.setItem(COURSE_FIELDS_KEY, JSON.stringify(updatedFields));
  return newField;
};

export const deleteCourseField = (id: number): void => {
  const fields = getCourseFields();
  const updatedFields = fields.filter(f => f.id !== id);
  localStorage.setItem(COURSE_FIELDS_KEY, JSON.stringify(updatedFields));
};
