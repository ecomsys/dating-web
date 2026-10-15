// app/(web)/user/[slug]/_components/photo-gallery.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Camera, User, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Photo {
  id: number;
  thumb_url: string;
  large_url: string;
  medium_url: string;
  is_primary: boolean;
  album_name?: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  isPremium: boolean;
  name: string;
  isAuth: boolean;
  onGuestClick?: () => void;
}

export function PhotoGallery({ photos, isPremium, name, isAuth, onGuestClick }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalPhotos = photos.length;
  
  const handlePhotoClick = (index: number) => {
    if (!isAuth) {
      onGuestClick?.();
      return;
    }
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % totalPhotos);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  };

  if (totalPhotos === 0) {
    return (
      <div className="w-full flex flex-col gap-4">
        <div className="relative rounded-sm overflow-hidden">
          <div className="aspect-[3/4] bg-muted flex items-center justify-center">
            <User className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className={cn("relative rounded-sm overflow-hidden", isPremium && "border-4 border-yellow-400 shadow-lg shadow-yellow-400/30")}>
        {/* Главное фото */}
        <div 
          className="aspect-[3/4] bg-muted relative cursor-pointer group"
          onClick={() => handlePhotoClick(0)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={photos[0].large_url} 
            alt={name} 
            className="absolute inset-0 w-full h-full object-cover group-hover:opacity-90 transition-opacity"
          />
          
          {/* Счетчик фото */}
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 flex items-center gap-1 backdrop-blur-sm z-10 rounded-sm">
            <Camera className="w-3 h-3" />
            <span>{totalPhotos}</span>
          </div>

          {/* Корона VIP */}
          {isPremium && (
            <div className="absolute bottom-0 right-0 w-16 h-16 z-20 pointer-events-none">
              <div style={{ width: 0, height: 0, borderTop: '4rem solid transparent', borderBottom: '4rem solid #facc15', borderLeft: '4rem solid transparent' }}></div>
              <svg className="absolute bottom-2 right-2 w-6 h-6 text-black z-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 16L3 5l5.5 4L12 4l3.5 5L21 5l-2 11H5zm0 2h14v2H5v-2z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Тумбнейлы */}
      {totalPhotos > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {photos.slice(0, 5).map((photo, index) => (
            <div 
              key={photo.id} 
              className="aspect-square bg-muted rounded-sm overflow-hidden cursor-pointer relative group"
              onClick={() => handlePhotoClick(index)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.thumb_url} alt={name} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
              {photo.is_primary && (
                <span className="absolute bottom-0 right-0 bg-primary text-primary-foreground text-[8px] font-bold px-1 py-0.5">AV</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Лайтбокс */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-border">
          <div className="relative flex items-center justify-center h-[80vh]">
            <button onClick={(e) => prevPhoto(e)} className="absolute left-4 text-white/70 hover:text-white z-10 p-2 bg-black/40 rounded-full backdrop-blur-sm">
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={photos[currentIndex].large_url} 
              alt={name} 
              className="max-h-full max-w-full object-contain"
            />

            <button onClick={(e) => nextPhoto(e)} className="absolute right-4 text-white/70 hover:text-white z-10 p-2 bg-black/40 rounded-full backdrop-blur-sm">
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute top-4 right-4 text-white/70 hover:text-white">
              <button onClick={() => setLightboxOpen(false)}>
                <X className="w-8 h-8" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}