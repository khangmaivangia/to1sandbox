import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  BarChart3,
  Box,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CloudRain,
  CloudSun,
  Crosshair,
  Cpu,
  Database,
  DollarSign,
  Droplets,
  Factory,
  Gauge,
  Globe2,
  Leaf,
  MapPin,
  Package,
  Radio,
  RefreshCw,
  Route,
  SatelliteDish,
  ScanLine,
  Ship,
  ShieldCheck,
  Siren,
  Sprout,
  Thermometer,
  Truck,
  Warehouse,
  Waves,
  Wifi,
  Wind,
  Zap,
} from "lucide-react";

type PillarId = "production" | "transport" | "warning";
type RouteStatus = "active" | "congested" | "disrupted";

const pillars: Array<{
  id: PillarId;
  index: string;
  label: string;
  title: string;
  score: number;
  color: string;
  icon: LucideIcon;
  description: string;
  result: string;
  details: string[];
}> = [
  {
    id: "production",
    index: "01 / NỀN CUNG",
    label: "TĂNG SẢN XUẤT & DỰ TRỮ",
    title: "Công nghệ cao, giống tốt và kho dự phòng phân tán.",
    score: 55,
    color: "#9df3c5",
    icon: Leaf,
    description: "Biến mỗi vùng sản xuất thành một mắt xích chủ động — có dữ liệu, có năng suất và có nguồn cung dự phòng.",
    result: "Tăng sản lượng + tạo nguồn lương thực dự phòng",
    details: [
      "Công nghệ cao và giống cây năng suất tốt, chịu hạn",
      "Tưới tiết kiệm nước, cảm biến đất và camera nông nghiệp",
      "Hỗ trợ vốn, kỹ thuật và vật tư cho nông dân",
      "Kho chiến lược đa điểm: gạo, ngô, lúa mì, đậu và thực phẩm khô",
      "Luân chuyển hàng hóa để tránh hư hỏng; phân phối nhanh khi cần",
    ],
  },
  {
    id: "transport",
    index: "02 / DÒNG TIẾP CẬN",
    label: "BẢO ĐẢM VẬN CHUYỂN & TIẾP CẬN",
    title: "Nhiều tuyến thay thế, đến đúng nơi với giá phù hợp.",
    score: 30,
    color: "#78d9ee",
    icon: Route,
    description: "Tách rủi ro khỏi một tuyến duy nhất bằng mạng lưới nhiều lớp: cảng, đường bộ, kho và điểm phân phối địa phương.",
    result: "Lương thực đến đúng nơi với mức giá phù hợp",
    details: [
      "Đa dạng hóa nguồn nhập khẩu và điểm nhận hàng",
      "Nhiều tuyến vận tải thay thế giữa nông trại, kho, cảng và thành phố",
      "Ưu tiên vận chuyển lương thực trong khủng hoảng",
      "Hỗ trợ doanh nghiệp giảm chi phí logistics và đầu vào",
      "Kiểm soát đầu cơ, găm hàng; khuyến khích phân phối tại địa phương",
    ],
  },
  {
    id: "warning",
    index: "03 / VÒNG PHẢN HỒI",
    label: "CẢNH BÁO & ỨNG PHÓ KHẨN CẤP",
    title: "Nhìn thấy bất thường trước khi nó thành khủng hoảng.",
    score: 15,
    color: "#f8bd71",
    icon: Siren,
    description: "Một trung tâm điều phối hợp nhất thời tiết, mùa vụ, giá cả, dự trữ và vận tải để kích hoạt phản ứng đúng lúc.",
    result: "Phát hiện sớm → phản ứng nhanh → hạn chế thiệt hại",
    details: [
      "Theo dõi sản lượng, giá lương thực, thời tiết và lượng dự trữ",
      "Cảnh báo sớm với kịch bản hạn hán, lũ lụt, dịch bệnh",
      "Kịch bản ứng phó gián đoạn thương mại và diễn tập định kỳ",
      "Kích hoạt nguồn dự trữ, điều chỉnh tuyến vận chuyển",
      "Theo dõi hồi phục và cập nhật kế hoạch sau mỗi chu kỳ",
    ],
  },
];

