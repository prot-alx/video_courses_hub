# Платформа Видеокурсов

Веб-платформа для размещения и продажи видеокурсов с системой управления пользователями и администрированием контента. Построена на Next.js с использованием PostgreSQL и NextAuth для аутентификации.

## 🎯 Основные возможности

- **Каталог курсов** с фильтрацией и поиском
- **Система пользователей** с ролями (USER/ADMIN)
- **Администрирование** курсов, видео и пользователей
- **Загрузка видео** с автоматической генерацией постеров
- **Запросы на доступ** к платным курсам
- **HTTPS поддержка** с собственными сертификатами
- **Стриминг видео** с защитой контента

## 🚀 Технологический стек

- **Frontend**: Next.js 15.4.6, React 19.1.0, Tailwind CSS 4.1.12
- **Backend**: Next.js API Routes, Node.js HTTPS сервер
- **База данных**: PostgreSQL 15 с Prisma ORM
- **Аутентификация**: NextAuth.js с Google OAuth
- **State Management**: Zustand
- **Валидация**: Zod
- **Файловая система**: Multer для загрузки файлов

## 📁 Структура проекта

```
video-courses-mvp/
├── prisma/                    # База данных
│   ├── schema.prisma         # Схема БД
│   └── migrations/           # Миграции
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── admin/           # Админ панель
│   │   ├── api/             # API endpoints
│   │   ├── auth/            # Страницы аутентификации
│   │   ├── courses/         # Каталог курсов
│   │   └── videos/          # Просмотр видео
│   ├── components/          # React компоненты
│   │   ├── admin/          # Админ компоненты
│   │   ├── courses/        # Компоненты курсов
│   │   └── layout/         # Layout компоненты
│   ├── lib/                # Утилиты и конфигурация
│   ├── stores/             # Zustand stores
│   └── types/              # TypeScript типы
├── public/                 # Статические файлы
├── uploads/               # Загруженные файлы
│   ├── videos/           # Видеофайлы
│   └── thumbnails/       # Постеры
├── your-domain.com+2.pem      # SSL сертификат
├── your-domain.com+2-key.pem  # Приватный ключ
├── server.mjs                  # HTTPS сервер
└── docker-compose.yml         # PostgreSQL контейнер
```

## 🛠 Установка и настройка

### Предварительные требования

- Node.js 18+ и npm
- Docker и Docker Compose
- Git

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd video-courses-mvp
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка базы данных

Запуск PostgreSQL в Docker:

```bash
docker-compose up -d
```

### 4. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# База данных
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# NextAuth
AUTH_URL="https://your-domain.com"
AUTH_SECRET="your-auth-secret-here"

# Google OAuth (получите в Google Cloud Console)
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
```

#### Генерация AUTH_SECRET

Для генерации безопасного секретного ключа используйте:

```bash
# Вариант 1: OpenSSL
openssl rand -base64 32

# Вариант 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Вариант 3: NextAuth CLI
npx auth secret
```

### 5. Выполнение миграций

```bash
npx prisma migrate deploy
npx prisma generate
```

### 6. Генерация SSL сертификатов

Для локальной разработки используется mkcert:

```bash
# Установка корневого сертификата (если еще не установлен)
./mkcert -install

# Генерация сертификата для вашего домена
./mkcert your-domain.com "*.your-domain.com" localhost
```

Убедитесь, что файлы сертификатов находятся в корне проекта:
- `your-domain.com+2.pem` (сертификат)
- `your-domain.com+2-key.pem` (приватный ключ)

Обновите пути к сертификатам в `server.mjs`:

```javascript
const httpsOptions = {
  key: readFileSync('./your-domain.com+2-key.pem'),
  cert: readFileSync('./your-domain.com+2.pem')
}
```

## 🔧 Настройка домена

### Локальная разработка

Для HTTPS в разработке у вас есть два варианта:

**Вариант 1: Использование localhost**
- Генерируйте сертификат для localhost: `./mkcert localhost`
- Доступ: https://localhost

**Вариант 2: Кастомный домен (опционально)**
- Добавьте в hosts файл: `127.0.0.1 your-domain.com`
- Генерируйте сертификат: `./mkcert your-domain.com`
- Доступ: https://your-domain.com

### Продакшн

Настройте DNS записи для вашего домена, чтобы они указывали на IP адрес вашего сервера.

## 🚀 Запуск приложения

### Режим разработки

```bash
# Next.js dev сервер (HTTP)
npm run dev

