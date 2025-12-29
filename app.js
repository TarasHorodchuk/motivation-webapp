const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// URL твого бота (Flask API) — заміни на свій ngrok або Render URL
const BOT_API_URL = "https://alease-budless-castiel.ngrok-free.dev";  // ← встав свій поточний ngrok URL // ← ТУТ ТВІЙ NGROK АБО RENDER URL

// Функція для запиту до API бота
async function apiRequest(endpoint, body = {}) {
  try {
    const response = await fetch(`${BOT_API_URL}/api${endpoint}`, {
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
  const data = await apiRequest('/student/profile');

  if (data.error) {
    document.getElementById("content").innerHTML = `<p style="color:red;">Помилка: ${data.error}</p>`;
    return;
  }

  // Заповнюємо дані
  document.getElementById("greeting").innerText = `Привіт, ${data.first_name} ${data.last_name}!`;
  document.getElementById("class-info").innerText = `Клас: ${data.class_name}`;
  document.getElementById("total-balance").innerText = `${data.total_coins} 🪙`;

  // Баланс по предметах
  const subjectsDiv = document.getElementById("subjects-balance");
  subjectsDiv.innerHTML = data.subjects.map(s => `
    <p><strong>${s.name}:</strong> ${s.coins} 🪙</p>
  `).join('');

  // Календар
  const calendarDiv = document.getElementById("calendar");
  if (data.calendar.length === 0) {
    calendarDiv.innerHTML = "<p>Уроків ще не було</p>";
  } else {
    calendarDiv.innerHTML = "<h3>Останні уроки:</h3>" + data.calendar.map(day => `
      <p><strong>${day.date}</strong> (${day.subject}): +${day.total} 🪙</p>
    `).join('');
  }
}

// Покупка +1 бал
async function buyBonus(bonus) {
  const cost = bonus === 1 ? 10 : 20;
  const confirm = confirm(`Купити +${bonus} бал(и) за ${cost} монет?`);
  if (!confirm) return;

  const data = await apiRequest('/student/buy_bonus', { bonus, cost });
  if (data.success) {
    tg.showAlert(data.success);
    loadStudentProfile();  // Оновлюємо профіль
  } else {
    tg.showAlert(data.error || "Недостатньо монет");
  }
}

// Зняття зауваження
async function buyRemoveWarning() {
  const confirm = confirm("Зняти зауваження за 8 монет?");
  if (!confirm) return;

  const data = await apiRequest('/student/remove_warning');
  if (data.success) {
    tg.showAlert(data.success);
    loadStudentProfile();
  } else {
    tg.showAlert(data.error || "Недостатньо монет");
  }
}

// Головна кнопка — оновити
tg.MainButton.setText("Оновити профіль").show();
tg.MainButton.onClick(loadStudentProfile);

// Завантажуємо профіль при відкритті
loadStudentProfile();