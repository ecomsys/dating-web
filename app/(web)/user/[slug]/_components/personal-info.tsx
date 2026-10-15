// app/(web)/user/[slug]/_components/personal-info.tsx
'use client';

import { searchConfig } from '@/lib/search-config';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
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
}

// Хелпер для получения названия из конфига
const getLabel = (key: string, value?: number | null): string | null => {
  if (value === null || value === undefined || value === 0) return null;
  return searchConfig[key]?.[value] || null;
};

// Хелпер для получения массива названий (для бейджей)
const getArrayLabels = (key: string, values?: number[] | null): string[] => {
  if (!values || !Array.isArray(values)) return [];
  return values.map(v => searchConfig[key]?.[v]).filter(Boolean) as string[];
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
      <span className="text-muted-foreground text-sm font-light sm:w-2/5">{label}</span>
      <span className="text-foreground text-sm sm:w-3/5">{value}</span>
    </div>
  );
}

export function PersonalInfo({ profile }: { profile: UserProfile }) {
  // Собираем внешность
  const appearanceParts: string[] = [];
  if (profile.height) appearanceParts.push(`${profile.height} см`);
  if (profile.body_type) {
    const bt = getLabel('body_type', profile.body_type);
    if (bt) appearanceParts.push(bt.toLowerCase());
  }
  const appearanceStr = appearanceParts.join(', ');

  // Массивы для бейджей
  const languages = getArrayLabels('languages', profile.languages);
  const sports = getArrayLabels('sports', profile.sports);

  // Проверка, есть ли вообще хоть одна запись
  const hasAnyInfo = appearanceStr || 
    profile.relationship_status || profile.children_status || profile.pets || 
    profile.housing || profile.has_car || profile.education_level || profile.institution || 
    profile.institution_year || profile.income || profile.activity || profile.position || 
    profile.smoking || profile.alcohol || languages.length > 0 || sports.length > 0;

  if (!hasAnyInfo) return null;

  return (
    <div className="mb-6 border-t border-border pt-4">
      <h3 className="text-base font-medium text-accent-foreground mb-2">Личная информация</h3>
      
      <div className="flex flex-col gap-y-3">
        <InfoRow label="Внешность" value={appearanceStr} />
        <InfoRow label="Отношения" value={getLabel('relationship_status', profile.relationship_status)} />
        <InfoRow label="Дети" value={getLabel('children_status', profile.children_status)} />
        <InfoRow label="Домашние животные" value={getLabel('pets', profile.pets)} />
        <InfoRow label="Жилищные условия" value={getLabel('housing', profile.housing)} />
        <InfoRow label="Наличие автомобиля" value={getLabel('has_car', profile.has_car)} />
        <InfoRow label="Образование" value={getLabel('education_level', profile.education_level)} />
        <InfoRow label="Учебное заведение" value={profile.institution} />
        <InfoRow label="Год выпуска" value={profile.institution_year ? String(profile.institution_year) : null} />
        <InfoRow label="Доход" value={getLabel('income', profile.income)} />
        <InfoRow label="Сфера деятельности" value={profile.activity} />
        <InfoRow label="Должность" value={profile.position} />
        <InfoRow label="Курение" value={getLabel('smoking', profile.smoking)} />
        <InfoRow label="Алкоголь" value={getLabel('alcohol', profile.alcohol)} />

        {languages.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
            <span className="text-muted-foreground text-sm font-light sm:w-2/5 sm:mt-1.5">Знание языков</span>
            <div className="flex flex-wrap gap-1.5 sm:w-3/5">
              {languages.map((lang, i) => (
                <Badge key={i} variant="default" className="bg-blue-400 text-white">{lang}</Badge>
              ))}
            </div>
          </div>
        )}

        {sports.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
            <span className="text-muted-foreground text-sm font-light sm:w-2/5 sm:mt-1.5">Спорт</span>
            <div className="flex flex-wrap gap-1.5 sm:w-3/5">
              {sports.map((sport, i) => (
                <Badge key={i} variant="default" className="bg-blue-400 text-white">{sport}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}