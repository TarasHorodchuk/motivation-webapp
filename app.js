const tg = window.Telegram.WebApp;

// Функція для безпечного запиту до API бота
async function apiRequest(endpoint, options = {}) {
  const initData = tg.initData;
  const response = await fetch(`/api${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData, ...options })
  });
  return response.json();
}

// Функція для завантаження профілю учня
async function loadStudentProfile() {
  try {
    const data = await apiRequest('/student/profile');
    if (data.error) {
      tg.showAlert(data.error);
      return;
    }

    document.getElementById("greeting").innerText = `Привіт, ${data.first_name}!`;
    document.getElementById("class-info").innerText = `Клас: ${data.class_name}`;
    document.getElementById("total-balance").innerText = `${data.total_coins} 🪙`;

    const subjectsDiv = document.getElementById("subjects-balance");
    subjectsDiv.innerHTML = data.subjects.map(s => `
      <p>• ${s.name}: <strong>${s.coins} 🪙</strong></p>
    `).join('');

    // Завантажуємо календар
    const calendarDiv = document.getElementById("calendar");
    const builder = new InlineKeyboardBuilder();
    data.lesson_dates.forEach(day => {
      builder.button(text=day.date, callback_data=`detail_${day.date}`);
    });
    builder.adjust(1);
    calendarDiv.innerHTML = "<h3>Дати уроків:</h3>" + builder.as_markup().inline_keyboard.map(row =>
      row.map(btn => `<button onclick="showDayDetail('${btn.callback_data}')">${btn.text}</button>`).join('')
    ).join('<br>');

  } catch (err) {
    tg.showAlert("Помилка завантаження профілю");
  }
}

// Функція для показу деталі за день
function showDayDetail(callback_data) {
  // Тут буде запит до API бота для деталі за день
  tg.showAlert(`Деталі за день: ${callback_data} (поки тест)`);
}

// Функція для покупки
async function buyBonus(bonus) {
  const cost = bonus === 1 ? 10 : 20;
  try {
    const data = await apiRequest('/student/buy', { bonus, cost });
    if (data.success) {
      tg.showAlert(`+${bonus} бали куплено за ${cost} монет!`);
      loadStudentProfile();  // Оновлюємо баланс
    } else {
      tg.showAlert(data.error || "Недостатньо монет");
    }
  } catch (err) {
    tg.showAlert("Помилка покупки");
  }
}

// Функція для зняття зауваження
async function buyRemoveWarning() {
  const cost = 8;
  try {
    const data = await apiRequest('/student/remove_warning', { cost });
    if (data.success) {
      tg.showAlert("Зауваження знято за 8 монет!");
      loadStudentProfile();
    } else {
      tg.showAlert(data.error || "Недостатньо монет");
    }
  } catch (err) {
    tg.showAlert("Помилка зняття зауваження");
  }
}