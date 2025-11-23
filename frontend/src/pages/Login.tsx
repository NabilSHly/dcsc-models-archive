'use client'

import { useContext, useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from 'lucide-react'
import AuthContext from "@/context/AuthContext";
import api from "@/services/api";

export default function Login() {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    const trimmed = password.trim();
    if (!trimmed) return;

    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", { password: trimmed });

      if (res?.data?.success && res?.data?.token) {
        const ok = login(res.data.token);

        if (ok) {
          toast({
            title: "تم تسجيل الدخول",
            description: "تم تسجيل الدخول بنجاح.",
          });
          window.location.href = "/";
        } else {
          toast({
            title: "فشل تسجيل الدخول",
            description: "انتهت صلاحية التذكرة أو غير صالحة.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "فشل تسجيل الدخول",
          description:
            res?.data?.message || "كلمة المرور غير صحيحة. حاول مرة أخرى.",
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message =
        error.response?.data?.message ||
        "حدث خطأ أثناء محاولة تسجيل الدخول. حاول مرة أخرى.";

      toast({
        title: "فشل تسجيل الدخول",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader dir="rtl" className="space-y-6 pb-6">
          <div className="flex items-center justify-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 p-3 shadow-sm transition-transform hover:scale-105 sm:h-24 sm:w-24">
              <img
                src="/cropped-log1o.png"
                alt="شعار مركز تطوير البلديات ودعم اللامركزية"
                className="h-full w-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 p-3 shadow-sm transition-transform hover:scale-105 sm:h-24 sm:w-24">
              <img
                src="/Untitled-1.png"
                alt="شعار تطوير"
                className="h-full w-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          <div className="space-y-3 text-center">
            <CardTitle className="text-balance text-2xl font-bold leading-tight sm:text-3xl">
              نظام أرشفة النماذج التدريبية
            </CardTitle>
            <p className="text-base font-medium text-primary sm:text-lg">
              مركز تطوير البلديات و دعم اللامركزية
            </p>
            <CardDescription className="text-sm text-muted-foreground sm:text-base">
              أدخل كلمة المرور للدخول إلى النظام
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            aria-busy={isLoading}
            autoComplete="on"
          >
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  autoFocus
                  required
                  minLength={3}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
                  aria-pressed={showPw}
                  className="absolute inset-y-0 right-3 flex items-center"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
