import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  Box,
  Building2,
  CloudRain,
  CloudSun,
  Cpu,
  Droplets,
  Factory,
  Gauge,
  Globe2,
  Leaf,
  MapPin,
  Pause,
  Plane,
  Play,
  Plus,
  Radio,
  Route,
  SatelliteDish,
  Ship,
  SlidersHorizontal,
  Sprout,
  ShoppingBasket,
  Siren,
  Store,
  Thermometer,
  Truck,
  Users,
  Warehouse,
  Waves,
  Wind,
  Wrench,
  X,
  Zap,
  ZoomOut,
} from "lucide-react";

type ScenarioId = "normal" | "drought" | "flood" | "disease" | "trade" | "technology" | "transport" | "power" | "salinity" | "wildfire" | "landslide" | "roadblock" | "congestion";
type ObjectId = "farm" | "warehouse" | "route" | "town" | "sensor" | "port" | "market" | null;

type Scenario = {
  id: ScenarioId;
  label: string;
  icon: LucideIcon;
  color: string;
  event: string;
  effect: string;
  production: number;
  reserves: number;
  access: number;
  tech: number;
};

const scenarios: Scenario[] = [
  { id: "normal", label: "BÌNH THƯỜNG", icon: CloudSun, color: "mint", event: "Mạng lưới đang vận hành theo nhịp chuẩn", effect: "Mọi tuyến và chợ hoạt động bình thường", production: 0, reserves: 0, access: 0, tech: 0 },
  { id: "drought", label: "HẠN HÁN", icon: Wind, color: "amber", event: "Cảm biến đất phát hiện thiếu nước ở vùng Nam", effect: "Tưới tăng · kho mở luồng · xe đổi hướng", production: -21, reserves: -19, access: -8, tech: 0 },
  { id: "flood", label: "LŨ LỤT", icon: Waves, color: "cyan", event: "Vùng trũng phía Nam bắt đầu ngập", effect: "Đường thấp đóng · tuyến cao được kích hoạt", production: -15, reserves: -13, access: -12, tech: 0 },
  { id: "disease", label: "DỊCH BỆNH", icon: Siren, color: "red", event: "Bất thường sinh học trên mùa vụ được phát hiện", effect: "Khoanh vùng · khử khuẩn · phân phối lại", production: -17, reserves: -16, access: -7, tech: 0 },
  { id: "trade", label: "ĐỨT GÃY THƯƠNG MẠI", icon: Ship, color: "violet", event: "Tàu nhập khẩu trễ lịch tại Cảng Đông", effect: "Nguồn nội địa bù tải · chợ giữ giá", production: -5, reserves: -14, access: -10, tech: 0 },
  { id: "technology", label: "NÂNG CẤP CÔNG NGHỆ", icon: Cpu, color: "cyan", event: "Kích hoạt cảm biến 5G, drone và tưới thông minh", effect: "Năng suất tăng · phát hiện sớm · tiết kiệm nước", production: 12, reserves: 8, access: 4, tech: 1 },
  { id: "transport", label: "TỐI ƯU VẬN TẢI", icon: Route, color: "mint", event: "Thuật toán phân luồng mở tuyến thay thế", effect: "Xe tự đổi tuyến · thời gian giao giảm 28%", production: 0, reserves: 4, access: 11, tech: 1 },
  { id: "power", label: "MẤT ĐIỆN DIỆN RỘNG", icon: Zap, color: "violet", event: "Trạm điện vùng bị quá tải theo dây chuyền", effect: "Kho chuyển máy phát · thành phố giảm công suất · xe chậm", production: -8, reserves: -6, access: -9, tech: 0 },
  { id: "salinity", label: "XÂM NHẬP MẶN", icon: Droplets, color: "amber", event: "Nước mặn lan ngược vào vùng cửa sông", effect: "Đập ngăn mặn đóng · ruộng ven sông đổi mùa vụ", production: -12, reserves: -5, access: -3, tech: 0 },
  { id: "wildfire", label: "CHÁY RỪNG", icon: Siren, color: "red", event: "Điểm nóng phát lửa do nắng kéo dài", effect: "Vùng đệm mở · drone cứu hỏa · đường bị phong tỏa", production: -9, reserves: -4, access: -8, tech: 0 },
  { id: "landslide", label: "SẠT LỞ ĐẤT", icon: AlertTriangle, color: "violet", event: "Sườn đồi trượt sau mưa cực đoan", effect: "Ba tuyến bị chặn · xe chuyển sang vòng tránh", production: -4, reserves: -8, access: -14, tech: 0 },
  { id: "roadblock", label: "CHẶN ĐƯỜNG", icon: Route, color: "red", event: "Một nút giao bị phong tỏa đột xuất", effect: "Biển chặn dựng lên · xe tìm tuyến vòng · giao hàng chậm", production: -1, reserves: -3, access: -12, tech: 0 },
  { id: "congestion", label: "ÙN TẮC GIAO THÔNG", icon: Truck, color: "amber", event: "Lưu lượng xe vượt sức chứa trục chính", effect: "Đoàn xe dồn cục · tốc độ giảm · kho tăng hàng chờ", production: -2, reserves: -2, access: -10, tech: 0 },
];

