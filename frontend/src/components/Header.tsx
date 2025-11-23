import { GraduationCap, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { logout } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useContext } from "react";
import AuthContext from "@/context/AuthContext";


export const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useContext(AuthContext);
  const handleLogout = () => {
    logout();
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل الخروج بنجاح.",
    });
    navigate("/login");
  };

  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 shrink-0 rounded-full bg-primary/10 p-1 ">
                <img
                  src="/Untitled-1.png"
                  alt="شعار تطوير"
                         className="h-full w-full object-contain"

                  loading="lazy"
                  decoding="async"
                />
              </div>
           <div className="relative h-16 w-16 shrink-0 rounded-full bg-primary/10 p-1 ">
      <img
        src="/cropped-log1o.png"
        alt="شعار مركز تطوير البلديات ودعم اللامركزية"
        className="h-full w-full object-contain"
        loading="lazy"
        decoding="async"
      />
       
    </div>
    
          <div>
            <h1 className="text-xl font-bold text-foreground">
              مركز تطوير البلديات و دعم اللامركزية
            </h1>
            <p className="text-sm text-muted-foreground">نظام أرشفة و إدارة الدورات التدريبية</p>
          </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate("/settings")} title="الإعدادات">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleLogout} title="تسجيل الخروج">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
