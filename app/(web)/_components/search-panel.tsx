// app/(web)/_components/search-panel.tsx
"use client";

import { advancedFilters, searchConfig } from "@/lib/search-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Loader2, ChevronDown, Search } from "lucide-react";
import { CityCombobox } from "@/components/ui/city-combobox";

export interface Filters {
  gender: string;
  city_id: string;
  country_id: string;
  city_label: string;
  dating_goal: string;
  activity: string;
  age: number[];
  age_from: number;
  age_to: number;
  is_new: boolean;
  verified_only: boolean;
  interests_string: string;
  adv1: string;
  adv1_values: string[];
  adv2: string;
  adv2_values: string[];
  adv3: string;
  adv3_values: string[];
  weight: number[];
  height: number[];
}

interface SearchPanelProps {
  isAuth: boolean;
  isSearchPage: boolean;
  showSearchPanel: boolean;
  setShowSearchPanel: (open: boolean) => void;
  showAdvanced: boolean;
  setShowAdvanced: (open: boolean) => void;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  applyFilters: () => void;
  loading: boolean;
}

const GENDER_OPTIONS = [
  { value: "any", label: "Всех" },
  { value: "male", label: "Парней" },
  { value: "female", label: "Девушек" },
];

const ACTIVITY_OPTIONS = [
  { value: "", label: "Не имеет значения" },
  { value: "online", label: "Сейчас онлайн" },
  { value: "recently", label: "Недавно активные" },
];

const DATING_GOAL_OPTIONS = [
  { value: "any", label: "Любая" },
  { value: "friends", label: "Дружба" },
  { value: "romantic", label: "Романтика" },
  { value: "family", label: "Семья" },
  { value: "casual", label: "Свободные отношения" },
  { value: "travel", label: "Путешествия" },
];