const objectCopy: Record<Exclude<ObjectId, null>, { title: string; type: string; lines: string[] }> = {
  farm: { title: "NÔNG TRẠI A", type: "SẢN XUẤT THÔNG MINH", lines: ["Sản lượng · 82%", "Nước tưới · 67%", "Trạng thái · đang theo dõi"] },
  warehouse: { title: "KHO DỰ TRỮ BẮC", type: "KHO CHIẾN LƯỢC", lines: ["Gạo · 8.420 tấn", "Ngô · 3.210 tấn", "Sức chứa · 78%"] },
  route: { title: "TUYẾN 03", type: "MẠNG VẬN CHUYỂN", lines: ["Công suất · 91%", "Trạng thái · đang mở", "Tuyến thay thế · sẵn sàng"] },
  town: { title: "THÀNH PHỐ VỆ TINH", type: "TRUNG TÂM DÂN CƯ", lines: ["Dân số · 128.000", "Khả năng tiếp cận · 96%", "Giao hàng · 18 phút"] },
  sensor: { title: "CẢM BIẾN 04", type: "CẢNH BÁO SỚM", lines: ["Tín hiệu · độ ẩm đất", "Lần gửi cuối · 09:42:18", "Trạng thái · trực tuyến"] },
  port: { title: "CẢNG ĐÔNG", type: "NHẬP KHẨU & TRUNG CHUYỂN", lines: ["Tàu · 03", "Thông lượng · 720 tấn/ngày", "Trạng thái · đang theo dõi"] },
  market: { title: "CHỢ HUYỆN 02", type: "PHÂN PHỐI ĐỊA PHƯƠNG", lines: ["Hàng khô · đủ 9 ngày", "Giá gạo · ổn định", "Phục vụ · 34.000 người"] },
};

const distributedFarms = [
  ["A1", 10, 20], ["A2", 28, 18], ["B1", 47, 16], ["B2", 66, 22], ["C1", 18, 39], ["C2", 43, 42], ["D1", 70, 39],
];
const reserveNodes = [
  ["K1", 8, 64], ["K2", 22, 59], ["K3", 37, 68], ["K4", 52, 61], ["K5", 67, 68], ["K6", 79, 56], ["K7", 88, 68], ["K8", 60, 31],
];
const cityNodes = [
  ["THÀNH PHỐ A", 55, 20], ["THÀNH PHỐ B", 63, 35], ["THÀNH PHỐ C", 76, 61], ["THÀNH PHỐ D", 63, 74], ["THÀNH PHỐ E", 72, 24],
];
const roadNetwork = Array.from({ length: 30 }, (_, index) => ({
  id: index + 1,
  left: 7 + (index % 6) * 16,
  top: 27 + Math.floor(index / 6) * 10,
  width: 115 + (index % 4) * 24,
  rotate: index % 2 ? -9 : 8,
}));
const valueCycle = [
  ["NGƯỜI DÂN", "Nhu cầu và sức mua tạo tín hiệu cho chợ"],
  ["CHỢ", "Dữ liệu tiêu dùng kéo hàng về đúng nơi"],
  ["VẬN TẢI", "Xe, drone và tàu phân phối theo nhu cầu"],
  ["KHO", "Dự trữ hấp thụ biến động và bảo vệ giá"],
  ["NÔNG TRẠI", "Đầu tư quay lại cho giống, nước và công nghệ"],
  ["THÀNH PHỐ", "Lương thực quay về nuôi sống cộng đồng"],
];
const upgradeTargets: Record<string, [string, string, string]> = {
  farm: ["NÂNG CẤP NÔNG TRẠI", "Đặt cảm biến đất và giống chịu hạn", "7 nông trại · vùng sản xuất"],
  water: ["NÂNG CẤP TƯỚI THÔNG MINH", "Mở van theo độ ẩm từng thửa ruộng", "ruộng A1–D1 · kênh nước"],
  road: ["NÂNG CẤP XE NÂNG CẤP", "Tăng tải lạnh và giảm thời gian giao", "16 xe · 30 tuyến"],
  air: ["NÂNG CẤP KHÔNG VẬN", "Mở hành lang drone và máy bay hàng hóa", "cảng trời · vùng xa"],
  sea: ["NÂNG CẤP CẢNG BIỂN", "Tăng cầu cảng và năng lực tàu", "CẢNG ĐÔNG · 3 bến"],
};

