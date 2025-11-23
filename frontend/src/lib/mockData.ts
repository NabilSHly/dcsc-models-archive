export interface Course {
  id: number;
  courseNumber: string;
  courseCode: string;
  courseField: string;
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
  images: { id: number; url: string; altText?: string }[];
  documents: {
    id: number;
    type: 'TRAINEES_DATA_FORM' | 'TRAINER_DATA_FORM' | 'ATTENDANCE_FORM' | 'GENERAL_REPORT_FORM' | 'COURSE_CERTIFICATE';
    fileName: string;
    path: string;
  }[];
}

export const mockCourses: Course[] = [
  {
    id: 1,
    courseNumber: "MDC-2024-001",
    courseCode: "GOV-ADM-101",
    courseField: "الحوكمة البلدية",
    courseName: "أساسيات إدارة الحكومة المحلية",
    numberOfBeneficiaries: 45,
    numberOfGraduates: 42,
    courseDuration: 5,
    courseHours: 40,
    courseVenue: "مركز التدريب البلدي، القاعة الرئيسية",
    courseStartDate: "2024-01-15",
    courseEndDate: "2024-01-19",
    trainerName: "د. أحمد حسن",
    trainerPhoneNumber: "100 123 4567 20+",
    notes: "مشاركة ممتازة. موصى به لتدريب متقدم متابعة.",
    images: [
      { id: 1, url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87", altText: "جلسة تدريبية جارية" },
      { id: 2, url: "https://images.unsplash.com/photo-1591115765373-5207764f72e7", altText: "نشاط مناقشة جماعية" },
      { id: 3, url: "https://images.unsplash.com/photo-1552664730-d307ca884978", altText: "حفل الشهادات" }
    ],
    documents: [
      { id: 1, type: 'TRAINEES_DATA_FORM', fileName: 'trainees_data.pdf', path: '/documents/mdc-2024-001/trainees_data.pdf' },
      { id: 2, type: 'TRAINER_DATA_FORM', fileName: 'trainer_data.pdf', path: '/documents/mdc-2024-001/trainer_data.pdf' },
      { id: 3, type: 'ATTENDANCE_FORM', fileName: 'attendance.pdf', path: '/documents/mdc-2024-001/attendance.pdf' },
      { id: 4, type: 'GENERAL_REPORT_FORM', fileName: 'general_report.pdf', path: '/documents/mdc-2024-001/general_report.pdf' },
      { id: 5, type: 'COURSE_CERTIFICATE', fileName: 'certificates.pdf', path: '/documents/mdc-2024-001/certificates.pdf' }
    ]
  },
  {
    id: 2,
    courseNumber: "MDC-2024-002",
    courseCode: "FIN-MGT-201",
    courseField: "الإدارة المالية",
    courseName: "تخطيط الموازنة البلدية والرقابة المالية",
    numberOfBeneficiaries: 38,
    numberOfGraduates: 35,
    courseDuration: 3,
    courseHours: 24,
    courseVenue: "المكتب الإقليمي، قاعة المؤتمرات أ",
    courseStartDate: "2024-02-05",
    courseEndDate: "2024-02-07",
    trainerName: "أ. فاطمة السيد",
    trainerPhoneNumber: "101 234 5678 20+",
    notes: "مشاركة قوية مع تمارين محاكاة الموازنة.",
    images: [
      { id: 4, url: "https://images.unsplash.com/photo-1573164713988-8665fc963095", altText: "ورشة عمل التخطيط المالي" },
      { id: 5, url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40", altText: "جلسة تحليل الموازنة" }
    ],
    documents: [
      { id: 6, type: 'TRAINEES_DATA_FORM', fileName: 'trainees_data.pdf', path: '/documents/mdc-2024-002/trainees_data.pdf' },
      { id: 7, type: 'TRAINER_DATA_FORM', fileName: 'trainer_data.pdf', path: '/documents/mdc-2024-002/trainer_data.pdf' },
      { id: 8, type: 'ATTENDANCE_FORM', fileName: 'attendance.pdf', path: '/documents/mdc-2024-002/attendance.pdf' },
      { id: 9, type: 'GENERAL_REPORT_FORM', fileName: 'general_report.pdf', path: '/documents/mdc-2024-002/general_report.pdf' }
    ]
  },
  {
    id: 3,
    courseNumber: "MDC-2024-003",
    courseCode: "DEC-DEV-150",
    courseField: "اللامركزية",
    courseName: "استراتيجيات وتنفيذ اللامركزية",
    numberOfBeneficiaries: 52,
    numberOfGraduates: 50,
    courseDuration: 7,
    courseHours: 56,
    courseVenue: "معهد التنمية المركزي",
    courseStartDate: "2024-03-10",
    courseEndDate: "2024-03-16",
    trainerName: "أ.د. محمد إبراهيم",
    trainerPhoneNumber: "102 345 6789 20+",
    notes: "تغطية شاملة. تقييمات عالية من المشاركين.",
    images: [
      { id: 6, url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644", altText: "حفل الافتتاح" },
      { id: 7, url: "https://images.unsplash.com/photo-1531482615713-2afd69097998", altText: "جلسة تعليمية تفاعلية" },
      { id: 8, url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f", altText: "تمرين التعاون الجماعي" }
    ],
    documents: [
      { id: 10, type: 'TRAINEES_DATA_FORM', fileName: 'trainees_data.pdf', path: '/documents/mdc-2024-003/trainees_data.pdf' },
      { id: 11, type: 'TRAINER_DATA_FORM', fileName: 'trainer_data.pdf', path: '/documents/mdc-2024-003/trainer_data.pdf' },
      { id: 12, type: 'ATTENDANCE_FORM', fileName: 'attendance.pdf', path: '/documents/mdc-2024-003/attendance.pdf' },
      { id: 13, type: 'GENERAL_REPORT_FORM', fileName: 'general_report.pdf', path: '/documents/mdc-2024-003/general_report.pdf' },
      { id: 14, type: 'COURSE_CERTIFICATE', fileName: 'certificates.pdf', path: '/documents/mdc-2024-003/certificates.pdf' }
    ]
  }
];

export const getDocumentTypeName = (type: string): string => {
  const names: Record<string, string> = {
    TRAINEES_DATA_FORM: "نموذج بيانات المتدربين",
    TRAINER_DATA_FORM: "نموذج بيانات المدرب",
    ATTENDANCE_FORM: "نموذج الحضور",
    GENERAL_REPORT_FORM: "التقرير العام",
    COURSE_CERTIFICATE: "شهادة الدورة التدريبية"
  };
  return names[type] || type;
};
