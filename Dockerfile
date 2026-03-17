# 1. Используем официальный образ Node.js (как у тебя на маке)
FROM node:25-slim

# 2. Создаем рабочую папку внутри контейнера
WORKDIR /usr/src/app

# 3. Копируем файлы со списком библиотек
COPY package*.json ./

# 4. Устанавливаем зависимости
RUN npm install --only=production

# 5. Копируем остальной код (наш index.js)
COPY . .

# 6. Запускаем приложение
CMD [ "node", "index.js" ]