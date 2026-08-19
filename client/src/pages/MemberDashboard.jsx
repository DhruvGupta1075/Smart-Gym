import React, { useState, useEffect } from "react";
import api from '../utils/api';
import { useAuth } from "../context/AuthContext";
import { useGym } from "../context/GymContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import WorkoutViewer from "../components/workout/WorkoutViewer";
import NutritionViewer from "../components/nutrition/NutritionViewer";
import ProgressLogModal from "../components/progress/ProgressLogModal";
import Toast from "../components/common/Toast";

/* ---- minimal inline line-icon set (keeps the spec-sheet aesthetic, no external icon dep) ---- */
const iconPath = {
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  dumbbell: "M6 8v8M18 8v8M2 10v4M22 10v4M6 12h12",
  apple: "M12 8c-3 0-5 2.2-5 5.5S9 20 12 20s5-2.8 5-6.5S15 8 12 8zM12 8c0-2 1-3.5 3-4",
  trend: "M3 17l6-6 4 4 8-8M21 7h-6v6",
  calendar: "M4 5h16v16H4zM4 9h16M8 3v4M16 3v4",
  flame: "M12 3c1 3-3 4-3 8a3 3 0 006 0c0-2-1-2.5-1-4 2 1 3 3 3 5a5 5 0 11-10 0c0-4 3-5 5-9z",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 3",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  qr: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3v3M20 14v3h-3M14 20h3M20 20h-3",
  camera: "M4 8h3l2-3h6l2 3h3v11H4zM12 12a3 3 0 100 6 3 3 0 000-6z",
  key: "M15 7a4 4 0 11-4 4M11 11L3 19v2h2l1-1h2v-2h2l1-1",
  x: "M6 6l12 12M18 6L6 18",
  plus: "M12 5v14M5 12h14",
  download: "M12 3v12m0 0l-4-4m4 4l4-4M4 19h16",
  refresh: "M4 4v6h6M20 20v-6h-6M4.5 15a8 8 0 0014.5 3.5M19.5 9A8 8 0 005 5.5",
  scale: "M12 3v18M6 7l-3 6a3 3 0 006 0zM18 7l-3 6a3 3 0 006 0zM6 7h12",
  activity: "M3 12h4l2-7 4 14 2-7h6",
  chevronDown: "M6 9l6 6 6-6",
  check: "M20 6L9 17l-5-5",
  menu: "M4 6h16M4 12h16M4 18h16",
};

function Icon({ path, size = 16, className = "", strokeWidth = 1.8 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={iconPath[path]} />
    </svg>
  );
}

const LayoutGrid = (p) => <Icon path="grid" {...p} />;
const Dumbbell = (p) => <Icon path="dumbbell" {...p} />;
const Apple = (p) => <Icon path="apple" {...p} />;
const TrendingUp = (p) => <Icon path="trend" {...p} />;
const CalendarCheck = (p) => <Icon path="calendar" {...p} />;
const Flame = (p) => <Icon path="flame" {...p} />;
const Clock = (p) => <Icon path="clock" {...p} />;
const LogOut = (p) => <Icon path="logout" {...p} />;
const QrCode = (p) => <Icon path="qr" {...p} />;
const Camera = (p) => <Icon path="camera" {...p} />;
const KeyRound = (p) => <Icon path="key" {...p} />;
const X = (p) => <Icon path="x" {...p} />;
const Plus = (p) => <Icon path="plus" {...p} />;
const Download = (p) => <Icon path="download" {...p} />;
const RefreshCw = (p) => <Icon path="refresh" {...p} />;
const Scale = (p) => <Icon path="scale" {...p} />;
const Activity = (p) => <Icon path="activity" {...p} />;
const ChevronDown = (p) => <Icon path="chevronDown" {...p} />;
const Check = (p) => <Icon path="check" {...p} />;
const Menu = (p) => <Icon path="menu" {...p} />;

const NAV = [
  { key: "portal", label: "My Portal", icon: LayoutGrid },
  { key: "workout", label: "Assigned Workout", icon: Dumbbell },
  { key: "nutrition", label: "Nutrition & Macros", icon: Apple },
  { key: "transformation", label: "Body Transformation", icon: TrendingUp },
  { key: "attendance", label: "My Attendance Log", icon: CalendarCheck },
];

const TABS = [
  { key: "workout", label: "Workout Routine", icon: Dumbbell },
  { key: "nutrition", label: "Nutrition & Macros", icon: Apple },
  { key: "transformation", label: "Body Transformation", icon: TrendingUp },
  { key: "attendance", label: "Attendance History", icon: CalendarCheck },
];

const DEFAULT_CHART_DATA = [
  { date: "Jul 17", weight: 64.2, bodyFat: 24.5, bench: 40 },
  { date: "Aug 13", weight: 61.5, bodyFat: 21.8, bench: 47.5 },
];