# Или HTTPS сервер для разработки
npm run start:dev
```

### Продакшн

```bash
# Сборка приложения
npm run build

# Запуск HTTPS сервера
npm run start:prod

# Или через PM2 (рекомендуется)
pm2 start ecosystem.config.js
```

## 🌐 Доступ к приложению

- **Разработка**: https://localhost или http://localhost:3000
- **Продакшн**: https://your-domain.com

### Первый запуск

1. Перейдите на сайт
2. Войдите через Google аккаунт
3. Первый пользователь автоматически получает права ADMIN
4. Настройте контакты в админ панели

## 👥 Система ролей

### USER (Пользователь)
- Просмотр каталога курсов
- Доступ к бесплатным курсам
- Запрос доступа к платным курсам
- Управление профилем

### ADMIN (Администратор)
- Все права пользователя
- Управление курсами и видео
- Обработка запросов на доступ
- Управление пользователями
- Загрузка видеоконтента
- Файловый менеджер

## 📊 База данных

### Основные таблицы

- `users` - Пользователи системы
- `courses` - Курсы
- `videos` - Видеоуроки
- `user_course_access` - Доступы пользователей к курсам
- `course_requests` - Запросы на доступ к курсам
- `admin_settings` - Настройки админ панели

## 🔒 Безопасность

### SSL/TLS

Приложение использует HTTPS с собственными сертификатами:
- Автоматический редирект с HTTP на HTTPS
- TLS сертификаты через mkcert для разработки
- Поддержка реальных SSL сертификатов для продакшна

### Аутентификация

- OAuth 2.0 через Google
- JWT токены для сессий
- Защита API роутов

### Защита контента

- Проверка доступа к видео
- Rate limiting для API
- Валидация загружаемых файлов

## 📋 API Endpoints

### Публичные

- `GET /api/courses` - Список курсов
- `GET /api/courses/[id]` - Информация о курсе
- `POST /api/course-request` - Запрос доступа к курсу

### Защищенные

- `GET /api/videos/[id]/stream` - Стриминг видео
- `GET /api/profile` - Профиль пользователя

### Админские

- `POST /api/admin/courses` - Создание курса
- `POST /api/admin/upload/video` - Загрузка видео
- `GET /api/admin/requests` - Список запросов

## 🔧 Конфигурация сервера

### Development Server (server.mjs)

```javascript
// HTTP редирект на HTTPS (порт 80)
// HTTPS сервер на порту 443
// Автоматическая загрузка SSL сертификатов
```

### PM2 (ecosystem.config.js)

```javascript
// Кластерный режим (2 инстанса)
// Автоперезапуск при ошибках
// Логирование
// Переменные окружения
```

## 📝 Загрузка контента

### Видео

- Поддерживаемые форматы: MP4
- Автоматическая генерация постеров
- Валидация размера файлов
- Организация по папкам

### Постеры

- Автоматическая генерация из видео
- Поддержка пользовательских изображений
- Оптимизация размера

## 🐛 Отладка и логирование

### Логи приложения

```bash
# PM2 логи
pm2 logs video-courses

# Логи в файлах
tail -f /var/log/pm2/video-courses.log
```

### База данных

```bash
# Подключение к БД
psql $DATABASE_URL

# Prisma Studio
npx prisma studio
```

## 🚀 Деплой

### Подготовка сервера

1. Установить Node.js, Docker, PM2
2. Настроить домен и DNS
3. Получить SSL сертификаты
4. Настроить firewall (порты 80, 443)

### Процесс деплоя

```bash
# Клонирование и установка
git clone <repo>
cd video-courses-mvp
npm install

# Настройка БД
docker-compose up -d
npx prisma migrate deploy

# Сборка и запуск
npm run build
pm2 start ecosystem.config.js
```

## 🔄 Обновления

### Обновление кода

```bash
git pull origin main
npm install
npm run build
pm2 restart video-courses
```

### Миграции БД

```bash
npx prisma migrate deploy
pm2 restart video-courses
```

## 📞 Поддержка

Для настройки контактов поддержки используйте админ панель:
- Email поддержки
- Телефон поддержки  
- Telegram поддержки