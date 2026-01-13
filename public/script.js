const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const currentWeather = document.getElementById('currentWeather');
const forecast = document.getElementById('forecast');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');
const alertBanner = document.getElementById('alertBanner');
const maxTempInput = document.getElementById('maxTemp');
const minTempInput = document.getElementById('minTemp');

searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

async function handleSearch() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    hideAll();
    showLoading();
    
    try {
        await Promise.all([
            fetchCurrentWeather(city),
            fetchForecast(city)
        ]);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

async function fetchCurrentWeather(city) {
    const response = await fetch(`/api/weather/current/${encodeURIComponent(city)}`);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch weather');
    }
    
    const data = await response.json();
    displayCurrentWeather(data);
    checkTemperatureAlerts(data.main.temp);
}

async function fetchForecast(city) {
    const response = await fetch(`/api/weather/forecast/${encodeURIComponent(city)}`);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch forecast');
    }
    
    const data = await response.json();
    displayForecast(data);
}

function displayCurrentWeather(data) {
    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°F`;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°F`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.wind.speed} mph`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    
    const iconCode = data.weather[0].icon;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    currentWeather.classList.remove('hidden');
}

function displayForecast(data) {
    const forecastCards = document.getElementById('forecastCards');
    forecastCards.innerHTML = '';
    
    const dailyForecasts = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);
    
    dailyForecasts.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <h4>${dayName}</h4>
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="Weather">
            <div class="temp">${Math.round(item.main.temp)}°F</div>
            <div class="desc">${item.weather[0].description}</div>
        `;
        
        forecastCards.appendChild(card);
    });
    
    forecast.classList.remove('hidden');
}

function checkTemperatureAlerts(currentTemp) {
    const maxTemp = parseFloat(maxTempInput.value) || 90;
    const minTemp = parseFloat(minTempInput.value) || 32;
    
    alertBanner.classList.add('hidden');
    alertBanner.classList.remove('cold');
    
    if (currentTemp > maxTemp) {
        alertBanner.textContent = `🔥 High Temperature Alert! Current: ${Math.round(currentTemp)}°F exceeds ${maxTemp}°F`;
        alertBanner.classList.remove('hidden');
    } else if (currentTemp < minTemp) {
        alertBanner.textContent = `❄️ Low Temperature Alert! Current: ${Math.round(currentTemp)}°F below ${minTemp}°F`;
        alertBanner.classList.remove('hidden');
        alertBanner.classList.add('cold');
    }
}

function showError(message) {
    errorMessage.textContent = `❌ ${message}`;
    errorMessage.classList.remove('hidden');
}

function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function hideAll() {
    currentWeather.classList.add('hidden');
    forecast.classList.add('hidden');
    errorMessage.classList.add('hidden');
    alertBanner.classList.add('hidden');
}