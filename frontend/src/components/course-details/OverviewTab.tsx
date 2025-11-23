import { Calendar, MapPin, Clock, Code, User, Phone, Users, Award } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Course {
  courseNumber: string;
  courseCode: string;
  courseField: { id: number; name: string };
  courseName: string;
  courseVenue: string;
  courseStartDate: string;
  courseEndDate: string;
  courseDuration: number;
  courseHours: number;
  trainerName: string;
  trainerPhoneNumber: string;
  numberOfBeneficiaries: number;
  numberOfGraduates: number;
  notes?: string;
}

interface OverviewTabProps {
  course: Course;
}

export const OverviewTab = ({ course }: OverviewTabProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  const completionRate = course.numberOfBeneficiaries > 0
    ? ((course.numberOfGraduates / course.numberOfBeneficiaries) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6 pt-6">
      {/* Course Information Section */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground text-center">معلومات الدورة التدريبية</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">كود الدورة التدريبية</label>
            <div className="flex items-center gap-2 text-foreground">
              <Code className="h-4 w-4 text-primary" />
              <span className="font-mono">{course.courseCode}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">المجال</label>
            <div className="rounded-md bg-secondary/10 px-3 py-2 text-secondary">
              {course.courseField?.name || 'غير محدد'}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">المكان</label>
            <div className="flex items-center gap-2 text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{course.courseVenue}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">تاريخ البدء</label>
            <div className="flex items-center gap-2 text-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{formatDate(course.courseStartDate)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">تاريخ الانتهاء</label>
            <div className="flex items-center gap-2 text-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{formatDate(course.courseEndDate)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">المدة</label>
            <div className="flex items-center gap-2 text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>{course.courseDuration} أيام ({course.courseHours} ساعة)</span>
            </div>
          </div>
        </div>

        {course.notes && (
          <div className="mt-6 space-y-2">
            <label className="text-sm font-medium text-muted-foreground">ملاحظات</label>
            <div className="rounded-md border bg-muted/50 p-4 text-foreground whitespace-pre-wrap">
              {course.notes}
            </div>
          </div>
        )}
      </div>

      {/* Trainer Information Section */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">معلومات المدرب</h3>
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">اسم المدرب</label>
                <p className="text-xl font-semibold text-foreground">{course.trainerName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">رقم الهاتف</label>
                <div className="flex items-center gap-2 text-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  <a href={`tel:${course.trainerPhoneNumber}`} className="hover:text-primary">
                    {course.trainerPhoneNumber}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Participants Section */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">المشاركون</h3>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">إجمالي المستهدفين</p>
                  <p className="text-3xl font-bold text-foreground">{course.numberOfBeneficiaries}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                  <Award className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الخريجون</p>
                  <p className="text-3xl font-bold text-foreground">{course.numberOfGraduates}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">نسبة الإتمام</p>
                <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
              </div>
              <div className="h-2 flex-1 mx-6 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};