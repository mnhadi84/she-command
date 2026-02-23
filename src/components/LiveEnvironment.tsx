import { useState, useEffect, useRef, useCallback } from "react";
import { CloudRain, Thermometer, Droplets, Factory, RefreshCw, Wifi } from "lucide-react";

interface WeatherData {
  temperature: number;
  rainfall: number;
  humidity: number;
}

const generateWeather = (): WeatherData => ({
  temperature: Math.round(28 + Math.random() * 7),
  rainfall: Math.round(Math.random() * 25 * 10) / 10,
  humidity: Math.round(55 + Math.random() * 30),
});

/** Smoothly interpolate between two numbers */
const useAnimatedValue = (target: number, duration = 800) => {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number>();
  const startRef = useRef({ value: target, time: 0 });

  useEffect(() => {
    const start = display;
    const startTime = performance.now();
    startRef.current = { value: start, time: startTime };

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
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

const LiveEnvironment = () => {
  const [weather, setWeather] = useState<WeatherData>(generateWeather);
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [refreshing, setRefreshing] = useState(false);

  // Smooth animated values
  const animTemp = useAnimatedValue(weather.temperature);
  const animRain = useAnimatedValue(weather.rainfall);
  const animHumid = useAnimatedValue(weather.humidity);

  // Derived metrics
  const waterPotential = Math.min(Math.round((animRain / 20) * 100), 100);
  const carbonDensity = Math.round(0.42 * animTemp + 0.18 * animHumid);
  const carbonLevel = carbonDensity > 25 ? "High" : carbonDensity > 15 ? "Moderate" : "Low";
  const carbonColor = carbonDensity > 25 ? "text-primary" : carbonDensity > 15 ? "text-safety-orange" : "text-secondary";

  const refresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setWeather(generateWeather());
      setLastUpdated("Just now");
      setRefreshing(false);
    }, 600);
  }, []);

  // Auto-refresh every 60s
  useEffect(() => {
    const id = setInterval(() => {
      setWeather(generateWeather());
      setLastUpdated("Just now");
    }, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass rounded-xl p-4 border border-accent/15 space-y-4">
      {/* Header */}
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

      {/* Raw Weather */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg glass-strong p-2.5 text-center border border-border/20">
          <Thermometer className="h-4 w-4 text-primary mx-auto mb-1" />
          <p className="font-display text-lg font-bold text-foreground tabular-nums">{Math.round(animTemp)}°</p>
          <p className="clamp-body text-muted-foreground">Temp</p>
        </div>
        <div className="rounded-lg glass-strong p-2.5 text-center border border-border/20">
          <CloudRain className="h-4 w-4 text-accent mx-auto mb-1" />
          <p className="font-display text-lg font-bold text-foreground tabular-nums">{animRain.toFixed(1)}</p>
          <p className="clamp-body text-muted-foreground">Rain mm</p>
        </div>
        <div className="rounded-lg glass-strong p-2.5 text-center border border-border/20">
          <Droplets className="h-4 w-4 text-accent mx-auto mb-1" />
          <p className="font-display text-lg font-bold text-foreground tabular-nums">{Math.round(animHumid)}%</p>
          <p className="clamp-body text-muted-foreground">Humidity</p>
        </div>
      </div>

      {/* Derived AI Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl glass-strong p-3 border border-secondary/15">
          <div className="flex items-center gap-2 mb-2">
            <CloudRain className="h-3.5 w-3.5 text-secondary" />
            <span className="clamp-body text-muted-foreground uppercase tracking-wider font-medium">
              Water Potential
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-secondary tabular-nums">{waterPotential}%</p>
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden mt-1.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-secondary transition-all duration-700"
              style={{ width: `${waterPotential}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl glass-strong p-3 border border-accent/15">
          <div className="flex items-center gap-2 mb-2">
            <Factory className="h-3.5 w-3.5 text-accent" />
            <span className="clamp-body text-muted-foreground uppercase tracking-wider font-medium">
              Carbon Density
            </span>
          </div>
          <p className={`font-display text-2xl font-bold tabular-nums ${carbonColor}`}>
            {carbonDensity}
          </p>
          <p className={`clamp-body font-display font-semibold ${carbonColor}`}>
            {carbonLevel} · kg/m²
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveEnvironment;
