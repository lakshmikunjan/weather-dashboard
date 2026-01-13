# Weather Dashboard

A modern, full-stack weather application featuring real-time weather data, 5-day forecasts, and customizable temperature alerts. Built with a sleek glassmorphism UI in blue and black color scheme.

![Weather Dashboard](https://img.shields.io/badge/status-active-success.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- **Auto-Location Detection**: Automatically detect weather for your current location using GPS
- **Real-Time Weather Data**: Get current weather conditions for any city worldwide
- **5-Day Forecast**: Detailed weather predictions with daily breakdowns
- **Temperature Alerts**: Set custom high/low temperature thresholds with visual notifications
- **Modern UI**: Glassmorphism design with smooth animations and responsive layout
- **Secure API**: Backend server protects API keys from client exposure
- **Fast Search**: Quick city search with Enter key support

## Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Glassmorphism UI design
- Responsive Grid/Flexbox layouts
- Async/Await for API calls
- Geolocation API

**Backend:**
- Node.js
- Express.js
- Axios for HTTP requests
- CORS middleware
- Environment variables with dotenv

**API:**
- OpenWeatherMap API

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- OpenWeatherMap API key (free tier)

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/lakshmikunjan/weather-dashboard.git
cd weather-dashboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
touch .env
```

4. **Add your API key to `.env`**
```env
OPENWEATHER_API_KEY=your_api_key_here
PORT=3000
```

5. **Get your free API key**
- Sign up at [OpenWeatherMap](https://openweathermap.org/api)
- Navigate to API Keys section
- Copy your key (activation takes approximately 2 hours)

6. **Start the development server**
```bash
npm run dev
```

7. **Open in browser**
```
http://localhost:3000
```

## Usage

1. **Auto-Location**: Click the "My Location" button to automatically detect your current location's weather
2. **Manual Search**: Enter any city name (e.g., "New York", "London", "Tokyo") and click Search or press Enter
3. **View Weather**: See current conditions including:
   - Temperature (Fahrenheit)
   - Weather description
   - Feels like temperature
   - Humidity percentage
   - Wind speed
   - Atmospheric pressure
4. **5-Day Forecast**: Scroll down to see the extended forecast
5. **Temperature Alerts**: Customize alert thresholds and receive visual notifications

## Project Structure
```
weather-dashboard/
├── public/
│   ├── index.html          # Main HTML structure
│   ├── style.css           # Modern glassmorphism styling
│   └── script.js           # Frontend logic & API calls
├── server.js               # Express backend server
├── .env                    # Environment variables (not in repo)
├── .gitignore             # Git ignore rules
├── package.json           # Project dependencies
└── README.md              # Project documentation
```

## API Endpoints

**Backend Routes:**

- `GET /api/weather/current/:city` - Get current weather for a city
- `GET /api/weather/forecast/:city` - Get 5-day forecast for a city
- `GET /api/weather/coordinates/:lat/:lon` - Get current weather by GPS coordinates
- `GET /api/weather/forecast-coordinates/:lat/:lon` - Get forecast by GPS coordinates

## Design Features

- **Glassmorphism UI**: Frosted glass effect with backdrop blur
- **Color Scheme**: Blue (#3b82f6) and Black (#0f172a) gradient
- **Smooth Animations**: Hover effects, loading spinners, slide-down alerts
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Accessibility**: High contrast text, clear labels, keyboard navigation

## Future Enhancements

- Add hourly forecast breakdown
- Implement weather maps visualization
- Add favorite cities feature with local storage
- Include air quality index (AQI) data
- Implement dark/light theme toggle
- Add weather notifications
- Support multiple temperature units (Celsius, Fahrenheit, Kelvin)
- Add weather comparison between cities

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the [issues page](https://github.com/lakshmikunjan/weather-dashboard/issues).

## License

This project is [MIT](LICENSE) licensed.

## Author

**Lakshmi Kunjan**
- GitHub: [@lakshmikunjan](https://github.com/lakshmikunjan)
- Project Link: [https://github.com/lakshmikunjan/weather-dashboard](https://github.com/lakshmikunjan/weather-dashboard)

## Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons from OpenWeatherMap's icon set
- Inspired by modern weather applications

---