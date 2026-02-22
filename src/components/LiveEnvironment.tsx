import { useState, useEffect } from "react";
import { CloudRain, Thermometer, Droplets, Factory, RefreshCw, Wifi } from "lucide-react";

interface WeatherData {
  temperature: number;
  rainfall: number;
  humidity: number;
}

const simulateWeather = (): WeatherData => ({
  temperature: Math.round(28 + Math.random() * 7),
  rainfall: Math.round(Math.random() * 25 * 10) / 10,
  humidity: Math.round(55 + Math.random() * 30),
});

const LiveEnvironment = () => {
  const [weather, setWeather] = useState<WeatherData>(simulateWeather);
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [refreshing, setRefreshing] = useState(false);

  // Derived metrics
  const waterPotential = Math.min(
    Math.round((weather.rainfall / 20) * 100),
    100
  );
  const carbonDensity = Math.round(
    0.42 * weather.temperature + 0.18 * weather.humidity
  );
  const carbonLevel =
    carbonDensity > 25 ? "High" : carbonDensity > 15 ? "Moderate" : "Low";
  const carbonColor =
    carbonDensity > 25 ? "text-primary" : carbonDensity > 15 ? "text-safety-orange" : "text-secondary";

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setWeather(simulateWeather());
      setLastUpdated("Just now");
      setRefreshing(false);
    }, 800);
  };

  // Auto-refresh every 60s
  useEffect(() => {
    const id = setInterval(() => {
      setWeather(simulateWeather());
      setLastUpdated("Just now");
    }, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass rounded-xl p-4 border border-accent/15 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
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
          <p className="font-display text-lg font-bold text-foreground">{weather.temperature}°</p>
          <p className="clamp-body text-muted-foreground">Temp</p>
        </div>
        <div className="rounded-lg glass-strong p-2.5 text-center border border-border/20">
          <CloudRain className="h-4 w-4 text-accent mx-auto mb-1" />
          <p className="font-display text-lg font-bold text-foreground">{weather.rainfall}</p>
          <p className="clamp-body text-muted-foreground">Rain mm</p>
        </div>
        <div className="rounded-lg glass-strong p-2.5 text-center border border-border/20">
          <Droplets className="h-4 w-4 text-accent mx-auto mb-1" />
          <p className="font-display text-lg font-bold text-foreground">{weather.humidity}%</p>
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
          <p className="font-display text-2xl font-bold text-secondary">{waterPotential}%</p>
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
          <p className={`font-display text-2xl font-bold ${carbonColor}`}>
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
