const routes = [
  { name: "Morris Loop", miles: 51.8, elevation: 820, outboundHeading: 202, rides: 47 },
  { name: "Yorkville South", miles: 48.9, elevation: 690, outboundHeading: 190, rides: 24 },
  { name: "Plainfield West", miles: 46.4, elevation: 510, outboundHeading: 264, rides: 31 },
  { name: "Batavia Rollers", miles: 52.3, elevation: 1240, outboundHeading: 315, rides: 18 },
];
const weatherDays = [
  { summary: "61–76°F · dry until evening", icon: "☀", title: "Tomorrow looks good.", hours: [[61,2,"SSW",8,13,"Clear","☀"],[64,1,"SSW",10,16,"Sunny","☀"],[67,1,"SSW",11,18,"Sunny","☀"],[70,2,"SSW",13,21,"Mostly sunny","🌤"],[72,3,"SW",14,23,"Partly cloudy","⛅"],[75,5,"SW",16,26,"Partly cloudy","⛅"]] },
  { summary: "58–65°F · steady rain in the morning", icon: "🌧", title: "Rain is likely.", hours: [[58,72,"E",13,21,"Rain","🌧"],[59,78,"E",14,24,"Rain","🌧"],[61,74,"ENE",15,25,"Rain","🌧"],[63,61,"ENE",16,27,"Showers","🌦"],[64,47,"NE",14,23,"Showers","🌦"],[65,35,"NE",12,19,"Cloudy","☁"]] },
  { summary: "55–69°F · breezy but dry", icon: "🌤", title: "A breezy ride day.", hours: [[55,3,"NW",14,24,"Clear","☀"],[58,2,"NW",16,27,"Sunny","☀"],[61,2,"NW",18,31,"Sunny","☀"],[64,3,"NW",19,33,"Sunny","☀"],[67,4,"WNW",20,35,"Mostly sunny","🌤"],[69,5,"WNW",19,34,"Partly cloudy","⛅"]] },
  { summary: "60–73°F · mild with low rain risk", icon: "⛅", title: "A comfortable ride day.", hours: [[60,5,"W",6,10,"Mostly clear","🌤"],[62,6,"W",7,11,"Partly cloudy","⛅"],[65,8,"WSW",8,13,"Partly cloudy","⛅"],[68,10,"WSW",9,15,"Cloudy","☁"],[71,12,"SW",10,16,"Cloudy","☁"],[73,14,"SW",11,18,"Cloudy","☁"]] },
  { summary: "67–82°F · warm and clear", icon: "☀", title: "A great ride day.", hours: [[67,1,"S",5,9,"Clear","☀"],[70,1,"S",6,10,"Sunny","☀"],[73,2,"SSW",7,12,"Sunny","☀"],[77,2,"SSW",8,14,"Sunny","☀"],[80,3,"SW",9,15,"Sunny","☀"],[82,4,"SW",10,17,"Mostly sunny","🌤"]] },
  { summary: "64–72°F · storms possible late morning", icon: "⛈", title: "Storms may interrupt your ride.", hours: [[64,18,"S",9,15,"Cloudy","☁"],[66,28,"S",10,17,"Cloudy","☁"],[68,42,"SSW",13,22,"Showers possible","🌦"],[70,63,"SSW",17,30,"Thunderstorms","⛈"],[72,70,"SW",19,35,"Thunderstorms","⛈"],[71,58,"W",17,31,"Showers","🌧"]] },
  { summary: "52–63°F · cool and mostly dry", icon: "🌤", title: "Cool but rideable.", hours: [[52,3,"NNE",7,12,"Clear","☀"],[54,4,"NNE",8,14,"Sunny","☀"],[57,5,"NE",9,16,"Mostly sunny","🌤"],[59,6,"NE",10,17,"Partly cloudy","⛅"],[61,8,"ENE",11,19,"Partly cloudy","⛅"],[63,10,"E",11,20,"Cloudy","☁"]] },
].map((day, dayIndex) => ({ ...day, hours: day.hours.map(([temp, precipitation, direction, speed, gusts, condition, icon], index) => ({ hour: index + 6, temp, precipitation, direction, speed, gusts, condition, icon })), dayIndex }));
const form = document.querySelector("#ride-form");
const distance = document.querySelector("#distance");
const distanceOutput = document.querySelector("#distance-output");
const routeList = document.querySelector("#route-list");
const conditionsSummary = document.querySelector("#conditions-summary");
const hourlyForecastElement = document.querySelector("#hourly-forecast");
const daySelect = document.querySelector("#ride-day");
const rideTimeSelect = document.querySelector("#ride-time");
const warning = document.querySelector("#ride-warning");
const settingsDialog = document.querySelector("#settings-dialog");
const settingsButton = document.querySelector("#settings-button");
const connectStravaButton = document.querySelector("#connect-strava");
const stravaConsent = document.querySelector("#strava-consent");
const stravaStatus = document.querySelector("#strava-status");
const menus = document.querySelectorAll(".menu");
let isStravaConnected = false;

