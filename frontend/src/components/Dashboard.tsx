import { useState, useEffect } from "react";
import { BookOpen, Users, Clock, Plus, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { CourseTable } from "./CourseTable";
import { useNavigate } from "react-router-dom";
import { listCourses } from "@/services/courses";
import { getDashboardStats } from "@/services/stats";
import { toast } from "@/components/ui/sonner";

export const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalGraduates: 0,
    totalHours: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const navigate = useNavigate();

  // Fetch dashboard stats
  useEffect(() => {
    (async () => {
      try {
        const data = await getDashboardStats();
        setStats(data.overview);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    })();
  }, []);

  // Fetch courses
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await listCourses({
          page,
          limit: 10,
          search: searchQuery,
        });
        setCourses(response.data);
        setTotalPages(response.pagination.totalPages);
      } catch (err) {
        toast.error("فشل تحميل الدورات");
      } finally {
        setLoading(false);
      }
    })();
  }, [page, searchQuery]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">إجمالي الدورات</p>
              <p className="text-3xl font-bold text-foreground">{stats.totalCourses}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <Users className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">إجمالي الخريجين</p>
              <p className="text-3xl font-bold text-foreground">{stats.totalGraduates}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Clock className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">إجمالي الساعات</p>
              <p className="text-3xl font-bold text-foreground">{stats.totalHours}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-foreground">أرشيف الدورات</h2>
          <Button onClick={() => navigate("/add-course")} className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة دورة جديدة
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="البحث باسم الدورة التدريبية أو الرقم أو المدرب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
        ) : (
          <>
            <CourseTable courses={courses} />
            
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  السابق
                </Button>
                <span className="flex items-center px-4">
                  صفحة {page} من {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};