function WorldLabel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return <div className={`world-label ${className}`}><strong>{title}</strong><span>{children}</span></div>;
}

function Home() {
  const [activeScenarios, setActiveScenarios] = useState<ScenarioId[]>(["normal"]);
  const [selected, setSelected] = useState<ObjectId>(null);
  const [paused, setPaused] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [cycleOpen, setCycleOpen] = useState(false);
  const [upgradeFocus, setUpgradeFocus] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [upgrades, setUpgrades] = useState<string[]>([]);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const dragState = useRef<{ x: number; y: number; ox: number; oy: number; pointerId: number } | null>(null);
  const active = scenarios.filter((item) => activeScenarios.includes(item.id));
  const has = (id: ScenarioId) => activeScenarios.includes(id);
  const upgraded = (id: string) => upgrades.includes(id);
  const weather = has("flood") ? "MƯA LỚN · 212mm" : has("drought") ? "NẮNG GẮT · 39°C" : has("trade") ? "CẢNG TẮC · 48h" : "ỔN ĐỊNH · 28°C";

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setTick((value) => (value + 1) % 100), 850);
    return () => window.clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = dragState.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      setCamera((current) => ({ ...current, x: drag.ox + event.clientX - drag.x, y: drag.oy + event.clientY - drag.y }));
    };
    const release = () => { dragState.current = null; };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("blur", release);
    };
  }, []);

  const targetMetrics = useMemo(() => {
    const sum = (key: "production" | "reserves" | "access") => active.reduce((total, item) => total + item[key], 0);
    const techBonus = (active.some((item) => item.id === "technology") ? 5 : 0) + (upgraded("farm") ? 12 : 0) + (upgraded("water") ? 4 : 0);
    const transportBonus = (active.some((item) => item.id === "transport") ? 7 : 0) + (upgraded("road") ? 10 : 0) + (upgraded("air") ? 6 : 0) + (upgraded("sea") ? 4 : 0);
    return {
      production: Math.max(52, Math.min(100, 92 + sum("production") + techBonus)),
      reserves: Math.max(38, Math.min(100, 84 + sum("reserves") + (upgraded("sea") ? 8 : 0))),
      access: Math.max(48, Math.min(100, 96 + sum("access") + transportBonus)),
      trucks: has("trade") ? "4 / 8" : has("flood") ? "5 / 8" : upgraded("road") ? "8 / 8" : "4 / 8",
      risk: activeScenarios.length === 1 && has("normal") ? "THẤP" : activeScenarios.some((id) => ["drought", "flood", "disease", "trade", "power", "salinity", "wildfire", "landslide", "roadblock", "congestion"].includes(id)) ? "CAO" : "ĐANG GIẢM",
    };
  }, [activeScenarios, upgrades]);

  const [simMetrics, setSimMetrics] = useState({ production: 92, reserves: 84, access: 96 });
  useEffect(() => {
    const timer = window.setInterval(() => {
      setSimMetrics((current) => {
        const move = (value: number, target: number) => Math.abs(target - value) < 0.3 ? target : value + (target - value) * 0.045;
        return { production: move(current.production, targetMetrics.production), reserves: move(current.reserves, targetMetrics.reserves), access: move(current.access, targetMetrics.access) };
      });
    }, 120);
    return () => window.clearInterval(timer);
  }, [targetMetrics.production, targetMetrics.reserves, targetMetrics.access]);

  const metrics = { ...simMetrics, trucks: targetMetrics.trucks, risk: targetMetrics.risk };

  const activate = (id: ScenarioId) => {
    if (id === "normal") { setActiveScenarios(["normal"]); setSelected(null); setPaused(false); return; }
    setActiveScenarios((current) => {
      const withoutNormal = current.filter((item) => item !== "normal");
      return withoutNormal.includes(id) ? (withoutNormal.length ? withoutNormal.filter((item) => item !== id) : ["normal"]) : [...withoutNormal, id];
    });
    setPaused(false);
  };

  const toggleUpgrade = (id: string) => {
    setUpgrades((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setUpgradeFocus(id);
    setPaused(false);
  };

  const selectObject = (id: Exclude<ObjectId, null>) => setSelected((current) => current === id ? null : id);
  const selectedCopy = selected ? objectCopy[selected] : null;
  const mapStyle = { transform: `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.zoom})` };
  const worldClass = `world-app ${activeScenarios.map((id) => `co-${id}`).join(" ")} ${upgradeFocus ? `focus-${upgradeFocus}` : ""}`;

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    event.preventDefault();
    dragState.current = { x: event.clientX, y: event.clientY, ox: camera.x, oy: camera.y, pointerId: event.pointerId };
  };
  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => { event.preventDefault(); setCamera((current) => ({ ...current, zoom: Math.max(.68, Math.min(1.52, current.zoom + (event.deltaY > 0 ? -.06 : .06))) })); };
  const activeText = active.filter((item) => item.id !== "normal").map((item) => item.label).join(" + ") || "BÌNH THƯỜNG";
  const cycleStep = valueCycle[tick % valueCycle.length];
  const selectedUpgrade = selected === "farm" ? "farm" : selected === "warehouse" ? "water" : selected === "route" ? "road" : selected === "port" ? "sea" : selected === "town" ? "air" : null;

  return <main className={worldClass}>
    <div className="world-topline"><div className="world-brand"><span className="world-brand-mark"><Sprout size={16} /></span><div><strong>HỆ ĐIỀU HÀNH AN NINH LƯƠNG THỰC</strong><span>MÔ HÌNH SỐ · XÃ HỘI 07 · VIỆT NAM</span></div></div><div className="world-live"><span className="status-dot" /> TRẠNG THÁI THỰC <span className="world-clock">09:42:{String(18 + tick).padStart(2, "0")}</span></div></div>

    <div className="world-viewport" onPointerDown={handlePointerDown} onWheel={handleWheel}>
      <div className="world-camera" style={mapStyle}><div className="world-map">
        <div className="map-sky"><div className="cloud cloud-a" /><div className="cloud cloud-b" /><div className="weather-rain" /><div className="storm-front" /></div><div className="network-summary"><span><b>7</b> nông trại</span><span><b>8</b> kho</span><span><b>5</b> thành phố</span><span><b>30</b> tuyến</span></div><div className="map-ground" /><div className="grass-layer">{Array.from({ length: 52 }, (_, index) => <span key={index} style={{ left: `${(index * 37) % 96}%`, top: `${18 + ((index * 19) % 62)}%`, transform: `rotate(${(index % 5) * 11 - 22}deg)` }} />)}</div><div className="flowing-water stream-a"><span /><span /><span /><span /></div><div className={`salt-front ${has("salinity") ? "visible" : ""}`} /><div className={`fire-zone ${has("wildfire") ? "visible" : ""}`} /><div className={`blackout-zone ${has("power") ? "visible" : ""}`} /><div className={`landslide-zone ${has("landslide") ? "visible" : ""}`} /><div className="water-body river-a" /><div className="water-body reservoir-a" /><div className={`drought-cracks ${has("drought") ? "visible" : ""}`} /><div className={`disease-spread ${has("disease") ? "visible" : ""}`} /><div className="terrain-hill hill-a" /><div className="terrain-hill hill-b" /><div className="terrain-hill hill-c" />
        <div className={`farm-field field-a ${has("drought") || has("disease") ? "stressed" : ""}`}>
          {Array.from({ length: 12 }, (_, index) => <span key={index} />)}
        </div><div className={`farm-field field-b ${has("drought") ? "dry" : has("flood") ? "flooded" : ""}`}>{Array.from({ length: 9 }, (_, index) => <span key={index} />)}</div><div className="farm-field field-c">{Array.from({ length: 8 }, (_, index) => <span key={index} />)}</div><div className={`flood-zone ${has("flood") ? "visible" : ""}`} />
        <svg className="map-routes" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true"><path className={`road road-main ${has("flood") ? "blocked" : ""} ${selected === "route" ? "selected" : ""}`} d="M190 472 C330 440 406 375 540 388 C665 402 745 493 1014 486" /><path className={`road road-alt ${has("flood") || has("trade") || has("transport") ? "active" : ""}`} d="M193 472 C355 560 467 560 604 500 C725 447 826 320 1025 300" /><path className={`road road-port ${has("trade") ? "blocked" : ""}`} d="M1025 300 C1070 276 1094 246 1115 205" /><path className="road road-north" d="M575 305 C690 226 796 206 972 224" /><path className="irrigation" d="M295 175 C340 225 360 280 348 353 M320 218 C375 216 416 226 457 244" /></svg>
        <div className="map-sectors"><div className="map-sector sector-production"><b>VÙNG SẢN XUẤT</b><span>7 nông trại phân tán</span></div><div className="map-sector sector-reserve"><b>VÙNG DỰ TRỮ</b><span>8 kho chiến lược</span></div><div className="map-sector sector-city"><b>VÙNG DÂN CƯ</b><span>5 thành phố</span></div><div className="map-sector sector-logistics"><b>VÙNG LOGISTICS</b><span>cảng · chợ · trung chuyển</span></div></div><div className={`road-block-sign ${has("roadblock") || has("landslide") ? "visible" : ""}`}><AlertTriangle size={16} /><b>CHẶN ĐƯỜNG</b><span>tuyến 07 · vòng tránh</span></div><div className={`traffic-congestion ${has("congestion") ? "visible" : ""}`}>{Array.from({ length: 9 }, (_, index) => <Truck key={index} size={index % 3 === 0 ? 20 : 15} />)}<b>ÙN TẮC · 18 PHÚT</b></div><div className={`enhance-callout ${upgradeFocus && upgradeTargets[upgradeFocus] ? "visible" : ""}`}>{upgradeFocus && upgradeTargets[upgradeFocus] ? <><Wrench size={15} /><div><b>{upgradeTargets[upgradeFocus][0]}</b><span>{upgradeTargets[upgradeFocus][1]}</span><small>{upgradeTargets[upgradeFocus][2]}</small></div><button type="button" onClick={() => setUpgradeFocus(null)} aria-label="Đóng hướng dẫn nâng cấp"><X size={12} /></button></> : null}</div><button type="button" className={`cycle-launcher ${cycleOpen ? "active" : ""}`} onClick={() => setCycleOpen((value) => !value)} aria-expanded={cycleOpen} aria-controls="value-cycle"><ArrowDownRight size={14} /><span>{cycleOpen ? "ĐÓNG VÒNG LẶP" : "VÒNG GIÁ TRỊ"}</span></button><div id="value-cycle" className={`value-cycle ${cycleOpen ? "is-open" : "is-closed"}`}><div className="cycle-header"><span>VÒNG GIÁ TRỊ LẶP</span><small>người dân tạo nhu cầu · hệ thống tái đầu tư</small></div><div className="cycle-track">{valueCycle.map(([label], index) => <span key={label} className={index === tick % valueCycle.length ? "active" : ""}><i>{index + 1}</i>{label}</span>)}</div><strong>{cycleStep[0]}</strong><p>{cycleStep[1]}</p></div><div className="expanded-hinterland"><span className="outer-road outer-road-a" /><span className="outer-road outer-road-b" /><span className="outer-road outer-road-c" /><div className="outer-node outer-forest"><Leaf size={15} /><b>VÙNG RỪNG NGOẠI VI</b></div><div className="outer-node outer-water"><Droplets size={15} /><b>HỒ ĐIỀU TIẾT</b></div><div className="outer-node outer-hill"><Sprout size={15} /><b>VÙNG ĐỒI XA</b></div></div><div className="distributed-network">{roadNetwork.map((road) => <span key={road.id} className="distributed-road" style={{ left: `${road.left}%`, top: `${road.top}%`, width: `${road.width}px`, transform: `rotate(${road.rotate}deg)` }}><Route size={8} /></span>)}</div><div className="distributed-farms">{distributedFarms.map(([id, left, top]) => <button key={id} type="button" className="distributed-node farm-node" style={{ left: `${left}%`, top: `${top}%` }} onClick={() => selectObject("farm")} aria-label={`Nông trại ${id}`}><Sprout size={15} /><b>{id}</b></button>)}</div><div className="distributed-reserves">{reserveNodes.map(([id, left, top]) => <button key={id} type="button" className="distributed-node reserve-node" style={{ left: `${left}%`, top: `${top}%` }} onClick={() => selectObject("warehouse")} aria-label={`Kho dự trữ ${id}`}><Warehouse size={14} /><b>{id}</b></button>)}</div><div className="distributed-cities">{cityNodes.map(([name, left, top]) => <button key={name} type="button" className="distributed-node city-node" style={{ left: `${left}%`, top: `${top}%` }} onClick={() => selectObject("town")} aria-label={String(name)}><Building2 size={16} /><b>{name}</b></button>)}</div>
        <div className={`route-flow route-flow-a ${has("flood") || has("transport") ? "rerouted" : ""}`}><Truck size={22} /></div><div className="route-flow route-flow-b"><Truck size={22} /></div><div className={`route-flow route-flow-c ${has("trade") ? "delayed" : ""}`}><Truck size={20} /></div><div className="route-flow route-flow-d"><Truck size={18} /></div><div className="fleet-trucks">{Array.from({ length: 6 }, (_, index) => <div className={`fleet-truck fleet-truck-${index + 1}`} key={index}><Truck size={17} /></div>)}</div><div className="car-convoy">{Array.from({ length: 16 }, (_, index) => <div key={index} className={`road-car ${index % 3 === 0 ? "road-car-alt" : ""}`} style={{ animationDelay: `${index * -0.42}s` }}><Truck size={index % 4 === 0 ? 16 : 13} /></div>)}</div><div className={`air-fleet ${upgraded("air") ? "enhanced" : ""}`}><div className="air-route" /><div className="aircraft aircraft-a"><Plane size={19} /></div><div className="aircraft aircraft-b"><Plane size={17} /></div><div className="aircraft aircraft-c"><Plane size={15} /></div></div><div className={`ship-fleet ${upgraded("sea") ? "enhanced" : ""}`}><Ship size={24} /><Ship size={20} /><Ship size={17} /></div>

        <button className={`map-object farm-object ${selected === "farm" ? "selected" : ""}`} onClick={() => selectObject("farm")}><div className="farm-building"><span className="roof" /><Factory size={30} /><span className="farm-door" /></div><div className="crop-patches"><span /><span /><span /></div><div className="farm-machine"><Truck size={16} /></div></button><WorldLabel title="NÔNG TRẠI A" className="farm-label">Sản lượng: {metrics.production}% · Nước: {has("drought") ? "41%" : "67%"} · <b>{has("technology") ? "CÔNG NGHỆ CAO" : "BÌNH THƯỜNG"}</b></WorldLabel><div className="drone drone-a"><SatelliteDish size={18} /></div><div className="sensor-beacon sensor-a"><Radio size={14} /></div><div className={`warning-burst farm-warning ${has("drought") || has("disease") ? "visible" : ""}`}><AlertTriangle size={16} /><span>{has("disease") ? "TÍN HIỆU DỊCH" : "THIẾU NƯỚC"}</span></div>

        <button className={`map-object warehouse-object ${selected === "warehouse" ? "selected" : ""}`} onClick={() => selectObject("warehouse")}><div className="warehouse-building"><span className="warehouse-roof" /><Warehouse size={38} /><span className="warehouse-door" /></div><div className="inventory-pods"><span /><span /><span /></div></button><WorldLabel title="KHO DỰ TRỮ BẮC" className="warehouse-label">Gạo: 8.420 tấn · Ngô: 3.210 tấn · Sức chứa: {metrics.reserves}%</WorldLabel><div className={`warehouse-flow ${activeScenarios.length > 1 ? "active" : ""}`}><Box size={15} /><ArrowDownRight size={13} /><span>{activeScenarios.length > 1 ? "ĐANG XUẤT HÀNG" : "SẴN SÀNG"}</span></div>
        <button className={`map-object depot-object ${has("technology") ? "upgraded" : ""}`} onClick={() => selectObject("warehouse")}><div className="depot-building"><Warehouse size={24} /></div></button><WorldLabel title="KHO VÙNG NAM" className="depot-label">Dự trữ: 4.860 tấn · Đang luân chuyển</WorldLabel>

        <button className={`map-object sensor-object ${selected === "sensor" ? "selected" : ""}`} onClick={() => selectObject("sensor")}><div className="sensor-tower"><span /><span /><SatelliteDish size={20} /></div></button><WorldLabel title="CẢM BIẾN 04" className="sensor-label">Độ ẩm: {has("drought") ? "31%" : "68%"} · {activeScenarios.length > 1 ? "CẢNH BÁO" : "TRỰC TUYẾN"}</WorldLabel>

        <button className={`map-object town-object ${selected === "town" ? "selected" : ""}`} onClick={() => selectObject("town")}><div className="town-buildings"><span className="tower tall" /><span className="tower" /><span className="tower small" /><span className="tower" /><span className="town-square"><Users size={18} /></span></div><div className="town-road" /></button><WorldLabel title="THÀNH PHỐ VỆ TINH" className="town-label">Dân số: 128.000 · Tiếp cận: {metrics.access}%</WorldLabel><div className="town-demand"><Gauge size={14} /><span>{metrics.access}% thực phẩm</span></div>
        <div className="village village-a"><HomeIcon /><span>ẤP BÌNH MINH</span></div><div className="village village-b"><HomeIcon /><span>LÀNG SÔNG XANH</span></div>

        <button className={`map-object port-object ${selected === "port" ? "selected" : ""}`} onClick={() => selectObject("port")}><div className="port-water" /><div className="port-crane"><span /><span /></div><Ship size={28} /><div className="port-boxes"><span /><span /><span /></div></button><WorldLabel title="CẢNG ĐÔNG" className="port-label">Tàu: 03 · Thông lượng: 720 tấn/ngày</WorldLabel><div className={`port-alert ${has("trade") ? "visible" : ""}`}><Ship size={13} /> CHẬM NHẬP · 48 GIỜ</div>

        <button className={`map-object market-object market-one ${selected === "market" ? "selected" : ""}`} onClick={() => selectObject("market")}><div className="market-building"><Store size={23} /></div><div className="market-stalls"><span /><span /><span /></div></button><WorldLabel title="CHỢ HUYỆN 02" className="market-label">Hàng khô: 9 ngày · Giá gạo: ổn định</WorldLabel>
        <button className="map-object market-object market-two" onClick={() => selectObject("market")}><div className="market-building"><ShoppingBasket size={23} /></div><div className="market-stalls"><span /><span /><span /></div></button><WorldLabel title="CHỢ ĐẦU MỐI 01" className="market-two-label">Phục vụ: 34.000 người · Mở cửa</WorldLabel>
        <div className="distribution-center"><Building2 size={24} /><span>ĐIỂM PHÂN PHỐI</span></div>
        <div className={`tech-pulse ${has("technology") || upgraded("farm") || upgraded("water") ? "visible" : ""}`}><Cpu size={16} /><span>5G · MÁY BAY KHÔNG NGƯỜI LÁI · TƯỚI THÔNG MINH</span></div><div className={`route-pulse ${has("transport") || upgraded("road") || upgraded("air") || upgraded("sea") ? "visible" : ""}`}><Route size={14} /><span>THUẬT TOÁN ĐỔI TUYẾN ĐANG CHẠY</span></div>

        <div className="map-legend"><span><i className="legend-mint" /> sản xuất</span><span><i className="legend-amber" /> dự trữ / ứng phó</span><span><i className="legend-cyan" /> dòng vận chuyển</span></div><div className="world-title-card"><span>BẢN ĐỒ XÃ HỘI THU NHỎ / DÒNG LƯƠNG THỰC THỜI GIAN THỰC</span><strong>Quan sát hệ thống.<br />Xem cách nó phản ứng.</strong></div>
      </div></div>
      <div className="viewport-hint"><span>KÉO ĐỂ DI CHUYỂN BẢN ĐỒ</span><span>CUỘN ĐỂ PHÓNG TO</span></div>
    </div>

    <button type="button" className={`console-launcher ${consoleOpen ? "active" : ""}`} onClick={() => setConsoleOpen((value) => !value)} aria-expanded={consoleOpen} aria-controls="scenario-console"><SlidersHorizontal size={15} /><span>{consoleOpen ? "ĐÓNG ĐIỀU KHIỂN" : "KỊCH BẢN"}</span></button><aside id="scenario-console" className={`scenario-console ${consoleOpen ? "is-open" : "is-closed"}`}><div className="console-head"><span><span className="status-dot" /> ĐIỀU KHIỂN KỊCH BẢN</span><span>{paused ? "THỦ CÔNG" : "TỰ ĐỘNG"}<button type="button" className="console-close" onClick={() => setConsoleOpen(false)} aria-label="Đóng điều khiển"><X size={13} /></button></span></div><div className="scenario-buttons">{scenarios.map((item) => { const Icon = item.icon; return <button key={item.id} title={item.label} className={activeScenarios.includes(item.id) ? `active ${item.color}` : ""} onClick={() => activate(item.id)}><Icon size={13} /><span>{item.label}</span></button>; })}</div><div className="technology-tree"><div className="technology-title"><Wrench size={11} /> CÂY NÂNG CẤP NĂNG LỰC</div><div className="technology-buttons"><button className={upgraded("farm") ? "upgraded" : ""} onClick={() => toggleUpgrade("farm")}><Sprout size={11} /> Nông trại</button><button className={upgraded("water") ? "upgraded" : ""} onClick={() => toggleUpgrade("water")}><Droplets size={11} /> Tưới thông minh</button><button className={upgraded("road") ? "upgraded" : ""} onClick={() => toggleUpgrade("road")}><Truck size={11} /> Xe nâng cấp</button><button className={upgraded("air") ? "upgraded" : ""} onClick={() => toggleUpgrade("air")}><Plane size={11} /> Không vận</button><button className={upgraded("sea") ? "upgraded" : ""} onClick={() => toggleUpgrade("sea")}><Ship size={11} /> Cảng biển</button></div></div><div className="active-stack"><span>ĐANG CHẠY ĐỒNG THỜI</span><strong>{activeText}{upgrades.length ? ` + ${upgrades.length} NÂNG CẤP` : ""}</strong></div><div className="console-event"><span className={`event-dot ${active[active.length - 1]?.color ?? "mint"}`} /><div><small>LUỒNG SỰ KIỆN / {activeText}</small><strong>{active[active.length - 1]?.event}</strong><span>{active[active.length - 1]?.effect}</span></div></div><div className="console-actions"><button onClick={() => setPaused((value) => !value)}>{paused ? <Play size={12} /> : <Pause size={12} />} {paused ? "TIẾP TỤC" : "TẠM DỪNG"}</button><button onClick={() => setCamera({ x: 0, y: 0, zoom: 1 })}>ĐẶT LẠI GÓC NHÌN</button></div></aside>

    <button type="button" className={`metrics-launcher ${metricsOpen ? "active" : ""}`} onClick={() => setMetricsOpen((value) => !value)} aria-expanded={metricsOpen} aria-controls="world-metrics"><Gauge size={14} /><span>{metricsOpen ? "ĐÓNG CHỈ SỐ" : "CHỈ SỐ"}</span></button><aside id="world-metrics" className={`world-metrics ${metricsOpen ? "is-open" : "is-closed"}`}><div className="metrics-head"><span>ĐO LƯỜNG XÃ HỘI</span><Activity size={12} /></div><div className="metric-row"><span>Sản lượng</span><b>{metrics.production}%</b><i style={{ width: `${metrics.production}%` }} /></div><div className="metric-row"><span>Dự trữ</span><b>{metrics.reserves}%</b><i className="amber" style={{ width: `${metrics.reserves}%` }} /></div><div className="metric-row"><span>Tiếp cận thực phẩm</span><b>{metrics.access}%</b><i className="cyan" style={{ width: `${metrics.access}%` }} /></div><div className="metrics-foot"><span>Rủi ro</span><b className={activeScenarios.length === 1 && has("normal") ? "good" : "warn"}>{metrics.risk}</b><span className="truck-count"><Truck size={12} /> {metrics.trucks}</span></div></aside>
    {selectedCopy && <aside className="object-inspector"><button className="inspector-close" onClick={() => setSelected(null)} aria-label="Đóng bảng thông tin"><X size={14} /></button><span className="inspector-type">{selectedCopy.type}</span><h2>{selectedCopy.title}</h2>{selectedCopy.lines.map((line) => <div className="inspector-line" key={line}>{line}</div>)}<div className="inspector-live"><span>ĐANG QUAN SÁT · THỜI GIAN THỰC</span><b>{selected === "farm" ? "Độ ẩm đất đang được đo" : selected === "warehouse" ? "Luồng xuất hàng đang kiểm kê" : selected === "route" ? "Đo tốc độ và tải tuyến" : selected === "town" ? "Nhu cầu dân cư đang cập nhật" : "Tín hiệu cảm biến đang truyền"}</b><i style={{ width: `${Math.max(18, (tick * 13) % 82)}%` }} /></div>{selectedUpgrade && <button type="button" className="inspector-upgrade" onClick={() => { toggleUpgrade(selectedUpgrade); setUpgradeFocus(selectedUpgrade); }}><Wrench size={13} /> {upgraded(selectedUpgrade) ? "XEM ĐIỂM ĐÃ NÂNG CẤP" : "NÂNG CẤP TẠI ĐÂY"}</button>}<div className="inspector-chain"><span>CHUỖI LIÊN KẾT</span><strong>nông trại <ArrowDownRight size={11} /> kho <ArrowDownRight size={11} /> vận tải <ArrowDownRight size={11} /> chợ</strong></div></aside>}
    <div className="zoom-controls"><button onClick={() => setCamera((current) => ({ ...current, zoom: Math.min(1.52, current.zoom + .08) }))} aria-label="Phóng to"><Plus size={15} /></button><button onClick={() => setCamera((current) => ({ ...current, zoom: Math.max(.68, current.zoom - .08) }))} aria-label="Thu nhỏ"><ZoomOut size={15} /></button><button onClick={() => setCamera({ x: 0, y: 0, zoom: 1 })} aria-label="Đặt lại"><MapPin size={14} /></button></div>
    <div className="world-statusbar"><span><span className="status-dot" /> 5 LUỒNG CẢM BIẾN TRỰC TUYẾN</span><span>DỮ LIỆU MÔ PHỎNG THỜI GIAN THỰC · KHÔNG CẦN MÁY CHỦ</span><span>HỆ THỐNG 55 / 30 / 15 ĐANG CHẠY</span></div>
  </main>;
}

function HomeIcon() { return <span className="home-icon"><span /><span /><span /></span>; }

export default Home;
