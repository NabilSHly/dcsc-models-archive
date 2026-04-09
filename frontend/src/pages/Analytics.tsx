import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Clock, ChevronLeft, ChevronRight, UserCheck } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  getDashboardStats,
  getFieldStats,
  getTrainerStats,
  getYearlyStats,
} from "@/services/stats";
import type { DashboardStats } from "@/services/stats";

const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const monthlyChartConfig: ChartConfig = {
  count:     { label: "الدورات",   color: "hsl(var(--chart-1))" },
  graduates: { label: "الخريجون", color: "hsl(var(--chart-2))" },
};

const fieldChartConfig: ChartConfig = {
  count: { label: "الدورات", color: "hsl(var(--chart-3))" },
};

const yearlyChartConfig: ChartConfig = {
  courses:   { label: "الدورات",   color: "hsl(var(--chart-1))" },
  graduates: { label: "الخريجون", color: "hsl(var(--chart-2))" },
};

export default function Analytics() {
  const [loading, setLoading]           = useState(true);
  const [dashboard, setDashboard]       = useState<DashboardStats | null>(null);
  const [fieldStats, setFieldStats]     = useState<any[]>([]);
  const [trainerStats, setTrainerStats] = useState<any[]>([]);
  const [yearlyData, setYearlyData]     = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearLoading, setYearLoading]   = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [dash, fields, trainers, yearly] = await Promise.all([
          getDashboardStats(),
          getFieldStats(),
          getTrainerStats(),
          getYearlyStats(selectedYear),
        ]);
        setDashboard(dash);
        setFieldStats(fields);
        setTrainerStats(trainers);
        setYearlyData(yearly);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return;
    (async () => {
      setYearLoading(true);
      try {
        const yearly = await getYearlyStats(selectedYear);
        setYearlyData(yearly);
      } catch (err) {
        console.error("Failed to load yearly stats:", err);
      } finally {
        setYearLoading(false);
      }
    })();
  }, [selectedYear]); // eslint-disable-line react-hooks/exhaustive-deps

  const monthlyChartData = dashboard?.coursesByMonth
    ? [...dashboard.coursesByMonth]
        .reverse()
        .map((d) => ({
          ...d,
          label: ARABIC_MONTHS[parseInt(d.month.split("-")[1]) - 1],
        }))
    : [];

  const fieldBarData = (dashboard?.coursesByField ?? [])
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const yearlyMonthlyData = ARABIC_MONTHS.map((name, i) => {
    const found = yearlyData?.monthlyBreakdown?.find((m: any) => m.month === i + 1);
    return {
      month:     name,
      courses:   found?.courses   ?? 0,
      graduates: found?.graduates ?? 0,
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <p className="text-lg text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  const overview = dashboard?.overview;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      <div className="container mx-auto px-4 py-8">

        <h1 className="mb-8 text-3xl font-bold text-foreground">
          لوحة التحليلات والإحصائيات
        </h1>

        {/* ── 1. Overview cards ──────────────────────────────── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الدورات</p>
                <p className="text-3xl font-bold">{(overview?.totalCourses ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الخريجين</p>
                <p className="text-3xl font-bold">{(overview?.totalGraduates ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <UserCheck className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المستفيدين</p>
                <p className="text-3xl font-bold">{(overview?.totalBeneficiaries ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الساعات</p>
                <p className="text-3xl font-bold">{(overview?.totalHours ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* ── 2. Monthly activity + Field distribution ───────── */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">

          {/* Monthly activity bar chart */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">النشاط الشهري (آخر 6 أشهر)</h2>
            {monthlyChartData.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">لا توجد بيانات</p>
            ) : (
              <ChartContainer config={monthlyChartConfig} className="h-64 w-full">
                <BarChart
                  data={monthlyChartData}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="count"     fill="var(--color-count)"     radius={[4, 4, 0, 0]} />
                  <Bar dataKey="graduates" fill="var(--color-graduates)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </Card>

          {/* Courses by field — horizontal bar */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">الدورات حسب المجال</h2>
            {fieldBarData.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">لا توجد بيانات</p>
            ) : (
              <ChartContainer config={fieldChartConfig} className="h-64 w-full">
                <BarChart
                  layout="vertical"
                  data={fieldBarData}
                  margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 10 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </Card>
        </div>

        {/* ── 3. Yearly statistics ───────────────────────────── */}
        <Card className="mb-8 p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">الإحصائيات السنوية</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setSelectedYear((y) => y - 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="w-16 text-center text-xl font-bold">{selectedYear}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedYear((y) => y + 1)}
                disabled={selectedYear >= new Date().getFullYear()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "الدورات",    value: yearlyData?.overview?.totalCourses       ?? 0 },
              { label: "الخريجون",   value: yearlyData?.overview?.totalGraduates     ?? 0 },
              { label: "المستفيدون", value: yearlyData?.overview?.totalBeneficiaries ?? 0 },
              { label: "الساعات",    value: yearlyData?.overview?.totalHours         ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border bg-muted/30 p-4 text-center">
                <p className="mb-1 text-xs text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {yearLoading ? (
            <p className="py-8 text-center text-muted-foreground">جاري التحميل...</p>
          ) : (
            <ChartContainer config={yearlyChartConfig} className="h-64 w-full">
              <BarChart
                data={yearlyMonthlyData}
                margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="courses"   fill="var(--color-courses)"   radius={[4, 4, 0, 0]} />
                <Bar dataKey="graduates" fill="var(--color-graduates)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </Card>

        {/* ── 4. Field statistics table ──────────────────────── */}
        <Card className="mb-8 p-6">
          <h2 className="mb-4 text-lg font-semibold">تفاصيل المجالات التدريبية</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="px-3 py-2 text-right font-medium">المجال</th>
                  <th className="px-3 py-2 text-center font-medium">الدورات</th>
                  <th className="px-3 py-2 text-center font-medium">الخريجون</th>
                  <th className="px-3 py-2 text-center font-medium">المستفيدون</th>
                  <th className="px-3 py-2 text-center font-medium">الساعات</th>
                </tr>
              </thead>
              <tbody>
                {fieldStats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">لا توجد بيانات</td>
                  </tr>
                ) : (
                  fieldStats.map((f: any) => (
                    <tr key={f.id} className="border-b transition-colors hover:bg-muted/30">
                      <td className="px-3 py-2.5 font-medium">{f.name}</td>
                      <td className="px-3 py-2.5 text-center">{f.totalCourses.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-center">{f.totalGraduates.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-center">{f.totalBeneficiaries.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-center">{f.totalHours.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── 5. Trainer statistics table ────────────────────── */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">إحصائيات المدربين</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="px-3 py-2 text-right font-medium">المدرب</th>
                  <th className="px-3 py-2 text-right font-medium">الهاتف</th>
                  <th className="px-3 py-2 text-center font-medium">الدورات</th>
                  <th className="px-3 py-2 text-center font-medium">الخريجون</th>
                  <th className="px-3 py-2 text-center font-medium">الساعات</th>
                </tr>
              </thead>
              <tbody>
                {trainerStats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">لا توجد بيانات</td>
                  </tr>
                ) : (
                  trainerStats.map((t: any, i: number) => (
                    <tr key={i} className="border-b transition-colors hover:bg-muted/30">
                      <td className="px-3 py-2.5 font-medium">{t.name}</td>
                      <td className="px-3 py-2.5 text-muted-foreground" dir="ltr">{t.phone}</td>
                      <td className="px-3 py-2.5 text-center">{t.totalCourses}</td>
                      <td className="px-3 py-2.5 text-center">{t.totalGraduates.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-center">{t.totalHours.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
}
