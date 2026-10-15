// app/(web)/user/[slug]/_components/profile-client.tsx
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Loader } from "@/components/ui/loader";
import { MapPin } from "lucide-react";

import { PhotoGallery } from "./photo-gallery";
import { ActionButtons } from "./action-buttons";
import { PersonalInfo } from './personal-info';
import { SelfPortrait } from './self-portrait';

import { useUIStore } from "@/store/ui-store";

// Типы для данных профиля
// Обнови интерфейс profile внутри ProfileData:
interface ProfileData {
  user: {
    id: number;
    name: string;
    slug: string;
    is_verified: boolean;
    has_active_premium: boolean;
    photos: Array<any>;
    profile: {
      age: number | null;
      headline: string | null;
      looking_for: string | null;
      city: { name: string } | null;
      // Добавляем поля для PersonalInfo
      height?: number | null;
      body_type?: number | null;
      relationship_status?: number | null;
      children_status?: number | null;
      pets?: number | null;
      housing?: number | null;
      has_car?: number | null;
      education_level?: number | null;
      institution?: string | null;
      institution_year?: number | null;
      income?: number | null;
      activity?: string | null;
      position?: string | null;
      smoking?: number | null;
      alcohol?: number | null;
      languages?: number[] | null;
      sports?: number[] | null;
      self_portrait?: string | string[] | null; // Для автопортрета
      interests?: string[] | null; // Для интересов
      dating_goals?: string[] | null; // Для "Я ищу"
    };
    preferences: {
      preferred_gender: string | null;
      preferred_age_min: number | null;
      preferred_age_max: number | null;
    } | null;
  };
  is_favorited: boolean;
  is_blocked: boolean;
  is_reported: boolean;
  is_auth: boolean;
}

export function ProfileClient({ slug }: { slug: string }) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { openLoginModal } = useUIStore();

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<ProfileData>(`/user/${slug}`);
        if (isMounted) setData(res.data);
      } catch (err: any) {
        if (isMounted)
          setError(
            err.response?.status === 404
              ? "Профиль не найден"
              : "Ошибка загрузки",
          );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return <Loader className="min-h-[calc(100dvh-4rem)]" />;
  }

  if (error || !data) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center text-destructive">
        {error || "Ошибка загрузки профиля"}
      </div>
    );
  }

  const { user } = data;

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6">
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row gap-8 p-6">
        <div className="w-full md:w-[33%] shrink-0">
          <PhotoGallery
            photos={user.photos || []}
            isPremium={user.has_active_premium}
            name={user.name}
            isAuth={data.is_auth}
            onGuestClick={openLoginModal}
          />
        </div>

        {/* ПРАВАЯ ЧАСТЬ: Информация */}
        <div className="flex-1 py-2 flex flex-col">
          {/* Имя и возраст */}
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            {user.name}, <span>{user.profile.age ?? "?"}</span>
          </h1>

          {/* Город */}
          <div className="flex items-center justify-between gap-3 mb-4 mt-2">
            <div className="flex flex-col gap-2">
              <p className="text-blue-500 text-sm flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {user.profile.city?.name ?? "Город не указан"}
              </p>
            </div>
            {/* Кнопки действий (Пока заглушка) */}
            <ActionButtons
              slug={user.slug}
              isAuth={data.is_auth}
              isFavorited={data.is_favorited}
              isBlocked={data.is_blocked}
              isReported={data.is_reported}
              onGuestClick={openLoginModal}
            />
          </div>

          {/* Статус (Headline) */}
          {user.profile.headline && (
            <div className="inline-block bg-background border border-border rounded-full px-8 py-4 mb-6 shadow-lg">
              <p className="text-sm text-foreground/80 italic font-light leading-relaxed">
                {user.profile.headline}
              </p>
            </div>
          )}

          {/* Кого ищу */}
          {user.profile.looking_for && (
            <div className="mb-6 border-t border-border pt-4">
              <h3 className="text-base font-medium text-accent-foreground mb-2">
                Кого я хочу найти
              </h3>
              <p className="text-sm text-foreground/80 italic leading-relaxed">
                {user.profile.looking_for}
              </p>
            </div>
          )}

          <PersonalInfo profile={user.profile} />
          <SelfPortrait text={user.profile.self_portrait} />
          
        </div>
      </div>
    </div>
  );
}
