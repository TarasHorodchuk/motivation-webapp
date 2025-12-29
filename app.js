const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Твій поточний ngrok URL
const BOT_API_URL = "https://alease-budless-castiel.ngrok-free.dev";  // ← Онови після перезапуску ngrok

async function apiRequest(endpoint) {
  try {
    const response = await fetch(`${BOT_API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: tg.initData })
    });
    return await response.json();
  } catch (err) {
    console.error("API помилка:", err);
    return { error: "Помилка з'єднання" };
  }
}

async function loadProfile() {
  const data = await apiRequest('/api/student/profile');

  if (data.error) {
    document.getElementById("loading").innerText = "Помилка: " + data.error;
    return;
  }

  document.getElementById("loading").style.display = "none";
  document.getElementById("profile").style.display = "block";

  document.getElementById("greeting").innerText = `Привіт, ${data.first_name} ${data.last_name}!`;
  document.getElementById("class-info").innerText = `Клас: ${data.class_name}`;
  document.getElementById("total-balance").innerText = `${data.total_coins} 🪙`;

  const subjectsDiv = document.getElementById("subjects-balance");
  subjectsDiv.innerHTML = data.subjects.map(s => `
    <p><strong>${s.name}:</strong> ${s.coins} 🪙</p>
  `).join('');

  renderCalendar(data.lesson_dates, data.daily_details);
}

function renderCalendar(lessonDates, dailyDetails) {
  const container = document.getElementById("calendar-container");
  container.innerHTML = "";

  const today = new Date();
  const months = [
    { year: today.getFullYear(), month: today.getMonth() },
    { year: today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear(), month: today.getMonth() === 0 ? 11 : today.getMonth() - 1 }
  ];

  const monthsUa = ["січень", "лютий", "березень", "квітень", "травень", "червень", "липень", "серпень", "вересень", "жовтень", "листопад", "грудень"];
  const daysHeader = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

  months.forEach(m => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `<h3>${monthsUa[m.month]} ${m.year}</h3>`;

    const headerDiv = document.createElement("div");
    headerDiv.className = "calendar-header";
    daysHeader.forEach(d => {
      const span = document.createElement("span");
      span.textContent = d;
      headerDiv.appendChild(span);
    });
    div.appendChild(headerDiv);

    const grid = document.createElement("div");
    grid.className = "calendar-grid";

    const firstDay = new Date(m.year, m.month, 1).getDay();
    const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();

    // Порожні клітинки перед першим днем
    for (let i = 1; i < (firstDay === 0 ? 7 : firstDay); i++) {
      const empty = document.createElement("div");
      empty.className = "calendar-day empty";
      grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDiv = document.createElement("div");
      dayDiv.className = "calendar-day";

      const dayDate = new Date(m.year, m.month, day);
      const dayStr = dayDate.toISOString().slice(0, 10);

      if (lessonDates.includes(dayStr)) {
        dayDiv.className += " lesson";
        dayDiv.onclick = () => showDayDetail(dayStr, dailyDetails[dayStr]);
      } else {
        dayDiv.className += " other";
      }

      dayDiv.textContent = day;
      grid.appendChild(dayDiv);
    }

    div.appendChild(grid);
    container.appendChild(div);
  });
}

function showDayDetail(dayStr, details) {
  const monthsUa = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
  const dayObj = new Date(dayStr);
  const dayFormatted = `${dayObj.getDate()} ${monthsUa[dayObj.getMonth()]} ${dayObj.getFullYear()}`;
  const dayOfWeek = ["понеділок", "вівторок", "середа", "четвер", "п'ятниця", "субота", "неділя"][dayObj.getDay()];

  let text = `<strong>${dayFormatted} (${dayOfWeek})</strong><br><br>`;

  if (!details || details.total === 0) {
    text += "За цю дату немає нарахувань.";
  } else {
    text += `Сумарно: ${details.total} 🪙<br><br>`;
    for (let crit of details.criteria) {
      text += `✓ ${crit.criterion} (+${crit.coins} монет)<br>`;
    }
  }

  document.getElementById("day-details").innerHTML = text;
}

function buyBonus(bonus) {
  tg.showAlert(`Куплено +${bonus} бал(и) (поки тест)`);
}

function buyRemoveWarning() {
  tg.showAlert("Зауваження знято (поки тест)");
}

tg.MainButton.setText("Оновити").show();
tg.MainButton.onClick(loadProfile);

loadProfile();