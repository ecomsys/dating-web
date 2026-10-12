## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

```bash
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx               # Server Component (роут /login)
│   ├── register/
│   │   ├── page.tsx               # Server Component (роут /register)
│   │   └── _components/           # Приватная папка (не влияет на роутинг)
│   │       └── register-form.tsx  # Client Component ('use client')
│   ├── reset-password/
│   │   ├── page.tsx
│   │   └── _components/
│   │       └── reset-form.tsx
│   └── layout.tsx                 # Server Component (общий лейаут)
│
├── (web)/
│   ├── page.tsx                   # Server Component (роут /)
│   ├── _components/
│   │   └── home-client.tsx        # Client Component (вся логика главной)
│   ├── user/[slug]/
│   │   ├── page.tsx               # Server Component (роут профиля)
│   │   └── _components/
│   │       └── profile-view.tsx   # Client Component (логика профиля)
│   └── layout.tsx
│
├── providers/
│   └── ... (твои глобальные провайдеры)
│
└── layout.tsx                     # Root Layout (Server Component)
```


# Правильный паттерн организации проекта:

```bash
app/(web)/user/[slug]/
├── page.tsx               # Server Component (роут)
├── _components/           # Все компоненты, относящиеся только к этой странице
│   ├── profile-client.tsx     # 'use client' (Главная логика)
│   ├── profile-sidebar.tsx    # 'use client' (Сайдбар)
│   └── profile-header.tsx     # Server Component (Можно рендерить на сервере!)
├── _hooks/                # Кастомные хуки только для этой страницы
│   └── use-profile-data.ts
├── _lib/                  # Утилиты только для этой страницы
│   └── format-profile-date.ts
└── _types/                # TypeScript интерфейсы для этой страницы
    └── profile.types.ts
```