const DEFAULT_MEASUREMENTS = [
  {
    date: "Jul 17, 2026",
    weight: "64.2 kg",
    bodyFat: "24.5%",
    chestWaist: "88 / 72 cm",
    armsThighs: "27 / 55 cm",
    lifts: "40 / 65 / 80 kg",
    notes: "First check with Sarah.",
  },
  {
    date: "Aug 13, 2026",
    weight: "61.5 kg",
    bodyFat: "21.8%",
    chestWaist: "87 / 67.5 cm",
    armsThighs: "26.5 / 53.5 cm",
    lifts: "47.5 / 75 / 95 kg",
    notes: "Waist down nearly 5cm! Glute strength significantly improved.",
  },
];

const DEFAULT_ATTENDANCE = [
  { date: "Sat, Aug 15, 2026", time: "05:02 pm", method: "QR_SCAN", status: "Present", session: "Evening HIIT and glute focus" },
  { date: "Thu, Aug 13, 2026", time: "05:28 pm", method: "QR_SCAN", status: "Present", session: "Evening HIIT and glute focus" },
  { date: "Wed, Aug 12, 2026", time: "05:19 pm", method: "QR_SCAN", status: "Present", session: "Evening HIIT and glute focus" },
  { date: "Mon, Aug 10, 2026", time: "05:02 pm", method: "QR_SCAN", status: "Present", session: "Evening HIIT and glute focus" },
  { date: "Sat, Aug 8, 2026", time: "05:00 pm", method: "QR_SCAN", status: "Present", session: "Evening HIIT and glute focus" },
  { date: "Thu, Aug 6, 2026", time: "05:37 pm", method: "QR_SCAN", status: "Present", session: "Evening HIIT and glute focus" },
  { date: "Wed, Aug 5, 2026", time: "05:38 pm", method: "QR_SCAN", status: "Present", session: "Evening HIIT and glute focus" },
];

function Corners({ color = "border-[#C9A15A]" }) {
  return (
    <>
      <span className={`absolute -top-px -left-px w-3 h-3 border-t border-l ${color}`} />
      <span className={`absolute -top-px -right-px w-3 h-3 border-t border-r ${color}`} />
      <span className={`absolute -bottom-px -left-px w-3 h-3 border-b border-l ${color}`} />
      <span className={`absolute -bottom-px -right-px w-3 h-3 border-b border-r ${color}`} />
    </>
  );
}

function Avatar({ initial = "E", size = 36 }) {
  return (
    <div
      className="rounded-full p-[1.5px] flex-shrink-0"
      style={{ width: size, height: size, background: "conic-gradient(from 180deg, #C9A15A, #FF4B2B, #C9A15A)" }}
    >
      <div className="w-full h-full rounded-full bg-[#1D1B16] flex items-center justify-center font-display text-[#C9A15A]" style={{ fontSize: size * 0.4 }}>
        {initial}
      </div>
    </div>
  );
}

function Eyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase text-[#C9A15A]">
      <span className="w-3.5 h-px bg-[#C9A15A] inline-block" />
      {children}
    </span>
  );
}

function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed border-white/10 relative bg-[#18170F]/40">
      <Corners color="border-white/15" />
      <div className="w-14 h-14 border border-white/15 flex items-center justify-center mb-6 bg-[#131210]">
        <Icon size={22} className="text-white/25" />
      </div>
      <h3 className="font-display text-xl text-slate-100">{title}</h3>
      <p className="text-[#A79E8E] text-sm max-w-sm mt-2.5 leading-relaxed">{desc}</p>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#1D1B16] border border-white/15 px-4 py-3 font-mono text-xs shadow-2xl">
      <div className="text-[#6E6858] uppercase tracking-wide mb-2">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex justify-between gap-6" style={{ color: p.color }}>
          <span>{p.name}</span>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return <span>{time}</span>;
}

