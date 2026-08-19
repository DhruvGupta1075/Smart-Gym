import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGym } from "../context/GymContext";
import {
  Dumbbell,
  Sparkles,
  QrCode,
  ShieldCheck,
  Calculator,
  Utensils,
  ArrowRight,
  Flame,
  Award,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  X,
  MapPin,
  Clock,
  Phone,
  Mail,
  UserCheck,
  Camera,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Zap,
  TrendingUp
} from "lucide-react";
import Modal from "../components/common/Modal";
import Toast from "../components/common/Toast";
import Logo from "../components/common/Logo";

// --- DATA STRUCTURES (PAN-INDIA) ---
const CITIES = {
  mumbai: {
    label: "Mumbai",
    num: "01",
    title: "Smart Gym Pro — Bandra West",
    addr: "Level 3 & 4, Crystal Point, Hill Road, Bandra West, Mumbai, MH 400050",
    occ: "Moderate · 44% capacity",
    occStatus: "optimal",
    size: "16,500 sq. ft — Multi-level facility",
    phone: "+91 98200 54321",
    amenities: [
      { name: "Eleiko IPF Powerlifting Bay", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80" },
      { name: "Infrared Sauna & Cryotherapy", img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80" },
      { name: "Rooftop HIIT Turf", img: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=800&q=80" },
      { name: "Executive Locker & Steam Suites", img: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80" },
    ],
    mainImage: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=85",
  },
  bengaluru: {
    label: "Bengaluru",
    num: "02",
    title: "Smart Gym Pro — Indiranagar",
    addr: "100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, KA 560038",
    occ: "Low · 21% capacity",
    occStatus: "low",
    size: "18,000 sq. ft — High-Performance Bay",
    phone: "+91 80 4000 8899",
    amenities: [
      { name: "Biometric Dexa Body Scans", img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80" },
      { name: "Olympic Platforms (IWF Spec)", img: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80" },
      { name: "Sled & Sprint Turf Track", img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80" },
      { name: "Cold Plunge Recovery Pods", img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80" },
    ],
    mainImage: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=85",
  },
  delhi: {
    label: "Delhi NCR",
    num: "03",
    title: "Smart Gym Pro — Gurugram Flagship",
    addr: "Tower B, Horizon Center, Golf Course Road, DLF Phase 5, Gurugram, HR 122002",
    occ: "High · 68% capacity",
    occStatus: "peak",
    size: "22,000 sq. ft — Luxury Mega-Arena",
    phone: "+91 124 455 7700",
    amenities: [
      { name: "Hammer Strength Official Bay", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80" },
      { name: "Recovery Juice & Protein Bar", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80" },
      { name: "Private 1-on-1 VIP Studios", img: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=800&q=80" },
      { name: "Finnish Sauna Suites", img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80" },
    ],
    mainImage: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=85",
  },
  hyderabad: {
    label: "Hyderabad",
    num: "04",
    title: "Smart Gym Pro — Jubilee Hills",
    addr: "Plot 482, Road No. 36, Jubilee Hills, Hyderabad, TG 500033",
    occ: "Moderate · 39% capacity",
    occStatus: "optimal",
    size: "15,000 sq. ft — High-Performance Center",
    phone: "+91 40 2355 9900",
    amenities: [
      { name: "Assault Fitness Cardio Arena", img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80" },
      { name: "Functional Movement Rig", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80" },
      { name: "Executive Steam Showers", img: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80" },
      { name: "Protein Fuel Cafe", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80" },
    ],
    mainImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85",
  },
  pune: {
    label: "Pune",
    num: "05",
    title: "Smart Gym Pro — Koregaon Park",
    addr: "Lane 7, North Main Road, Koregaon Park, Pune, MH 411001",
    occ: "Low · 18% capacity",
    occStatus: "low",
    size: "14,000 sq. ft — Power & Conditioning Bay",
    phone: "+91 20 6600 4400",
    amenities: [
      { name: "Calibrated Deadlift Platforms", img: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=800&q=80" },
      { name: "Physiotherapy & Dry Needling", img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80" },
      { name: "24/7 Smart QR Access", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80" },
      { name: "Ice Bath Recovery Zone", img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80" },
    ],
    mainImage: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=1200&q=85",
  },
};

const PROGRAMS = [
  {
    code: "STR / 01",
    title: "Strength & Power Lab",
    desc: "Eleiko-standard powerlifting bays with progressive overload tracking, 1RM testing, and coach-reviewed lift mechanics every session.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    tag: "All Levels",
    duration: "60 Mins • 5 Days / Wk",
    coach: "Coach Vikram Rathore, CSCS",
  },
  {
    code: "NUT / 02",
    title: "Indian Macro Recomp",
    desc: "Veg and non-veg macro fueling plans built around paneer, soya, dal, chicken and whey — daily logging with weekly coach overhaul.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
    tag: "All Levels",
    duration: "Daily Macro Tracking",
    coach: "Coach Ananya Sharma, MS",
  },
  {
    code: "REC / 03",
    title: "Mobility & Cryo Recovery",
    desc: "Joint decompression, dynamic fascial mobility work, and Finnish infrared sauna suites for rapid central nervous system recovery.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    tag: "3x / Week",
    duration: "35 Mins • 3 Days / Wk",
    coach: "Coach Priya Patel",
  },
  {
    code: "VIP / 04",
    title: "1-on-1 Personal Coaching",
    desc: "A dedicated trainer, custom-built routine, biometric Dexa tracking, and daily WhatsApp accountability check-ins.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80",
    tag: "Custom",
    duration: "Private Studio Booking",
    coach: "Master Coaching Staff",
  },
  {
    code: "HIIT / 05",
    title: "Conditioning & Rooftop HIIT",
    desc: "High-output interval circuits on our rooftop turf — assault bikes, sled pushes, and battle ropes built for real engine capacity.",
    image: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=800&q=80",
    tag: "All Levels",
    duration: "45 Mins • 4 Days / Wk",
    coach: "Coach Rohan Deshmukh",
  },
  {
    code: "WHT / 06",
    title: "White Glove Private Studio",
    desc: "Private studio training with concierge scheduling for members who want elite performance work away from the main floor.",
    image: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=800&q=80",
    tag: "Members",
    duration: "VIP Studio Access",
    coach: "Executive Trainers",
  },
];

const COACHES = [
  {
    initials: "VR",
    name: "Vikram Rathore, CSCS",
    role: "Head of Strength & Powerlifting",
    city: "Mumbai · Bandra West Flagship",
    image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80",
    credentials: "CSCS • USAW Olympic Coach • 8+ Yrs",
    spec: "Squat/Bench/Deadlift 1RM Periodization & Progressive Overload",
    bio: "National powerlifting record holder and master strength coach who has guided 600+ athletes across Mumbai & Bengaluru.",
  },
  {
    initials: "AS",
    name: "Ananya Sharma, MS",
    role: "Head of Indian Performance Nutrition",
    city: "Delhi NCR · Gurugram Arena",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    credentials: "MS Sports Dietetics • NASM Master Trainer",
    spec: "Vegetarian & Non-Veg Macro Recomp & Metabolic Fueling",
    bio: "Clinical nutritionist specializing in high-protein Indian adaptations (Paneer, Sattu, Soya) and sustainable fat loss.",
  },
  {
    initials: "RD",
    name: "Rohan Deshmukh",
    role: "Master Conditioning & Turf Coach",
    city: "Bengaluru · Indiranagar Arena",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    credentials: "CrossFit L2 • Functional Strength Specialist",
    spec: "Metabolic Thresholds, Air Bikes, Sleds & Agility",
    bio: "Former national athlete leading high-output athletic conditioning camps with biometric heart-rate telemetry.",
  },
  {
    initials: "PP",
    name: "Priya Patel",
    role: "Director of Mobility & Recovery",
    city: "Hyderabad · Jubilee Hills Club",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    credentials: "FMS Certified • Dry Needling & Sauna Specialist",
    spec: "Joint Decompression, Dynamic Fascia & Nervous System Reset",
    bio: "Pioneered our post-workout thermal recovery protocols combining Finnish sauna and cold plunge therapy.",
  },
];

const TRANSFORMATIONS = [
  {
    name: "Rahul Verma",
    location: "Bengaluru · Indiranagar Arena",
    profession: "Senior Software Architect",
    duration: "16 Weeks Protocol",
    stats: {
      weight: "92 kg ➔ 76 kg (-16 kg)",
      bodyFat: "26.4% ➔ 13.8%",
      lift: "Deadlift 100kg ➔ 190kg",
      streak: "84 Days Active Streak",
    },
    quote:
      "Working long coding shifts had wrecked my posture and stamina. Coach Vikram designed a 4-day Upper/Lower split and high-protein Indian macro plan. The QR check-in and streak tracking kept me accountable every single evening after work.",
    coach: "Coach Vikram Rathore, CSCS",
    beforeImage: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80",
    afterImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Priya Patel",
    location: "Mumbai · Bandra West Club",
    profession: "Strategy Consultant",
    duration: "12 Weeks Metabolic Shred",
    stats: {
      weight: "68 kg ➔ 57.5 kg (-10.5 kg)",
      bodyFat: "29.2% ➔ 18.5%",
      lift: "Squat 45kg ➔ 95kg",
      streak: "62 Days Active Streak",
    },
    quote:
      "I thought eating vegetarian meant I couldn’t get enough protein without massive calories. Coach Ananya calibrated my paneer, whey, and sattu macros. My energy levels during client presentations have doubled and my waist dropped 6cm!",
    coach: "Coach Ananya Sharma, MS",
    beforeImage: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    afterImage: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Arjun Kapoor",
    location: "Delhi NCR · Gurugram Flagship",
    profession: "Investment Banker",
    duration: "20 Weeks Hypertrophy & Bulk",
    stats: {
      weight: "71 kg ➔ 81.5 kg (+10.5 kg Lean Mass)",
      bodyFat: "14.0% ➔ 12.5%",
      lift: "Bench Press 70kg ➔ 135kg",
      streak: "95 Days Active Streak",
    },
    quote:
      "The equipment here is world-class. Calibrated Eleiko plates, luxury recovery saunas, and real coaches who review your volume graphs every Sunday on the dashboard.",
    coach: "Coach Rohan Deshmukh",
    beforeImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    afterImage: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80",
  },
];

const FAQS = [
  {
    q: "How does the Contactless QR Check-In system work?",
    a: "Every member receives a dynamic cryptographic QR pass in their mobile portal. When entering any of our 12 centers in Mumbai, Bengaluru, Delhi NCR, Hyderabad, or Pune, simply scan your phone at the gate kiosk for instant entry in under 2 seconds.",
  },
  {
    q: "Can I use my membership across all 12 centers in India?",
    a: "Yes! Our Multi-City Performance and White Glove tiers grant full access across all 12 flagship centers with zero guest fees or paperwork.",
  },
  {
    q: "Are customized Indian diet plans included for vegetarians?",
    a: "Absolutely. Our clinical nutritionist Coach Ananya Sharma specializes in high-protein vegetarian and vegan meal formulations using low-fat Paneer, Sattu, Soya chunks, and Whey Isolate mapped to your exact calorie target.",
  },
  {
    q: "Is there any lock-in contract or hidden joining fee?",
    a: "No. We believe in 100% pricing transparency. All listed rates include 18% GST with zero admission fees. You can pause or cancel your subscription directly from your member portal.",
  },
];

// --- EDITORIAL HELPER COMPONENTS ---
function Corners({ color = "border-gym-gold" }) {
  return (
    <>
      <span className={`absolute -top-px -left-px w-3 h-3 border-t border-l ${color}`} />
      <span className={`absolute -top-px -right-px w-3 h-3 border-t border-r ${color}`} />
      <span className={`absolute -bottom-px -left-px w-3 h-3 border-b border-l ${color}`} />
      <span className={`absolute -bottom-px -right-px w-3 h-3 border-b border-r ${color}`} />
    </>
  );
}

function Eyebrow({ children, center = false }) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-sans font-medium tracking-widest uppercase text-[11px] tracking-[0.16em] uppercase text-gym-gold ${center ? "justify-center w-full" : ""
        }`}
    >
      <span className="w-3.5 h-px bg-gym-gold inline-block" />
      {children}
    </span>
  );
}

function RevealCard({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    const fallback = setTimeout(() => setVisible(true), 2500);
    return () => {
      obs.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-[0.98]"
        } ${className}`}
    >
      {children}
    </div>
  );
}

// --- MAIN LANDING COMPONENT ---
export default function LandingPage() {
  const { user } = useAuth();
  const { showToast } = useGym();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCity, setActiveCity] = useState("mumbai");
  const [selectedAmenityIdx, setSelectedAmenityIdx] = useState(0);
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [passSubmitted, setPassSubmitted] = useState(false);
  const [transformationIdx, setTransformationIdx] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const [openFaq, setOpenFaq] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Ensure page always starts at top on every refresh / mount
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Monitor window scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 350);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Smooth scroll handler with offset for floating navbar
  const scrollToSection = (e, href) => {
    if (!href || !href.startsWith("#")) return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const headerOffset = 90;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      if (menuOpen) setMenuOpen(false);
    }
  };

  // Free pass form state
  const [passForm, setPassForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "Mumbai — Bandra West",
    interest: "Strength & Power Lab (STR / 01)",
    timeSlot: "Morning (06:00 AM - 10:00 AM)",
  });

  // Interactive BMR & Macro Calculator State
  const [calcGender, setCalcGender] = useState("male");
  const [calcAge, setCalcAge] = useState(26);
  const [calcWeight, setCalcWeight] = useState(74);
  const [calcHeight, setCalcHeight] = useState(175);
  const [calcActivity, setCalcActivity] = useState(1.55);
  const [calcGoal, setCalcGoal] = useState("hypertrophy");
  const [calcDiet, setCalcDiet] = useState("veg");

  const bmr =
    calcGender === "male"
      ? 10 * calcWeight + 6.25 * calcHeight - 5 * calcAge + 5
      : 10 * calcWeight + 6.25 * calcHeight - 5 * calcAge - 161;
  const tdee = Math.round(bmr * calcActivity);
  let targetCalories = tdee;
  if (calcGoal === "fatloss") targetCalories = Math.round(tdee - 450);
  if (calcGoal === "hypertrophy") targetCalories = Math.round(tdee + 350);

  const targetProtein = Math.round(calcWeight * (calcGoal === "hypertrophy" ? 2.2 : 2.0));
  const proteinCals = targetProtein * 4;
  const fatCals = Math.round(targetCalories * 0.25);
  const targetFats = Math.round(fatCals / 9);
  const carbCals = targetCalories - proteinCals - fatCals;
  const targetCarbs = Math.max(0, Math.round(carbCals / 4));

  const heightM = calcHeight / 100;
  const bmi = (calcWeight / (heightM * heightM)).toFixed(1);

  const city = CITIES[activeCity];
  const activeTransformation = TRANSFORMATIONS[transformationIdx];

  const handlePassSubmit = (e) => {
    e.preventDefault();
    setPassSubmitted(true);
    showToast("VIP Guest Pass Reserved! QR entry token sent via WhatsApp & Email.", "success");
  };

  const handlePassReset = () => {
    setPassSubmitted(false);
    setPassModalOpen(false);
  };

  return (
    <div
      className="min-h-screen bg-gym-darker text-[#FFFFFF] antialiased selection:bg-gym-red/30 selection:text-gym-red"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        .font-display tracking-tight { font-family: 'Fraunces', serif; }
        .font-sans font-medium tracking-widest uppercase { font-family: 'JetBrains Mono', monospace; }
        .bg-grid {
          background-image:
            linear-gradient(rgba(245,241,232,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,241,232,0.025) 1px, transparent 1px);
          background-size: 64px 64px;
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 70%);
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 70%);
        }
        @keyframes pulse2 { 0%,100%{opacity:1;} 50%{opacity:.4;} }
        .animate-pulse2 { animation: pulse2 2s infinite; }
      `}</style>

      {/* Ambient Grid Backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid" />

      {/* ================= ULTRA-PREMIUM FLOATING NAVBAR ================= */}
      <header className="sticky top-0 z-50 transition-all duration-300">
        <div className="w-full max-w-[1380px] mx-auto px-3 sm:px-6 pt-3 pb-2">
          <nav className="h-[66px] sm:h-[72px] px-3.5 sm:px-6 rounded-2xl bg-gym-darker/92 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.7)] flex items-center justify-between gap-2 sm:gap-4 relative">
            {/* Subtle top ambient red gradient accent line */}
            <div className="absolute top-0 left-1/6 right-1/6 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF2A2A]/70 to-transparent pointer-events-none" />

            {/* Brand Logo */}
            <Logo to="/" showSubtitle={true} />

            {/* Desktop Navigation Links */}
            <div className="hidden xl:flex items-center gap-5 2xl:gap-6 shrink min-w-0">
              {[
                { name: "Programs", href: "#programs" },
                { name: "Coaches", href: "#coaches" },
                { name: "Macro Lab", href: "#calculator" },
                { name: "Transformations", href: "#transformations" },
                { name: "Centres", href: "#locations" },
                { name: "Membership", href: "#membership" },
                { name: "FAQs", href: "#faqs" },
              ].map((l) => (
                <a
                  key={l.name}
                  href={l.href}
                  onClick={(e) => scrollToSection(e, l.href)}
                  className="text-[12.5px] 2xl:text-[13.5px] text-gym-muted hover:text-[#FFFFFF] transition-colors font-medium tracking-wide relative py-1 px-1 group whitespace-nowrap"
                >
                  <span>{l.name}</span>
                  <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-gym-red scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center" />
                </a>
              ))}
            </div>

            {/* CTA Actions */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {user ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-1.5 text-[11px] sm:text-xs font-sans font-medium tracking-widest uppercase text-gym-gold hover:text-slate-100 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/[0.03] border border-gym-gold/40 transition-all hover:bg-gym-gold/15 whitespace-nowrap shrink-0"
                >
                  <UserCheck className="w-3.5 h-3.5 text-gym-red shrink-0" />
                  <span className="hidden sm:inline">{user.role.toUpperCase()} PORTAL</span>
                  <span className="sm:hidden">PORTAL</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="hidden sm:inline-flex items-center text-xs font-sans font-medium tracking-widest uppercase text-gym-muted hover:text-slate-100 px-2.5 py-1.5 rounded-xl transition-colors uppercase tracking-wider whitespace-nowrap border border-transparent hover:border-white/10"
                >
                  Sign In
                </button>
              )}

              <button
                onClick={() => setPassModalOpen(true)}
                className="font-sans font-medium tracking-widest uppercase text-[10px] sm:text-[11.5px] tracking-wider px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#FF2A2A] via-[#FF4D4D] to-gym-amber text-[#000000] hover:brightness-110 active:scale-95 transition-all whitespace-nowrap font-bold shadow-md shadow-gym-red/25 flex items-center gap-1 sm:gap-1.5 shrink-0"
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="hidden sm:inline">Book Assessment</span>
                <span className="sm:hidden">Book Now</span>
              </button>

              <button
                aria-label="Menu"
                onClick={() => setMenuOpen((v) => !v)}
                className="xl:hidden p-1.5 sm:p-2 rounded-xl border border-white/20 flex items-center justify-center text-slate-300 hover:text-slate-100 bg-white/[0.02] shrink-0"
              >
                {menuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <span className="text-base">☰</span>}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Navigation Menu */}
        {menuOpen && (
          <div className="xl:hidden w-full max-w-[1380px] mx-auto px-3 sm:px-6 mt-2">
            <div className="flex flex-col items-center gap-3.5 py-6 px-4 rounded-2xl border border-white/10 bg-gym-darker/98 backdrop-blur-2xl shadow-2xl animate-slide-up">
              {[
                { name: "Programs", href: "#programs" },
                { name: "Coaches", href: "#coaches" },
                { name: "Macro Lab", href: "#calculator" },
                { name: "Transformations", href: "#transformations" },
                { name: "Centres", href: "#locations" },
                { name: "Membership", href: "#membership" },
                { name: "FAQs", href: "#faqs" },
              ].map((l) => (
                <a
                  key={l.name}
                  href={l.href}
                  onClick={(e) => scrollToSection(e, l.href)}
                  className="text-sm text-gym-muted hover:text-[#FFFFFF] font-medium py-1"
                >
                  {l.name}
                </a>
              ))}
              <div className="pt-3 border-t border-white/10 w-full flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(user ? "/dashboard" : "/login");
                  }}
                  className="w-full py-2.5 rounded-xl border border-white/15 text-xs text-gym-gold font-sans font-medium tracking-widest uppercase uppercase font-semibold"
                >
                  {user ? "Open Dashboard" : "Member Portal Sign In"}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10">
        {/* ================= HERO WITH CINEMATIC PHOTOGRAPHY ================= */}
        <section className="relative pt-16 md:pt-24 pb-16 overflow-hidden">
          {/* Full-bleed background photography */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=85"
              alt="Athletes training under moody gym lighting"
              className="w-full h-full object-cover object-center filter brightness-[0.25] contrast-[1.2]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/80 to-[#000000]/50" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_20%_30%,rgba(225,29,72,0.14),transparent)]" />
          </div>

          <div className="max-w-6xl mx-auto px-5 md:px-8 relative z-10">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-end pb-16 border-b border-white/10">
              <div className="animate-fade-in-up">
                <Eyebrow>Elite Athletic Performance — 5 Cities, India</Eyebrow>
                <h1 className="font-display tracking-tight font-medium text-[42px] leading-[1.03] md:text-6xl lg:text-7xl mt-6 text-slate-100">
                  Trained by data.
                  <br />
                  Built like <em className="italic text-gym-gold font-normal">India's best.</em>
                </h1>
                <p className="max-w-md text-gym-muted text-[16px] leading-relaxed mt-6">
                  A performance system for people who treat their body like their best-run asset —
                  biometric tracking, coach-authored programming, and Indian macro nutrition across
                  our flagship centres in Mumbai, Bengaluru, Delhi NCR, Hyderabad and Pune.
                </p>
                <div className="flex flex-wrap gap-4 mt-9">
                  <button
                    onClick={() => setPassModalOpen(true)}
                    className="font-sans font-medium tracking-widest uppercase text-xs tracking-wide uppercase px-6 py-3.5 bg-gym-red text-[#000000] border border-gym-red hover:bg-transparent hover:text-[#FFFFFF] transition-colors font-bold shadow-xl shadow-gym-red/20"
                  >
                    Book a Free Assessment
                  </button>
                  <a
                    href="#programs"
                    onClick={(e) => scrollToSection(e, "#programs")}
                    className="font-sans font-medium tracking-widest uppercase text-xs tracking-wide uppercase px-6 py-3.5 border border-white/20 hover:border-white/60 transition-colors"
                  >
                    View Programs ↓
                  </a>
                </div>
              </div>

              {/* Live Telemetry Panel */}
              <div className="relative border border-white/20 bg-gym-card/90 backdrop-blur-md p-6 sm:p-7 shadow-2xl animate-fade-in-up" style={{ animationDelay: "150ms" }}>

                <div className="flex items-center gap-2 font-sans font-medium tracking-widest uppercase text-[11px] tracking-wider uppercase text-gym-emerald mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gym-emerald animate-pulse2" />
                  Live network telemetry
                </div>
                {[
                  ["Athletes tracked", "25,412", "PAN-INDIA"],
                  ["Flagship centres", "12", "5 CITIES"],
                  ["Goal transformation rate", "98.6", "%"],
                  ["QR floor access speed", "<2.0", "SEC"],
                  ["Coaching coverage", "24", "/ 7"],
                ].map(([label, val, unit], i, arr) => (
                  <div
                    key={label}
                    className={`flex justify-between items-baseline py-3.5 font-sans font-medium tracking-widest uppercase ${i !== arr.length - 1 ? "border-b border-dashed border-white/10" : ""
                      }`}
                  >
                    <span className="text-[11.5px] text-gym-subtle tracking-wide uppercase">{label}</span>
                    <span className="text-lg font-semibold text-slate-100">
                      {val} <span className="text-gym-gold text-xs font-normal ml-1">{unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick 4 Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-white/10">
              {[
                ["25K+", "Indian athletes trained"],
                ["12 hubs", "Multi-level luxury facilities"],
                ["98.6%", "Tracked by biometric analytics"],
                ["02 sec", "Biometric QR floor access"],
              ].map(([num, label]) => (
                <div key={label} className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/10 last:border-r-0">
                  <div className="font-display tracking-tight text-3xl md:text-4xl text-slate-100">{num}</div>
                  <div className="font-sans font-medium tracking-widest uppercase text-[11px] tracking-wide uppercase text-gym-subtle mt-2.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= PROGRAMS WITH REAL PHOTOGRAPHY ================= */}
        <section id="programs" className="py-20 md:py-28 border-b border-white/10">
          <div className="max-w-6xl mx-auto px-5 md:px-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-8 mb-14">
              <div>
                <Eyebrow>Structured Periodization</Eyebrow>
                <h2 className="font-display tracking-tight text-3xl md:text-5xl leading-tight max-w-xl mt-3">
                  Programs engineered for <em className="italic text-gym-gold font-normal">visible</em> results.
                </h2>
              </div>
              <p className="max-w-xs text-gym-muted text-sm leading-relaxed">
                Every plan is authored by a certified coach and tracked against your biometric baseline.
              </p>
            </div>

            <div className="grid md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROGRAMS.map((p, idx) => (
                <RevealCard
                  key={p.code}
                  delay={idx * 110}
                  className="bg-gym-card/60 backdrop-blur-md border border-white/5 hover:border-gym-red/30 rounded-2xl transition-all duration-500 flex flex-col justify-between overflow-hidden group hover:-translate-y-2 hover:shadow-[0_8px_40px_-12px_rgba(255,42,42,0.3)]"
                >
                  {/* Real Program Photograph with moody overlay */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                    <span className="absolute top-3.5 left-3.5 font-sans font-medium tracking-widest uppercase text-[11px] text-gym-red bg-gym-darker/90 px-2.5 py-1 border border-white/10 font-bold">
                      {p.code}
                    </span>
                    <span className="absolute top-3.5 right-3.5 font-sans font-medium tracking-widest uppercase text-[10px] text-gym-gold bg-gym-darker/90 px-2 py-0.5 border border-gym-gold/30 uppercase">
                      {p.tag}
                    </span>
                  </div>

                  <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display tracking-tight text-xl text-slate-100 group-hover:text-gym-red transition-colors">{p.title}</h3>
                      <p className="text-gym-muted text-xs leading-relaxed mt-2">{p.desc}</p>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between font-sans font-medium tracking-widest uppercase text-[11px]">
                      <span className="text-gym-subtle text-[10.5px] truncate max-w-[150px]">{p.coach}</span>
                      <button
                        onClick={() => {
                          setPassForm({ ...passForm, interest: p.title });
                          setPassModalOpen(true);
                        }}
                        className="text-gym-gold hover:text-slate-100 transition-colors font-bold"
                      >
                        Try a class →
                      </button>
                    </div>
                  </div>
                </RevealCard>
              ))}
            </div>
          </div>
        </section>

        {/* ================= INTERACTIVE BMR & MACRO LAB ================= */}
        <section id="calculator" className="py-20 md:py-28 border-b border-white/10 relative">
          <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#C9A15A_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/80 to-transparent pointer-events-none" />
          <div className="max-w-6xl mx-auto px-5 md:px-8 space-y-12">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
              <div>
                <Eyebrow>Interactive Body Intelligence</Eyebrow>
                <h2 className="font-display tracking-tight text-3xl md:text-5xl leading-tight max-w-xl mt-3">
                  Indian Physique &amp; <em className="italic text-gym-gold font-normal">Macro Lab.</em>
                </h2>
              </div>
              <p className="max-w-xs text-gym-muted text-sm leading-relaxed">
                Calculate your exact BMR, daily caloric expenditure, and custom protein targets mapped to real Indian meals.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Inputs */}
              <div className="lg:col-span-6 p-7 border border-white/5 bg-gym-card/40 backdrop-blur-lg rounded-3xl shadow-xl relative space-y-5">

                <div className="flex items-center gap-2 text-xs font-sans font-medium tracking-widest uppercase uppercase tracking-wide text-gym-gold">
                  <Calculator className="w-4 h-4 text-gym-red" />
                  <span>Enter Physical Baseline</span>
                </div>

                {/* Gender Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setCalcGender("male")}
                    className={`py-2.5 text-xs font-sans font-medium tracking-widest uppercase uppercase tracking-wide border transition-all ${calcGender === "male"
                        ? "bg-gym-red text-[#000000] border-gym-red font-bold"
                        : "border-white/15 text-gym-muted hover:text-slate-100"
                      }`}
                  >
                    Male Athlete
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcGender("female")}
                    className={`py-2.5 text-xs font-sans font-medium tracking-widest uppercase uppercase tracking-wide border transition-all ${calcGender === "female"
                        ? "bg-gym-red text-[#000000] border-gym-red font-bold"
                        : "border-white/15 text-gym-muted hover:text-slate-100"
                      }`}
                  >
                    Female Athlete
                  </button>
                </div>

                {/* Sliders & Numeric Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-sans font-medium tracking-widest uppercase uppercase text-gym-subtle">Age (Yrs)</label>
                    <input
                      type="number"
                      value={calcAge}
                      onChange={(e) => setCalcAge(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gym-cardLight border border-white/15 text-xs font-sans font-medium tracking-widest uppercase text-center text-slate-100 focus:outline-none focus:border-gym-red"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-sans font-medium tracking-widest uppercase uppercase text-gym-subtle">Weight (kg)</label>
                    <input
                      type="number"
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gym-cardLight border border-white/15 text-xs font-sans font-medium tracking-widest uppercase text-center text-gym-red font-bold focus:outline-none focus:border-gym-red"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-sans font-medium tracking-widest uppercase uppercase text-gym-subtle">Height (cm)</label>
                    <input
                      type="number"
                      value={calcHeight}
                      onChange={(e) => setCalcHeight(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gym-cardLight border border-white/15 text-xs font-sans font-medium tracking-widest uppercase text-center text-slate-100 focus:outline-none focus:border-gym-red"
                    />
                  </div>
                </div>

                {/* Target Protocol */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-sans font-medium tracking-widest uppercase uppercase text-gym-subtle">Target Protocol</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {[
                      { id: "fatloss", label: "Fat Shred" },
                      { id: "hypertrophy", label: "Hypertrophy" },
                      { id: "maintenance", label: "Maintenance" },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setCalcGoal(g.id)}
                        className={`py-2 text-[11px] font-sans font-medium tracking-widest uppercase uppercase border transition-all ${calcGoal === g.id
                            ? "bg-gym-gold/15 border-gym-gold text-gym-gold font-bold"
                            : "border-white/10 text-gym-subtle hover:text-slate-100"
                          }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diet Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-sans font-medium tracking-widest uppercase uppercase text-gym-subtle">Indian Diet Preference</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCalcDiet("veg")}
                      className={`py-2 text-xs font-sans font-medium tracking-widest uppercase border transition-all ${calcDiet === "veg"
                          ? "border-gym-emerald text-gym-emerald bg-gym-emerald/10"
                          : "border-white/10 text-gym-subtle"
                        }`}
                    >
                      🌱 Pure Vegetarian / Vegan
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcDiet("non-veg")}
                      className={`py-2 text-xs font-sans font-medium tracking-widest uppercase border transition-all ${calcDiet === "non-veg"
                          ? "border-gym-red text-gym-red bg-gym-red/10"
                          : "border-white/10 text-gym-subtle"
                        }`}
                    >
                      🍗 Non-Veg &amp; High Protein
                    </button>
                  </div>
                </div>
              </div>

              {/* Output Results */}
              <div className="lg:col-span-6 p-7 border border-gym-gold/20 bg-gym-card/80 backdrop-blur-lg rounded-3xl shadow-[0_0_40px_-10px_rgba(212,175,55,0.15)] relative space-y-6">

                <div className="flex justify-between items-baseline pb-4 border-b border-white/10">
                  <div>
                    <span className="font-sans font-medium tracking-widest uppercase text-[11px] uppercase tracking-wide text-gym-subtle">Prescribed Daily Target</span>
                    <div className="font-display tracking-tight text-3xl md:text-4xl text-slate-100 mt-1">
                      {targetCalories.toLocaleString()} <span className="text-sm font-sans font-medium tracking-widest uppercase text-gym-red">kcal / day</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-sans font-medium tracking-widest uppercase text-[11px] uppercase text-gym-subtle">BMI Index</span>
                    <div className="font-sans font-medium tracking-widest uppercase text-xl font-bold text-gym-gold">{bmi}</div>
                  </div>
                </div>

                {/* Macro Distribution */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-center">
                  <div className="p-3 border border-white/10 bg-gym-darker">
                    <div className="font-sans font-medium tracking-widest uppercase text-[10px] text-gym-subtle uppercase">Protein</div>
                    <div className="font-display tracking-tight text-2xl text-gym-red mt-1">{targetProtein}g</div>
                    <div className="font-sans font-medium tracking-widest uppercase text-[9px] text-gym-subtle">{proteinCals} kcal</div>
                  </div>
                  <div className="p-3 border border-white/10 bg-gym-darker">
                    <div className="font-sans font-medium tracking-widest uppercase text-[10px] text-gym-subtle uppercase">Carbohydrates</div>
                    <div className="font-display tracking-tight text-2xl text-gym-gold mt-1">{targetCarbs}g</div>
                    <div className="font-sans font-medium tracking-widest uppercase text-[9px] text-gym-subtle">{carbCals} kcal</div>
                  </div>
                  <div className="p-3 border border-white/10 bg-gym-darker">
                    <div className="font-sans font-medium tracking-widest uppercase text-[10px] text-gym-subtle uppercase">Healthy Fats</div>
                    <div className="font-display tracking-tight text-2xl text-gym-emerald mt-1">{targetFats}g</div>
                    <div className="font-sans font-medium tracking-widest uppercase text-[9px] text-gym-subtle">{fatCals} kcal</div>
                  </div>
                </div>

                {/* Indian Food List */}
                <div className="p-4 border border-white/10 bg-gym-darker space-y-2">
                  <div className="flex items-center gap-2 text-xs font-sans font-medium tracking-widest uppercase uppercase text-gym-gold">
                    <Utensils className="w-3.5 h-3.5 text-gym-red" />
                    <span>Recommended Indian Sources ({calcDiet === "veg" ? "Veg" : "Non-Veg"})</span>
                  </div>
                  {calcDiet === "veg" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gym-muted">
                      <span>• 200g Low-fat Paneer (36g P)</span>
                      <span>• 50g Roasted Sattu (14g P)</span>
                      <span>• 50g Soya Chunks (26g P)</span>
                      <span>• 1 Scoop Whey + Curd / Dahi</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gym-muted">
                      <span>• 200g Grilled Chicken Tikka (50g P)</span>
                      <span>• 4 Whole Eggs + 2 Whites (30g P)</span>
                      <span>• Fish Curry / Salmon (40g P)</span>
                      <span>• 1 Scoop Whey Isolate</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setPassModalOpen(true)}
                  className="w-full py-3.5 font-sans font-medium tracking-widest uppercase text-xs uppercase tracking-wide bg-gym-red text-[#000000] font-semibold hover:bg-transparent hover:text-slate-100 border border-gym-red transition-colors"
                >
                  Have a Coach Build This Plan For You →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= INTERACTIVE BEFORE/AFTER TRANSFORMATION SLIDER ================= */}
        <section id="transformations" className="py-20 md:py-28 border-b border-white/10 relative">
          <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#C9A15A_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/80 to-transparent pointer-events-none" />
          <div className="max-w-6xl mx-auto px-5 md:px-8 space-y-12">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
              <div>
                <Eyebrow>Proven In The Data</Eyebrow>
                <h2 className="font-display tracking-tight text-3xl md:text-5xl leading-tight max-w-xl mt-3">
                  Interactive Transformation <em className="italic text-gym-gold font-normal">Slider.</em>
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {TRANSFORMATIONS.map((t, idx) => (
                  <button
                    key={t.name}
                    onClick={() => {
                      setTransformationIdx(idx);
                      setSliderPos(50);
                    }}
                    className={`font-sans font-medium tracking-widest uppercase text-xs uppercase px-4 py-2 border transition-all ${transformationIdx === idx
                        ? "bg-gym-gold text-[#000000] border-gym-gold font-bold"
                        : "border-white/15 text-gym-muted hover:text-slate-100"
                      }`}
                  >
                    {t.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Before / After Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 border border-white/5 bg-gym-card/40 backdrop-blur-xl rounded-3xl shadow-2xl relative">


              {/* Interactive Image Split Compare */}
              <div className="lg:col-span-6 relative h-80 sm:h-96 border border-white/20 overflow-hidden select-none">
                {/* After Image (Full Base) */}
                <img
                  src={activeTransformation.afterImage}
                  alt={`${activeTransformation.name} After`}
                  className="w-full h-full object-cover object-center"
                />
                <span className="absolute bottom-4 right-4 font-sans font-medium tracking-widest uppercase text-[10.5px] uppercase tracking-wider bg-gym-red text-[#000000] px-3 py-1 font-bold">
                  After ({activeTransformation.duration})
                </span>

                {/* Before Image (Clipped overlay) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={activeTransformation.beforeImage}
                    alt={`${activeTransformation.name} Before`}
                    className="w-full h-full object-cover object-center filter grayscale-[0.3]"
                    style={{ width: "100%", height: "100%" }}
                  />
                  <span className="absolute bottom-4 left-4 font-sans font-medium tracking-widest uppercase text-[10.5px] uppercase tracking-wider bg-gym-darker/90 text-slate-100 border border-white/20 px-3 py-1 font-bold">
                    Before Baseline
                  </span>
                </div>

                {/* Vertical Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-gym-gold cursor-ew-resize pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gym-darker border border-gym-gold flex items-center justify-center text-[10px] text-gym-gold shadow-xl">
                    ⇄
                  </div>
                </div>

                {/* Range Slider for Interaction */}
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-20"
                  aria-label="Drag to compare before and after photos"
                />
              </div>

              {/* Transformation Story & Verified Metrics */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-display tracking-tight text-3xl text-slate-100">{activeTransformation.name}</h3>
                    <span className="font-sans font-medium tracking-widest uppercase text-[10px] uppercase text-gym-emerald border border-gym-emerald/30 bg-gym-emerald/10 px-2 py-0.5">
                      Verified Member
                    </span>
                  </div>
                  <p className="text-xs text-gym-muted mt-1 font-sans font-medium tracking-widest uppercase">{activeTransformation.profession} • {activeTransformation.location}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans font-medium tracking-widest uppercase text-xs">
                  <div className="p-3 border border-white/10 bg-gym-card">
                    <div className="text-[10px] text-gym-subtle uppercase">Weight Delta</div>
                    <div className="text-sm font-bold text-gym-red mt-0.5">{activeTransformation.stats.weight}</div>
                  </div>
                  <div className="p-3 border border-white/10 bg-gym-card">
                    <div className="text-[10px] text-gym-subtle uppercase">Body Fat %</div>
                    <div className="text-sm font-bold text-gym-gold mt-0.5">{activeTransformation.stats.bodyFat}</div>
                  </div>
                  <div className="p-3 border border-white/10 bg-gym-card col-span-2">
                    <div className="text-[10px] text-gym-subtle uppercase">Strength Milestone</div>
                    <div className="text-sm font-bold text-gym-emerald mt-0.5">{activeTransformation.stats.lift} • {activeTransformation.stats.streak}</div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gym-muted italic leading-relaxed">
                  "{activeTransformation.quote}"
                </p>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between font-sans font-medium tracking-widest uppercase text-xs">
                  <span className="text-slate-300">Coached by: <strong className="text-gym-gold">{activeTransformation.coach}</strong></span>
                  <button
                    onClick={() => setPassModalOpen(true)}
                    className="text-gym-red hover:text-slate-100 font-bold"
                  >
                    Start Your Protocol →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= COACHES WITH REAL PHOTOGRAPHY ================= */}
        <section id="coaches" className="py-20 md:py-28 border-b border-white/10 bg-gym-darker">
          <div className="max-w-6xl mx-auto px-5 md:px-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-8 mb-14">
              <div>
                <Eyebrow>Certified Leadership</Eyebrow>
                <h2 className="font-display tracking-tight text-3xl md:text-5xl leading-tight max-w-xl mt-3">
                  Coaching staff <em className="italic text-gym-gold font-normal">certified</em>, not just enthusiastic.
                </h2>
              </div>
              <p className="max-w-xs text-gym-muted text-sm leading-relaxed">
                Every coach on our roster holds CSCS or NASM credentials and authors your program personally.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {COACHES.map((c, idx) => (
                <RevealCard
                  key={c.name}
                  delay={idx * 110}
                  className="bg-gym-card/60 backdrop-blur-md border border-white/5 hover:border-gym-red/30 rounded-2xl transition-all duration-500 flex flex-col justify-between overflow-hidden group hover:-translate-y-2 hover:shadow-[0_8px_40px_-12px_rgba(255,42,42,0.3)]"
                >
                  {/* Real Coach Portrait */}
                  <div className="relative h-64 w-full overflow-hidden">
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover object-top filter brightness-95 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                    <span className="absolute top-3.5 left-3.5 font-sans font-medium tracking-widest uppercase text-[10px] bg-gym-darker/90 text-gym-gold px-2 py-0.5 border border-gym-gold/30 uppercase">
                      {c.credentials.split("•")[0]}
                    </span>
                  </div>

                  <div className="p-6 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-medium text-slate-100 text-base group-hover:text-gym-red transition-colors">{c.name}</h4>
                      <div className="font-sans font-medium tracking-widest uppercase text-[11px] uppercase tracking-wide text-gym-gold mt-1">{c.role}</div>
                      <div className="text-xs text-gym-subtle mt-1.5">{c.city}</div>
                      <p className="text-xs text-gym-muted mt-2.5 line-clamp-2">"{c.bio}"</p>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <button
                        onClick={() => {
                          setPassForm({ ...passForm, interest: `1-on-1 with ${c.name}` });
                          setPassModalOpen(true);
                        }}
                        className="font-sans font-medium tracking-widest uppercase text-[11px] uppercase tracking-wide text-gym-red hover:text-slate-100 transition-colors font-semibold"
                      >
                        Book 1-on-1 Trial →
                      </button>
                    </div>
                  </div>
                </RevealCard>
              ))}
            </div>
          </div>
        </section>

        {/* ================= PAN-INDIA LOCATIONS WITH PHOTO GALLERY ================= */}
        <section id="locations" className="py-20 md:py-28 border-b border-white/10">
          <div className="max-w-6xl mx-auto px-5 md:px-8 space-y-12">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
              <div>
                <Eyebrow>Multi-City Footprint</Eyebrow>
                <h2 className="font-display tracking-tight text-3xl md:text-5xl leading-tight max-w-xl mt-3">
                  Flagship <em className="italic text-gym-gold font-normal">arenas</em> across India.
                </h2>
              </div>
              <p className="max-w-xs text-gym-muted text-sm leading-relaxed">
                One membership. Seamless QR access at every center in Mumbai, Bengaluru, Delhi NCR, Hyderabad and Pune.
              </p>
            </div>

            {/* City Selection Tabs */}
            <div className="flex flex-wrap border border-white/20 w-fit">
              {Object.entries(CITIES).map(([key, c]) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveCity(key);
                    setSelectedAmenityIdx(0);
                  }}
                  className={`font-sans font-medium tracking-widest uppercase text-xs uppercase tracking-wide px-5 py-3 border-r border-white/20 last:border-r-0 transition-colors ${activeCity === key ? "bg-gym-red text-[#000000] font-bold" : "text-gym-muted hover:text-[#FFFFFF]"
                    }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Spotlight Center Box with Dynamic Images */}
            <div className="grid md:grid-cols-[1fr_1fr] border border-white/10 bg-gym-card">
              {/* Center Main Photograph */}
              <div className="relative min-h-[360px] md:min-h-[440px] overflow-hidden">
                <img
                  src={city.amenities[selectedAmenityIdx]?.img || city.mainImage}
                  alt={city.title}
                  className="w-full h-full object-cover object-center filter contrast-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />


                <div className="absolute top-4 left-4">
                  <span className="font-sans font-medium tracking-widest uppercase text-[11px] tracking-wider uppercase text-gym-emerald bg-gym-darker/90 px-3 py-1 border border-white/10 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gym-emerald animate-pulse2" />
                    {city.occ}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-sans font-medium tracking-widest uppercase text-xs text-slate-100 bg-gym-darker/90 p-3 border border-white/10">
                  <span className="truncate">{city.amenities[selectedAmenityIdx]?.name}</span>
                  <span className="text-gym-gold text-[10px]">Photo {selectedAmenityIdx + 1}/4</span>
                </div>
              </div>

              {/* Details & Interactive Amenity Switcher */}
              <div className="p-8 md:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <Eyebrow>{city.size}</Eyebrow>
                    <h3 className="font-display tracking-tight text-2xl md:text-[28px] mt-2 text-slate-100">{city.title}</h3>
                    <p className="text-gym-muted text-xs mt-2 flex items-start gap-2 leading-relaxed">
                      <MapPin className="w-4 h-4 text-gym-red shrink-0 mt-0.5" />
                      <span>{city.addr}</span>
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <p className="font-sans font-medium tracking-widest uppercase text-[11px] uppercase text-gym-subtle">Click Facility Amenities To View Photos:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {city.amenities.map((f, idx) => (
                        <button
                          key={f.name}
                          type="button"
                          onClick={() => setSelectedAmenityIdx(idx)}
                          className={`text-xs text-left px-3 py-2.5 border transition-all flex items-center gap-2 ${selectedAmenityIdx === idx
                              ? "bg-gym-gold/15 border-gym-gold text-slate-100 font-semibold"
                              : "border-white/10 bg-gym-darker text-gym-muted hover:text-slate-100"
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${selectedAmenityIdx === idx ? "bg-gym-red" : "bg-[#8C8C8C]"}`} />
                          <span className="truncate">{f.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs font-sans font-medium tracking-widest uppercase">
                    <span className="text-gym-subtle">Concierge Desk:</span>
                    <p className="text-slate-200 font-bold">{city.phone}</p>
                  </div>

                  <button
                    onClick={() => {
                      setPassForm({ ...passForm, city: city.title });
                      setPassModalOpen(true);
                    }}
                    className="font-sans font-medium tracking-widest uppercase text-xs tracking-wide uppercase px-6 py-3 bg-gym-red text-[#000000] border border-gym-red hover:bg-transparent hover:text-[#FFFFFF] transition-colors font-bold"
                  >
                    Book Centre Tour &amp; Free Pass
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= TRANSPARENT INDIAN PRICING ================= */}
        <section id="membership" className="py-20 md:py-28 border-b border-white/10">
          <div className="max-w-6xl mx-auto px-5 md:px-8 space-y-14">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-8">
              <div>
                <Eyebrow>Transparent Pricing (₹)</Eyebrow>
                <h2 className="font-display tracking-tight text-3xl md:text-5xl leading-tight max-w-xl mt-3">
                  Transparent, <em className="italic text-gym-gold font-normal">Indian</em> memberships.
                </h2>
              </div>
              <p className="max-w-xs text-gym-muted text-sm leading-relaxed">
                All prices include 18% GST. No hidden joining fees. Cancel or pause anytime from the member app.
              </p>
            </div>

            <div className="grid md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  tier: "Foundation",
                  name: "Single City Access",
                  price: "₹2,999",
                  billing: "Billed monthly • GST included",
                  feats: ["Access to one flagship centre", "Contactless QR self check-in", "Standard group classes & turf", "Indian macro nutrition engine", "Executive lockers & shower suites"],
                  featured: false,
                },
                {
                  tier: "Performance",
                  name: "Multi-City Access",
                  price: "₹5,499",
                  billing: "6 Months Access • Best Value in India",
                  feats: ["All 12 centres, 5 Indian cities", "Biometric telemetry & Chart.js logs", "Monthly coach programming review", "Infrared sauna & recovery suite access", "2 Free VIP Guest passes / month", "No-cost EMI via UPI / Cards"],
                  featured: true,
                },
                {
                  tier: "White Glove",
                  name: "1-on-1 Elite Coaching",
                  price: "₹14,999",
                  billing: "12 Months VIP • Dedicated CSCS Coach",
                  feats: ["Dedicated personal trainer assigned", "Private studio scheduling", "Quarterly Dexa scans + daily WhatsApp check-ins", "Concierge nutrition planning", "Smart Gym Pro Athlete kit included"],
                  featured: false,
                },
              ].map((p, idx) => (
                <RevealCard
                  key={p.tier}
                  delay={idx * 120}
                  className={`relative flex flex-col justify-between p-9 rounded-3xl border backdrop-blur-md transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_40px_-15px_rgba(255,42,42,0.2)] ${p.featured ? "border-gym-red bg-gradient-to-b from-[#FF2A2A]/[0.08] to-transparent shadow-gym-red/10" : "border-white/10 bg-gym-card"
                    }`}
                >
                  {p.featured && (
                    <span className="absolute -top-px -right-px bg-gym-red text-[#000000] font-sans font-medium tracking-widest uppercase text-[10.5px] uppercase tracking-wide px-3 py-1.5 font-bold">
                      Most Chosen in India
                    </span>
                  )}
                  <div>
                    <div className="font-sans font-medium tracking-widest uppercase text-xs uppercase tracking-wide text-gym-gold">{p.tier}</div>
                    <h3 className="font-display tracking-tight text-2xl mt-3.5 text-slate-100">{p.name}</h3>
                    <div className="flex items-baseline gap-2 mt-5">
                      <span className="font-display tracking-tight text-4xl md:text-[44px] text-slate-100">{p.price}</span>
                      <span className="font-sans font-medium tracking-widest uppercase text-xs text-gym-subtle">/ month</span>
                    </div>
                    <p className="text-[11px] text-gym-muted mt-1 font-sans font-medium tracking-widest uppercase">{p.billing}</p>
                    <ul className="flex flex-col gap-3 my-7">
                      {p.feats.map((f) => (
                        <li key={f} className="text-[13px] text-gym-muted pl-5 relative">
                          <span className="absolute left-0 top-[8px] w-2.5 h-px bg-gym-gold" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => navigate("/register")}
                    className={`text-center font-sans font-medium tracking-widest uppercase text-xs uppercase tracking-wide px-6 py-3.5 border transition-colors ${p.featured
                        ? "bg-gym-red text-[#000000] border-gym-red hover:bg-transparent hover:text-[#FFFFFF] font-bold"
                        : "border-white/20 hover:border-white/60 text-slate-200"
                      }`}
                  >
                    Choose {p.tier}
                  </button>
                </RevealCard>
              ))}
            </div>
          </div>
        </section>

        {/* ================= INTERACTIVE FAQ ACCORDION ================= */}
        <section className="py-20 md:py-28 border-b border-white/10 relative">
          <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#C9A15A_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/80 to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto px-5 md:px-8 space-y-10">
            <div className="text-center space-y-3">
              <Eyebrow center>Common Queries</Eyebrow>
              <h2 className="font-display tracking-tight text-3xl md:text-5xl leading-tight">
                Frequently Asked <em className="italic text-gym-gold font-normal">Questions.</em>
              </h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="border border-white/15 bg-gym-darker overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-display tracking-tight text-lg text-slate-100 hover:text-gym-red transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gym-gold transition-transform duration-300 ${openFaq === idx ? "rotate-180 text-gym-red" : ""
                        }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-6 text-xs sm:text-sm text-gym-muted leading-relaxed border-t border-white/10 pt-4 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CONVERSION CALL TO ACTION ================= */}
        <section className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-5 md:px-8">
            <div
              className="relative border border-white/20 text-center px-7 py-16 md:px-16 md:py-20 bg-gym-card shadow-2xl"
              style={{ background: "radial-gradient(ellipse 60% 100% at 50% 100%, rgba(225,29,72,0.14), transparent)" }}
            >

              <Eyebrow center>Begin your transformation</Eyebrow>
              <h2 className="font-display tracking-tight text-4xl md:text-6xl leading-tight max-w-3xl mx-auto mt-6 text-slate-100">
                Ready to build your <em className="italic text-gym-gold font-normal">peak physique?</em>
              </h2>
              <p className="text-gym-muted max-w-md mx-auto mt-6 mb-10 leading-relaxed">
                Book a free biometric assessment at your nearest flagship centre in Mumbai, Bengaluru, Delhi NCR, Hyderabad or Pune.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setPassModalOpen(true)}
                  className="font-sans font-medium tracking-widest uppercase text-xs tracking-wide uppercase px-6 py-3.5 bg-gym-red text-[#000000] border border-gym-red hover:bg-transparent hover:text-[#FFFFFF] transition-colors font-bold shadow-xl shadow-gym-red/20"
                >
                  Book Free Assessment
                </button>
                <a
                  href="#locations"
                  onClick={(e) => scrollToSection(e, "#locations")}
                  className="font-sans font-medium tracking-widest uppercase text-xs tracking-wide uppercase px-6 py-3.5 border border-white/20 hover:border-white/60 transition-colors"
                >
                  Find Your Nearest Centre
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 py-16 md:py-20 border-t border-white/10 bg-gym-darker">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="grid md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-10 pb-14 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 border border-white/20 flex items-center justify-center bg-gym-darker">

                  <span className="font-display tracking-tight text-gym-red text-lg font-bold">S</span>
                </div>
                <div className="font-display tracking-tight text-lg">
                  SMART GYM <span className="text-gym-gold">INDIA</span>
                </div>
              </div>
              <p className="text-gym-muted text-[13.5px] leading-relaxed mt-4 max-w-xs">
                Elite performance training and biometric telemetry, across Mumbai, Bengaluru, Delhi NCR, Hyderabad and Pune.
              </p>
              <div className="mt-4 font-sans font-medium tracking-widest uppercase text-[11px] text-gym-emerald flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gym-emerald animate-pulse2" />
                <span>All 12 Centers Operational</span>
              </div>
            </div>
            {[
              { h: "Train", links: [{ l: "Programs", h: "#programs" }, { l: "Macro Lab", h: "#calculator" }, { l: "Transformations", h: "#transformations" }, { l: "Membership", h: "#membership" }] },
              { h: "Centres", links: [{ l: "Mumbai", h: "#locations" }, { l: "Bengaluru", h: "#locations" }, { l: "Delhi NCR", h: "#locations" }, { l: "Hyderabad", h: "#locations" }, { l: "Pune", h: "#locations" }] },
              { h: "Portals", links: [{ l: "Member Sign In", h: "/login" }, { l: "Trainer Hub", h: "/login" }, { l: "Admin Console", h: "/login" }, { l: "Register", h: "/register" }] },
              { h: "Support", links: [{ l: "Contact HQ", h: "#locations" }, { l: "WhatsApp Hotline", h: "#locations" }, { l: "Privacy Policy", h: "#faqs" }, { l: "Refund Rules", h: "#faqs" }] },
            ].map((col) => (
              <div key={col.h}>
                <h5 className="font-sans font-medium tracking-widest uppercase text-[11px] uppercase tracking-wide text-gym-gold mb-4 font-bold">{col.h}</h5>
                {col.links.map((item) => (
                  <a
                    key={item.l}
                    href={item.h}
                    onClick={(e) => {
                      if (item.h.startsWith("#")) {
                        scrollToSection(e, item.h);
                      }
                    }}
                    className="block text-[13px] text-gym-muted hover:text-[#FFFFFF] mb-2.5 transition-colors"
                  >
                    {item.l}
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-between items-center gap-3 pt-7 font-sans font-medium tracking-widest uppercase text-[11px] text-gym-subtle">
            <span>© 2026 SMART GYM INDIA PVT. LTD. — GSTIN: 27AABCS1429B1ZX</span>
            <span>PRIVACY — TERMS — NO-COST EMI APPLIED</span>
          </div>
        </div>
      </footer>

      {/* ================= INTERACTIVE VIP FREE PASS MODAL ================= */}
      <Modal isOpen={passModalOpen} onClose={handlePassReset} title="Claim 1-Day VIP Guest Pass" maxWidth="max-w-lg">
        {passSubmitted ? (
          <div className="text-center py-6 space-y-4 animate-fade-in bg-gym-darker">
            <div className="w-16 h-16 rounded-full bg-gym-emerald/20 text-gym-emerald mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-display tracking-tight text-2xl text-slate-100">VIP Assessment Reserved</h4>
            <p className="text-xs text-gym-muted max-w-sm mx-auto leading-relaxed">
              Welcome to Smart Gym India, <strong>{passForm.name}</strong>! We've sent your entry QR token and booking details to <span className="text-gym-red font-sans font-medium tracking-widest uppercase">{passForm.phone}</span> and <span className="text-gym-gold">{passForm.email}</span>.
            </p>
            <div className="p-4 bg-gym-card border border-white/10 text-xs text-gym-muted text-left space-y-1 font-sans font-medium tracking-widest uppercase">
              <p>• <strong>Center:</strong> {passForm.city}</p>
              <p>• <strong>Selected Session:</strong> {passForm.interest}</p>
              <p>• <strong>Access:</strong> Eleiko bays, sauna recovery &amp; Dexa body scan</p>
            </div>
            <button
              onClick={handlePassReset}
              className="px-6 py-2.5 bg-gym-red text-[#000000] font-sans font-medium tracking-widest uppercase text-xs uppercase tracking-wide font-bold"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handlePassSubmit} className="space-y-4 bg-gym-darker p-1">
            <p className="text-xs text-gym-muted leading-relaxed">
              Experience our Eleiko powerlifting bays, biometric Dexa scans, and CSCS coaching with 100% free gym &amp; sauna access. No credit card required.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-sans font-medium tracking-widest uppercase uppercase text-gym-subtle">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={passForm.name}
                onChange={(e) => setPassForm({ ...passForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gym-card border border-white/15 text-xs text-slate-100 placeholder-[#8C8C8C] focus:outline-none focus:border-gym-red"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-sans font-medium tracking-widest uppercase uppercase text-gym-subtle">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@gmail.com"
                  value={passForm.email}
                  onChange={(e) => setPassForm({ ...passForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gym-card border border-white/15 text-xs text-slate-100 placeholder-[#8C8C8C] focus:outline-none focus:border-gym-red"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-sans font-medium tracking-widest uppercase uppercase text-gym-subtle">WhatsApp Mobile (+91) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98200 12345"
                  value={passForm.phone}
                  onChange={(e) => setPassForm({ ...passForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gym-card border border-white/15 text-xs text-gym-red font-sans font-medium tracking-widest uppercase placeholder-[#8C8C8C] focus:outline-none focus:border-gym-red"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-sans font-medium tracking-widest uppercase uppercase text-gym-subtle">Nearest Center</label>
                <select
                  value={passForm.city}
                  onChange={(e) => setPassForm({ ...passForm, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gym-card border border-white/15 text-xs text-slate-100 focus:outline-none focus:border-gym-red"
                >
                  <option value="Mumbai — Bandra West">Mumbai — Bandra West</option>
                  <option value="Bengaluru — Indiranagar">Bengaluru — Indiranagar</option>
                  <option value="Delhi NCR — Gurugram">Delhi NCR — Gurugram</option>
                  <option value="Hyderabad — Jubilee Hills">Hyderabad — Jubilee Hills</option>
                  <option value="Pune — Koregaon Park">Pune — Koregaon Park</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-sans font-medium tracking-widest uppercase uppercase text-gym-subtle">Workout Focus</label>
                <select
                  value={passForm.interest}
                  onChange={(e) => setPassForm({ ...passForm, interest: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gym-card border border-white/15 text-xs text-slate-100 focus:outline-none focus:border-gym-red"
                >
                  <option value="Strength & Power Lab (STR / 01)">Strength &amp; Power Lab (STR / 01)</option>
                  <option value="Indian Macro Recomp (NUT / 02)">Indian Macro Recomp (NUT / 02)</option>
                  <option value="Conditioning & Rooftop HIIT (HIIT / 05)">Conditioning &amp; HIIT (HIIT / 05)</option>
                  <option value="1-on-1 Personal Assessment (VIP / 04)">1-on-1 Personal Assessment (VIP / 04)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handlePassReset}
                className="px-4 py-2 font-sans font-medium tracking-widest uppercase text-xs uppercase text-gym-muted hover:text-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 font-sans font-medium tracking-widest uppercase text-xs uppercase bg-gym-red text-[#000000] font-bold border border-gym-red hover:bg-transparent hover:text-slate-100 transition-colors"
              >
                Get Free Pass →
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Floating Scroll To Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-40 px-3.5 py-2.5 rounded-2xl bg-gym-card/90 backdrop-blur-xl border border-white/20 text-gym-gold hover:text-slate-100 hover:border-gym-red hover:bg-gym-red/20 shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all duration-300 group hover:-translate-y-1 active:scale-95 animate-fade-in flex items-center gap-1.5 font-sans font-medium tracking-widest uppercase text-xs font-semibold"
        >
          <ChevronUp className="w-4 h-4 text-gym-red group-hover:-translate-y-0.5 transition-transform" />
          <span>TOP</span>
        </button>
      )}

      {/* Global Toast Alerts */}
      <Toast />
    </div>
  );
}
