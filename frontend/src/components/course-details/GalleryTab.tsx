// frontend/src/components/course-details/GalleryTab.tsx
import type { Course } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { getAssetUrl } from "@/lib/assets";

interface GalleryTabProps {
  course: Course;
}

export const GalleryTab = ({ course }: GalleryTabProps) => {
  return (
    <div className="pt-6">
      {course.images.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">لم يتم رفع أي صور بعد</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {course.images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <img
                src={getAssetUrl(image.url)}
                alt={image.altText || "صورة الدورة التدريبية"}
                className="h-64 w-full object-cover transition-transform hover:scale-105"
               
              />
              {image.altText && (
                <div className="p-3">
                  <p className="text-sm text-muted-foreground">{image.altText}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};