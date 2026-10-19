import { useState, useEffect, useRef, useCallback } from "react";
import { CloudRain, Thermometer, Droplets, Factory, RefreshCw, Wifi, CloudFog, AlertTriangle } from "lucide-react";

interface WeatherData {
  temperature: number;
  rainfall: number;
  humidity: number;
}

export interface HazeData {
  api: number;
  pm25: number;
  pm10: number;
  status: string;
  source: "gps" | "default";
  time: string;
}

export const HAZE_KEY = "she-analytics-haze";
const KL = { lat: 3.139, lon: 101.6869 };

/** Linear interpolation across DOE Malaysia API breakpoints */
const interp = (c: number, bps: [number, number, number, number][]) => {
  for (const [cLo, cHi, iLo, iHi] of bps) {
    if (c <= cHi) return Math.round(((iHi - iLo) / (cHi - cLo)) * (c - cLo) + iLo);
  }
  return 500;
};
// DOE (2019 revised API) particulate breakpoints, µg/m³
export const pm25ToApi = (c: number) =>
  interp(Math.max(0, c), [[0, 15, 0, 50], [15, 40, 50, 100], [40, 65, 100, 200], [65, 150, 200, 300], [150, 250, 300, 500]]);
export const pm10ToApi = (c: number) =>
  interp(Math.max(0, c), [[0, 50, 0, 50], [50, 150, 50, 100], [150, 350, 100, 200], [350, 420, 200, 300], [420, 600, 300, 500]]);

export const apiStatus = (api: number) =>
  api <= 50 ? "Good" : api <= 100 ? "Moderate" : api <= 200 ? "Unhealthy" : "Very Unhealthy / Hazardous";

const hazeStyle = (api: number) =>
  api <= 50
    ? "text-secondary border-secondary/40"
    : api <= 100
    ? "text-accent border-accent/40"
    : api <= 200
    ? "text-safety-orange border-safety-orange/50"
    : "text-destructive border-destructive/50";

/** Smoothly interpolate between two numbers */
const useAnimatedValue = (target: number, duration = 800) => {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number>();

  useEffect(() => {
    const start = display;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round((start + (target - start) * eased) * 10) / 10);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
};

const getPosition = (): Promise<{ lat: number; lon: number; source: "gps" | "default" }> =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({ ...KL, source: "default" });
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude, source: "gps" }),
      () => resolve({ ...KL, source: "default" }),
      { timeout: 8000, maximumAge: 300000 }
    );
  });

