const routes = [
  { name: "Morris Loop", miles: 51.8, elevation: 820, outboundHeading: 202, rides: 47 },
  { name: "Yorkville South", miles: 48.9, elevation: 690, outboundHeading: 190, rides: 24 },
  { name: "Plainfield West", miles: 46.4, elevation: 510, outboundHeading: 264, rides: 31 },
  { name: "Batavia Rollers", miles: 52.3, elevation: 1240, outboundHeading: 315, rides: 18 },
];
const form = document.querySelector("#ride-form");
const distance = document.querySelector("#distance");
const distanceOutput = document.querySelector("#distance-output");
const routeList = document.querySelector("#route-list");
const conditionsSummary = document.querySelector("#conditions-summary");
const menus = document.querySelectorAll(".menu");
const installButton = document.querySelector("#install-button");
let installPrompt;

function windForHour(hour) { const increase = Math.max(0, hour - 7) * 1.4; return { from: 205, speed: Math.round(10 + increase), label: "SSW" }; }
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
  const desiredMiles = Number(distance.value); const hour = Number(document.querySelector("#ride-time").value); const preference = document.querySelector("#wind-preference").value; const rideType = document.querySelector("#ride-type").value; const weather = windForHour(hour);
  const sorted = routes.map(route => ({ ...route, score: scoreRoute(route, desiredMiles, preference, rideType, weather) })).sort((a, b) => b.score - a.score);
  conditionsSummary.textContent = `${weather.label} ${weather.speed} mph at ${hour}:00 AM`;
  routeList.innerHTML = sorted.map((route, index) => `<article class="route-card"><div class="rank">${["🥇", "🥈", "🥉", "4"][index]}</div><div><h3 class="route-name">${route.name}</h3><p class="route-meta">${route.miles.toFixed(1)} mi · ${route.elevation.toLocaleString()} ft · ridden ${route.rides} times</p></div><p class="route-reason">${routeReason(route, preference, weather)}</p><div class="score"><strong>${route.score}</strong><span>wind score</span></div></article>`).join("");
}
distance.addEventListener("input", () => { distanceOutput.textContent = `${distance.value} mi`; });
form.addEventListener("submit", event => { event.preventDefault(); renderRoutes(); document.querySelector(".results").scrollIntoView({ behavior: "smooth", block: "start" }); });
menus.forEach(menu => menu.addEventListener("toggle", () => { if (menu.open) menus.forEach(other => { if (other !== menu) other.open = false; }); }));
document.addEventListener("click", event => { if (!event.target.closest(".menu")) menus.forEach(menu => { menu.open = false; }); });
window.addEventListener("beforeinstallprompt", event => { event.preventDefault(); installPrompt = event; installButton.hidden = false; });
installButton.addEventListener("click", async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = undefined;
  installButton.hidden = true;
});
window.addEventListener("appinstalled", () => { installButton.hidden = true; });
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
renderRoutes();
