// frontend/src/components/course-details/DocumentsTab.tsx
import { useState } from "react";
import { FileText, Download, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAssetUrl } from "@/lib/assets";

interface Document {
  id: number;
  type: string;
  fileName?: string;
  path: string;
}

interface Course {
  documents: Document[];
}

interface DocumentsTabProps {
  course: Course;
}

const getDocumentTypeName = (type: string): string => {
  const names: Record<string, string> = {
    TRAINEES_DATA_FORM: "نموذج بيانات المتدربين",
    TRAINER_DATA_FORM: "نموذج بيانات المدرب",
    ATTENDANCE_FORM: "نموذج الحضور",
    GENERAL_REPORT_FORM: "نموذج التقرير العام للدورة التدريبية",
    COURSE_CERTIFICATE: "شهائد الدورة التدريبية"
  };
  return names[type] || type;
};

export const DocumentsTab = ({ course }: DocumentsTabProps) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  const documentsByType = (course.documents || []).reduce((acc, doc) => {
    if (!acc[doc.type]) {
      acc[doc.type] = [];
    }
    acc[doc.type].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  const documentTypes = Object.keys(documentsByType);

  const handleDownload = (doc: Document) => {
    const url = getAssetUrl(doc.path);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.fileName || 'document.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pt-6">
      {documentTypes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">لم يتم رفع أي مستندات بعد</p>
        </Card>
      ) : (
        documentTypes.map((type) => {
          const docs = documentsByType[type];
          const docCount = docs.length;
          
          return (
            <Card key={type} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{getDocumentTypeName(type)}</p>
                    <p className="text-sm text-muted-foreground">
                      {docCount} {docCount === 1 ? 'ملف' : 'ملفات'}
                    </p>
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setSelectedType(type)}>
                      <Eye className="h-4 w-4" />
                      عرض
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{getDocumentTypeName(type)}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                      {docs.map((doc) => (
                        <Card key={doc.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                              <p className="text-sm text-foreground truncate">
                                {doc.fileName || 'مستند'}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-2 flex-shrink-0"
                              onClick={() => handleDownload(doc)}
                            >
                              <Eye className="h-4 w-4" />
                              عرض
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
};