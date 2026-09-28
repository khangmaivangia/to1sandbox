import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  Box,
  CloudRain,
  CloudSun,
  Droplets,
  Factory,
  Gauge,
  Globe2,
  Leaf,
  MapPin,
  Pause,
  Play,
  Plus,
  Radio,
  Route,
  SatelliteDish,
  Ship,
  Siren,
  Sprout,
  Thermometer,
  Truck,
  Users,
  Warehouse,
  Waves,
  Wind,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

type ScenarioId = "normal" | "drought" | "flood" | "disease" | "trade";
type ObjectId = "farm" | "warehouse" | "route" | "town" | "sensor" | "port" | null;

type Scenario = {
  id: ScenarioId;
  label: string;
  icon: LucideIcon;
  color: string;
  weather: string;
  event: string;
  consequence: string;
  productionDrop: number;
  reserveDrop: number;
  accessDrop: number;
};

const scenarios: Scenario[] = [
  { id: "normal", label: "NORMAL", icon: CloudSun, color: "mint", weather: "ỔN ĐỊNH · 28°C", event: "Mạng lưới đang vận hành bình thường", consequence: "Sản xuất và phân phối theo nhịp chuẩn", productionDrop: 0, reserveDrop: 0, accessDrop: 0 },
  { id: "drought", label: "HẠN HÁN", icon: Wind, color: "amber", weather: "NẮNG GẮT · 39°C", event: "Cảm biến đất phát hiện thiếu nước ở Farm A", consequence: "Tưới tăng · kho mở luồng · xe đổi hướng", productionDrop: 21, reserveDrop: 19, accessDrop: 8 },
  { id: "flood", label: "LŨ LỤT", icon: Waves, color: "cyan", weather: "MƯA LỚN · 212mm", event: "Vùng trũng phía nam bắt đầu ngập", consequence: "Đường thấp đóng · tuyến cao được kích hoạt", productionDrop: 15, reserveDrop: 13, accessDrop: 12 },
  { id: "disease", label: "DỊCH BỆNH", icon: Siren, color: "red", weather: "CẢNH BÁO · VÙNG 04", event: "Bất thường sinh học được phát hiện trên mùa vụ", consequence: "Khoanh vùng · khử khuẩn · phân phối lại", productionDrop: 17, reserveDrop: 16, accessDrop: 7 },
  { id: "trade", label: "GIÁN ĐOẠN THƯƠNG MẠI", icon: Ship, color: "violet", weather: "CẢNG TẮC · 48h", event: "Tàu nhập khẩu trễ lịch tại Cảng Đông", consequence: "Tuyến nội địa bù tải · giá được giữ ổn định", productionDrop: 5, reserveDrop: 14, accessDrop: 10 },
];

const objectCopy: Record<Exclude<ObjectId, null>, { title: string; type: string; lines: string[] }> = {
  farm: { title: "FARM A", type: "SẢN XUẤT THÔNG MINH", lines: ["Production · 82%", "Water · 67%", "Status · monitoring"] },
  warehouse: { title: "RESERVE", type: "KHO CHIẾN LƯỢC", lines: ["Rice · 8,420 t", "Corn · 3,210 t", "Capacity · 78%"] },
  route: { title: "ROUTE 03", type: "MẠNG VẬN CHUYỂN", lines: ["Capacity · 91%", "Status · active", "Alt route · ready"] },
  town: { title: "POPULATION", type: "TRUNG TÂM DÂN CƯ", lines: ["Population · 128,000", "Food availability · 96%", "Delivery · 18 min"] },
  sensor: { title: "SENSOR 04", type: "EARLY WARNING", lines: ["Signal · humidity", "Last ping · 09:42:18", "Status · online"] },
  port: { title: "EAST PORT", type: "NHẬP KHẨU", lines: ["Vessels · 03", "Throughput · 720 t/day", "Status · monitored"] },
};