export function SearchPanel({
  isAuth,
  isSearchPage,
  showSearchPanel,
  setShowSearchPanel,
  showAdvanced,
  setShowAdvanced,
  filters,
  setFilters,
  applyFilters,
  loading,
}: SearchPanelProps) {
  const getAvailableAdvancedFilters = (currentSlot: string) => {
    const excluded = [filters.adv1, filters.adv2, filters.adv3].filter(
      (val) => val !== "none" && val !== currentSlot,
    );
    return Object.entries(advancedFilters).filter(
      ([key]) => !excluded.includes(key),
    );
  };

  const updateSlot = (slot: "adv1" | "adv2" | "adv3", value: string) => {
    setFilters((prev) => ({ ...prev, [slot]: value, [`${slot}_values`]: [] }));
  };

  return (
    <div className="bg-card border border-border rounded-xl mb-6 shadow-sm">
      {isAuth && isSearchPage && (
        <div
          onClick={() => setShowSearchPanel(!showSearchPanel)}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors"
        >
          <span className="text-sm font-medium text-foreground">
            {showSearchPanel ? "Фильтры поиска" : "Найти людей"}
          </span>
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <span>{showSearchPanel ? "Свернуть" : "Развёрнуть поиск"}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${showSearchPanel ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      )}

      {/* Тело поиска (Плавно сворачивается/разворачивается) */}
      {/* Используем трюк с CSS Grid для плавной анимации высоты */}
      <div
        className={`grid transition-all duration-500 ease-in-out ${showSearchPanel ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div
            className={`p-6 ${isSearchPage ? "border-t border-border" : "border-t-0"}`}
          >
            <div className="grid md:grid-cols-[60%_40%] gap-8 md:gap-6">
              {/* ЛЕВАЯ КОЛОНКА */}
              <div className="space-y-4 w-full">
               
                <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Регион</Label>
                <CityCombobox 
                  className="w-full max-w-none"
                  value={{ id: filters.city_id || filters.country_id, type: filters.country_id ? 'country' : 'city', label: filters.city_label }} 
                  onChange={(val) => setFilters(prev => ({ 
                    ...prev, 
                    city_id: val.type === 'city' ? val.id : '',
                    country_id: val.type === 'country' ? val.id : '',
                    city_label: val.label
                  }))} 
                />
              </div>

               <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Кого я ищу
                  </Label>
                  {isAuth ? (
                    <div className="inline-flex items-center h-10 px-3 border border-border rounded-md bg-muted/30 text-sm font-medium">
                      {filters.gender === "male" ? "Парня" : "Девушку"}
                    </div>
                  ) : (
                    <Select
                      value={filters.gender}
                      onValueChange={(val) =>
                        setFilters((prev) => ({
                          ...prev,
                          gender: val ?? "any",
                        }))
                      }
                    >
                      <SelectTrigger className="w-full max-w-[14rem]">
                        <SelectValue placeholder="Выберите пол">
                          {GENDER_OPTIONS.find(
                            (opt) => opt.value === filters.gender,
                          )?.label || "Всех"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>


                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Цель отношений
                  </Label>
                  <Select
                    value={filters.dating_goal}
                    onValueChange={(val) =>
                      setFilters((prev) => ({
                        ...prev,
                        dating_goal: val ?? "any",
                      }))
                    }
                  >
                    <SelectTrigger className="w-full max-w-[14rem]">
                      <SelectValue placeholder="Любая">
                        {DATING_GOAL_OPTIONS.find(
                          (opt) => opt.value === filters.dating_goal,
                        )?.label || "Любая"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {DATING_GOAL_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Активность
                  </Label>
                  <Select
                    value={filters.activity}
                    onValueChange={(val) =>
                      setFilters((prev) => ({ ...prev, activity: val ?? "" }))
                    }
                  >
                    <SelectTrigger className="w-full max-w-[14rem]">
                      <SelectValue placeholder="Не имеет значения">
                        {ACTIVITY_OPTIONS.find(
                          (opt) => opt.value === filters.activity,
                        )?.label || "Не имеет значения"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* ПРАВАЯ КОЛОНКА */}
              <div className="space-y-6 md:border-l border-border md:pl-6">
                <div className="space-y-2 max-w-[16rem]">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                      Возраст
                    </Label>
                    <span className="text-sm font-medium text-muted-foreground">
                      {filters.age[0]} - {filters.age[1]}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Slider
                      value={filters.age}
                      min={18}
                      max={99}
                      onValueChange={(val) => {
                        const arr = (
                          Array.isArray(val) ? val : [val, val]
                        ) as number[];
                        setFilters((prev) => ({
                          ...prev,
                          age: arr,
                          age_from: arr[0],
                          age_to: arr[1],
                        }));
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-3 pt-2 flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="is_new"
                      checked={filters.is_new}
                      onCheckedChange={(checked) =>
                        setFilters((prev) => ({
                          ...prev,
                          is_new: checked === true,
                        }))
                      }
                    />
                    <Label htmlFor="is_new">Новые пользователи</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="verified_only"
                      checked={filters.verified_only}
                      onCheckedChange={(checked) =>
                        setFilters((prev) => ({
                          ...prev,
                          verified_only: checked === true,
                        }))
                      }
                    />
                    <Label htmlFor="verified_only">Проверенные фото</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* РАСШИРЕННЫЙ ПОИСК (Только для авторизованных) */}
            {isAuth && (
              // Используем трюк с CSS Grid для плавной анимации высоты
              <div
                className={`grid transition-all duration-500 ease-in-out ${showAdvanced ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <div className="overflow-hidden">
                  <div className="space-y-6 mt-6 pt-6 border-t border-border">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground block mb-1.5">
                        Интересы (через запятую)
                      </Label>
                      <Input
                        type="text"
                        value={filters.interests_string}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            interests_string: e.target.value,
                          }))
                        }
                        placeholder="Например: кино, музыка, спорт"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Слот 1 */}
                      <div className="space-y-3">
                        <Select
                          value={filters.adv1}
                          onValueChange={(val) =>
                            updateSlot("adv1", val ?? "none")
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Дополнительное поле">
                              {filters.adv1 !== "none"
                                ? advancedFilters[filters.adv1]
                                : "Дополнительное поле"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Нет</SelectItem>
                            {getAvailableAdvancedFilters(filters.adv1).map(
                              ([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <SlotContent
                          slot="adv1"
                          filters={filters}
                          setFilters={setFilters}
                        />
                      </div>

                      {/* Слот 2 */}
                      <div className="space-y-3">
                        <Select
                          value={filters.adv2}
                          onValueChange={(val) =>
                            updateSlot("adv2", val ?? "none")
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Дополнительное поле">
                              {filters.adv2 !== "none"
                                ? advancedFilters[filters.adv2]
                                : "Дополнительное поле"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Нет</SelectItem>
                            {getAvailableAdvancedFilters(filters.adv2).map(
                              ([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <SlotContent
                          slot="adv2"
                          filters={filters}
                          setFilters={setFilters}
                        />
                      </div>

                      {/* Слот 3 */}
                      <div className="space-y-3">
                        <Select
                          value={filters.adv3}
                          onValueChange={(val) =>
                            updateSlot("adv3", val ?? "none")
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Дополнительное поле">
                              {filters.adv3 !== "none"
                                ? advancedFilters[filters.adv3]
                                : "Дополнительное поле"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Нет</SelectItem>
                            {getAvailableAdvancedFilters(filters.adv3).map(
                              ([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <SlotContent
                          slot="adv3"
                          filters={filters}
                          setFilters={setFilters}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
              <Button onClick={applyFilters} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                {loading ? "Ищем..." : "Искать"}
              </Button>
              {isAuth && (
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-primary hover:underline flex items-center gap-1.5"
                >
                  {showAdvanced
                    ? "Скрыть расширенный поиск"
                    : "Расширенный поиск"}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${showAdvanced ? "rotate-180" : ""}`}
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Вспомогательный компонент
function SlotContent({
  slot,
  filters,
  setFilters,
}: {
  slot: "adv1" | "adv2" | "adv3";
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}) {
  const type = filters[slot];
  const values = filters[`${slot}_values`];

  if (type === "none") return null;

  if (type === "weight" || type === "height") {
    const min = type === "weight" ? 30 : 130;
    const max = type === "weight" ? 200 : 250;
    const currentVal = filters[type] as number[];

    return (
      <div className="p-4 border border-border rounded-lg bg-muted/20 space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-muted-foreground">
            {advancedFilters[type]}
          </Label>
          <span className="text-sm font-medium text-muted-foreground">
            {currentVal[0]} - {currentVal[1]} {type === "weight" ? "кг" : "см"}
          </span>
        </div>
        <div className="pt-2">
          <Slider
            value={currentVal}
            min={min}
            max={max}
            onValueChange={(val) => {
              const arr = (Array.isArray(val) ? val : [val, val]) as number[];
              setFilters((prev) => ({ ...prev, [type]: arr }));
            }}
          />
        </div>
      </div>
    );
  }

  const options = searchConfig[type];
  if (!options) return null;

  // Иммутабельный обработчик чекбоксов (Реакт-вей)
  const handleToggle = (val: string) => {
    setFilters((prev) => {
      const currentArr = prev[`${slot}_values`];
      if (currentArr.includes(val)) {
        // Удаляем (создаем новый массив)
        return {
          ...prev,
          [`${slot}_values`]: currentArr.filter((v) => v !== val),
        };
      } else {
        // Добавляем (создаем новый массив)
        return { ...prev, [`${slot}_values`]: [...currentArr, val] };
      }
    });
  };

  return (
    <div className="flex flex-col gap-2 overflow-y-auto max-h-[200px] p-2 border border-border rounded-lg little-scroll">
      {Object.entries(options).map(([val, label]) => (
        <div key={val} className="flex items-center gap-2">
          <Checkbox
            id={`${slot}-${val}`}
            checked={values.includes(String(val))}
            onCheckedChange={() => handleToggle(String(val))}
          />
          <Label
            htmlFor={`${slot}-${val}`}
            className="text-sm font-normal cursor-pointer"
          >
            {label}
          </Label>
        </div>
      ))}
    </div>
  );
}
