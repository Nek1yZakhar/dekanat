# Руководство по настройке и запуску сервиса («Цифровой деканат»)

Данный документ содержит актуальную пошаговую инструкцию по инфраструктуре, связыванию базы данных Supabase, настройке AI-ассистента и эксплуатации боевого сервера в **Yandex Cloud** для жюри конкурса *MGIMO × AI Challenge*.

---

## 📌 Текущий прогресс настройки

- [x] **Шаг 1**: Создать проект в Supabase Cloud и скопировать ключи — **ВЫПОЛНЕНО** (проект `dekanat`, ref `mwzhtjmnjywvhhyxcdgd`, регион `eu-central-1`)
- [x] **Шаг 2**: Включить pgvector и накатить миграцию с сидами — **ВЫПОЛНЕНО** (10 таблиц с RLS, 3 аккаунта, расписание, зачётка, 40 статей регламентов)
- [x] **Шаг 3**: Настроить AI-провайдера (OpenRouter Gemma 4 31B + SOCKS5 прокси) — **ВЫПОЛНЕНО** (протестировано, гибридный RAG работает)
- [x] **Шаг 4**: Создать репозиторий на GitHub и связать с проектом — **ВЫПОЛНЕНО** (https://github.com/Nek1yZakhar/dekanat)
- [x] **Шаг 5**: Настроить MCP-серверы в AntiGravity — **ВЫПОЛНЕНО** (MCP `supabase-mcp-server` и `github-server-nek1y` активны)
- [x] **Шаг 6**: Развернуть суверенный сервер на Yandex Cloud (Москва) с Caddy auto-SSL — **ВЫПОЛНЕНО** (публичный URL: **`https://153.51.174.89.sslip.io`**)

---

## 1. База данных Supabase Cloud (Боевой контур)

Проект активен (`ACTIVE_HEALTHY`), схема развернута, сиды загружены:
- **URL**: `https://mwzhtjmnjywvhhyxcdgd.supabase.co`
- **Ключ anon**: сохранён в `.env`
- **Ключ service_role**: строго серверный, сохранён в `.env`
- **Тестовые аккаунты для жюри**:
  - Студент 1 (отличник): `student1@dekanat.fake` / `DekanatPass2026!`
  - Студент 2 (с пересдачей): `student2@dekanat.fake` / `DekanatPass2026!`
  - Сотрудник деканата: `staff@dekanat.fake` / `DekanatPass2026!`

---

## 2. AI-ассистент деканата (OpenRouter + SOCKS5 Egress)

Система настроена и протестирована на живых запросах:
- **Основная модель**: `google/gemma-4-31b-it:free` (высокое качество рассуждений на русском языке, контекст 256K).
- **Резервная модель**: `baidu/ernie-5.5-flash-preview:free` (подхватывает запросы при 429 от Gemma).
- **Сетевой мост**: SOCKS5-прокси подключен через библиотеку `socks-proxy-agent`.
- **RAG-поиск**: перед обращением к LLM роут `/api/ai/chat` ищет статьи среди 40 университетских регламентов в базе Supabase через косинусное сходство `pgvector`.
- **Оффлайн-фоллбэк**: при недоступности внешних AI API чат выдает детерминированный ответ с точной статьей регламента.

---

## 3. Продакшен-хостинг в Yandex Cloud (Compute VM)

Прототип развернут на виртуальной машине в дата-центре Yandex Cloud (Москва, зона `ru-central1-d`).

### Характеристики сервера:
- **Публичный IP**: `153.51.174.89`
- **Публичный домен**: `https://153.51.174.89.sslip.io`
- **ОС**: Ubuntu 24.04 LTS (Noble Numbat)
- **Ресурсы**: 2 vCPU, 2 ГБ RAM, 10 ГБ SSD, подключен swap-файл на 1,5 ГБ (`/swapfile`).
- **Стек**: Docker CE v29.10, Docker Compose v5.8, Caddy 2 (Alpine).
- **Фаервол (UFW)**: разрешены порты `22` (SSH), `80` (HTTP ACME), `443` (HTTPS TLS).

### Эксплуатация и обновление приложения:
Подключение по SSH:
```bash
ssh ubuntu@153.51.174.89
```

Обновление и перезапуск стека на сервере:
```bash
cd /home/ubuntu/dekanat
docker compose down
docker compose up -d --build
docker compose ps
```

Проверка логов контейнеров:
```bash
docker logs dekanat-app --tail 50
docker logs dekanat-caddy --tail 50
```

Проверка Keep-Alive crontab:
```bash
crontab -l
# 0 */12 * * * /usr/bin/curl -s https://153.51.174.89.sslip.io/api/health > /dev/null
```