const scenarios: Array<{
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  productionDrop: number;
  reserveDrop: number;
  transportDrop: number;
  risk: string;
}> = [
  { id: "drought", label: "Hạn hán", icon: CloudSun, description: "Nắng nóng kéo dài làm giảm năng suất tại vùng trồng trọng điểm.", productionDrop: 21, reserveDrop: 23, transportDrop: 7, risk: "CAO" },
  { id: "flood", label: "Lũ lụt", icon: Waves, description: "Mưa cực đoan cắt đứt một số tuyến đường và vùng sản xuất.", productionDrop: 14, reserveDrop: 13, transportDrop: 16, risk: "CAO" },
  { id: "disease", label: "Dịch bệnh", icon: ShieldCheck, description: "Dịch bệnh nông nghiệp lan rộng, cần cô lập và phân phối lại.", productionDrop: 17, reserveDrop: 18, transportDrop: 10, risk: "TRUNG BÌNH" },
  { id: "trade", label: "Gián đoạn thương mại", icon: Ship, description: "Một nguồn nhập khẩu và tuyến cảng bị đình trệ trong ngắn hạn.", productionDrop: 5, reserveDrop: 16, transportDrop: 20, risk: "CAO" },
  { id: "price", label: "Giá lương thực tăng", icon: DollarSign, description: "Giá đầu vào tăng nhanh, gây áp lực lên khả năng tiếp cận.", productionDrop: 8, reserveDrop: 11, transportDrop: 11, risk: "TRUNG BÌNH" },
];

const routeSeed: Array<{ id: string; name: string; detail: string; status: RouteStatus }> = [
  { id: "north", name: "Tuyến Bắc · kho vùng cao", detail: "1.240 tấn / ngày", status: "active" },
  { id: "port", name: "Cảng Đông · trung tâm", detail: "720 tấn / ngày", status: "congested" },
  { id: "local", name: "Mạng địa phương · thay thế", detail: "420 tấn / ngày", status: "active" },
];

const responseSteps = [
  "Phát hiện bất thường",
  "Kích hoạt cảnh báo",
  "Mở kho dự trữ",
  "Đổi tuyến vận chuyển",
  "Đến vùng ảnh hưởng",
  "Theo dõi hồi phục",
];

function SectionKicker({ children, color = "mint" }: { children: React.ReactNode; color?: "mint" | "cyan" | "amber" }) {
  return <div className={`kicker ${color === "cyan" ? "text-[#78d9ee]" : color === "amber" ? "text-[#f8bd71]" : ""}`}><span className="kicker-line" />{children}</div>;
}

function FlowNode({ icon: Icon, title, subtitle, tone = "mint" }: { icon: LucideIcon; title: string; subtitle: string; tone?: "mint" | "cyan" | "amber" }) {
  return <div className={`flow-node ${tone}`}><div className="flow-icon"><Icon size={26} strokeWidth={1.6} /></div><div><h3>{title}</h3><p>{subtitle}</p></div></div>;
}

function PillarVisual({ id }: { id: PillarId }) {
  if (id === "production") {
    return <div className="pillar-visual">
      <span className="visual-caption">SENSOR MESH / FARM 07</span>
      <div className="farm-sky" /><div className="farm-horizon" />
      <div className="sensor-beam" /><div className="drone"><SatelliteDish size={19} strokeWidth={1.4} /></div>
      <div className="crop-row"><Sprout size={18} /><Sprout size={23} /><Sprout size={16} /></div>
      <div className="warehouse" />
    </div>;
  }

  if (id === "transport") {
    return <div className="route-visual">
      <span className="visual-caption">MULTI-ROUTE ACCESS MAP</span><div className="route-grid" />
      <div className="route-path active" style={{ left: "18%", top: "42%", width: "69%", transform: "rotate(-12deg)" }} />
      <div className="route-path congested" style={{ left: "21%", top: "62%", width: "61%", transform: "rotate(16deg)" }} />
      <div className="route-path active" style={{ left: "45%", top: "28%", width: "39%", transform: "rotate(61deg)" }} />
      <div className="route-node" style={{ left: "15%", top: "39%" }} data-label="farm" /><div className="route-node port" style={{ left: "42%", top: "54%" }} data-label="port" /><div className="route-node city" style={{ left: "84%", top: "27%" }} data-label="city" /><div className="route-node" style={{ left: "78%", top: "77%" }} data-label="local" />
      <Truck className="route-truck" size={18} strokeWidth={1.5} />
    </div>;
  }

  return <div className="control-visual">
    <span className="visual-caption">EARLY WARNING / HUB 01</span><div className="radar" />
    <div className="control-bars">
      <div className="control-bar"><label>Thời tiết <b>68%</b></label><div className="bar-track"><div className="bar-fill" style={{ width: "68%" }} /></div></div>
      <div className="control-bar"><label>Sản lượng <b>92%</b></label><div className="bar-track"><div className="bar-fill" style={{ width: "92%" }} /></div></div>
      <div className="control-bar"><label>Giá lương thực <b>31%</b></label><div className="bar-track"><div className="bar-fill amber" style={{ width: "31%" }} /></div></div>
      <div className="control-bar"><label>Dự trữ <b>84%</b></label><div className="bar-track"><div className="bar-fill" style={{ width: "84%" }} /></div></div>
    </div>
    <div className="alert-strip"><AlertTriangle size={12} /> Cảnh báo sớm · 01 tín hiệu cần theo dõi</div>
  </div>;
}

