import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card } from "./ui/card";
import { FileText, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import type { Course } from "@/services/courses";
import {
  createCourse,
  updateCourse,
  uploadCourseImages,
  uploadCourseDocument,
  deleteCourseImage,
  deleteCourseDocument,
} from "@/services/courses";

const courseSchema = z.object({
  courseNumber: z.string().min(1, "رقم الدورة التدريبية مطلوب").max(32),
  courseCode: z.string().min(1, "كود الدورة التدريبية مطلوب").max(32),
  courseFieldId: z.coerce.number().int().positive("مجال الدورة التدريبية مطلوب"),
  courseName: z.string().min(1, "اسم الدورة التدريبية مطلوب").max(128),
  numberOfBeneficiaries: z.coerce.number().min(1, "يجب أن يكون على الأقل 1"),
  numberOfGraduates: z.coerce.number().min(0, "لا يمكن أن يكون سالباً"),
  courseDuration: z.coerce.number().min(1, "يجب أن يكون يوم واحد على الأقل"),
  courseHours: z.coerce.number().min(1, "يجب أن تكون ساعة واحدة على الأقل"),
  courseVenue: z.string().min(1, "المكان مطلوب").max(128),
  courseStartDate: z.string().min(1, "تاريخ البدء مطلوب"),
  courseEndDate: z.string().min(1, "تاريخ الانتهاء مطلوب"),
  trainerName: z.string().min(1, "اسم المدرب مطلوب").max(128),
  trainerPhoneNumber: z.string().min(1, "رقم الهاتف مطلوب").max(32),
  notes: z.string().max(1000).optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseFormProps {
  course?: Course;
  fields: Array<{ id: number; name: string }>;
}

export const CourseForm = ({ course, fields = [] }: CourseFormProps) => {
  const navigate = useNavigate();

  // Early return if no fields
  if (!Array.isArray(fields) || fields.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground mb-4">
          لا توجد مجالات متاحة. يرجى إضافة مجال أولاً من صفحة الإعدادات.
        </p>
        <Button onClick={() => navigate("/settings")}>
          الذهاب إلى الإعدادات
        </Button>
      </Card>
    );
  }
  const [images, setImages] = useState<File[]>([]);
  const [documents, setDocuments] = useState<{
    TRAINEES_DATA_FORM?: File[];
    TRAINER_DATA_FORM?: File[];
    ATTENDANCE_FORM?: File[];
    GENERAL_REPORT_FORM?: File[];
    COURSE_CERTIFICATE?: File[];
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
// inside the component
const [existingImages, setExistingImages] = useState(course?.images ?? []);
const [existingDocuments, setExistingDocuments] = useState(course?.documents ?? []);

useEffect(() => {
  setExistingImages(course?.images ?? []);
  setExistingDocuments(course?.documents ?? []);
}, [course]);

const getAssetUrl = (p: string) => {
  const base = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
  return p.startsWith("/") ? `${base}${p}` : `${base}/${p}`;
};


  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: course
      ? {
          courseNumber: course.courseNumber ?? "",
          courseCode: course.courseCode ?? "",
          courseFieldId: course.courseFieldId ?? 0,
          courseName: course.courseName ?? "",
          numberOfBeneficiaries: course.numberOfBeneficiaries ?? 0,
          numberOfGraduates: course.numberOfGraduates ?? 0,
          courseDuration: course.courseDuration ?? 1,
          courseHours: course.courseHours ?? 0,
          courseVenue: course.courseVenue ?? "",
          courseStartDate: course.courseStartDate ? course.courseStartDate.split('T')[0] : "",
          courseEndDate: course.courseEndDate ? course.courseEndDate.split('T')[0] : "",
          trainerName: course.trainerName ?? "",
          trainerPhoneNumber: course.trainerPhoneNumber ?? "",
          notes: course.notes ?? "",
        }
      : {
          courseNumber: "",
          courseCode: "",
          courseFieldId: 0,
          courseName: "",
          numberOfBeneficiaries: 0,
          numberOfGraduates: 0,
          courseDuration: 1,
          courseHours: 0,
          courseVenue: "",
          courseStartDate: "",
          courseEndDate: "",
          trainerName: "",
          trainerPhoneNumber: "",
          notes: "",
        },
  });

  const handleFileChange = (
    type: keyof typeof documents,
    files: FileList | null
  ) => {
    if (files) {
      const fileArray = Array.from(files);
      setDocuments((prev) => ({
        ...prev,
        [type]: [...(prev[type] || []), ...fileArray],
      }));
    }
  };
// images
const handleDeleteExistingImage = async (imageId: number) => {
  if (!course) return;
  await deleteCourseImage(course.id, imageId);
  setExistingImages(prev => prev.filter(i => i.id !== imageId));
  toast.success("تم حذف الصورة");
};

// documents
const handleDeleteExistingDocument = async (documentId: number) => {
  if (!course) return;
  await deleteCourseDocument(course.id, documentId);
  setExistingDocuments(prev => prev.filter(d => d.id !== documentId));
  toast.success("تم حذف المستند");
};

  const removeDocument = (type: keyof typeof documents, index: number) => {
    setDocuments((prev) => ({
      ...prev,
      [type]: prev[type]?.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setImages((prev) => [...prev, ...fileArray]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CourseFormValues) => {
    setIsSubmitting(true);
    try {
      let savedCourse;
      
      // Create or update course
      if (course) {
        savedCourse = await updateCourse(course.id, data);
        toast.success("تم تحديث الدورة التدريبية بنجاح");
      } else {
        savedCourse = await createCourse(data);
        toast.success("تم إنشاء الدورة التدريبية بنجاح");
      }

      // Upload images if any
      if (images.length > 0) {
        await uploadCourseImages(savedCourse.id, images);
      }

      // Upload documents if any
      for (const [type, files] of Object.entries(documents)) {
        if (files && files.length > 0) {
          for (const file of files) {
            await uploadCourseDocument(savedCourse.id, type, file);
          }
        }
      }

      navigate(`/course/${savedCourse.id}`);
    } catch (error: any) {
      const message = error?.response?.data?.message || "حدث خطأ أثناء حفظ الدورة";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const documentTypes = [
    { key: "TRAINEES_DATA_FORM", label: "نماذج بيانات المتدربين" },
    { key: "TRAINER_DATA_FORM", label: "نموذج بيانات المدرب" },
    { key: "ATTENDANCE_FORM", label: "نماذج الحضور" },
    { key: "GENERAL_REPORT_FORM", label: "نموذج التقرير العام" },
    { key: "COURSE_CERTIFICATE", label: "شهائد الدورة التدريبية" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="courseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الدورة التدريبية *</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: MDC-2024-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courseCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>كود الدورة التدريبية *</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: GOV-ADM-101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courseFieldId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المجال *</FormLabel>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المجال" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {fields.map((f) => (
                      <SelectItem key={f.id} value={String(f.id)}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courseName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم الدورة التدريبية *</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل اسم الدورة التدريبية" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courseVenue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المكان *</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: مركز التدريب، القاعة الرئيسية" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courseStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ البدء *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courseEndDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ الانتهاء *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courseDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المدة (أيام) *</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courseHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>إجمالي الساعات *</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numberOfBeneficiaries"
            render={({ field }) => (
              <FormItem>
                <FormLabel>عدد المستهدفين *</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numberOfGraduates"
            render={({ field }) => (
              <FormItem>
                <FormLabel>عدد الخريجين *</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trainerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم المدرب *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trainerPhoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم هاتف المدرب *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ملاحظات (اختياري)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="أضف أي ملاحظات أو ملاحظات إضافية..."
                  className="min-h-[64px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

       {/* --- صور الدورة التدريبية (تعرض الموجود + تسمح بإضافة صور جديدة) --- */}
<Card className="p-6">
  <div className="mb-4 flex items-center gap-2">
    <ImageIcon className="h-5 w-5 text-primary" />
    <h3 className="text-lg font-semibold text-foreground">صور الدورة التدريبية</h3>
  </div>

  {/* صور موجودة مسبقاً (وضع التعديل) */}
  {course && existingImages.length > 0 && (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
    {existingImages.map((img) => (
      <div key={img.id} className="relative group">
        <div className="aspect-video rounded-lg bg-muted overflow-hidden">
          <img
            src={getAssetUrl(img.url)}
            alt={img.altText || "صورة الدورة"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
        </div>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 left-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => handleDeleteExistingImage(img.id)}
          title="حذف"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    ))}
  </div>
)}
  {/* إضافة صور جديدة */}
  <Input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => handleImageChange(e.target.files)}
    className="cursor-pointer mb-4"
  />

  {images.length > 0 && (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <div key={index} className="relative group">
          <div className="aspect-video rounded-lg bg-muted overflow-hidden">
            <img
              src={URL.createObjectURL(image)}
              alt={`صورة ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 left-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => removeImage(index)}
            title="إزالة من الرفع الحالي"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )}
</Card>

{/* --- مستندات الدورة التدريبية (تعرض الموجود بحسب النوع + تسمح بإضافة المزيد) --- */}
<Card className="p-6">
  <div className="mb-4 flex items-center gap-2">
    <FileText className="h-5 w-5 text-primary" />
    <h3 className="text-lg font-semibold text-foreground">مستندات الدورة التدريبية</h3>
  </div>

  <div className="space-y-6">
    {documentTypes.map(({ key, label }) => {
      const existingForType = course
        ? existingDocuments.filter((d) => d.type === key)
        : [];
      return (
        <div key={key}>
          <label className="mb-2 block text-sm font-medium text-foreground">
            {label}
          </label>

          {/* مستندات موجودة مسبقاً (وضع التعديل) */}
          {existingForType.length > 0 && (
            <div className="space-y-2 mb-3">
              {existingForType.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <a
                      className="text-sm text-foreground truncate underline"
                      href={getAssetUrl(doc.path)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {doc.fileName || "document.pdf"}
                    </a>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => handleDeleteExistingDocument(doc.id)}
                    title="حذف"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* رفع مستندات جديدة لهذا النوع */}
          <Input
            type="file"
            accept=".pdf"
            multiple
            onChange={(e) =>
              handleFileChange(key as keyof typeof documents, e.target.files)
            }
            className="cursor-pointer mb-2"
          />

          {documents[key as keyof typeof documents]?.length ? (
            <div className="space-y-2 mt-3">
              {documents[key as keyof typeof documents]!.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground truncate">
                      {file.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() =>
                      removeDocument(key as keyof typeof documents, index)
                    }
                    title="إزالة من الرفع الحالي"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      );
    })}
  </div>
</Card>


        <div className="flex gap-4">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting 
              ? "جاري الحفظ..." 
              : course 
                ? "تحديث الدورة التدريبية" 
                : "إنشاء الدورة التدريبية"
            }
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate("/")}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </Form>
  );
};