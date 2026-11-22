# TICKET-07.8: Комплексная адаптивность UI (Mobile-to-Desktop), устранение сбоя зачетки /grades, SSoT расписания на главной и гармонизация дизайн-стандартов

> **Идентификатор тикета**: `TICKET-07.8`  
> **Статус**: 🟡 **SPECIFIED (Сформирован и согласован через /grill-me)**  
> **Приоритет**: P0 (Критичный UX и стабильность платформы перед показом жюри)  
> **Автор**: Захар (Solo-Maker)  
> **Дата составления**: 23 ноября 2026  
> **Целевой релиз**: v0.7.8-responsive-mastery  

---

## 1. Контекст, Бизнес-цель & Базовое состояние

По результатам комплексного сквозного тестирования платформы на различных типах экранов (мобильные устройства, планшеты, десктопные мониторы) и анализа аудио-транскрипта Захара (`docs/pravki/me.md` и контрольных скриншотов `docs/pravki/1.jpg`–`6.jpg`) зафиксированы критические дефекты пользовательского опыта и визуальной геометрии:

1. **Критический сбой зачетной книжки (`/grades`)**:
   - При клике на «Открыть зачётную книжку и симулятор» или переходе на `/grades` сервер падает с ошибкой Next.js SSR `This page couldn't load` (код ошибки `1235902522`).
   - Причина: серверный компонент `app/(student)/grades/page.tsx` импортировал константы данных из клиентского модуля `grades-client-view.tsx` (`"use client"`), что приводило к `TypeError: e.INITIAL_GRADES.find is not a function`.
2. **Рассогласование данных студента на главной странице (`/dashboard`)**:
   - У студента 1 (Смирнов Алексей, группа `ЦД-23-1`, факультет прикладной цифровизации) в карточке «Ближайшая пара» отображается дисциплина Международных отношений: «Введение в специальность» (08:30–10:00, доц. Елохина Ю.В.).
   - Причина: запрос к таблице `lessons` в `DashboardPage` не фильтровал пары по `session.groupId`.
3. **Отсутствие адаптивности под большие экраны (Desktop & Tablet)**:
   - В `app/layout.tsx` корневой контейнер контента жестко зажат в `max-w-md mx-auto` (448px), в то время как верхний дисклеймер растянут на 100% ширины (1920px). На экранах ноутбуков и мониторов интерфейс выглядит как узкая полоса по центру, а элементы форм и сетки сбиваются.
   - Требуется плавная адаптивная сетка (Fluid Container `max-w-2xl lg:max-w-3xl xl:max-w-4xl`), обеспечивающая нативный мобильный опыт на смартфонах и гармоничное, пропорциональное отображение карточек, расписания и таблиц на десктопе.
4. **Дефекты экрана заявок (`/requests`)**:
   - Карточка готовой справки с гербовой печатью при наличии широкого экрана активирует директиву `sm:flex-row sm:items-center justify-between`, из-за чего пояснительный текст зажимается слева в узкую вертикальную колонку шириной в 2 слова, а зеленая кнопка уезжает вправо.
   - В форме «Новая заявка» выбор типа справки реализован через нативный HTML `<select>`, нарушая стандарты B2B UI.
5. **Схлопывание поля ввода AI-ассистента (`/ai`)**:
   - Из-за хардкода `h-[calc(100vh-135px)]` при динамическом наличии дисклеймера и фиксированного нижнего бара `MobileNav` блок чипсов подсказок наезжает на поле ввода, а сам инпут уходит под нижнюю панель навигации.
6. **Ликвидация регистрации и доработка экрана входа (`/login`)**:
   - В университетском деканате регистрация аккаунтов извне недопустима (учетные записи выдает администрация). Ссылку и роут `/signup` необходимо удалить.
   - В кнопке быстрого входа для жюри необходимо добавить фамилию: «Студент 1: Смирнов (Отличник, без долгов)».
7. **Систематизация дизайн-стандартов**:
   - Создание локального проектного правила `.agents/rules/ui_ux_invariants.md` (на основе боевых инвариантов `autoparts-decision-intelligence`) и глобального мастер-скилла `b2b-ui-mastery`.

---

## 2. Анализ кодовой базы и корневые причины (RCA & Forensics)