function Home() {
  const [expandedPillar, setExpandedPillar] = useState<PillarId>("production");
  const [highlightedPillar, setHighlightedPillar] = useState<PillarId | null>(null);
  const [selectedScenario, setSelectedScenario] = useState("drought");
  const [simulationStep, setSimulationStep] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [routeStatuses, setRouteStatuses] = useState<Record<string, RouteStatus>>(() => Object.fromEntries(routeSeed.map((route) => [route.id, route.status])));
  const [selectedRoute, setSelectedRoute] = useState("north");

  const scenario = scenarios.find((item) => item.id === selectedScenario) ?? scenarios[0];
  const progress = simulationStep / (responseSteps.length - 1);
  const displayMetrics = useMemo(() => {
    const recovery = simulationStep >= 4 ? Math.max(0, progress - .66) * 2 : 0;
    return {
      production: Math.round(92 - scenario.productionDrop * (1 - recovery) * Math.min(1, progress * 1.35)),
      reserves: Math.round(84 - scenario.reserveDrop * (1 - recovery) * Math.min(1, progress * 1.18)),
      transport: Math.round(96 - scenario.transportDrop * (1 - recovery) * Math.min(1, progress * 1.12)),
      risk: progress > .48 && progress < .92 ? "CAO" : progress >= .92 ? "ỔN ĐỊNH" : "THẤP",
    };
  }, [progress, scenario]);

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => setSimulationStep((current) => Math.min(current + 1, responseSteps.length - 1)), 960);
    return () => window.clearInterval(timer);
  }, [isRunning, selectedScenario]);

  useEffect(() => {
    if (simulationStep === responseSteps.length - 1) setIsRunning(false);
  }, [simulationStep]);

  const selectScenario = (id: string) => {
    setSelectedScenario(id);
    setSimulationStep(0);
    setIsRunning(true);
  };

  const cycleRouteStatus = (id: string) => {
    setSelectedRoute(id);
    setRouteStatuses((current) => {
      const next: Record<RouteStatus, RouteStatus> = { active: "congested", congested: "disrupted", disrupted: "active" };
      return { ...current, [id]: next[current[id]] };
    });
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return <div className="app-shell min-h-screen">
    <header className="site-header">
      <div className="container header-inner">
        <a href="#top" className="brand-lockup" aria-label="Về đầu trang">
          <span className="brand-mark"><Sprout size={17} strokeWidth={1.8} /></span>
          <span className="brand-copy"><strong>Food Security OS</strong><span>Resilience command center · VN</span></span>
        </a>
        <nav className="nav-links" aria-label="Điều hướng chính">
          <a href="#system">Hệ thống</a><a href="#pillars">Ba trụ cột</a><a href="#simulation">Mô phỏng</a><a href="#allocation">55 / 30 / 15</a>
        </nav>
        <div className="header-status"><span className="status-dot" /> <span>Hệ thống đang giám sát</span></div>
      </div>
    </header>

    <main id="top">
      <section className="section hero">
        <div className="container">
          <div className="hero-top">
            <div>
              <SectionKicker>HỆ THỐNG AN NINH LƯƠNG THỰC · 2026</SectionKicker>
              <h1>Không chỉ dự trữ.<br /><em>Một hệ thống biết phản ứng.</em></h1>
              <p className="hero-sub">Theo dõi <strong>→</strong> Phát hiện nguy cơ <strong>→</strong> Kích hoạt dự trữ <strong>→</strong> Điều chỉnh vận chuyển. <span style={{ color: "#7f9c92" }}>Mọi quyết định quay lại thành dữ liệu cho vòng tiếp theo.</span></p>
              <div className="hero-actions"><button className="primary-btn" onClick={() => scrollTo("simulation")}>Chạy mô phỏng <ArrowRight size={14} /></button><a className="ghost-btn" href="#pillars">Khám phá 3 trụ cột <ChevronDown size={14} /></a></div>
            </div>
            <div className="live-summary">
              <div className="panel-label"><span>Snapshot / 09:42:18</span><span className="live"><span className="status-dot" /> Live</span></div>
              <div className="summary-grid">
                <div className="summary-metric"><span className="metric-label">Sản lượng theo dõi</span><strong className="metric-value">92<small>%</small></strong><span className="metric-trend">↑ 4.2% so với tuần trước</span></div>
                <div className="summary-metric"><span className="metric-label">Mức dự trữ</span><strong className="metric-value">84<small>%</small></strong><span className="metric-trend">Đủ 11.6 tuần</span></div>
                <div className="summary-metric"><span className="metric-label">Tuyến đang mở</span><strong className="metric-value">17<small>/ 19</small></strong><span className="metric-trend">89% năng lực</span></div>
                <div className="summary-metric"><span className="metric-label">Cảnh báo</span><strong className="metric-value">01</strong><span className="metric-trend" style={{ color: "#f8bd71" }}>Cần theo dõi</span></div>
              </div>
              <div className="summary-foot"><Activity size={12} /> Các tín hiệu đang được hợp nhất từ 5 lớp dữ liệu</div>
            </div>
          </div>

          <div className="system-panel" id="system">
              <div className="system-topline"><span className="system-title">Bản đồ tích hợp / tất cả các mắt xích trong một vòng lặp</span><span><Wifi size={12} /> 99.98% tín hiệu ổn định</span></div>
            <div className="flow-stage">
              <div className="integrated-diagram" aria-label="Sơ đồ tích hợp hệ thống an ninh lương thực">
                <div className="diagram-grid-bg" />
                <svg className="diagram-connections" viewBox="0 0 1000 420" role="img" aria-label="Các luồng kết nối từ sản xuất, kho, cảnh báo, vận chuyển tới người dân">
                  <defs>
                    <linearGradient id="mintFlow" x1="0" x2="1"><stop offset="0" stopColor="#9df3c5" stopOpacity=".12" /><stop offset=".5" stopColor="#9df3c5" stopOpacity=".9" /><stop offset="1" stopColor="#78d9ee" stopOpacity=".16" /></linearGradient>
                    <linearGradient id="amberFlow" x1="0" x2="1"><stop offset="0" stopColor="#f8bd71" stopOpacity=".12" /><stop offset=".5" stopColor="#f8bd71" stopOpacity=".85" /><stop offset="1" stopColor="#9df3c5" stopOpacity=".12" /></linearGradient>
                    <filter id="diagramGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  </defs>
                  <path className="diagram-line" d="M176 104 C260 104 280 178 377 198" stroke="url(#mintFlow)" />
                  <path className="diagram-line" d="M824 104 C740 104 720 178 623 198" stroke="url(#amberFlow)" />
                  <path className="diagram-line" d="M176 316 C260 316 280 246 377 224" stroke="url(#mintFlow)" />
                  <path className="diagram-line" d="M824 316 C740 316 720 246 623 224" stroke="url(#amberFlow)" />
                  <path className="diagram-line diagram-loop" d="M500 116 C774 0 1000 130 899 333 C798 536 222 536 101 333 C0 130 226 0 500 116" stroke="url(#mintFlow)" />
                  <circle cx="500" cy="210" r="7" fill="#9df3c5" filter="url(#diagramGlow)" />
                </svg>
                <button className={`diagram-node diagram-production ${highlightedPillar === "production" ? "is-hot" : ""}`} onMouseEnter={() => setHighlightedPillar("production")} onMouseLeave={() => setHighlightedPillar(null)} onFocus={() => setHighlightedPillar("production")} onBlur={() => setHighlightedPillar(null)} onClick={() => { setExpandedPillar("production"); scrollTo("pillars"); }}><span className="diagram-node-icon"><Sprout size={20} /></span><span><b>55</b><strong> SẢN XUẤT</strong><small>nông nghiệp · dữ liệu</small></span></button>
                <button className={`diagram-node diagram-reserves ${highlightedPillar === "production" ? "is-hot" : ""}`} onMouseEnter={() => setHighlightedPillar("production")} onMouseLeave={() => setHighlightedPillar(null)} onFocus={() => setHighlightedPillar("production")} onBlur={() => setHighlightedPillar(null)} onClick={() => { setExpandedPillar("production"); scrollTo("pillars"); }}><span className="diagram-node-icon amber"><Warehouse size={20} /></span><span><b>ĐỆM AN TOÀN</b><strong> KHO CHIẾN LƯỢC</strong><small>gạo · ngô · thực phẩm khô</small></span></button>
                <button className={`diagram-node diagram-warning ${highlightedPillar === "warning" ? "is-hot" : ""}`} onMouseEnter={() => setHighlightedPillar("warning")} onMouseLeave={() => setHighlightedPillar(null)} onFocus={() => setHighlightedPillar("warning")} onBlur={() => setHighlightedPillar(null)} onClick={() => { setExpandedPillar("warning"); scrollTo("pillars"); }}><span className="diagram-node-icon amber"><Siren size={20} /></span><span><b>15</b><strong> CẢNH BÁO</strong><small>phát hiện · kích hoạt</small></span></button>
                <button className={`diagram-node diagram-transport ${highlightedPillar === "transport" ? "is-hot" : ""}`} onMouseEnter={() => setHighlightedPillar("transport")} onMouseLeave={() => setHighlightedPillar(null)} onFocus={() => setHighlightedPillar("transport")} onBlur={() => setHighlightedPillar(null)} onClick={() => { setExpandedPillar("transport"); scrollTo("pillars"); }}><span className="diagram-node-icon cyan"><Truck size={20} /></span><span><b>30</b><strong> VẬN CHUYỂN</strong><small>nhiều tuyến · tiếp cận</small></span></button>
                <button className="diagram-node diagram-access" onClick={() => scrollTo("simulation")}><span className="diagram-node-icon cyan"><Globe2 size={20} /></span><span><b>TIẾP CẬN</b><strong> NGƯỜI DÂN</strong><small>đúng nơi · đúng lúc</small></span></button>
                <div className="diagram-hub"><div className="hub-pulse"><Activity size={18} /></div><strong>FOOD SECURITY OS</strong><span>MONITOR → DETECT → ACT</span><small>phản hồi liên tục</small></div>
                <div className="diagram-signal signal-weather"><Thermometer size={11} /> thời tiết</div><div className="diagram-signal signal-crops"><Leaf size={11} /> mùa vụ</div><div className="diagram-signal signal-price"><DollarSign size={11} /> giá cả</div><div className="diagram-signal signal-reserve"><Package size={11} /> dự trữ</div><div className="diagram-signal signal-route"><Route size={11} /> tuyến đường</div>
              <span className="flow-status"><RefreshCw size={10} /> Vòng lặp liên tục <b>MONITOR AGAIN</b></span>
              </div>
            </div>
            <div className="sensor-rail">
              <div className="sensor-chip"><span className="signal" /><Thermometer size={12} /><span>Thời tiết / 24 vùng</span></div>
              <div className="sensor-chip"><span className="signal" /><Sprout size={12} /><span>Sản lượng mùa vụ</span></div>
              <div className="sensor-chip"><span className="signal" /><DollarSign size={12} /><span>Giá lương thực</span></div>
              <div className="sensor-chip"><span className="signal" /><Package size={12} /><span>Hàng tồn kho</span></div>
              <div className="sensor-chip"><span className="signal" /><Truck size={12} /><span>Trạng thái vận chuyển</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="pillars">
        <div className="container">
          <div className="section-heading"><div><div className="section-kicker">01 — 03 / KIẾN TRÚC HỆ THỐNG</div><h2>Ba trụ cột.<br />Một dòng chảy.</h2></div><p>Không có mắt xích nào hoạt động một mình. Mỗi trụ cột bù đắp cho điểm yếu của hai trụ cột còn lại.</p></div>
          <div className="pillars-grid">
            {pillars.map((pillar) => { const Icon = pillar.icon; const isOpen = expandedPillar === pillar.id; return <article key={pillar.id} className={`pillar-card ${highlightedPillar === pillar.id ? "is-highlighted" : ""}`} style={{ "--pillar-color": pillar.color } as React.CSSProperties}>
              <button className="pillar-head" onClick={() => setExpandedPillar(isOpen ? (null as unknown as PillarId) : pillar.id)} aria-expanded={isOpen}>
                <span className="pillar-index">{pillar.index}</span><span className="pillar-accent" />
                <span className="pillar-title">{pillar.label}<br /><span style={{ color: "#8ba49c", fontWeight: 500 }}>{pillar.title}</span></span>
                <span className="pillar-score">{pillar.score}<small>/ 100 điểm</small></span>
                <ChevronDown size={15} style={{ color: pillar.color, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 180ms" }} />
              </button>
              <div className="pillar-body">
                <p className="pillar-description">{pillar.description}</p><PillarVisual id={pillar.id} />
                {pillar.id === "production" && <div className="micro-stats"><div className="micro-stat"><b>5G</b><span>Kết nối</span></div><div className="micro-stat"><b>+18%</b><span>Năng suất</span></div><div className="micro-stat"><b>11.6</b><span>Tuần dự trữ</span></div></div>}
                {pillar.id === "transport" && <div className="route-status-list">{routeSeed.map((route) => { const status = routeStatuses[route.id]; return <button key={route.id} className={`route-status-row ${selectedRoute === route.id ? "selected" : ""}`} onClick={() => cycleRouteStatus(route.id)}><span className={`status-indicator ${status}`} /><span><b>{route.name}</b><br /><small>{route.detail}</small></span><small style={{ color: status === "active" ? "#9df3c5" : status === "congested" ? "#f8bd71" : "#ec7f76" }}>{status === "active" ? "ACTIVE" : status === "congested" ? "CONGESTED" : "DISRUPTED"}</small></button>; })}</div>}
                {pillar.id === "transport" && <div className="route-note"><Route size={11} /> Bấm vào tuyến để đổi trạng thái và xem mạng lưới tự phân bổ lại luồng.</div>}
                {isOpen && <div className="detail-list">{pillar.details.map((detail) => <div className="detail-item" key={detail}><Check size={12} /><span>{detail}</span></div>)}</div>}
                <div className="card-result"><CircleCheck size={13} /><span>{pillar.result}</span></div>
              </div>
            </article>; })}
          </div>
        </div>
      </section>

      <section className="section simulation-section" id="simulation">
        <div className="container">
          <div className="simulation-grid">
            <aside className="sim-sidebar"><div><SectionKicker color="amber">04 / LIVE DRILL</SectionKicker><h3>Mô phỏng khủng hoảng</h3><p>Chọn một cú sốc. Quan sát hệ thống chuyển từ nhận biết sang ổn định trong vài nhịp.</p></div>
              <div className="scenario-list">{scenarios.map((item) => { const Icon = item.icon; return <button key={item.id} className={`scenario-btn ${selectedScenario === item.id ? "active" : ""}`} onClick={() => selectScenario(item.id)}><Icon size={14} /><span>{item.label}</span>{selectedScenario === item.id && <Check size={13} style={{ marginLeft: "auto" }} />}</button>; })}</div>
              <div className="scenario-meta"><span>Mức rủi ro</span><strong>{scenario.risk}</strong></div>
            </aside>
            <div className="sim-main">
              <div className="sim-header"><div><h3>{scenario.label}: hệ thống đang phản ứng</h3><p>{scenario.description}</p></div><button className={`sim-run ${!isRunning ? "paused" : ""}`} onClick={() => { if (!isRunning && simulationStep === responseSteps.length - 1) setSimulationStep(0); setIsRunning(true); }}>{isRunning ? <><Activity size={14} /> Đang chạy</> : <><RefreshCw size={14} /> Chạy lại</>}</button></div>
              <div className="sim-metrics">
                <div className="sim-metric"><span className="metric-label">Sản lượng</span><div className="sim-metric-value">{displayMetrics.production}<span>%</span></div><div className={`sim-metric-change ${displayMetrics.production < 80 ? "negative" : ""}`}>92% ban đầu → {displayMetrics.production}%</div></div>
                <div className="sim-metric"><span className="metric-label">Mức dự trữ</span><div className="sim-metric-value">{displayMetrics.reserves}<span>%</span></div><div className={`sim-metric-change ${displayMetrics.reserves < 70 ? "negative" : ""}`}>84% ban đầu → {displayMetrics.reserves}%</div></div>
                <div className="sim-metric"><span className="metric-label">Nguy cơ thiếu hụt</span><div className="sim-metric-value" style={{ color: displayMetrics.risk === "CAO" ? "#f8bd71" : displayMetrics.risk === "ỔN ĐỊNH" ? "#9df3c5" : "#ecf8f3" }}>{displayMetrics.risk}</div><div className={`sim-metric-change ${displayMetrics.risk === "CAO" ? "high" : ""}`}>{responseSteps[simulationStep]}</div></div>
                <div className="sim-metric"><span className="metric-label">Khả năng vận chuyển</span><div className="sim-metric-value">{displayMetrics.transport}<span>%</span></div><div className={`sim-metric-change ${displayMetrics.transport < 91 ? "negative" : ""}`}>96% ban đầu → {displayMetrics.transport}%</div></div>
              </div>
              <div className="response-track"><div className="response-track-head"><span>Phản ứng theo thời gian thực</span><strong>{String(simulationStep + 1).padStart(2, "0")} / 06</strong></div><div className="steps">{responseSteps.map((step, index) => <div className={`step ${index < simulationStep ? "done" : ""} ${index === simulationStep ? "current" : ""}`} key={step}><div className="step-dot">{index < simulationStep ? <Check size={12} /> : index === simulationStep ? <Zap size={12} /> : index + 1}</div><span>{step}</span></div>)}</div></div>
              <div className="simulation-note"><CircleAlert size={13} /> Khi một tuyến bị gián đoạn, luồng hàng tự động chuyển qua tuyến thay thế; mức dự trữ giảm trong ngắn hạn rồi phục hồi khi vùng ảnh hưởng ổn định.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="allocation">
        <div className="container">
          <div className="allocation-grid">
            <div className="donut-wrap"><div className="donut-orbit" /><div className={`donut-chart ${highlightedPillar === "transport" ? "pillar-2" : highlightedPillar === "warning" ? "pillar-3" : ""}`}><div className="donut-center"><div><strong>100</strong><span>điểm hệ thống</span></div></div><button className="donut-hotspot one" onMouseEnter={() => setHighlightedPillar("production")} onFocus={() => setHighlightedPillar("production")} onMouseLeave={() => setHighlightedPillar(null)} onBlur={() => setHighlightedPillar(null)} aria-label="55 điểm sản xuất và dự trữ">55</button><button className="donut-hotspot two" onMouseEnter={() => setHighlightedPillar("transport")} onFocus={() => setHighlightedPillar("transport")} onMouseLeave={() => setHighlightedPillar(null)} onBlur={() => setHighlightedPillar(null)} aria-label="30 điểm vận chuyển">30</button><button className="donut-hotspot three" onMouseEnter={() => setHighlightedPillar("warning")} onFocus={() => setHighlightedPillar("warning")} onMouseLeave={() => setHighlightedPillar(null)} onFocusCapture={() => setHighlightedPillar("warning")} onBlur={() => setHighlightedPillar(null)} aria-label="15 điểm cảnh báo và ứng phó">15</button></div></div>
            <div className="allocation-copy"><SectionKicker color="cyan">05 / PHÂN BỔ NĂNG LỰC</SectionKicker><h3>55 / 30 / 15<br />không phải một biểu đồ.</h3><p>Đó là cách hệ thống ưu tiên sức bền trước khi sự cố xảy ra — nền cung lớn, dòng tiếp cận linh hoạt và vòng cảnh báo đủ nhanh để kích hoạt cả hai.</p><div className="allocation-list">{pillars.map((pillar) => <button key={pillar.id} className={`allocation-item ${highlightedPillar === pillar.id ? "selected" : ""}`} style={{ "--alloc-color": pillar.color } as React.CSSProperties} onMouseEnter={() => setHighlightedPillar(pillar.id)} onMouseLeave={() => setHighlightedPillar(null)} onFocus={() => setHighlightedPillar(pillar.id)} onBlur={() => setHighlightedPillar(null)} onClick={() => { setExpandedPillar(pillar.id); scrollTo("pillars"); }}><span className="alloc-swatch" /><span><span className="alloc-title">{pillar.score}% — {pillar.label}</span><span className="alloc-purpose">{pillar.result}</span></span><span className="alloc-points">{pillar.score}</span></button>)}</div></div>
          </div>
        </div>
      </section>
    </main>

    <footer className="footer"><div className="container footer-inner"><span className="footer-brand">Food Security OS · VN</span><span className="footer-note"><Crosshair size={12} /> Prototype trực quan · Dữ liệu mô phỏng · 2026</span><span>MONITOR → DETECT → ACT → MONITOR</span></div></footer>
  </div>;
}

export default Home;