const LiveEnvironment = () => {
  const [weather, setWeather] = useState<WeatherData>({ temperature: 0, rainfall: 0, humidity: 0 });
  const [haze, setHaze] = useState<HazeData | null>(() => {
    try { return JSON.parse(localStorage.getItem(HAZE_KEY) || "null"); } catch { return null; }
  });
  const [lastUpdated, setLastUpdated] = useState("Syncing...");
  const [refreshing, setRefreshing] = useState(false);

  const animTemp = useAnimatedValue(weather.temperature);
  const animRain = useAnimatedValue(weather.rainfall);
  const animHumid = useAnimatedValue(weather.humidity);

  const waterPotential = Math.min(Math.round((animRain / 20) * 100), 100);
  const carbonDensity = Math.round(0.42 * animTemp + 0.18 * animHumid);
  const carbonLevel = carbonDensity > 25 ? "High" : carbonDensity > 15 ? "Moderate" : "Low";
  const carbonColor = carbonDensity > 25 ? "text-primary" : carbonDensity > 15 ? "text-safety-orange" : "text-secondary";

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const { lat, lon, source } = await getPosition();
    try {
      const [wRes, aRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation`),
        fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,european_aqi,us_aqi`),
      ]);
      const w = await wRes.json();
      const a = await aRes.json();
      if (w?.current) {
        setWeather({
          temperature: w.current.temperature_2m ?? 0,
          rainfall: w.current.precipitation ?? 0,
          humidity: w.current.relative_humidity_2m ?? 0,
        });
      }
      if (a?.current && typeof a.current.pm2_5 === "number") {
        const pm25 = Math.round(a.current.pm2_5 * 10) / 10;
        const pm10 = Math.round((a.current.pm10 ?? 0) * 10) / 10;
        const api = Math.max(pm25ToApi(pm25), pm10ToApi(pm10));
        const next: HazeData = {
          api, pm25, pm10, status: apiStatus(api), source,
          time: new Date().toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" }),
        };
        setHaze(next);
        localStorage.setItem(HAZE_KEY, JSON.stringify(next));
      }
      setLastUpdated(source === "gps" ? "Live · GPS" : "Live · KL default");
    } catch {
      setLastUpdated("Offline");
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <div className="space-y-2">
      <div className="glass rounded-xl p-4 border border-accent/15 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            <Wifi className="h-3.5 w-3.5 text-secondary" />
            <span className="font-display clamp-heading font-semibold uppercase tracking-wider text-foreground">
              Live Environment
            </span>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 clamp-body text-muted-foreground hover:text-accent transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
            {lastUpdated}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-lg glass-strong p-2 text-center border border-border/20">
            <Thermometer className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="font-display text-lg font-bold text-foreground tabular-nums">{Math.round(animTemp)}°</p>
            <p className="clamp-body text-muted-foreground">Temp</p>
          </div>
          <div className="rounded-lg glass-strong p-2 text-center border border-border/20">
            <CloudRain className="h-4 w-4 text-accent mx-auto mb-1" />
            <p className="font-display text-lg font-bold text-foreground tabular-nums">{animRain.toFixed(1)}</p>
            <p className="clamp-body text-muted-foreground">Rain mm</p>
          </div>
          <div className="rounded-lg glass-strong p-2 text-center border border-border/20">
            <Droplets className="h-4 w-4 text-accent mx-auto mb-1" />
            <p className="font-display text-lg font-bold text-foreground tabular-nums">{Math.round(animHumid)}%</p>
            <p className="clamp-body text-muted-foreground">Humidity</p>
          </div>
          <div className={`rounded-lg glass-strong p-2 text-center border ${haze ? hazeStyle(haze.api) : "border-border/20 text-muted-foreground"}`}>
            <CloudFog className="h-4 w-4 mx-auto mb-1" />
            <p className="font-display text-lg font-bold tabular-nums">{haze ? haze.api : "--"}</p>
            <p className="clamp-body leading-tight">{haze ? haze.status : "Haze / API"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl glass-strong p-3 border border-secondary/15">
            <div className="flex items-center gap-2 mb-2">
              <CloudRain className="h-3.5 w-3.5 text-secondary" />
              <span className="clamp-body text-muted-foreground uppercase tracking-wider font-medium">Water Potential</span>
            </div>
            <p className="font-display text-2xl font-bold text-secondary tabular-nums">{waterPotential}%</p>
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden mt-1.5">
              <div className="h-full rounded-full bg-gradient-to-r from-accent to-secondary transition-all duration-700" style={{ width: `${waterPotential}%` }} />
            </div>
          </div>
          <div className="rounded-xl glass-strong p-3 border border-accent/15">
            <div className="flex items-center gap-2 mb-2">
              <Factory className="h-3.5 w-3.5 text-accent" />
              <span className="clamp-body text-muted-foreground uppercase tracking-wider font-medium">Carbon Density</span>
            </div>
            <p className={`font-display text-2xl font-bold tabular-nums ${carbonColor}`}>{carbonDensity}</p>
            <p className={`clamp-body font-display font-semibold ${carbonColor}`}>{carbonLevel} · kg/m²</p>
          </div>
        </div>
      </div>

      {haze && haze.api > 100 && (
        <div className="flex items-start gap-2 rounded-xl border border-safety-orange/50 bg-safety-orange/10 p-3">
          <AlertTriangle className="h-4 w-4 text-safety-orange shrink-0 mt-0.5" />
          <p className="clamp-body font-semibold text-safety-orange">
            ⚠️ DOE HAZE ALERT (API &gt; 100): Mandatory N95/P2 particulate respirators required for all outdoor OSP trenching, aerial pole climbing, and TESB rooftop solar operations.
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveEnvironment;
