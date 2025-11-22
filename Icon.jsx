import React from 'react';
import { 
  Home, Briefcase, TrendingUp, Users, User, 
  Bell, ChevronRight, ChevronLeft, ChevronDown, ArrowUpRight, ArrowRight,
  Check, CheckCircle2, Lock, Shield, ShieldCheck,
  Gift, Send, X, Copy, UploadCloud, Zap, 
  Star, Globe, Activity, Award, LogOut, 
  Settings, MessageCircle, Wallet, Clock, 
  Loader2, Play, DollarSign, Trophy, AlertCircle, Key
} from 'lucide-react';

// 1. The Registry
// Maps string names (from JSON/DB) to React Components
const iconMap = {
  home: Home,
  briefcase: Briefcase,
  trendingup: TrendingUp,
  users: Users,
  user: User,
  bell: Bell,
  chevronright: ChevronRight,
  chevronleft: ChevronLeft,
  chevrondown: ChevronDown,
  arrowupright: ArrowUpRight,
  arrowright: ArrowRight,
  check: Check,
  checkcircle: CheckCircle2,
  lock: Lock,
  shield: Shield,
  shieldcheck: ShieldCheck,
  gift: Gift,
  send: Send,
  x: X,
  copy: Copy,
  upload: UploadCloud,
  zap: Zap,
  star: Star,
  globe: Globe,
  activity: Activity,
  award: Award,
  logout: LogOut,
  settings: Settings,
  chat: MessageCircle,
  wallet: Wallet,
  clock: Clock,
  loader: Loader2,
  play: Play,
  dollar: DollarSign,
  trophy: Trophy,
  alert: AlertCircle,
  key: Key
};

const Icon = ({ 
  name, 
  size = 20, 
  className = "", 
  strokeWidth = 2.5 // Defaulting to THICKER strokes for the Masterpiece theme
}) => {
  // normalize name to lowercase to avoid casing errors
  const normalizedName = name ? name.toLowerCase().replace(/-/g, '') : '';
  
  const IconComponent = iconMap[normalizedName];

  if (!IconComponent) {
    // Fallback if icon name is wrong/missing
    console.warn(`Icon "${name}" not found in registry.`);
    return null; 
  }

  return (
    <IconComponent 
      size={size} 
      className={className} 
      strokeWidth={strokeWidth} 
    />
  );
};

export default Icon;