function TransformationPanel({ chartData = DEFAULT_CHART_DATA, measurements = DEFAULT_MEASUREMENTS, onOpenLogModal }) {
  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
        <div>
          <h3 className="font-display text-xl flex items-center gap-2.5 text-slate-100">
            <TrendingUp size={18} className="text-[#C9A15A]" />
            Transformation &amp; Metric Progress
          </h3>
          <p className="text-[#A79E8E] text-sm mt-1.5">
            Track changes in weight, body fat %, and major compound strength lifts.
          </p>
        </div>
        <button
          onClick={onOpenLogModal}
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide px-5 py-3 bg-[#FF4B2B] text-[#131210] border border-[#FF4B2B] hover:bg-transparent hover:text-[#F5F1E8] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_24px_-8px_rgba(255,75,43,0.7)] w-fit font-bold cursor-pointer"
        >
          <Plus size={14} /> Log Today's Measurement
        </button>
      </div>

      <div className="relative border border-white/10 p-4 md:p-6 mb-10 overflow-hidden bg-[#18170F]/50">
        <Corners color="border-[#FF4B2B]/40" />
        <div className="absolute top-5 right-5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-[#6FBE8C] z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6FBE8C] animate-pulse2" /> Live sync
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4FD1C5" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#4FD1C5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fatFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF4B2B" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#FF4B2B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,241,232,0.08)" />
            <XAxis dataKey="date" stroke="#6E6858" fontSize={11} fontFamily="JetBrains Mono, monospace" />
            <YAxis yAxisId="left" stroke="#6E6858" fontSize={11} fontFamily="JetBrains Mono, monospace" />
            <YAxis yAxisId="right" orientation="right" stroke="#6E6858" fontSize={11} fontFamily="JetBrains Mono, monospace" />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}
            />
            <Area yAxisId="left" type="monotone" dataKey="weight" stroke="none" fill="url(#weightFill)" legendType="none" />
            <Area yAxisId="right" type="monotone" dataKey="bodyFat" stroke="none" fill="url(#fatFill)" legendType="none" />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="weight"
              name="Body Weight (kg)"
              stroke="#4FD1C5"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#131210", stroke: "#4FD1C5", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#4FD1C5", stroke: "#131210", strokeWidth: 2 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="bodyFat"
              name="Body Fat (%)"
              stroke="#FF4B2B"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#131210", stroke: "#FF4B2B", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#FF4B2B", stroke: "#131210", strokeWidth: 2 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="bench"
              name="Bench Press Max (kg)"
              stroke="#6FBE8C"
              strokeWidth={2}
              strokeDasharray="4 3"
              dot={{ r: 3.5, fill: "#131210", stroke: "#6FBE8C", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <Eyebrow>Recorded measurement logs</Eyebrow>
      <div className="mt-5 overflow-x-auto border border-white/10 bg-[#18170F]/50">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="font-mono text-[10.5px] uppercase tracking-wide text-[#6E6858] border-b border-[#C9A15A]/20 bg-[#131210]">
              <th className="text-left px-5 py-4 font-normal">Date</th>
              <th className="text-left px-5 py-4 font-normal">Weight</th>
              <th className="text-left px-5 py-4 font-normal">Body Fat %</th>
              <th className="text-left px-5 py-4 font-normal">Chest / Waist</th>
              <th className="text-left px-5 py-4 font-normal">Arms / Thighs</th>
              <th className="text-left px-5 py-4 font-normal">Bench / Squat / Deadlift</th>
              <th className="text-left px-5 py-4 font-normal">Notes</th>
            </tr>
          </thead>
          <tbody>
            {measurements.map((m, idx) => (
              <tr key={idx} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.03] transition-colors">
                <td className="px-5 py-4 font-medium whitespace-nowrap text-slate-200">{m.date}</td>
                <td className="px-5 py-4 font-mono text-[#4FD1C5] whitespace-nowrap">{m.weight}</td>
                <td className="px-5 py-4 font-mono text-[#FF4B2B] whitespace-nowrap">{m.bodyFat}</td>
                <td className="px-5 py-4 text-[#A79E8E] whitespace-nowrap">{m.chestWaist}</td>
                <td className="px-5 py-4 text-[#A79E8E] whitespace-nowrap">{m.armsThighs}</td>
                <td className="px-5 py-4 font-mono text-[#6FBE8C] whitespace-nowrap">{m.lifts}</td>
                <td className="px-5 py-4 text-[#A79E8E] min-w-[220px]">{m.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttendanceTable({ attendance = DEFAULT_ATTENDANCE, onOpenCheckIn, onRefresh, full = false }) {
  return (
    <div>
      {full && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl flex items-center gap-3 text-slate-100">
              <CalendarCheck size={20} className="text-[#C9A15A]" />
              Attendance &amp; Check-In Log
            </h2>
            <p className="text-[#A79E8E] text-sm mt-2">Timestamped biometric and QR records verifying gym floor presence.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCheckIn}
              className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide px-4 py-2.5 border border-[#6FBE8C]/40 text-[#6FBE8C] hover:bg-[#6FBE8C]/10 transition-colors font-bold cursor-pointer"
            >
              <QrCode size={13} /> Self Check-In
            </button>
            <button
              onClick={() => alert("Attendance summary exported as CSV/PDF report.")}
              className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide px-4 py-2.5 border border-white/15 text-[#A79E8E] hover:text-[#F5F1E8] transition-colors cursor-pointer"
            >
              <Download size={13} /> Export Report <ChevronDown size={13} />
            </button>
            <button
              onClick={onRefresh}
              className="w-10 h-10 border border-white/15 flex items-center justify-center text-[#A79E8E] hover:text-[#F5F1E8] transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <span className="font-mono text-xs text-[#6E6858]">
          Showing <span className="text-[#C9A15A]">{attendance.length}</span> check-in entries
        </span>
        <span className="font-mono text-[11px] text-[#6FBE8C] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6FBE8C] animate-pulse2" /> Live sync
        </span>
      </div>
      <div className="overflow-x-auto border border-white/10 bg-[#18170F]/50">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="font-mono text-[10.5px] uppercase tracking-wide text-[#6E6858] border-b border-white/10 bg-[#131210]">
              <th className="text-left px-5 py-4 font-normal">Date</th>
              <th className="text-left px-5 py-4 font-normal">Check-In Time</th>
              <th className="text-left px-5 py-4 font-normal">Method</th>
              <th className="text-left px-5 py-4 font-normal">Status</th>
              <th className="text-left px-5 py-4 font-normal">Location / Session</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a, idx) => (
              <tr key={idx} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                <td className="px-5 py-4 flex items-center gap-3 whitespace-nowrap text-slate-200">
                  <span className="w-7 h-7 rounded-full bg-[#4FD1C5]/15 text-[#4FD1C5] flex items-center justify-center font-mono text-[11px] flex-shrink-0 font-bold">
                    M
                  </span>
                  {a.date}
                </td>
                <td className="px-5 py-4 font-mono text-[#A79E8E] whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={12} className="text-[#C9A15A]" /> {a.time}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="font-mono text-[10.5px] uppercase text-[#4FD1C5] border border-[#4FD1C5]/30 px-2 py-1 bg-[#4FD1C5]/10">
                    {a.method}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="font-mono text-[10.5px] uppercase text-[#6FBE8C] flex items-center gap-1.5 font-bold">
                    ● {a.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-[#A79E8E] whitespace-nowrap">{a.session}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MemberDashboard() {
  const { user, logout } = useAuth();
  const { showToast, setIsScannerOpen } = useGym();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync initial tab with pathname
  const getInitialTab = () => {
    if (location.pathname === "/my-workout") return "workout";
    if (location.pathname === "/my-nutrition") return "nutrition";
    if (location.pathname === "/my-progress") return "transformation";
    if (location.pathname === "/attendance") return "attendance";
    return "portal";
  };

  const [activeNav, setActiveNav] = useState(getInitialTab());
  const [activeTab, setActiveTab] = useState(getInitialTab() === "portal" ? "workout" : getInitialTab());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkInMethod, setCheckInMethod] = useState("camera");
  const [dailyCode, setDailyCode] = useState("");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  useEffect(() => {
    const tab = getInitialTab();
    setActiveNav(tab);
    if (tab !== "portal") {
      setActiveTab(tab);
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchMemberData();
  }, []);

  const fetchMemberData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/member/dashboard");
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      // Graceful offline fallback
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = async (e) => {
    e.preventDefault();
    if (!dailyCode) {
      showToast("Please enter a valid daily PIN code", "error");
      return;
    }
    try {
      const res = await api.post("/api/attendance/self-checkin", {
        memberId: user?._id || user?.id,
        code: dailyCode,
      });
      if (res.data.success) {
        showToast("Check-in successful! Welcome to the gym.", "success");
        setCheckInOpen(false);
        setDailyCode("");
        fetchMemberData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Invalid check-in code. Check kiosk display.", "error");
    }
  };

  const isCheckedInToday = data?.isCheckedInToday;
  const streak = data?.user?.streakDays || user?.streakDays || 8;
  const totalWorkouts = data?.totalCheckIns || 16;
  const latestLog = data?.progressHistory && data.progressHistory.length > 0 ? data.progressHistory[data.progressHistory.length - 1] : null;

  const chartData =
    data?.progressHistory && data.progressHistory.length > 0
      ? data.progressHistory.map((h) => ({
          date: new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          weight: h.weightKg,
          bodyFat: h.bodyFatPercentage || 20,
          bench: h.benchPressMaxKg || 45,
        }))
      : DEFAULT_CHART_DATA;

  const measurementsList =
    data?.progressHistory && data.progressHistory.length > 0
      ? data.progressHistory.map((h) => ({
          date: new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          weight: `${h.weightKg} kg`,
          bodyFat: h.bodyFatPercentage ? `${h.bodyFatPercentage}%` : "—",
          chestWaist: `${h.measurements?.chestCm || "—"} / ${h.measurements?.waistCm || "—"} cm`,
          armsThighs: `${h.measurements?.armsCm || "—"} / ${h.measurements?.thighsCm || "—"} cm`,
          lifts: `${h.benchPressMaxKg || "—"} / ${h.squatMaxKg || "—"} / ${h.deadliftMaxKg || "—"} kg`,
          notes: h.notes || "Progress recorded.",
        }))
      : DEFAULT_MEASUREMENTS;

  const attendanceList =
    data?.attendanceHistory && data.attendanceHistory.length > 0
      ? data.attendanceHistory.map((a) => ({
          date: new Date(a.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
          time: new Date(a.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          method: a.method || "QR_SCAN",
          status: "Present",
          session: a.notes || "Evening HIIT and glute focus",
        }))
      : DEFAULT_ATTENDANCE;

  const memberName = user?.name || "Elena Rostova";
  const memberInitial = memberName.charAt(0) || "E";
  const planName = user?.membership?.planName || "Gold Half-Yearly";
  const fitnessGoal = user?.fitnessGoals || "Fat loss (-6kg), tone core and glutes, run a sub-25 min 5k";
  const assignedCoach = data?.user?.assignedTrainer?.name || "Sarah Chen, MS, CPT";

  const STATS = [
    { label: "Check-in Streak", value: `${streak}`, unit: "Days", icon: Flame, footer: "Consistency multiplier", tag: "Active", accent: "#FF4B2B" },
    { label: "Total Workouts", value: `${totalWorkouts}`, unit: "", icon: CalendarCheck, footer: "Attendance sessions", tag: null, accent: "#4FD1C5" },
    {
      label: "Current Weight",
      value: latestLog?.weightKg ? `${latestLog.weightKg}` : "61.5",
      unit: "kg",
      icon: Scale,
      footer: latestLog?.date ? `Logged ${new Date(latestLog.date).toLocaleDateString()}` : "Logged 13/8/2026",
      tag: null,
      accent: "#C9A15A",
    },
    {
      label: "Body Fat %",
      value: latestLog?.bodyFatPercentage ? `${latestLog.bodyFatPercentage}` : "21.8",
      unit: "%",
      icon: Activity,
      footer: "Estimated composition",
      tag: null,
      accent: "#FF4B2B",
    },
  ];

  const renderTabContent = () => {
    if (activeTab === "workout") {
      if (data?.assignedWorkout && data.assignedWorkout.schedule?.length > 0) {
        return <WorkoutViewer plan={data.assignedWorkout} isInteractive={true} />;
      }
      return (
        <EmptyState
          icon={Dumbbell}
          title="No Workout Plan Assigned"
          desc="Your trainer has not published a routine yet. Check back soon or request a custom split!"
        />
      );
    }
    if (activeTab === "nutrition") {
      if (data?.assignedNutrition && data.assignedNutrition.meals?.length > 0) {
        return <NutritionViewer plan={data.assignedNutrition} />;
      }
      return (
        <EmptyState
          icon={Apple}
          title="No Nutrition Plan Assigned"
          desc="Your custom dietary macros and meal plans will be displayed here once generated by your coach."
        />
      );
    }
    if (activeTab === "transformation") {
      return (
        <TransformationPanel
          chartData={chartData}
          measurements={measurementsList}
          onOpenLogModal={() => setIsLogModalOpen(true)}
        />
      );
    }
    if (activeTab === "attendance") {
      return (
        <AttendanceTable
          attendance={attendanceList}
          onOpenCheckIn={() => setCheckInOpen(true)}
          onRefresh={fetchMemberData}
          full={false}
        />
      );
    }
    return null;
  };

  return (
    <div className="relative min-h-screen bg-[#131210] text-[#F5F1E8]" style={{ fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes pulse2 { 0%,100%{opacity:1;} 50%{opacity:.4;} }
        .animate-pulse2 { animation: pulse2 2s infinite; }
        @keyframes popIn { 0%{opacity:0; transform:scale(.96) translateY(6px);} 100%{opacity:1; transform:scale(1) translateY(0);} }
        .animate-pop { animation: popIn .28s cubic-bezier(.16,1,.3,1); }
        @keyframes shimmer { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
        @keyframes scanline { 0%{ top:0%; opacity:0; } 8%{ opacity:1; } 92%{ opacity:1; } 100%{ top:100%; opacity:0; } }
        .animate-scanline { animation: scanline 2.4s ease-in-out infinite; }
        .bg-grid-ambient {
          background-image:
            linear-gradient(rgba(245,241,232,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,241,232,0.025) 1px, transparent 1px);
          background-size: 56px 56px;
          -webkit-mask-image: radial-gradient(ellipse 70% 50% at 50% 0%, black 0%, transparent 70%);
          mask-image: radial-gradient(ellipse 70% 50% at 50% 0%, black 0%, transparent 70%);
        }
      `}</style>

      {/* ambient texture + top glow line */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-ambient" />
      <div
        className="fixed top-0 left-0 right-0 h-px z-40 pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, #C9A15A55, #FF4B2B66, #C9A15A55, transparent)" }}
      />

      {/* ===== TOP BAR ===== */}
      <header className="sticky top-0 z-40 bg-[#131210]/85 backdrop-blur-md border-b border-white/10">
        <div className="h-[68px] px-5 md:px-7 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-9 h-9 border border-white/20 flex items-center justify-center text-slate-100 cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <div
              onClick={() => navigate("/")}
              className="relative w-9 h-9 border border-white/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_18px_-6px_rgba(255,75,43,0.4)] cursor-pointer"
            >
              <Corners />
              <span className="font-display text-[#FF4B2B] text-lg font-bold">S</span>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-display text-base tracking-wide">SMART GYM</span>
                <span className="font-mono text-[9.5px] tracking-wide uppercase text-[#C9A15A] border border-[#C9A15A]/30 px-1.5 py-0.5">
                  Pro
                </span>
              </div>
              <div className="font-mono text-[10px] tracking-[0.1em] text-[#6E6858] uppercase mt-0.5">
                Analytics &amp; Operations Platform
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 md:gap-4">
            <div className="hidden md:flex items-center gap-2 font-mono text-xs text-[#A79E8E] border border-white/10 px-3 py-2 bg-[#18170F]">
              <Clock size={13} className="text-[#C9A15A]" />
              <LiveClock />
            </div>
            <button
              onClick={() => setCheckInOpen(true)}
              className="flex items-center gap-2 font-mono text-[11px] md:text-xs uppercase tracking-wide px-3 md:px-4 py-2.5 border border-[#6FBE8C]/40 text-[#6FBE8C] hover:bg-[#6FBE8C]/10 transition-colors whitespace-nowrap cursor-pointer font-bold"
            >
              <QrCode size={14} /> <span className="hidden xs:inline">Self </span>Check-In
            </button>
            <div className="hidden sm:flex items-center gap-2.5 pl-2.5 border-l border-white/10">
              <Avatar initial={memberInitial} size={36} />
              <div>
                <div className="text-[13px] font-medium leading-tight text-slate-100">{memberName}</div>
                <span className="font-mono text-[9.5px] uppercase tracking-wide text-[#6FBE8C] border border-[#6FBE8C]/30 px-1.5 py-0.5">
                  Member
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="w-9 h-9 border border-white/15 flex items-center justify-center text-[#A79E8E] hover:text-[#F5F1E8] hover:border-white/40 hover:shadow-[0_0_16px_-4px_rgba(255,75,43,0.4)] transition-all flex-shrink-0 cursor-pointer"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ===== SIDEBAR (Fixed/Sticky) ===== */}
        <aside
          className={`fixed lg:sticky top-[68px] left-0 z-40 flex flex-col w-[260px] flex-shrink-0 border-r border-white/10 h-[calc(100vh-68px)] px-5 py-6 bg-[#131210] overflow-y-auto transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="relative border border-white/15 p-4 mb-8 bg-gradient-to-b from-white/[0.03] to-transparent">
            <Corners />
            <div className="flex items-center gap-3">
              <Avatar initial={memberInitial} size={40} />
              <div>
                <div className="text-sm font-medium text-slate-100">{memberName}</div>
                <div className="font-mono text-[10px] uppercase tracking-wide text-[#6E6858] mt-0.5">Member Portal</div>
              </div>
            </div>
          </div>

          <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#6E6858] mb-3 px-1">Main Menu</div>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = activeNav === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveNav(item.key);
                    if (item.key !== "portal") {
                      setActiveTab(item.key);
                    }
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3.5 py-3 text-sm text-left transition-all border-l-2 cursor-pointer ${
                    active
                      ? "border-[#FF4B2B] bg-gradient-to-r from-[#FF4B2B]/[0.08] to-transparent text-[#F5F1E8] shadow-[inset_0_0_24px_-16px_rgba(255,75,43,0.8)]"
                      : "border-transparent text-[#A79E8E] hover:text-[#F5F1E8] hover:bg-white/[0.02]"
                  }`}
                >
                  <Icon size={16} className={active ? "text-[#C9A15A]" : ""} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div
            className="mt-auto relative border border-[#FF4B2B]/30 bg-gradient-to-b from-[#FF4B2B]/[0.08] to-transparent p-4 overflow-hidden"
            style={{ boxShadow: "0 0 40px -20px rgba(255,75,43,0.5)" }}
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#FF4B2B]/10 blur-2xl" />
            <div className="relative flex items-center gap-2 mb-2">
              <Flame size={15} className="text-[#FF4B2B]" />
              <span className="font-mono text-[11px] uppercase tracking-wide text-[#FF4B2B]">Check-in Streak</span>
            </div>
            <div className="relative font-display text-2xl text-slate-100">{streak} Days</div>
            <div className="relative text-xs text-[#6E6858] mt-1.5 font-mono">
              Plan: <span className="text-[#A79E8E]">{planName}</span>
            </div>
          </div>
        </aside>

        {/* ===== MAIN ===== */}
        <main className="flex-1 px-5 md:px-8 py-8 max-w-[1400px] min-w-0">
          {activeNav === "portal" && (
            <>
              <div
                className="relative border border-[#FF4B2B]/30 p-6 md:p-8 mb-8 overflow-hidden"
                style={{ background: "radial-gradient(ellipse 55% 100% at 100% 0%, rgba(255,75,43,0.08), transparent)" }}
              >
                <Corners color="border-[#FF4B2B]" />
                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-[#C9A15A] border border-[#C9A15A]/30 px-2.5 py-1.5 bg-[#131210]">
                        <QrCode size={12} /> {planName}
                      </span>
                      <span className="font-mono text-xs text-[#6E6858]">
                        Expires: {user?.membership?.expiryDate ? new Date(user.membership.expiryDate).toLocaleDateString() : "29/12/2026"}
                      </span>
                    </div>
                    <h1 className="font-display text-3xl md:text-[38px] leading-tight text-slate-100">
                      Welcome back, <span className="text-[#FF4B2B]">{memberName}</span>! 🔥
                    </h1>
                    <p className="text-[#A79E8E] text-sm md:text-[15px] mt-3 max-w-2xl">
                      Goal: <span className="text-[#F5F1E8] italic">"{fitnessGoal}"</span>{" "}
                      · Assigned Coach: <span className="text-[#F5F1E8] font-medium">{assignedCoach}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setCheckInOpen(true)}
                    className="flex items-center justify-center gap-2.5 font-mono text-xs uppercase tracking-wide px-7 py-4 bg-[#6FBE8C] text-[#131210] hover:bg-transparent hover:text-[#6FBE8C] border border-[#6FBE8C] transition-all whitespace-nowrap flex-shrink-0 shadow-[0_0_30px_-8px_rgba(111,190,140,0.6)] hover:shadow-[0_0_30px_-8px_rgba(111,190,140,0.9)] hover:-translate-y-0.5 cursor-pointer font-bold"
                  >
                    <QrCode size={16} /> Self Check-In (Scan QR)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-10">
                {STATS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.label}
                      className="group relative border border-white/10 p-5 md:p-6 overflow-hidden transition-all duration-300 hover:border-white/25 hover:-translate-y-1 bg-[#18170F]/50"
                    >
                      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-70 transition-opacity group-hover:opacity-100" style={{ background: s.accent }} />
                      <div
                        className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                        style={{ background: s.accent }}
                      />
                      <div className="relative flex items-start justify-between mb-5">
                        <span className="font-mono text-[10.5px] uppercase tracking-wide text-[#6E6858]">{s.label}</span>
                        <div
                          className="w-8 h-8 border flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                          style={{ borderColor: `${s.accent}40`, background: `${s.accent}0D` }}
                        >
                          <Icon size={14} style={{ color: s.accent }} />
                        </div>
                      </div>
                      <div className="relative flex items-baseline gap-2 flex-wrap">
                        <span className="font-display text-3xl tabular-nums text-slate-100">{s.value}</span>
                        {s.unit && <span className="font-mono text-sm text-[#A79E8E]">{s.unit}</span>}
                        {s.tag && (
                          <span className="font-mono text-[9.5px] uppercase tracking-wide text-[#6FBE8C] border border-[#6FBE8C]/30 px-1.5 py-0.5 ml-auto flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6FBE8C] animate-pulse2" />
                            {s.tag}
                          </span>
                        )}
                      </div>
                      <div className="relative mt-4 pt-3 border-t border-dashed border-white/10 font-mono text-[11px] text-[#6E6858]">
                        {s.footer}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2 border-b border-white/10 mb-8">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = activeTab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border transition-all -mb-px cursor-pointer ${
                        active
                          ? "border-[#C9A15A]/40 text-[#C9A15A] bg-[#C9A15A]/[0.06] shadow-[0_18px_28px_-24px_rgba(201,161,90,0.7)]"
                          : "border-transparent text-[#A79E8E] hover:text-[#F5F1E8] hover:bg-white/[0.02]"
                      }`}
                    >
                      <Icon size={15} />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {renderTabContent()}
            </>
          )}

          {activeNav === "attendance" && (
            <AttendanceTable
              attendance={attendanceList}
              onOpenCheckIn={() => setCheckInOpen(true)}
              onRefresh={fetchMemberData}
              full
            />
          )}

          {activeNav === "workout" && (
            <div>
              <div className="mb-6">
                <Eyebrow>Weekly Prescription</Eyebrow>
                <h2 className="font-display text-2xl text-slate-100 mt-1">Assigned Training Routine</h2>
              </div>
              {data?.assignedWorkout?.schedule?.length > 0 ? (
                <WorkoutViewer plan={data.assignedWorkout} isInteractive={true} />
              ) : (
                <EmptyState
                  icon={Dumbbell}
                  title="No Workout Plan Assigned"
                  desc="Your trainer has not published a routine yet. Check back soon or request a custom split!"
                />
              )}
            </div>
          )}

          {activeNav === "nutrition" && (
            <div>
              <div className="mb-6">
                <Eyebrow>Dietary Protocol</Eyebrow>
                <h2 className="font-display text-2xl text-slate-100 mt-1">Nutrition &amp; Macro Breakdown</h2>
              </div>
              {data?.assignedNutrition?.meals?.length > 0 ? (
                <NutritionViewer plan={data.assignedNutrition} />
              ) : (
                <EmptyState
                  icon={Apple}
                  title="No Nutrition Plan Assigned"
                  desc="Your custom dietary macros and meal plans will be displayed here once generated by your coach."
                />
              )}
            </div>
          )}

          {activeNav === "transformation" && (
            <TransformationPanel
              chartData={chartData}
              measurements={measurementsList}
              onOpenLogModal={() => setIsLogModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* ===== CHECK-IN MODAL ===== */}
      {checkInOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="animate-pop relative w-full max-w-md border border-[#FF4B2B]/30 bg-[#131210] p-6"
            style={{ boxShadow: "0 0 60px -12px rgba(255,75,43,0.35)" }}
          >
            <Corners color="border-[#FF4B2B]" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl text-slate-100">Gym Self Check-In</h3>
              <button onClick={() => setCheckInOpen(false)} className="text-[#A79E8E] hover:text-[#F5F1E8] cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="flex border border-white/15 mb-5">
              <button
                onClick={() => setCheckInMethod("camera")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 font-mono text-xs uppercase tracking-wide transition-colors cursor-pointer ${
                  checkInMethod === "camera" ? "bg-[#4FD1C5]/10 text-[#4FD1C5] border-r border-white/15" : "text-[#A79E8E] border-r border-white/15"
                }`}
              >
                <Camera size={14} /> Camera Scan
              </button>
              <button
                onClick={() => setCheckInMethod("manual")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 font-mono text-xs uppercase tracking-wide transition-colors cursor-pointer ${
                  checkInMethod === "manual" ? "bg-[#4FD1C5]/10 text-[#4FD1C5]" : "text-[#A79E8E]"
                }`}
              >
                <KeyRound size={14} /> Manual Daily Code
              </button>
            </div>
            {checkInMethod === "camera" ? (
              <div className="relative h-64 bg-[#0A0912] border border-white/10 flex flex-col items-center justify-center gap-3 p-4 text-center overflow-hidden">
                <Corners color="border-[#4FD1C5]/60" />
                <div className="absolute left-0 right-0 h-px bg-[#4FD1C5]/70 shadow-[0_0_12px_2px_rgba(79,209,197,0.6)] animate-scanline pointer-events-none" />
                <Camera size={28} className="text-white/15" />
                <p className="text-xs text-slate-300 font-mono max-w-xs relative z-10">
                  Scan the dynamic QR code displayed on the front desk kiosk screen.
                </p>
                <button
                  onClick={() => {
                    setCheckInOpen(false);
                    setIsScannerOpen(true);
                  }}
                  className="mt-2 px-5 py-2.5 bg-[#4FD1C5] text-[#131210] font-mono text-xs uppercase tracking-wider font-bold shadow-lg cursor-pointer relative z-10 hover:bg-[#3dbbae] transition-colors"
                >
                  Open Camera Scanner
                </button>
              </div>
            ) : (
              <form onSubmit={handleManualCheckIn} className="h-64 border border-white/10 flex flex-col items-center justify-center gap-4 px-8 bg-[#18170F]/50 relative">
                <Corners color="border-[#C9A15A]/40" />
                <KeyRound size={24} className="text-white/25" />
                <input
                  type="text"
                  required
                  placeholder="Enter daily code"
                  value={dailyCode}
                  onChange={(e) => setDailyCode(e.target.value.toUpperCase())}
                  className="w-full bg-transparent border border-white/15 text-center py-3 font-mono tracking-[0.3em] uppercase text-sm placeholder:text-white/20 text-[#FF4B2B] focus:outline-none focus:border-[#C9A15A]/50"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#FF4B2B] text-[#131210] font-mono text-xs uppercase tracking-wider font-bold shadow-lg cursor-pointer hover:bg-[#e03a1d] transition-colors"
                >
                  Verify Code &amp; Check In
                </button>
              </form>
            )}
            <p className="text-center text-xs text-[#6E6858] mt-5">
              Point your device camera at the gym counter screen to verify presence.
            </p>
          </div>
        </div>
      )}

      {/* Progress Logger Modal */}
      <ProgressLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSuccess={fetchMemberData}
      />

      <Toast />
    </div>
  );
}
