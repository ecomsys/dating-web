// app/(web)/_components/feed-client.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import api from "@/lib/api";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { SearchPanel } from "./search-panel"; // Создадим на следующем шаге
import { UserCard } from "./user-card"; // Создадим на следующем шаге
import { ButtonLink } from "@/components/ui/button-link";

// Тип для карточки юзера из API
interface FeedUser {
  id: number;
  slug: string; 
  name: string;
  age: number | string;
  city: string;
  is_online: boolean;
  has_premium: boolean;
  photo: string | null;
  photos_count: number;
  zodiac: string;
  distance: string | null;
  status_text: string;
}

export function FeedClient({
  isSearchPage = false,
  defaultGender = "any",
}: {
  isSearchPage?: boolean;
  defaultGender?: string;
}) {
  const { user } = useAuthStore();
  const { openLoginModal } = useUIStore();
  const isAuth = !!user;

  // Состояние UI
  const [showSearchPanel, setShowSearchPanel] = useState(
    !isAuth ? true : !isSearchPage,
  );
  const [showAdvanced, setShowAdvanced] = useState(isAuth && !isSearchPage);

  // Состояние данных
  const [users, setUsers] = useState<FeedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(!isSearchPage);

  // Состояние фильтров (полная копия твоего Alpine объекта)
  const [filters, setFilters] = useState({
    gender: defaultGender,
    city_id: "",
    country_id: '',
    city_label: '',
    dating_goal: "any",
    activity: "",
    age: [18, 50],
    age_from: 18,
    age_to: 50,
    is_new: false,
    verified_only: false,
    interests_string: "",
    adv1: "none",
    adv1_values: [] as string[],
    adv2: "none",
    adv2_values: [] as string[],
    adv3: "none",
    adv3_values: [] as string[],
    weight: [45, 85],
    height: [150, 185],
  });

  // Refs для бесконечного скролла
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Сборка payload для API (точная копия getPayload из Alpine)
 // Сборка payload для API
  const getPayload = useCallback(() => {
    const payload: Record<string, any> = {
      gender: filters.gender || 'any',
      city_id: filters.city_id || '',
      country_id: filters.country_id || '', // <--- Добавили защиту
      dating_goal: filters.dating_goal || 'any',
      activity: filters.activity || '',
      age_from: filters.age[0],
      age_to: filters.age[1],
      is_new: filters.is_new,
      verified_only: filters.verified_only,
      interests: filters.interests_string 
        ? filters.interests_string.split(',').map(s => s.trim()).filter(Boolean).map(s => s.replace(/[^a-zа-яё0-9\s-]/giu, '')).filter(Boolean)
        : [],
    };

    (['adv1', 'adv2', 'adv3'] as const).forEach(slot => {
      const type = filters[slot];
      if (type !== 'none') {
        if (type === 'weight' || type === 'height') {
          const sliderVal = filters[type] as number[];
          payload[`${type}_from`] = sliderVal[0];
          payload[`${type}_to`] = sliderVal[1];
        } else {
          payload[type] = (filters[`${slot}_values`] as string[]).map(v => parseInt(v));
        }
      }
    });

    return payload;
  }, [filters]);
 

  // Функция загрузки
  const fetchUsers = useCallback(
    async (pageToFetch: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        const payload = getPayload();
        payload.page = pageToFetch;

        Object.keys(payload).forEach((key) => {
          const val = payload[key];
          if (Array.isArray(val) && val.length > 0) {
            val.forEach((v) => params.append(`${key}[]`, v));
          } else if (val !== '' && val !== null && val !== undefined && !(Array.isArray(val) && val.length === 0)) {
            params.append(key, val);
          }
        });

           // === И СЮДА ЛОГ ===
        console.log("URL Params:", params.toString());
        


        const response = await api.get(`/users/search?${params.toString()}`);
        const data = response.data;

               setUsers((prev) =>
          pageToFetch === 1 ? data.users : [...prev, ...data.users],
        );
        setCurrentPage(data.current_page);
        setLastPage(data.last_page);
      } catch (error) {
        console.error("Ошибка загрузки анкет:", error);
      } finally {
        setLoading(false);
      }
    },
    [getPayload],
  );

  // Первичная загрузка при монтировании
  useEffect(() => {
    const foo = () => fetchUsers(1);
    foo();
  }, []);

  // Логика применения фильтров (кнопка "Искать")
  const applyFilters = () => {
    setUsers([]);
    fetchUsers(1);
  };

  // Логика бесконечного скролла
  const enableInfiniteScroll = () => {
    setShowLoadMoreButton(false);
  };

  // Наблюдатель для скролла
  useEffect(() => {
    // Если кнопка скрыта (или мы на странице поиска), включаем обсервер
    if (!showLoadMoreButton) {
      const sentinel = sentinelRef.current;
      if (sentinel) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            if (
              entries[0].isIntersecting &&
              !loading &&
              currentPage < lastPage
            ) {
              fetchUsers(currentPage + 1);
            }
          },
          { rootMargin: "200px" },
        );
        observerRef.current.observe(sentinel);
      }
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [showLoadMoreButton, loading, currentPage, lastPage, fetchUsers]);


  return (
    <div className="space-y-6">
      {/* 1. Панель поиска */}
      <SearchPanel
        isAuth={isAuth}
        isSearchPage={isSearchPage}
        showSearchPanel={showSearchPanel}
        setShowSearchPanel={setShowSearchPanel}
        showAdvanced={showAdvanced}
        setShowAdvanced={setShowAdvanced}
        filters={filters}
        setFilters={setFilters}       
        applyFilters={applyFilters}
        loading={loading}
      />

      {/* 2. Сетка анкет */}
      <div>
        {/* Крупный спиннер при первой загрузке */}
        {loading && users.length === 0 && (
          <div className="flex justify-center items-center py-[33dvh]">
            <Loader className="w-10 h-10" />
          </div>
        )}

        {/* Сетка карточек */}
        {(!loading || users.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user, index) => (
              <UserCard
                key={user.id}
                user={user}
                index={index}
                isAuth={isAuth}
                onWriteClick={!isAuth ? openLoginModal : undefined}
              />
            ))}
          </div>
        )}

        {/* Пустой результат */}
        {!loading && users.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <p>
              По вашим критериям никого не найдено. Попробуйте изменить фильтры.
            </p>
          </div>
        )}
      </div>

      {/* 3. Логика "Показать еще" и Бесконечный скролл */}
      <div className="pt-4 flex flex-col items-center justify-center gap-4">
        {!isSearchPage &&
          showLoadMoreButton &&
          currentPage < lastPage &&
          users.length > 0 && (
            <Button
              variant="outline"
              onClick={enableInfiniteScroll}
              disabled={loading}
              className="border-primary text-primary px-6 py-2 rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              {loading ? "Ищем..." : "Найти еще людей"}
            </Button>
          )}
        {!showLoadMoreButton && currentPage < lastPage && (
          <Loader className="w-8 h-8" />
        )}
        {/* Скрытый сенсор для IntersectionObserver */}
        <div ref={sentinelRef} className="h-1"></div>
      </div>

      {/* 4. БЛОК ИНФОРМАЦИИ ТОЛЬКО ДЛЯ ГОСТЯ */}
      {!isAuth && (
        <div className="mt-8 bg-card border border-border rounded-xl p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold">
            Добро пожаловать на Dating App! ❤️
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Наш сайт знакомств поможет вам найти серьезные отношения, друзей или
            просто интересных собеседников. Регистрируйтесь бесплатно, чтобы
            получить доступ к чатам, лайкам и полному просмотру анкет.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <ButtonLink href="/register">Создать аккаунт</ButtonLink>
            <Button variant="outline" onClick={() => openLoginModal()}>
              Войти
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-6 pt-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-primary">
              Правила сайта
            </a>
            <a href="#" className="hover:text-primary">
              Политика конфиденциальности
            </a>
            <a href="#" className="hover:text-primary">
              Поддержка
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
