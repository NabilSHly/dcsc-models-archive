import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";

interface Course {
  id: number;
  courseNumber: string;
  courseName: string;
  courseField: { id: number; name: string };
  trainerName: string;
  courseStartDate: string;
  numberOfGraduates: number;
  numberOfBeneficiaries: number;
}

interface CourseTableProps {
  courses: Course[];
}

export const CourseTable = ({ courses = [] }: CourseTableProps) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-start">رقم الدورة التدريبية</TableHead>
            <TableHead className="text-start">اسم الدورة التدريبية</TableHead>
            <TableHead className="text-start">المجال</TableHead>
            <TableHead className="text-start">المدرب</TableHead>
            <TableHead className="text-start">تاريخ البدء</TableHead>
            <TableHead className="text-start">الخريجون</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!Array.isArray(courses) || courses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                لم يتم العثور على دورات
              </TableCell>
            </TableRow>
          ) : (
            courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.courseNumber}</TableCell>
                <TableCell>{course.courseName}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {course.courseField?.name || 'غير محدد'}
                  </Badge>
                </TableCell>
                <TableCell>{course.trainerName}</TableCell>
                <TableCell>{formatDate(course.courseStartDate)}</TableCell>
                <TableCell>
                  <span className="font-semibold text-primary">
                    {course.numberOfGraduates}
                  </span>
                  <span className="text-muted-foreground">
                    /{course.numberOfBeneficiaries}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    عرض
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};