| Компонент / Файл | Симптом дефекта | Точная техническая причина (Root Cause) | Решение (Fix Contract) |
| :--- | :--- | :--- | :--- |
| `app/(student)/grades/page.tsx` & `grades-client-view.tsx` | Сбой SSR `This page couldn't load` (Error 1235902522) на проде | Серверный `page.tsx` импортировал `INITIAL_GRADES` из `"use client"` файла. В Next.js бандлер оборачивает не-компонентные экспорты клиентских файлов в прокси, лишенные методов `Array.prototype.find`. | Вынести все наборы данных и интерфейсы оценок в изолированный чистый TypeScript-модуль `lib/grades-data.ts`. |
| `app/(student)/dashboard/page.tsx` | Первая пара Смирнова — «Введение в специальность» (МО) | `supabase.from("lessons").select("*").order("start_time", { ascending: true }).limit(1)` не содержит `.eq("group_id", session.groupId)`. Первой по времени (08:30) была пара группы МО. | Добавить фильтр `.eq("group_id", session.groupId)` с фоллбеком на пары группы ЦД (`00000000-0000-0000-0000-000000000010`). |
| `app/layout.tsx` & `app/(student)/layout.tsx` | «Узкая кишка» 448px на мониторах 1920x1080 | Жесткий класс `max-w-md mx-auto` в корневом теге `<main>`. | Заменить на `w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-4`. Обеспечить центрирование контента. |
| `app/(student)/requests/page.tsx` | Текст карточки справки сжат в 2 слова, нативный `<select>` | Директива `sm:flex-row sm:items-center justify-between` при `gap-3` выталкивает блок кнопки вправо. Нативный тег `<select>`. | Перевести карточку в вертикальный стек (`flex flex-col gap-3`): текст на 100% ширины, кнопка внизу на всю ширину блока. Заменить `<select>` на кастомный селектор. |
| `app/(student)/ai/page.tsx` | Поле ввода обрезано снизу под навигацией | Контейнер страницы имеет фиксированный `h-[calc(100vh-135px)]`, конфликтующий с `DisclaimerBanner` (~36px), `header` (~45px), `main p-4` (32px) и `MobileNav` (64px + safe-area). | Переписать на чистый Flexbox: `flex-1 min-h-0 flex flex-col`, где чат занимает `flex-1 overflow-y-auto`, а чипсы и форма ввода прижаты к низу. |
| `app/(auth)/login/page.tsx` | Наличие ссылки `/signup`, нет фамилии у Студента 1 | Текст «Нет учётной записи? Зарегистрироваться» в футере. Лейбл кнопки «Студент 1 (Отличник, без долгов)». | Удалить ссылку и футер регистрации. Перенаправить `/signup` на `/login`. Обновить лейбл на «Студент 1: Смирнов (Отличник, без долгов)». |

---

## 3. Целевая архитектура и спецификация изменений

### 3.1. Изоляция данных зачетки (`lib/grades-data.ts`)
Создается модуль `lib/grades-data.ts`, содержащий:
- Типы `ExtendedGradeRecord`, расширяющие `GradeRecord`.
- Константы `INITIAL_GRADES` (Алексей Смирнов, ЦД-23-1, GPA 4.8), `STUDENT2_DEFAULT_GRADES` (Мария Кузнецова, долг по матанализу), `STUDENT3_DEFAULT_GRADES` (Анна Иванова, МО, GPA 4.67).
- Оба файла (`page.tsx` и `grades-client-view.tsx`) импортируют данные из `lib/grades-data.ts`.

### 3.2. SSoT выборки ближайшей пары (`app/(student)/dashboard/page.tsx`)
```typescript
const studentGroupId = session.groupId || "00000000-0000-0000-0000-000000000010";

const { data: lessonsData } = await supabase
  .from("lessons")
  .select("*")
  .eq("group_id", studentGroupId)
  .order("start_time", { ascending: true })
  .limit(1);

const nextLesson = lessonsData?.[0] || {
  discipline: "Математический анализ",
  kind: "lecture",
  start_time: "09:00",
  end_time: "10:30",
  room: "ауд. 302",
  teacher: "доц. Смирнов А.А.",
};
```

### 3.3. Fluid Container Invariant (`app/layout.tsx` и `MobileNav`)
- Корневой лейаут:
```tsx
<main className="flex-1 flex flex-col w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-3 sm:px-4 transition-all">
  {children}
</main>
```
- Навигация `components/mobile-nav.tsx`:
```tsx
<nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border pb-safe">
  <div className="flex items-center justify-around h-16 max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-4">
    {/* Иконки с комфортными отступами */}
  </div>
</nav>
```

