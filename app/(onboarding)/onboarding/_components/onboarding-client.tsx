// app/(onboarding)/_components/onboarding-client.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Camera, X, Plus, Loader2 } from 'lucide-react';
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExistingPhoto {
  id: number;
  thumb_url: string;
  path_original: string; // <--- Добавили оригинал для фоллбэка
  is_primary: boolean;
  is_intimate: boolean;
}

interface NewPhoto {
  file: File;
  preview: string;
  is_intimate: boolean;
}

// Хелпер для правильных путей
const getImageUrl = (url: string) => {
  if (!url || url.startsWith('http') || url.startsWith('data:')) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost';
  return `${baseUrl}${url}`;
};

export function OnboardingClient() {
  const router = useRouter();
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([]);
  const [newPhotos, setNewPhotos] = useState<NewPhoto[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadInitialPhotos = async () => {
      try {
        const res = await api.get<{ photos: ExistingPhoto[] }>('/onboarding/photos');
        if (isMounted) setExistingPhotos(res.data.photos);
      } catch (e) {
        if (isMounted) console.error('Failed to fetch photos', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadInitialPhotos();
    return () => { isMounted = false; };
  }, []);
 

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    let addedCount = 0;
    let duplicateCount = 0;
    const newFiles: NewPhoto[] = [];

    files.forEach(file => {
      const isDuplicate = newPhotos.some(p => p.file.name === file.name && p.file.size === file.size);
      
      if (isDuplicate) {
        duplicateCount++;
      } else {
        newFiles.push({
          file,
          preview: URL.createObjectURL(file),
          is_intimate: false,
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      setNewPhotos(prev => [...prev, ...newFiles]);
      setIsPreviewOpen(true);
      toast.success(`Добавлено новых фото: ${addedCount}`);
    }
    if (duplicateCount > 0) {
      toast.error(`Пропущено дубликатов: ${duplicateCount}`);
    }

    e.target.value = ''; 
  };

  const removeNewPhoto = (index: number) => {
    URL.revokeObjectURL(newPhotos[index].preview);
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const deleteExistingPhoto = async (id: number) => {
    try {
      await api.delete(`/photos/${id}`);
      setExistingPhotos(prev => prev.filter(p => p.id !== id));
      toast.success('Фото удалено.');
    } catch (e) {
      toast.error('Ошибка удаления фото.');
    }
  };

  const toggleNewIntimate = (index: number) => {
    setNewPhotos(prev => prev.map((p, i) => i === index ? { ...p, is_intimate: !p.is_intimate } : p));
  };

  const toggleExistingIntimate = (id: number) => {
    setExistingPhotos(prev => prev.map(p => p.id === id ? { ...p, is_intimate: !p.is_intimate } : p));
  };

   const savePhotos = async () => {
    if (newPhotos.length === 0 && existingPhotos.length === 0) {
      toast.error('Добавьте хотя бы одно фото!');
      return;
    }

    setIsSaving(true);
    const formData = new FormData();

    newPhotos.forEach((photo, index) => {
      formData.append(`photos[${index}]`, photo.file);
      if (photo.is_intimate) {
        formData.append(`intimate_flags[${index}]`, '1');
      }
    });

    existingPhotos.forEach(photo => {
      if (photo.is_intimate) {
        formData.append(`existing_intimate_flags[]`, String(photo.id));
      }
    });

    try {
      const res = await api.post<{ success: boolean; redirect: string }>('/onboarding/save', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        toast.success('Фото успешно сохранены!');
        
        // 1. ЖЕЛЕЗОБЕТОННАЯ ОЧИСТКА перед переходом
        newPhotos.forEach(p => URL.revokeObjectURL(p.preview));
        setNewPhotos([]);
        setIsPreviewOpen(false);
        setIsLoading(true); // Вешаем лоадер, чтобы скрыть модалку визуально

        // 2. Используем replace, чтобы затереть историю
        setTimeout(() => router.replace(res.data.redirect), 800);
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string; errors?: Record<string, string[]> }>;
      if (err.response?.status === 422 && err.response.data.errors) {
        const firstError = Object.values(err.response.data.errors)[0]?.[0];
        toast.error(firstError || 'Ошибка валидации файлов.');
      } else {
        toast.error('Ошибка сервера при загрузке.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const skipUpload = async () => {
    setIsSaving(true);
    try {
      const res = await api.post<{ success: boolean; redirect: string }>('/onboarding/skip');
      if (res.data.success) {
        // Тоже чистим и используем replace
        newPhotos.forEach(p => URL.revokeObjectURL(p.preview));
        setNewPhotos([]);
        setIsPreviewOpen(false);
        setIsLoading(true);
        
        router.replace(res.data.redirect);
      }
    } catch (e) {
      toast.error('Ошибка сети.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100dvh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

   // Железобетонная функция закрытия модалки
  const closeModal = () => {
    newPhotos.forEach(p => URL.revokeObjectURL(p.preview));
    setNewPhotos([]);
    setIsPreviewOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        
        {/* ЛЕВАЯ КОЛОНКА (Информация) */}
        <div className="max-w-[21rem] mx-auto">
          <div className="relative w-54 h-54 mb-10 mx-auto md:mx-[initial] flex items-center justify-center">
            <div className="absolute -inset-2 rounded-full border-4 border-dashed border-primary/40"></div>
            <div className="absolute inset-0 rounded-full bg-muted flex items-center justify-center border-4 border-border">
              <Camera className="w-20 h-20 text-muted-foreground" />
            </div>
          </div>

          <ul className="space-y-1 text-sm text-muted-foreground inline-block text-left mx-auto mb-8">
            <li className="flex items-start gap-3"><span>·</span><span>НЕ загружайте фото других людей</span></li>
            <li className="flex items-start gap-3"><span>·</span><span>НЕ загружайте непристойные фото (используйте пометку 18+)</span></li>
            <li className="flex items-start gap-3"><span>·</span><span>Загрузите фото, на котором вас хорошо видно</span></li>
          </ul>
        </div>

        {/* ПРАВАЯ КОЛОНКА (Загрузка) */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Загрузите фото</h1>
          <p className="text-muted-foreground mb-8">Ваше фото — ключ к интересным знакомствам. Загрузите свои лучшие снимки!</p>               

          <label htmlFor="main-photo-input" className="cursor-pointer w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
            Выбрать фото с компьютера
          </label>
          <input id="main-photo-input" type="file" onChange={handleFiles} className="hidden" accept="image/jpeg, image/png, image/webp" multiple />

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-sm text-center text-muted-foreground mb-4">Или загрузите из соцсетей:</p>
            <div className="flex justify-center gap-4">
              <span className="text-xs text-muted-foreground/50">Соцсети скоро</span>
            </div>
          </div>

          <button onClick={skipUpload} disabled={isSaving} className="underline block w-full text-center mt-6 text-sm text-primary hover:no-underline transition-colors disabled:opacity-50">
            Я загружу фото позже
          </button>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ПРЕДПРОСМОТРА */}
      {/* Убрали onOpenChange, очистка работает через useEffect */}
      <Dialog open={isPreviewOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-3xl p-0">
          <DialogHeader className="p-6 border-b border-border space-y-0">
            <DialogTitle className="text-lg">Предпросмотр фото</DialogTitle>
            <div className="text-xs text-muted-foreground mt-1 flex gap-3">
              <span>Фотографий: {newPhotos.length + existingPhotos.length}</span>
            </div>
          </DialogHeader>

          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
            
            {/* Существующие фото */}
            {existingPhotos.length > 0 && (
              <div>
                <h4 className="text-sm text-muted-foreground uppercase font-semibold mb-3">Ваши текущие фото</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {existingPhotos.map(photo => (
                    <div key={photo.id} className="relative group border border-border rounded-lg overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getImageUrl(photo.thumb_url || photo.path_original)} className="w-full h-40 object-cover" alt="Photo" />
                      {photo.is_primary && <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded">Аватар</span>}
                      <button onClick={() => deleteExistingPhoto(photo.id)} className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1.5 rounded-md border border-border/50 inline-flex items-center gap-2">
                        <Checkbox checked={photo.is_intimate} onCheckedChange={() => toggleExistingIntimate(photo.id)} id={`existing-${photo.id}`} />
                        <label htmlFor={`existing-${photo.id}`} className="text-xs font-medium cursor-pointer select-none">18+</label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Новые фото */}
            {newPhotos.length > 0 && (
              <div>
                {existingPhotos.length > 0 && <h4 className="text-sm text-muted-foreground uppercase font-semibold mb-3">Новые фото</h4>}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {newPhotos.map((photo, index) => (
                    <div key={index} className="relative group border border-border rounded-lg overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.preview} className="w-full h-40 object-cover" alt="Preview" />
                      <button onClick={() => removeNewPhoto(index)} className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1.5 rounded-md border border-border/50 inline-flex items-center gap-2">
                        <Checkbox checked={photo.is_intimate} onCheckedChange={() => toggleNewIntimate(index)} id={`new-${index}`} />
                        <label htmlFor={`new-${index}`} className="text-xs font-medium cursor-pointer select-none">18+</label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {newPhotos.length === 0 && existingPhotos.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Фотографии не выбраны
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 p-6 border-t border-border bg-muted/30">
            <label 
              htmlFor="add-more-photos" 
              className={cn(buttonVariants({ variant: "outline" }), "flex-1 cursor-pointer")}
            >
              <Plus className="w-4 h-4" />
              Добавить ещё фото
            </label>
            <input id="add-more-photos" type="file" onChange={handleFiles} className="hidden" accept="image/jpeg, image/png, image/webp" multiple />
            
            <Button onClick={savePhotos} disabled={isSaving} className="flex-1">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isSaving ? 'Загрузка...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}