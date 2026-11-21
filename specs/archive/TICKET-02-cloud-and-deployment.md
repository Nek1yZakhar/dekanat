# TICKET-02: Облачная инфраструктура и суверенный деплой на RU VPS (Yandex Cloud Compute VM)

## Objective
Развернуть рабочий прототип «Цифровой деканат» на публичном домене с автоматическим HTTPS, гарантированно доступном из РФ без применения VPN для жюри конкурса *MGIMO × AI Challenge* (22–28 ноября 2026), подключенным к облачному кластеру Supabase Cloud и запущенным в изолированном Docker-контейнере на виртуальном сервере **Yandex Cloud (стартовый грант 4 000 ₽ / 60 дней)** под управлением Caddy auto-SSL.

---

## Preconditions
- Активный платежный аккаунт в **Yandex Cloud** со стартовым грантом **4 000 ₽ на 60 дней** (активирован 22.11.2026).
- Виртуальная машина Yandex Compute Cloud (Ubuntu 24.04 LTS, 2 vCPU, 2 ГБ RAM, 10 ГБ SSD, статический публичный IPv4: `153.51.174.89`).
- Публичный бесплатный wildcard-домен `153.51.174.89.sslip.io` с автоматической DNS-маршрутизацией на IP сервера.
- Установленные на сервере Docker Engine v29.10 и Docker Compose v5.8.
- Активный проект Supabase Cloud (`mwzhtjmnjywvhhyxcdgd`) со статусом `ACTIVE_HEALTHY`.

---

## Scope
1. **Облачный кластер Supabase Cloud (Выполнено)**:
   - Проект в регионе `eu-central-1` с активным расширением `pgvector`.
   - Применена миграция `0001_init.sql` (10 таблиц с жесткими RLS-политиками).
   - Выполнен сид `seeds/seed.ts`: созданы 3 тестовых пользователя в Auth (`student1`, `student2`, `staff`), учебное расписание, зачетка с БРС и 40 статей регламентов.
   - Проект успешно восстановлен из снапшота (`restore_project`) после недельного простоя.
2. **Конфигурация переменных окружения и AI-проксирования (Выполнено)**:
   - Настроены переменные: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
   - Интегрирован OpenRouter (`google/gemma-4-31b-it:free`) с резервом `baidu/ernie-5.5-flash-preview:free` и аварийным локальным оффлайн-движком.
   - Подключен выделенный SOCKS5-прокси (`AI_PROXY_URL`) через `socks-proxy-agent` для стабильного обхода блокировок API OpenRouter.
3. **Оптимизация сборки Next.js 16 и Dockerfile (Выполнено)**:
   - Режим `output: "standalone"` в `next.config.ts`.
   - Многоэтапный `Dockerfile` (deps $\to$ builder $\to$ runner) под непривилегированным пользователем `nextjs:nodejs` (UID 1001) с явным копированием `public/` и `.next/static/`.
4. **Безопасность RAM и поставка контейнера (Yandex Cloud 2 vCPU / 2 ГБ RAM)**:
   - На сервере подключен swap на 1,5 ГБ (`/swapfile`).
   - Сборка и запуск выполнены через `docker compose up -d --build`. В рантайме контейнер потребляет ~220 МБ RSS.
5. **Оркестрация и авто-SSL через Caddy (Выполнено)**:
   - `docker-compose.yml` включает сервисы `dekanat` (порт 3000 закрыт от внешней сети) и `caddy` (порты `80:80` и `443:443`).
   - Caddy автоматически получил и поддерживает Let's Encrypt TLS-сертификат для домена `153.51.174.89.sslip.io`.
   - Принудительный редирект HTTP $\to$ HTTPS, HTTP/2, сжатие gzip/zstd, строгие заголовки безопасности (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).
6. **Эндпоинт мониторинга работоспособности (Выполнено)**:
   - Маршрут `GET /api/health`, возвращающий `{ status: "ok", timestamp: "...", service: "dekanat-core", version: "0.1.0" }` с кодом 200.
7. **Keep-Alive механизм Supabase и защита от засыпания (ADR-002) (Выполнено)**:
   - Системный crontab на сервере каждые 12 часов опрашивает `/api/health`. Это поддерживает активность базы Supabase Cloud против автопаузы Free Tier (7 дней).
8. **Защита приватности конкурсного контура (Выполнено)**:
   - Настроен `public/robots.txt` (`Disallow: /`) и заголовки `noindex, nofollow` для исключения прототипа из поисковой выдачи Яндекс и Google.

---

## Out of scope
- Использование хостингов Vercel, Netlify, Render, Railway, Fly.io (категорически запрещено из-за постоянных и эпизодических блокировок ТСПУ в РФ).
- Использование Cloudflare Tunnels (`*.trycloudflare.com`) и ngrok (дросселирование Cloudflare до 16 КБ/с на мобильных операторах РФ, блокировки ngrok).
- Платные тарифы Supabase (работа ведется строго в рамках Free Tier).

---

## Done-When (Критерии верификации)
1. [x] Публичный URL по протоколу HTTPS стабильно открывается с мобильных устройств через сотовые сети РФ (МТС, Билайн, МегаФон, Т2) и фиксированных провайдеров (Ростелеком) без использования VPN (`https://153.51.174.89.sslip.io`).
2. [x] База данных Supabase восстановлена и переведена в статус `ACTIVE_HEALTHY`.
3. [x] Команда `docker compose up -d` на чистом VPS разворачивает стек и переводит контейнеры в статус `healthy`.
4. [x] Маршрут `GET /api/health` возвращает статус `200 OK` и валидный JSON.
5. [x] В Git-репозитории отсутствуют секретные ключи.

---

## Result (Архивное резюме выполнения)
- **Статус**: 🟢 **DONE (Закрыт)** — 22.11.2026 (02:15 IRKT / 21:15 21.11 MSK).
- **Публичный production URL прототипа**: **`https://153.51.174.89.sslip.io`**
- **Инфраструктура**:
  - ВМ Yandex Compute Cloud (Москва, `153.51.174.89`, Ubuntu 24.04, 2 vCPU, 2 ГБ RAM, 1,5 ГБ swap).
  - Caddy 2 auto-SSL: доверенный сертификат Let's Encrypt получен автоматически.
  - Multi-stage Docker Next.js 16 standalone: запущен в non-root режиме (`nextjs:nodejs`), память RSS ~220 МБ.
  - Supabase Cloud (`eu-central-1`): реактивирован через `restore_project` в `ACTIVE_HEALTHY`.
  - Crontab Keep-Alive: настроен на опрос `/api/health` каждые 12 часов.
- **Верификация**:
  - `curl -ILs https://153.51.174.89.sslip.io` $\to$ `307 /dashboard` $\to$ `307 /login` $\to$ `200 OK`.
  - Дисклеймер конкурса отображается на главной странице и подтвержден сканированием DOM.
