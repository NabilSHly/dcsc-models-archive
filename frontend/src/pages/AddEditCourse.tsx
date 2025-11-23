import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CourseForm } from "@/components/CourseForm";
import { getCourse } from "@/services/courses";
import { listFields } from "@/services/fields";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import type { Course } from "@/services/courses";
import type { Field } from "@/services/fields";

const AddEditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [course, setCourse] = useState<Course | undefined>(undefined);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Always fetch fields
        const fieldsData = await listFields();
        setFields(fieldsData);

        // Fetch course if editing
        if (isEdit && id) {
          const courseData = await getCourse(Number(id));
          setCourse(courseData);
        }
      } catch (err: any) {
        const message = err?.response?.data?.message || "تعذر تحميل البيانات";
        toast.error(message);
        navigate("/");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </Card>
      </div>
    );
  }

  // If editing but no course found
  if (isEdit && !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">لم يتم العثور على الدورة التدريبية</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            العودة إلى لوحة التحكم
          </Button>
        </Card>
      </div>
    );
  }

  // If no fields available
  if (fields.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            العودة إلى لوحة التحكم
          </Button>
        </div>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            لا توجد مجالات متاحة. يجب إضافة مجال واحد على الأقل قبل إنشاء دورة.
          </p>
          <Button onClick={() => navigate("/settings")}>
            الذهاب إلى الإعدادات
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          العودة إلى لوحة التحكم
        </Button>
      </div>

      <Card className="p-6">
        <h1 className="mb-6 text-3xl font-bold text-foreground">
          {isEdit ? "تعديل الدورة التدريبية" : "إضافة دورة جديدة"}
        </h1>
        <CourseForm course={course} fields={fields} />
      </Card>
    </div>
  );
};

export default AddEditCourse;