function WorldLabel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return <div className={`world-label ${className}`}><strong>{title}</strong><span>{children}</span></div>;
}

function Home() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("normal");
  const [selected, setSelected] = useState<ObjectId>(null);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const dragState = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setTick((value) => (value + 1) % 100), 850);
    return () => window.clearInterval(timer);
  }, [paused]);

  const metrics = useMemo(() => {
    const wave = Math.round(Math.sin(tick / 5) * 2);
    return {
      production: Math.max(61, 92 - scenario.productionDrop + wave),
      reserves: Math.max(45, 84 - Math.round(scenario.reserveDrop * (0.55 + (tick % 12) / 30))),
      access: Math.max(54, 96 - scenario.accessDrop + Math.round(wave / 2)),
      trucks: scenarioId === "trade" ? "2 / 3" : scenarioId === "flood" ? "2 / 3" : "3 / 3",
      risk: scenarioId === "normal" ? "LOW" : scenarioId === "disease" ? "HIGH" : "ELEVATED",
    };
  }, [scenario, scenarioId, tick]);

  const activate = (id: ScenarioId) => {
    setScenarioId(id);
    setSelected(null);
    setPaused(false);
  };

  const selectObject = (id: Exclude<ObjectId, null>) => setSelected((current) => current === id ? null : id);
  const selectedCopy = selected ? objectCopy[selected] : null;
  const mapStyle = { transform: `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.zoom})` };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = { x: event.clientX, y: event.clientY, ox: camera.x, oy: camera.y };
  };
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    setCamera((current) => ({ ...current, x: dragState.current!.ox + event.clientX - dragState.current!.x, y: dragState.current!.oy + event.clientY - dragState.current!.y }));
  };
  const handlePointerUp = () => { dragState.current = null; };
  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    setCamera((current) => ({ ...current, zoom: Math.max(.72, Math.min(1.45, current.zoom + (event.deltaY > 0 ? -.06 : .06))) }));
  };

  return <main className={`world-app scenario-${scenarioId}`}>
    <div className="world-topline">
      <div className="world-brand"><span className="world-brand-mark"><Sprout size={16} /></span><div><strong>FOOD SECURITY OS</strong><span>DIGITAL TWIN · SOCIETY 07</span></div></div>
      <div className="world-live"><span className="status-dot" /> LIVE WORLD STATE <span className="world-clock">09:42:{String(18 + tick).padStart(2, "0")}</span></div>
    </div>

    <div className="world-viewport" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onWheel={handleWheel}>
      <div className="world-camera" style={mapStyle}>
        <div className="world-map">
          <div className="map-sky"><div className="cloud cloud-a" /><div className="cloud cloud-b" /><div className="weather-rain" /></div>
          <div className="map-ground" />
          <div className="terrain-hill hill-a" /><div className="terrain-hill hill-b" />
          <div className={`farm-field field-a ${scenarioId === "drought" || scenarioId === "disease" ? "stressed" : ""}`}>{Array.from({ length: 12 }, (_, index) => <span key={index} />)}</div>
          <div className={`farm-field field-b ${scenarioId === "drought" ? "dry" : scenarioId === "flood" ? "flooded" : ""}`}>{Array.from({ length: 9 }, (_, index) => <span key={index} />)}</div>
          <div className={`flood-zone ${scenarioId === "flood" ? "visible" : ""}`} />
          <svg className="map-routes" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true">
            <path className={`road road-main ${scenarioId === "flood" ? "blocked" : ""} ${selected === "route" ? "selected" : ""}`} d="M190 472 C330 440 406 375 540 388 C665 402 745 493 1014 486" />
            <path className={`road road-alt ${scenarioId === "flood" || scenarioId === "trade" ? "active" : ""}`} d="M193 472 C355 560 467 560 604 500 C725 447 826 320 1025 300" />
            <path className={`road road-port ${scenarioId === "trade" ? "blocked" : ""}`} d="M1025 300 C1070 276 1094 246 1115 205" />
            <path className="irrigation" d="M295 175 C340 225 360 280 348 353 M320 218 C375 216 416 226 457 244" />
          </svg>
          <div className={`route-flow route-flow-a ${scenarioId === "flood" ? "rerouted" : ""}`}><Truck size={22} /></div><div className="route-flow route-flow-b"><Truck size={22} /></div><div className={`route-flow route-flow-c ${scenarioId === "trade" ? "delayed" : ""}`}><Truck size={20} /></div>

          <button className={`map-object farm-object ${selected === "farm" ? "selected" : ""}`} onClick={() => selectObject("farm")}><div className="farm-building"><span className="roof" /><Factory size={30} /><span className="farm-door" /></div><div className="crop-patches"><span /><span /><span /></div><div className="farm-machine"><Truck size={16} /></div></button>
          <WorldLabel title="FARM A" className="farm-label">Production: {metrics.production}% · Water: {scenarioId === "drought" ? "41%" : "67%"} · <b>{scenarioId === "normal" ? "NORMAL" : "MONITORING"}</b></WorldLabel>
          <div className="drone drone-a"><SatelliteDish size={18} /></div><div className="sensor-beacon sensor-a"><Radio size={14} /></div><div className={`warning-burst farm-warning ${scenarioId === "drought" || scenarioId === "disease" ? "visible" : ""}`}><AlertTriangle size={16} /><span>{scenarioId === "disease" ? "BIO SIGNAL" : "WATER LOW"}</span></div>

          <button className={`map-object warehouse-object ${selected === "warehouse" ? "selected" : ""}`} onClick={() => selectObject("warehouse")}><div className="warehouse-building"><span className="warehouse-roof" /><Warehouse size={38} /><span className="warehouse-door" /></div><div className="inventory-pods"><span /><span /><span /></div></button>
          <WorldLabel title="RESERVE" className="warehouse-label">Rice: 8,420 t · Corn: 3,210 t · Capacity: {metrics.reserves}%</WorldLabel>
          <div className={`warehouse-flow ${scenarioId !== "normal" ? "active" : ""}`}><Box size={15} /><ArrowDownRight size={13} /><span>{scenarioId === "normal" ? "STANDBY" : "RELEASING FOOD"}</span></div>

          <button className={`map-object sensor-object ${selected === "sensor" ? "selected" : ""}`} onClick={() => selectObject("sensor")}><div className="sensor-tower"><span /><span /><SatelliteDish size={20} /></div></button><WorldLabel title="SENSOR 04" className="sensor-label">Humidity · {scenarioId === "drought" ? "31%" : "68%"} · {scenarioId === "normal" ? "ONLINE" : "ALERT"}</WorldLabel>

          <button className={`map-object town-object ${selected === "town" ? "selected" : ""}`} onClick={() => selectObject("town")}><div className="town-buildings"><span className="tower tall" /><span className="tower" /><span className="tower small" /><span className="tower" /><span className="town-square"><Users size={18} /></span></div><div className="town-road" /></button><WorldLabel title="POPULATION" className="town-label">128,000 · Food availability: {metrics.access}%</WorldLabel><div className="town-demand"><Gauge size={14} /><span>{metrics.access}% availability</span></div>

          <button className={`map-object port-object ${selected === "port" ? "selected" : ""}`} onClick={() => selectObject("port")}><div className="port-water" /><div className="port-crane"><span /><span /></div><Ship size={28} /><div className="port-boxes"><span /><span /><span /></div></button><WorldLabel title="EAST PORT" className="port-label">Vessels: 03 · Throughput: 720 t/day</WorldLabel>
          <div className={`port-alert ${scenarioId === "trade" ? "visible" : ""}`}><Ship size={13} /> IMPORT DELAY · 48h</div>

          <div className="map-legend"><span><i className="legend-mint" /> production</span><span><i className="legend-amber" /> response</span><span><i className="legend-cyan" /> movement</span></div>
          <div className="world-title-card"><span>MINIATURE SOCIETY / REAL-TIME FOOD FLOW</span><strong>Observe the system.<br />Watch it respond.</strong></div>
        </div>
      </div>
      <div className="viewport-hint"><span>DRAG TO PAN</span><span>SCROLL TO ZOOM</span></div>
    </div>

    <aside className="scenario-console"><div className="console-head"><span><span className="status-dot" /> SCENARIO CONTROL</span><span>{paused ? "MANUAL" : "AUTO"}</span></div><div className="scenario-buttons">{scenarios.map((item) => { const Icon = item.icon; return <button key={item.id} className={scenarioId === item.id ? `active ${item.color}` : ""} onClick={() => activate(item.id)}><Icon size={13} /><span>{item.label}</span></button>; })}</div><div className="console-event"><span className={`event-dot ${scenario.color}`} /><div><small>EVENT STREAM / {scenario.label}</small><strong>{scenario.event}</strong><span>{scenario.consequence}</span></div></div><div className="console-actions"><button onClick={() => setPaused((value) => !value)}>{paused ? <Play size={12} /> : <Pause size={12} />} {paused ? "RESUME" : "PAUSE"}</button><button onClick={() => setCamera({ x: 0, y: 0, zoom: 1 })}>RESET VIEW</button></div></aside>

    <aside className="world-metrics"><div className="metrics-head"><span>WORLD TELEMETRY</span><Activity size={12} /></div><div className="metric-row"><span>Production</span><b>{metrics.production}%</b><i style={{ width: `${metrics.production}%` }} /></div><div className="metric-row"><span>Reserves</span><b>{metrics.reserves}%</b><i className="amber" style={{ width: `${metrics.reserves}%` }} /></div><div className="metric-row"><span>Food access</span><b>{metrics.access}%</b><i className="cyan" style={{ width: `${metrics.access}%` }} /></div><div className="metrics-foot"><span>Risk</span><b className={scenarioId === "normal" ? "good" : "warn"}>{metrics.risk}</b><span className="truck-count"><Truck size={12} /> {metrics.trucks}</span></div></aside>

    <div className="pillar-rail"><span className="rail-label">SYSTEM WEIGHT</span><span><b>55</b> production + reserves</span><span><b>30</b> transport + access</span><span><b>15</b> warning + response</span></div>

    {selectedCopy && <aside className="object-inspector"><button className="inspector-close" onClick={() => setSelected(null)} aria-label="Close inspector"><X size={14} /></button><span className="inspector-type">{selectedCopy.type}</span><h2>{selectedCopy.title}</h2>{selectedCopy.lines.map((line) => <div className="inspector-line" key={line}>{line}</div>)}<div className="inspector-chain"><span>CONNECTED FLOW</span><strong>farm <ArrowDownRight size={11} /> reserve <ArrowDownRight size={11} /> route <ArrowDownRight size={11} /> town</strong></div></aside>}

    <div className="zoom-controls"><button onClick={() => setCamera((current) => ({ ...current, zoom: Math.min(1.45, current.zoom + .08) }))} aria-label="Zoom in"><Plus size={15} /></button><button onClick={() => setCamera((current) => ({ ...current, zoom: Math.max(.72, current.zoom - .08) }))} aria-label="Zoom out"><ZoomOut size={15} /></button><button onClick={() => setCamera({ x: 0, y: 0, zoom: 1 })} aria-label="Reset zoom"><MapPin size={14} /></button></div>
    <div className="world-statusbar"><span><span className="status-dot" /> 5 SENSOR STREAMS ONLINE</span><span>SIMULATED REAL-TIME DATA · NO BACKEND REQUIRED</span><span>55 / 30 / 15 SYSTEM ACTIVE</span></div>
  </main>;
}

export default Home;