### 3.4. Рефакторинг карточки справки и селектора (`app/(student)/requests/page.tsx`)
1. **Карточка готовой справки (Anti-Flex-Squishing Guard)**:
```tsx
<div className="mt-3 p-4 rounded-xl bg-card border border-emerald-500/30 shadow-xs flex flex-col gap-3">
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
      <FileCheck className="w-4 h-4 text-emerald-600" />
    </div>
    <div className="text-xs text-foreground leading-relaxed flex-1">
      Справка оформлена и заверена электронной подписью деканата. Вы можете открыть и скачать официальный электронный документ прямо сейчас либо забрать оригинал с гербовой печатью в кабинете 201.
    </div>
  </div>
  <Button
    type="button"
    size="sm"
    onClick={() => setCertificateModalId(item.id)}
    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-2 h-9 shadow-xs cursor-pointer"
  >
    <FileCheck className="w-4 h-4 text-white" />
    Открыть и скачать справку (PDF)
  </Button>
</div>
```
2. **Кастомный селектор справки**:
Внедрение кастомного доступного выпадающего списка `CustomSelect` с клавиатурной навигацией и поддержкой `sasha`-стиля.

### 3.5. Flexbox-верстка AI-деканата (`app/(student)/ai/page.tsx`)
```tsx
<div className="flex-1 min-h-0 flex flex-col h-[calc(100dvh-120px)] max-h-full">
  {/* Chat Header */}
  ...
  {/* Messages Area */}
  <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 pb-2">
    ...
  </div>
  {/* Suggestions Chips */}
  <div className="flex gap-1.5 overflow-x-auto py-2 shrink-0 scrollbar-none">
    ...
  </div>
  {/* Input Bar */}
  <form className="flex gap-2 pt-1 shrink-0 pb-1">
    ...
  </form>
</div>
```

### 3.6. Проектные правила B2B UI (`.agents/rules/ui_ux_invariants.md`)
Фиксация 6 золотых правил:
1. `Zero Native Selects in Modals & Forms`: обязательное использование кастомных селекторов.
2. `Anti-Flex-Squishing Invariant`: запрет сайд-бай-сайд сжатия длинных текстов кнопками при `flex-row`.
3. `Fluid Container & Max-Width Hierarchy`: запрет жесткого `max-w-md` для десктопа; применение `max-w-2xl lg:max-w-3xl xl:max-w-4xl`.
4. `Dynamic Viewport Height & Safe-Area Guard`: использование `100dvh` и flex-контейнеров с `min-h-0` вместо хрупких вычислений `calc(100vh - Npx)`.
5. `Single-Scrollbar Policy`: отсутствие двойных скроллбаров на десктопе и внутри диалогов.
6. `Zero-Emoji Policy`: использование исключительно семантических SVG-иконок (`lucide-react`).

---

## 4. Интерактивный чеклист приемки и план верификации

### 4.1. Автоматизированные тесты (Quality Gates)
```bash
# 1. Проверка типов TypeScript (0 ошибок)
pnpm typecheck

# 2. Проверка линтера (0 предупреждений)
pnpm lint

# 3. Модульные и интеграционные тесты Vitest (все 30+ тестов успешны)
pnpm test

# 4. Standalone продакшн-сборка Next.js
pnpm build
```

### 4.2. Сквозная ручная верификация UI (Forensic Checklist)
1. **Экран входа (`/login`)**:
   - [ ] Отсутствует футер «Нет учётной записи? Зарегистрироваться».
   - [ ] При попытке прямого перехода на `/signup` происходит редирект на `/login`.
   - [ ] Кнопка быстрого входа отображает: «Студент 1: Смирнов (Отличник, без долгов)».
2. **Главная страница (`/dashboard`)**:
   - [ ] В карточке «Ближайшая пара» у Смирнова отображается пара по Математическому анализу / Базам данных (ИТ-факультет), а не «Введение в специальность» (МО).
   - [ ] Кнопка «Открыть зачётную книжку и симулятор» открывает `/grades` мгновенно без падений.
3. **Экран зачетки (`/grades`)**:
   - [ ] Страница рендерится без ошибок 500 / `This page couldn't load`.
   - [ ] Представлены корректные оценки Смирнова (GPA 4.8), Кузнецовой (долг) и Ивановой.
4. **Адаптивность (Desktop vs Mobile)**:
   - [ ] На десктопе (1920x1080) контент раскрывается в пропорциональный контейнер `max-w-3xl` / `max-w-4xl`.
   - [ ] Карточки центрированы, нет смещения влево, текст не вытянут в одну тонкую нить.
5. **Экран заявок (`/requests`)**:
   - [ ] В карточке готовой справки текст занимает полную ширину, а кнопка «Открыть и скачать справку (PDF)» расположена снизу на всю ширину. Текст больше не зажат в 2 слова.
   - [ ] В форме создания заявки селектор типа справки выполнен в виде кастомного красивого дропдауна.
6. **Экран AI-ассистента (`/ai`)**:
   - [ ] Поле ввода и кнопка отправки четко видны над нижней панелью навигации на всех разрешениях экрана.
   - [ ] Чипсы подсказок не перекрывают инпут при скролле истории диалога.
