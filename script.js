const apiKey = "631b3d1b84c325f70b8a1ced5a35bbeb";
let weeklyChart;

async function getWeather() {
  const city = document.getElementById("city-input").value.trim();
  if (!city) return;

  try {
    // Dados atuais da cidade
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=pt_br&units=metric`
    );
    if (!weatherResponse.ok) throw new Error("Cidade não encontrada");
    const data = await weatherResponse.json();

    // Atualiza dashboard
    document.querySelector(".temperature").textContent = `${Math.round(data.main.temp)}°C`;
    document.querySelector(".description").textContent =
      data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
    document.getElementById("humidity").textContent = `${data.main.humidity}%`;
    document.getElementById("wind").textContent = `${Math.round(data.wind.speed)} km/h`;
    const icon = data.weather[0].icon;
    document.querySelector(".weather-icon").innerHTML =
      `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Clima">`;

    // Fundo do body conforme clima
    const mainWeather = data.weather[0].main.toLowerCase();
    const body = document.body;
    const dashboard = document.querySelector(".dashboard");

    switch(mainWeather){
      case "clear": body.style.background = "linear-gradient(to right, #56CCF2, #2F80ED)"; break;
      case "clouds": body.style.background = "linear-gradient(to right, #757F9A, #D7DDE8)"; break;
      case "rain":
      case "drizzle": body.style.background = "linear-gradient(to right, #4B79A1, #283E51)"; break;
      case "thunderstorm": body.style.background = "linear-gradient(to right, #141E30, #243B55)"; break;
      case "snow": body.style.background = "linear-gradient(to right, #83a4d4, #b6fbff)"; break;
      case "mist":
      case "fog": body.style.background = "linear-gradient(to right, #606c88, #3f4c6b)"; break;
      default: body.style.background = "linear-gradient(to right, #2c3e50, #4ca1af)";
    }

    dashboard.style.background = "rgba(28, 31, 39, 0.9)";
    dashboard.style.boxShadow = "0 5px 20px rgba(0,0,0,0.3)";
    dashboard.style.borderRadius = "15px";

    // Previsão de 5 dias / 3h
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=pt_br`
    );
    if (!forecastResponse.ok) throw new Error("Não foi possível obter previsão");
    const forecastData = await forecastResponse.json();

    // Transformar dados de 3h em previsão diária
    const daily = {};
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short' });
      if (!daily[date]) daily[date] = { max: item.main.temp, min: item.main.temp };
      daily[date].max = Math.max(daily[date].max, item.main.temp);
      daily[date].min = Math.min(daily[date].min, item.main.temp);
    });

    const days = Object.keys(daily).slice(0, 7);
    const tempMax = days.map(day => daily[day].max);
    const tempMin = days.map(day => daily[day].min);

    // Atualiza gráfico
    if (weeklyChart) weeklyChart.destroy();
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    weeklyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Máx',
            data: tempMax,
            borderColor: '#FF5733',
            backgroundColor: 'rgba(255,87,51,0.2)',
            tension: 0.3
          },
          {
            label: 'Mín',
            data: tempMin,
            borderColor: '#33C1FF',
            backgroundColor: 'rgba(51,193,255,0.2)',
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top', labels: { color: '#fff' } } },
        scales: {
          x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
          y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
        }
      }
    });

  } catch (error) {
    alert(error.message);
  }
}

// Pesquisa com Enter
document.getElementById("city-input").addEventListener("keypress", function(e){
  if(e.key === "Enter") getWeather();
});


