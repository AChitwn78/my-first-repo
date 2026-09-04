const demoRoutes = [
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
const connectGarminButton = document.querySelector("#connect-garmin");
const garminConsent = document.querySelector("#garmin-consent");
const garminStatus = document.querySelector("#garmin-status");
const menus = document.querySelectorAll(".menu");
const routeModeInputs = document.querySelectorAll('input[name="route-mode"]');
const useLocationButton = document.querySelector("#use-location");
const locationStatus = document.querySelector("#explore-location");
const findRideButton = document.querySelector("#find-ride-button");
const routePreviewDialog = document.querySelector("#route-preview-dialog");
const activityFolderInput = document.querySelector("#activity-folder-input");
const activityZipInput = document.querySelector("#activity-zip-input");
const importStatus = document.querySelector("#import-status");
const sampleRoutesStatus = document.querySelector("#sample-routes-status");
const loadSampleRoutesButton = document.querySelector("#load-sample-routes");
let isStravaConnected = false;
let isGarminConnected = false;
let currentLocation = null;
let displayedRoutes = [];
let importedRoutes = loadImportedRoutes();

daySelect.innerHTML = weatherDays.map((day, index) => `<option value="${index}">${dayLabel(index)} · ${dayDate(index)}</option>`).join("");
rideTimeSelect.innerHTML = weatherDays[0].hours.slice(1).map(item => `<option value="${item.hour}"${item.hour === 8 ? " selected" : ""}>${formatHour(item.hour)}</option>`).join("");

function dayLabel(index) {
  const date = new Date(); date.setDate(date.getDate() + index + 1);
  return index === 0 ? "Tomorrow" : date.toLocaleDateString(undefined, { weekday: "long" });
}
function dayDate(index) {
  const date = new Date(); date.setDate(date.getDate() + index + 1);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function selectedDay() { return weatherDays[Number(daySelect.value)]; }
function routeMode() { return document.querySelector('input[name="route-mode"]:checked').value; }
function loadImportedRoutes() { try { return JSON.parse(localStorage.getItem("ridewise-imported-routes") || "[]"); } catch { return []; } }
function saveImportedRoutes(routesToSave) { localStorage.setItem("ridewise-imported-routes", JSON.stringify(routesToSave)); }
function showSavedImportStatus() {
  if (!importStatus || !importedRoutes.length) return;
  importStatus.dataset.state = "success";
  importStatus.textContent = `${importedRoutes.length} imported route patterns are saved on this device.`;
}
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
  document.querySelector("#warning-title").textContent = warnings.length ? "Riding conditions need attention:" : "";
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
function exploredRoutes(desiredMiles) {
  const place = currentLocation ? "from your location" : "near your location";
  return [
    { name: "Southwest Wind Loop", miles: desiredMiles + .8, elevation: Math.round(desiredMiles * 19), outboundHeading: 205, origin: `Generated ${place}`, detail: "Loop · cycling-friendly roads" },
    { name: "Riverside Out & Back", miles: Math.max(25, desiredMiles - 1.6), elevation: Math.round(desiredMiles * 13), outboundHeading: 42, origin: `Generated ${place}`, detail: "Out & back · lower climbing" },
    { name: "Rolling Country Circuit", miles: desiredMiles + 2.4, elevation: Math.round(desiredMiles * 25), outboundHeading: 310, origin: `Generated ${place}`, detail: "Loop · more climbing" },
  ];
}
function renderRouteMode() {
  const exploring = routeMode() === "explore";
  useLocationButton.hidden = !exploring;
  locationStatus.hidden = !exploring;
  if (exploring && !currentLocation) locationStatus.textContent = "Choose your location to start routes near you. Demo routes are shown until routing is connected.";
  findRideButton.childNodes[0].textContent = exploring ? "Explore routes " : "Find my ride ";
}
function renderRoutes() {
  const desiredMiles = Number(distance.value); const hour = Number(document.querySelector("#ride-time").value); const preference = document.querySelector("#wind-preference").value; const rideType = document.querySelector("#ride-type").value; const day = selectedDay(); const weather = windForHour(hour, day);
  const exploring = routeMode() === "explore";
  const savedRoutes = importedRoutes.length ? importedRoutes : demoRoutes;
  const baseRoutes = exploring ? exploredRoutes(desiredMiles) : savedRoutes;
  const sorted = baseRoutes.map(route => ({ ...route, score: scoreRoute(route, desiredMiles, preference, rideType, weather) })).sort((a, b) => b.score - a.score);
  conditionsSummary.textContent = `${weather.label} ${weather.speed} mph at ${hour}:00 AM`;
  renderHourlyForecast(hour, day);
  renderDayDetails(day, hour);
  document.querySelector("#recommendations-eyebrow").textContent = exploring ? "EXPLORE ROUTES · DEMO" : "RECOMMENDATIONS";
  document.querySelector("#recommendations-title").textContent = exploring ? `Wind-aware routes for ${dayLabel(day.dayIndex)}` : `Your best routes for ${dayLabel(day.dayIndex)}`;
  document.querySelector("#route-count").textContent = exploring ? "3" : savedRoutes.length;
  document.querySelector("#route-count-label").textContent = exploring ? "route ideas" : importedRoutes.length ? "imported routes" : "saved routes";
  document.querySelector("#method-title").innerHTML = exploring ? "Routes built around<br />your ride window." : importedRoutes.length ? "Your GPS tracks,<br />ranked by weather." : "Real route geometry,<br />not guesswork.";
  document.querySelector("#method-copy").textContent = exploring ? "This prototype creates route concepts from your chosen distance and wind preference. Production Ridewise™ will request routes from a cycling-aware map service, check road access and elevation, then return usable map geometry and GPX export." : importedRoutes.length ? "Ridewise keeps a simplified copy of each imported GPS track on this device, then compares its direction with your selected forecast and wind preference." : "Each route is divided into small GPS segments. The planner compares the direction of every segment with the expected wind at the time you'll reach it—so “headwind out, tailwind home” is based on the road beneath your wheels.";
  const visibleRoutes = sorted.slice(0, exploring ? 3 : importedRoutes.length ? 12 : 4);
  displayedRoutes = visibleRoutes.map(route => ({ ...route, reason: routeReason(route, preference, weather), exploring }));
  routeList.innerHTML = displayedRoutes.map((route, index) => `<article class="route-card" data-route-index="${index}" role="button" tabindex="0" aria-label="Preview ${route.name}"><div class="rank">${["🥇", "🥈", "🥉", "4"][index]}</div><div><h3 class="route-name">${route.name}</h3><p class="route-meta">${route.miles.toFixed(1)} mi · ${route.elevation.toLocaleString()} ft · ${exploring ? route.detail : `ridden ${route.rides} times`}</p>${exploring ? `<span class="route-origin">${route.origin}</span>` : route.imported ? `<span class="route-origin">Imported from Strava export</span>` : ""}</div><p class="route-reason">${route.reason}</p><div class="score"><strong>${route.score}</strong><span>ride match</span></div></article>`).join("");
}
function openRoutePreview(index) {
  const route = displayedRoutes[index];
  if (!route || !routePreviewDialog) return;
  document.querySelector("#route-preview-origin").textContent = route.exploring ? "EXPLORE ROUTE · DEMO" : route.imported ? "IMPORTED ROUTE SUMMARY" : "SAVED ROUTE PREVIEW";
  document.querySelector("#route-preview-title").textContent = route.name;
  document.querySelector("#preview-distance").textContent = `${route.miles.toFixed(1)} mi`;
  document.querySelector("#preview-elevation").textContent = `${route.elevation.toLocaleString()} ft`;
  document.querySelector("#preview-score").textContent = route.score;
  document.querySelector("#preview-reason").textContent = route.reason;
  const realGeometry = route.imported && Array.isArray(route.path) && route.path.length > 1;
  const demoBadge = document.querySelector("#preview-demo-badge");
  demoBadge.hidden = realGeometry;
  document.querySelector("#preview-note").textContent = route.exploring ? "Illustrative preview only. Live routing will show the exact streets, route surface and navigation-ready GPX." : realGeometry ? "This is a simplified shape of your imported GPS track, stored only on this device. It is not uploaded by Ridewise." : route.imported ? "This activity was imported before GPS previews were enabled. Import the archive again to add its real route shape." : "Illustrative preview only. Connect Strava to use your actual saved route geometry and activity history.";
  const exportStatus = document.querySelector("#garmin-export-status");
  exportStatus.hidden = true;
  exportStatus.textContent = "";
  const paths = ["M33 167 C72 113 111 191 147 118 S211 41 260 80 S306 164 327 54", "M33 167 C91 90 119 105 166 165 S259 196 302 120 S278 48 327 54", "M33 167 C72 207 112 184 157 100 S237 42 272 132 S304 95 327 54"];
  const geometry = realGeometry ? previewGeometry(route.path) : null;
  document.querySelector("#preview-route-line").setAttribute("d", geometry?.d || paths[index % paths.length]);
  setPreviewMarker("#preview-start-dot", "#preview-start-label", geometry?.start, { x: 33, y: 167 });
  setPreviewMarker("#preview-finish-dot", "#preview-finish-label", geometry?.finish, { x: 327, y: 54 });
  routePreviewDialog.showModal();
}
function previewGeometry(points) {
  const latitude = points.reduce((total, point) => total + point.lat, 0) / points.length;
  const projected = points.map(point => ({ x: point.lon * Math.cos(latitude * Math.PI / 180), y: point.lat }));
  const xValues = projected.map(point => point.x); const yValues = projected.map(point => point.y);
  const minX = Math.min(...xValues); const maxX = Math.max(...xValues); const minY = Math.min(...yValues); const maxY = Math.max(...yValues);
  const scale = Math.min(304 / Math.max(maxX - minX, .00001), 164 / Math.max(maxY - minY, .00001));
  const offsetX = 180 - ((minX + maxX) / 2) * scale; const offsetY = 110 + ((minY + maxY) / 2) * scale;
  const transformed = projected.map(point => ({ x: point.x * scale + offsetX, y: offsetY - point.y * scale }));
  return { d: transformed.map((point, itemIndex) => `${itemIndex ? "L" : "M"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" "), start: transformed[0], finish: transformed.at(-1) };
}
function setPreviewMarker(dotSelector, labelSelector, position, fallback) {
  const point = position || fallback; const dot = document.querySelector(dotSelector); const label = document.querySelector(labelSelector);
  dot.setAttribute("cx", point.x); dot.setAttribute("cy", point.y);
  label.style.left = `${Math.min(86, Math.max(2, point.x / 3.6 - 6))}%`;
  label.style.top = `${Math.min(86, Math.max(2, point.y / 2.2 + 4))}%`;
  label.style.right = "auto"; label.style.bottom = "auto";
}
function parseCsv(text) {
  const rows = []; let row = []; let field = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') { if (quoted && text[index + 1] === '"') { field += '"'; index += 1; } else quoted = !quoted; }
    else if (character === "," && !quoted) { row.push(field); field = ""; }
    else if ((character === "\n" || character === "\r") && !quoted) { if (character === "\r" && text[index + 1] === "\n") index += 1; row.push(field); if (row.some(value => value)) rows.push(row); row = []; field = ""; }
    else field += character;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}
function activityMetadata(csvText) {
  const rows = parseCsv(csvText); const headers = rows.shift() || [];
  const fieldIndex = name => headers.indexOf(name);
  const filenameIndex = fieldIndex("Filename"); const nameIndex = fieldIndex("Activity Name"); const typeIndex = fieldIndex("Activity Type");
  return new Map(rows.filter(row => row[filenameIndex]).map(row => [row[filenameIndex].split("/").pop(), { name: row[nameIndex] || "Imported ride", type: row[typeIndex] || "" }]));
}
function haversineMiles(a, b) {
  const radians = degrees => degrees * Math.PI / 180; const radiusMiles = 3958.8;
  const dLat = radians(b.lat - a.lat); const dLon = radians(b.lon - a.lon);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * radiusMiles * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}
function bearing(a, b) {
  const radians = degrees => degrees * Math.PI / 180; const degrees = value => (value * 180 / Math.PI + 360) % 360;
  const delta = radians(b.lon - a.lon); const y = Math.sin(delta) * Math.cos(radians(b.lat)); const x = Math.cos(radians(a.lat)) * Math.sin(radians(b.lat)) - Math.sin(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.cos(delta);
  return degrees(Math.atan2(y, x));
}
function summarizeGpx(text, metadata, filename) {
  const documentXml = new DOMParser().parseFromString(text, "application/xml");
  const points = Array.from(documentXml.getElementsByTagName("trkpt")).map(point => ({ lat: Number(point.getAttribute("lat")), lon: Number(point.getAttribute("lon")), elevation: Number(point.getElementsByTagName("ele")[0]?.textContent) })).filter(point => Number.isFinite(point.lat) && Number.isFinite(point.lon));
  if (points.length < 3) return null;
  let miles = 0; let climbingMeters = 0;
  for (let index = 1; index < points.length; index += 1) { miles += haversineMiles(points[index - 1], points[index]); const gain = points[index].elevation - points[index - 1].elevation; if (Number.isFinite(gain) && gain > 0) climbingMeters += gain; }
  if (miles < 3 || miles > 250) return null;
  let headingPoint = points[1]; let headingDistance = 0;
  for (let index = 1; index < points.length && headingDistance < .06; index += 1) { headingDistance += haversineMiles(points[index - 1], points[index]); headingPoint = points[index]; }
  const sampleSize = 96; const path = points.filter((_, index) => index % Math.max(1, Math.ceil(points.length / sampleSize)) === 0).map(point => ({ lat: Number(point.lat.toFixed(5)), lon: Number(point.lon.toFixed(5)) }));
  if (path.at(-1)?.lat !== points.at(-1).lat || path.at(-1)?.lon !== points.at(-1).lon) path.push({ lat: Number(points.at(-1).lat.toFixed(5)), lon: Number(points.at(-1).lon.toFixed(5)) });
  return { name: metadata?.name || `Imported ride ${filename.replace(/\.[^.]+$/, "")}`, miles, elevation: Math.round(climbingMeters * 3.28084), outboundHeading: bearing(points[0], headingPoint), path, rides: 1, imported: true };
}
async function importActivityFolder(files, onProgress = () => {}) {
  const filesToImport = Array.from(files); const activityCsv = filesToImport.find(file => file.name === "activities.csv");
  const metadata = activityCsv ? activityMetadata(await activityCsv.text()) : new Map();
  const gpxFiles = filesToImport.filter(file => /\.gpx$/i.test(file.name));
  if (!gpxFiles.length) throw new Error("No GPX activity files were found. Choose the unzipped Strava export folder.");
  const summaries = [];
  for (let index = 0; index < gpxFiles.length; index += 1) {
    const file = gpxFiles[index]; const activity = metadata.get(file.name);
    if (activity && !/ride|cycling/i.test(activity.type)) continue;
    const summary = summarizeGpx(await file.text(), activity, file.name); if (summary) summaries.push(summary);
    if (index % 12 === 0) {
      onProgress(index + 1, gpxFiles.length);
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  }
  const grouped = new Map();
  summaries.forEach(summary => {
    const key = `${summary.name.toLowerCase()}|${Math.round(summary.miles)}|${Math.round(summary.outboundHeading / 20)}`;
    const existing = grouped.get(key); if (existing) existing.rides += 1; else grouped.set(key, summary);
  });
  return Array.from(grouped.values()).sort((a, b) => b.rides - a.rides || b.miles - a.miles);
}
async function importActivityZip(file, onProgress = () => {}) {
  if (!window.JSZip) throw new Error("ZIP support could not load. Check your connection, then try again.");
  const archive = await window.JSZip.loadAsync(file);
  const files = Object.values(archive.files).filter(entry => !entry.dir).map(entry => ({
    name: entry.name.split("/").pop(),
    text: () => entry.async("text"),
  }));
  return importActivityFolder(files, onProgress);
}
async function processActivityImport(importer, statusElement = importStatus, sourceName = "your Strava export") {
  statusElement.dataset.state = "";
  statusElement.textContent = "Reading your activity archive locally…";
  try {
    importedRoutes = await importer((completed, total) => {
      statusElement.textContent = `Reading activity ${completed} of ${total} locally…`;
    });
    if (!importedRoutes.length) throw new Error("No cycling GPX tracks were found in that archive.");
    saveImportedRoutes(importedRoutes);
    statusElement.dataset.state = "success";
    statusElement.textContent = `Imported ${importedRoutes.length} route patterns from ${sourceName}. Demo routes have been replaced.`;
    renderRoutes();
  } catch (error) {
    statusElement.dataset.state = "error";
    statusElement.textContent = error.message || "The import could not be completed.";
  }
}
distance.addEventListener("input", () => { distanceOutput.textContent = `${distance.value} mi`; });
document.querySelector("#ride-time").addEventListener("change", renderRoutes);
daySelect.addEventListener("change", renderRoutes);
routeModeInputs.forEach(input => input.addEventListener("change", () => { renderRouteMode(); renderRoutes(); }));
const chooseActivityFolder = () => activityFolderInput?.click();
const chooseActivityZip = () => activityZipInput?.click();
document.querySelector("#import-rides-button")?.addEventListener("click", chooseActivityFolder);
document.querySelector("#import-rides-menu")?.addEventListener("click", chooseActivityFolder);
document.querySelector("#import-zip-button")?.addEventListener("click", chooseActivityZip);
activityFolderInput?.addEventListener("change", async event => {
  const selectedFiles = event.target.files;
  if (selectedFiles?.length) await processActivityImport(onProgress => importActivityFolder(selectedFiles, onProgress));
  event.target.value = "";
});
activityZipInput?.addEventListener("change", async event => {
  const selectedFile = event.target.files?.[0];
  if (selectedFile) await processActivityImport(onProgress => importActivityZip(selectedFile, onProgress));
  event.target.value = "";
});
loadSampleRoutesButton?.addEventListener("click", async () => {
  loadSampleRoutesButton.disabled = true;
  sampleRoutesStatus.dataset.state = "";
  sampleRoutesStatus.textContent = "Loading public sample routes…";
  try {
    const response = await fetch("sample-routes.json");
    if (!response.ok) throw new Error("The public sample routes could not be loaded.");
    const routes = await response.json();
    if (!Array.isArray(routes) || !routes.length || !routes.every(route => Array.isArray(route.path) && route.path.length > 1)) throw new Error("The public sample route data is invalid.");
    importedRoutes = routes;
    saveImportedRoutes(importedRoutes);
    sampleRoutesStatus.dataset.state = "success";
    sampleRoutesStatus.textContent = `Loaded ${importedRoutes.length} public Ridewise route patterns on this device.`;
    renderRoutes();
  } catch (error) {
    sampleRoutesStatus.dataset.state = "error";
    sampleRoutesStatus.textContent = error.message || "The public sample routes could not be loaded.";
  } finally {
    loadSampleRoutesButton.disabled = false;
  }
});
useLocationButton?.addEventListener("click", () => {
  if (!navigator.geolocation) { locationStatus.textContent = "Location is not available in this browser. Demo routes will remain near a sample location."; return; }
  useLocationButton.textContent = "Finding your location…";
  navigator.geolocation.getCurrentPosition(position => {
    currentLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
    locationStatus.textContent = `Location ready (${currentLocation.latitude.toFixed(3)}, ${currentLocation.longitude.toFixed(3)}). Routes will start here when live routing is connected.`;
    useLocationButton.textContent = "Location updated";
    renderRoutes();
  }, () => {
    locationStatus.textContent = "We couldn't access your location. You can still review the sample route ideas.";
    useLocationButton.textContent = "Try location again";
  }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
});
routeList.addEventListener("click", event => { const card = event.target.closest(".route-card"); if (card) openRoutePreview(Number(card.dataset.routeIndex)); });
routeList.addEventListener("keydown", event => { if ((event.key === "Enter" || event.key === " ") && event.target.closest(".route-card")) { event.preventDefault(); openRoutePreview(Number(event.target.closest(".route-card").dataset.routeIndex)); } });
document.querySelector("#close-route-preview")?.addEventListener("click", () => routePreviewDialog?.close());
document.querySelector("#preview-close-button")?.addEventListener("click", () => routePreviewDialog?.close());
document.querySelector("#export-garmin-button")?.addEventListener("click", () => {
  const exportStatus = document.querySelector("#garmin-export-status");
  exportStatus.hidden = false;
  exportStatus.textContent = "Demo preview: Garmin export will be available after Ridewise™ is approved for Garmin's Courses API and the route has real GPS geometry.";
});
routePreviewDialog?.addEventListener("click", event => { if (event.target === routePreviewDialog) routePreviewDialog.close(); });
settingsButton?.addEventListener("click", () => settingsDialog?.showModal());
document.querySelector("#close-settings")?.addEventListener("click", () => settingsDialog?.close());
connectStravaButton?.addEventListener("click", () => {
  if (isStravaConnected) {
    isStravaConnected = false;
    stravaStatus.textContent = "Not connected";
    connectStravaButton.textContent = "Connect";
    return;
  }
  stravaConsent.hidden = false;
  connectStravaButton.hidden = true;
});
document.querySelector("#cancel-connection")?.addEventListener("click", () => { stravaConsent.hidden = true; connectStravaButton.hidden = false; });
document.querySelector("#complete-demo-connection")?.addEventListener("click", () => {
  isStravaConnected = true;
  stravaStatus.textContent = "Connected (demo)";
  connectStravaButton.textContent = "Disconnect";
  connectStravaButton.hidden = false;
  stravaConsent.hidden = true;
});
connectGarminButton?.addEventListener("click", () => {
  if (isGarminConnected) {
    isGarminConnected = false;
    garminStatus.textContent = "Not connected";
    connectGarminButton.textContent = "Connect";
    return;
  }
  garminConsent.hidden = false;
  connectGarminButton.hidden = true;
});
document.querySelector("#cancel-garmin-connection")?.addEventListener("click", () => { garminConsent.hidden = true; connectGarminButton.hidden = false; });
document.querySelector("#complete-garmin-connection")?.addEventListener("click", () => {
  isGarminConnected = true;
  garminStatus.textContent = "Connected (demo)";
  connectGarminButton.textContent = "Disconnect";
  connectGarminButton.hidden = false;
  garminConsent.hidden = true;
});
settingsDialog?.addEventListener("click", event => { if (event.target === settingsDialog) settingsDialog.close(); });
form.addEventListener("submit", event => { event.preventDefault(); renderRoutes(); document.querySelector(".results").scrollIntoView({ behavior: "smooth", block: "start" }); });
menus.forEach(menu => menu.addEventListener("toggle", () => { if (menu.open) menus.forEach(other => { if (other !== menu) other.open = false; }); }));
document.addEventListener("click", event => { if (!event.target.closest(".menu")) menus.forEach(menu => { menu.open = false; }); });
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
showSavedImportStatus();
renderRouteMode();
renderRoutes();