function dayLabel(index) {
  const date = new Date(); date.setDate(date.getDate() + index + 1);
  return index === 0 ? "Tomorrow" : date.toLocaleDateString(undefined, { weekday: "long" });
}
function dayDate(index) {
  const date = new Date(); date.setDate(date.getDate() + index + 1);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function selectedDay() { return weatherDays[Number(daySelect.value)]; }
function windForHour(hour, day = selectedDay()) {
  const forecast = day.hours.find(item => item.hour === hour) || day.hours[2];
  return { from: forecast.direction === "SW" ? 225 : 205, speed: forecast.speed, label: forecast.direction, gusts: forecast.gusts, temp: forecast.temp, precipitation: forecast.precipitation };
}
function formatHour(hour) { return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`; }
function renderHourlyForecast(selectedHour, day) {
  hourlyForecastElement.innerHTML = day.hours.map(item => `<article class="hour-card${item.hour === selectedHour ? " selected" : ""}"><p class="hour-time">${formatHour(item.hour)}${item.hour === selectedHour ? " · START" : ""}</p><div class="weather-icon" aria-hidden="true">${item.icon}</div><p class="hour-temp">${item.temp}°</p><p class="hour-condition">${item.condition}</p><p class="weather-line"><span>Precip.</span><strong>${item.precipitation}%</strong></p><p class="weather-line"><span>Wind</span><strong>${item.direction} ${item.speed} mph</strong></p><p class="weather-line"><span>Gusts</span><strong>${item.gusts} mph</strong></p></article>`).join("");
}
function renderDayDetails(day, hour) {
  const weather = windForHour(hour, day);
  document.querySelector("#hero-weather-icon").textContent = day.icon;
  document.querySelector("#hero-weather-title").textContent = day.title;
  document.querySelector("#hero-weather-summary").textContent = day.summary;
  document.querySelector("#forecast-eyebrow").textContent = `${dayLabel(day.dayIndex).toUpperCase()}'S FORECAST`;
  document.querySelector("#forecast-title").textContent = `${dayLabel(day.dayIndex)} · ${dayDate(day.dayIndex)}`;
  document.querySelector("#planner-title").textContent = day.dayIndex === 0 ? "Plan tomorrow's ride" : `Plan ${dayLabel(day.dayIndex)}'s ride`;
  document.querySelector("#recommendations-title").textContent = `Your best routes for ${dayLabel(day.dayIndex)}`;
  document.querySelector("#rain-hours").textContent = day.hours.filter(item => item.precipitation >= 40).length;
  document.querySelector("#day-high").textContent = `${Math.max(...day.hours.map(item => item.temp))}°`;
  const warnings = [];
  const laterConditions = day.hours.filter(item => item.hour > hour && item.hour <= hour + 3);
  const upcomingStorm = laterConditions.find(item => /Thunderstorm/.test(item.condition));
  if (weather.precipitation >= 40) warnings.push(`Rain is likely at ${formatHour(hour)} (${weather.precipitation}% chance), which can leave roads slick.`);
  if (weather.gusts >= 28) warnings.push(`Wind gusts may reach ${weather.gusts} mph at departure.`);
  if (weather.temp <= 45 || weather.temp >= 90) warnings.push(`The expected ${weather.temp}° departure temperature may be uncomfortable.`);
  if (upcomingStorm) warnings.push(`Thunderstorms are possible around ${formatHour(upcomingStorm.hour)} during your ride.`);
  warning.hidden = warnings.length === 0;
  document.querySelector("#warning-title").textContent = warnings.length ? "Why riding conditions need attention" : "";
  document.querySelector("#warning-copy").textContent = warnings.length ? warnings.join(" ") : "";
}
function windComponent(routeHeading, windFrom, speed) { return Math.cos((routeHeading - windFrom) * Math.PI / 180) * speed; }
function scoreRoute(route, desiredMiles, preference, rideType, weather) {
  const distanceScore = Math.max(0, 32 - Math.abs(route.miles - desiredMiles) * 3.1);
  const headwind = windComponent(route.outboundHeading, weather.from, weather.speed);
  let windScore = 0;
  if (preference === "headwind-early") windScore = Math.max(0, 46 + headwind * 3.5);
  if (preference === "tailwind-early") windScore = Math.max(0, 46 - headwind * 3.5);
  if (preference === "least-wind") windScore = Math.max(0, 46 - Math.abs(headwind) * 2.2);
  const elevationAdjustment = rideType === "easy" ? Math.max(0, 12 - route.elevation / 150) : rideType === "training" ? Math.min(12, route.elevation / 90) : 8;
  return Math.round(Math.min(99, distanceScore + windScore + elevationAdjustment));
}
function routeReason(route, preference, weather) {
  const headwind = windComponent(route.outboundHeading, weather.from, weather.speed);
  if (preference === "least-wind") return `Only ${Math.round(Math.abs(headwind))} mph direct wind on the outbound leg.`;
  const favorable = preference === "headwind-early" ? headwind > 0 : headwind < 0;
  return favorable ? "Wind works in your preferred direction; the return reverses it." : "Strong distance match, with a less favorable wind angle.";
}
function renderRoutes() {
  const desiredMiles = Number(distance.value); const hour = Number(document.querySelector("#ride-time").value); const preference = document.querySelector("#wind-preference").value; const rideType = document.querySelector("#ride-type").value; const day = selectedDay(); const weather = windForHour(hour, day);
  const sorted = routes.map(route => ({ ...route, score: scoreRoute(route, desiredMiles, preference, rideType, weather) })).sort((a, b) => b.score - a.score);
  conditionsSummary.textContent = `${weather.label} ${weather.speed} mph at ${hour}:00 AM`;
  renderHourlyForecast(hour, day);
  renderDayDetails(day, hour);
  routeList.innerHTML = sorted.map((route, index) => `<article class="route-card"><div class="rank">${["🥇", "🥈", "🥉", "4"][index]}</div><div><h3 class="route-name">${route.name}</h3><p class="route-meta">${route.miles.toFixed(1)} mi · ${route.elevation.toLocaleString()} ft · ridden ${route.rides} times</p></div><p class="route-reason">${routeReason(route, preference, weather)}</p><div class="score"><strong>${route.score}</strong><span>wind score</span></div></article>`).join("");
}
distance.addEventListener("input", () => { distanceOutput.textContent = `${distance.value} mi`; });
document.querySelector("#ride-time").addEventListener("change", renderRoutes);
daySelect.addEventListener("change", renderRoutes);
settingsButton.addEventListener("click", () => settingsDialog.showModal());
document.querySelector("#close-settings").addEventListener("click", () => settingsDialog.close());
connectStravaButton.addEventListener("click", () => {
  if (isStravaConnected) {
    isStravaConnected = false;
    stravaStatus.textContent = "Not connected";
    connectStravaButton.textContent = "Connect";
    return;
  }
  stravaConsent.hidden = false;
  connectStravaButton.hidden = true;
});
document.querySelector("#cancel-connection").addEventListener("click", () => { stravaConsent.hidden = true; connectStravaButton.hidden = false; });
document.querySelector("#complete-demo-connection").addEventListener("click", () => {
  isStravaConnected = true;
  stravaStatus.textContent = "Connected (demo)";
  connectStravaButton.textContent = "Disconnect";
  connectStravaButton.hidden = false;
  stravaConsent.hidden = true;
});
settingsDialog.addEventListener("click", event => { if (event.target === settingsDialog) settingsDialog.close(); });
form.addEventListener("submit", event => { event.preventDefault(); renderRoutes(); document.querySelector(".results").scrollIntoView({ behavior: "smooth", block: "start" }); });
menus.forEach(menu => menu.addEventListener("toggle", () => { if (menu.open) menus.forEach(other => { if (other !== menu) other.open = false; }); }));
document.addEventListener("click", event => { if (!event.target.closest(".menu")) menus.forEach(menu => { menu.open = false; }); });
daySelect.innerHTML = weatherDays.map((day, index) => `<option value="${index}">${dayLabel(index)} · ${dayDate(index)}</option>`).join("");
rideTimeSelect.innerHTML = weatherDays[0].hours.slice(1).map(item => `<option value="${item.hour}"${item.hour === 8 ? " selected" : ""}>${formatHour(item.hour)}</option>`).join("");
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
renderRoutes();
