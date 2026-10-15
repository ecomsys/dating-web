// app/(web)/_components/city-combobox.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { Check, ChevronsUpDown, MapPin, X } from "lucide-react";

interface GeoResult {
  id: number;
  type: "city" | "country";
  label: string;
}

interface CityComboboxProps {
  value: { id: string; type: string; label: string };
  onChange: (value: { id: string; type: string; label: string }) => void;
  className?: string; // <--- Добавили
}

export function CityCombobox({
  value,
  onChange,
  className,
}: CityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);

    const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState(0);

  // При открытии дропдауна меряем ширину триггера
  useEffect(() => {
    if (open && triggerRef.current) {
      setDropdownWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  // Debounce поиска (300мс)
  useEffect(() => {
    if (!search || search.length < 2) {
      const foo = () => setResults([]);
      foo();
      return;
    }

    const foo = () => setLoading(true);
    foo();

    const timer = setTimeout(async () => {
      try {
        const res = await api.get<GeoResult[]>("/geo/search", {
          params: { q: search },
        });
        setResults(res.data);
      } catch (error) {
        console.error("Ошибка поиска города:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

   return (
    <div className="relative w-full">
            <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger 
         ref={triggerRef} 
        className={cn(
          "inline-flex items-center justify-between w-full rounded-lg border border-input bg-muted/30 px-4 py-1.5 text-sm font-normal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          className
        )}>
          <div className="flex items-center gap-2 truncate">
            {value.label ? (
              <>
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">{value.label}</span>
              </>
            ) : (
              "Регион"
            )}
          </div>
          
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {value.label ? (
              <span 
                className="text-muted-foreground hover:text-foreground" 
                onClick={(e) => { 
                  e.stopPropagation();
                  onChange({ id: '', type: '', label: '' });
                }}
              >
                <X className="w-4 h-4" />
              </span>
            ) : null}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </PopoverTrigger>
        
         <PopoverContent style={{ width: dropdownWidth }} className="p-0">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Начните вводить..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {loading && <div className="p-2 text-sm text-center text-muted-foreground">Поиск...</div>}
              {!loading && search.length >= 2 && results.length === 0 && (
                <CommandEmpty>Ничего не найдено.</CommandEmpty>
              )}
              {!loading && results.length > 0 && (
                <CommandGroup>
                  {results.map((item) => (
                    <CommandItem                     
                      key={`${item.type}-${item.id}`}
                      onSelect={() => {
                        onChange({ id: String(item.id), type: item.type, label: item.label });
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value.id === String(item.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
