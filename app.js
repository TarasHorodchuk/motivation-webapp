const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// ← ТУТ ТВІЙ ПОТОЧНИЙ NGROK URL (зміни після кожного перезапуску ngrok)
const BOT_API_URL = " https://alease-budless-castiel.ngrok-free.dev";  // ← встав свій актуальний ngrok URL

// Функція для запиту до API бота
async function apiRequest(endpoint, body = {}) {
  try {
    const response = await fetch(`${BOT_API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: tg.initData, ...body })
    });
    return await response.json();
  } catch (err) {
    console.error("API помилка:", err);
    tg.showAlert("Помилка з'єднання з ботом");
    return { error: "Помилка з'єднання" };
  }
}

// Завантаження профілю учня
async function loadStudentProfile() {
  const data = await apiRequest('/api/student/profile');

  if (data.error) {
    document.getElementById("loading").innerText = "Помилка: " + data.error;
    return;
  }

  document.getElementById("loading").style.display = "none";

  document.getElementById("greeting").innerText = `Привіт, ${data.first_name} ${data.last_name}!`;
  document.getElementById("class-info").innerText = `Клас: ${data.class_name}`;
  document.getElementById("total-balance").innerText = `${data.total_coins} 🪙`;

  const subjectsDiv = document.getElementById("subjects-balance");
  subjectsDiv.innerHTML = data.subjects.map(s => `
    <p><strong>${s.name}:</strong> ${s.coins} 🪙</p>
  `).join('');

  const calendarDiv = document.getElementById("calendar");
  if (data.calendar.length === 0) {
    calendarDiv.innerHTML = "<p>Уроків ще не було</p>";
  } else {
    calendarDiv.innerHTML = "<h3>Останні уроки:</h3>" + data.calendar.map(day => `
      <p><strong>${day.date}</strong>: ${day.subject} (+${day.total} 🪙)</p>
    `).join('');
  }
}

// Кнопка оновлення
tg.MainButton.setText("Оновити профіль").show();
tg.MainButton.onClick(loadStudentProfile);

// Завантажуємо при відкритті
loadStudentProfile();