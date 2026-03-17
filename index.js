const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Firestore } = require('@google-cloud/firestore'); // Меняем библиотеку

// Инициализируем Firestore напрямую
const db = new Firestore({
    projectId: 'gen-lang-client-0917967367',
    databaseId: 'firestore-db-001',
});

const app = express();
const port = process.env.PORT || 8080;

// 2. Инициализация Gemini через переменную окружения
// Мы передадим этот ключ позже в настройках Cloud Run
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', async (req, res) => {
    try {
        // --- РАБОТА С ДАННЫМИ (Firestore) ---
        const counterRef = db.collection('stats').doc('global');
        const doc = await counterRef.get();

        let count = 1;
        if (doc.exists) {
            count = (doc.data().views || 0) + 1;
        }

        // Сохраняем обновленный счетчик
        await counterRef.set({ views: count }, { merge: true });

        // --- РАБОТА С ИИ (Gemini) ---
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Ты — дружелюбный ИИ. Поприветствуй пользователя. 
                    Скажи ему, что он посетитель №${count}. 
                    Напиши одно короткое предсказание на сегодня.`;

        const result = await model.generateContent(prompt);
        const aiText = result.response.text();

        // --- ОТВЕТ ПОЛЬЗОВАТЕЛЮ ---
        res.send(`
      <div style="font-family: sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; box-shadow: 2px 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #4285F4;">Hello from Google Cloud! ☁️</h1>
        <div style="background: #f9f9f9; padding: 15px; border-left: 5px solid #4285F4; margin: 20px 0;">
          ${aiText}
        </div>
        <p style="color: #666;">Статистика: это обращение к ИИ было под номером <strong>${count}</strong>.</p>
      </div>
    `);

    } catch (error) {
        console.error("Ошибка приложения:", error);
        res.status(500).send("Произошла ошибка: " + error.message);
    }
});

app.listen(port, () => {
    console.log(`Приложение слушает порт ${port}`);
});