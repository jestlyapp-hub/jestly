"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Subscription } from "@/types/subscription";
import { CATEGORY_CONFIG } from "@/types/subscription";
import { useSubscriptionCalendar } from "@/lib/hooks/use-subscription-calendar";
import { useSubscriptionLogo } from "@/lib/hooks/use-subscription-logo";
import type { CalendarDay, CalendarEvent, CalendarWeek, MonthStats } from "@/lib/subscriptions/calendar";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  DollarSign,
  Zap,
  Clock,
  Receipt,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  X,
} from "lucide-react";
import { monthlyAmount, yearlyAmount, costInWorkDays, healthScore, daysUntilBilling, nextBillingDate } from "@/lib/subscriptions/helpers";

// ═══════════════════════════════════════
// INTENSITY STYLES
// ═══════════════════════════════════════

const INTENSITY_BG: Record<string, string> = {
  none: "",
  low: "bg-violet-50/50",
  medium: "bg-violet-100/60",
  high: "bg-violet-200/60",
  danger: "bg-violet-300/50",
};

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// ═══════════════════════════════════════
// MONTH NAVIGATOR
// ═══════════════════════════════════════

function MonthNavigator({ label, onPrev, onNext, onToday }: {
  label: string; onPrev: () => void; onNext: () => void; onToday: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={onPrev} className="p-1.5 rounded-lg hover:bg-[#F0F0EE] transition-colors cursor-pointer" aria-label="Mois précédent">
        <ChevronLeft size={18} className="text-[#8A8A88]" />
      </button>
      <h2 className="text-[16px] font-bold text-[#191919] min-w-[160px] text-center capitalize">{label}</h2>
      <button onClick={onNext} className="p-1.5 rounded-lg hover:bg-[#F0F0EE] transition-colors cursor-pointer" aria-label="Mois suivant">
        <ChevronRight size={18} className="text-[#8A8A88]" />
      </button>
      <button onClick={onToday} className="text-[11px] font-medium text-[#7C3AED] hover:bg-violet-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer">
        Aujourd&apos;hui
      </button>
    </div>
  );
}

// ═══════════════════════════════════════
// KPI CARDS
// ═══════════════════════════════════════

function KpiCards({ stats }: { stats: MonthStats }) {
  const kpis = [
    { label: "Total du mois", value: `${stats.monthTotal.toFixed(0)}€`, icon: DollarSign, color: "bg-violet-50 text-violet-600" },
    { label: "Prélèvements", value: String(stats.chargeCount), icon: Receipt, color: "bg-blue-50 text-blue-600" },
    { label: "Déductible", value: `${stats.monthDeductible.toFixed(0)}€`, icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
    { label: "Prochain débit", value: stats.daysUntilNext >= 0 ? `${stats.daysUntilNext}j` : "—", sub: stats.nextCharge?.subscription.name, icon: Clock, color: stats.daysUntilNext <= 3 && stats.daysUntilNext >= 0 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {kpis.map((k, i) => (
        <motion.div
          key={k.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white rounded-xl border border-[#E6E6E4] p-3.5"
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${k.color}`}>
            <k.icon size={14} strokeWidth={1.8} />
          </div>
          <p className="text-[10px] font-medium text-[#AAA] uppercase tracking-wider">{k.label}</p>
          <p className="text-[18px] font-bold text-[#191919] leading-tight">{k.value}</p>
          {k.sub && <p className="text-[10px] text-[#BBB] truncate">{k.sub}</p>}
        </motion.div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// INSIGHTS BAR
// ═══════════════════════════════════════

function InsightsBar({ insights }: { insights: string[] }) {
  if (insights.length === 0) return null;
  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
      <Lightbulb size={14} className="text-amber-500 flex-shrink-0" />
      {insights.map((ins, i) => (
        <span key={i} className="text-[11px] text-[#5A5A58] bg-amber-50 border border-amber-200 rounded-full px-3 py-1 whitespace-nowrap flex-shrink-0">
          {ins}
        </span>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// EVENT CHIP (mini pill dans cellule)
// ═══════════════════════════════════════

function EventChip({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  const cat = CATEGORY_CONFIG[event.subscription.category];
  const isToCancle = event.subscription.status === "to_cancel";

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`w-full flex items-center gap-1.5 px-1.5 py-0.5 rounded text-left transition-all hover:opacity-80 cursor-pointer ${
        isToCancle ? "bg-orange-50 border border-orange-200" : "bg-white/80 border border-[#F0F0EE]"
      }`}
    >
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: cat.color }}
      />
      <span className="text-[9px] font-medium text-[#191919] truncate flex-1">{event.subscription.name}</span>
      <span className="text-[9px] font-bold text-[#5A5A58] flex-shrink-0">{event.amount.toFixed(0)}€</span>
    </button>
  );
}

// ═══════════════════════════════════════
// CALENDAR CELL
// ═══════════════════════════════════════

function CalendarCell({ day, isSelected, onSelect, onSelectSub }: {
  day: CalendarDay;
  isSelected: boolean;
  onSelect: () => void;
  onSelectSub: (sub: Subscription) => void;
}) {
  const maxVisible = 2;
  const overflow = day.events.length - maxVisible;

  return (
    <motion.button
      onClick={onSelect}
      whileHover={day.isCurrentMonth ? { scale: 1.02 } : undefined}
      className={`relative flex flex-col min-h-[90px] lg:min-h-[110px] p-1.5 rounded-xl border transition-all text-left cursor-pointer ${
        !day.isCurrentMonth
          ? "opacity-35 border-transparent"
          : isSelected
          ? "border-[#7C3AED] bg-violet-50/30 shadow-sm ring-1 ring-[#7C3AED]/20"
          : day.events.length > 0
          ? `border-[#E6E6E4] ${INTENSITY_BG[day.intensity]} hover:border-[#D0D0CE] hover:shadow-sm`
          : "border-transparent hover:border-[#E6E6E4] hover:bg-[#FAFAFA]"
      }`}
    >
      {/* Day number + today badge */}
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[12px] font-semibold leading-none ${
          day.isToday
            ? "text-white bg-[#7C3AED] w-6 h-6 rounded-full flex items-center justify-center"
            : day.isCurrentMonth ? "text-[#191919]" : "text-[#CCC]"
        }`}>
          {day.dayOfMonth}
        </span>
        {day.totalAmount > 0 && day.isCurrentMonth && (
          <span className={`text-[10px] font-bold ${
            day.intensity === "danger" ? "text-red-600" :
            day.intensity === "high" ? "text-violet-700" :
            "text-[#7C3AED]"
          }`}>
            {day.totalAmount.toFixed(0)}€
          </span>
        )}
      </div>

      {/* Event chips */}
      {day.isCurrentMonth && (
        <div className="flex flex-col gap-0.5 flex-1">
          {day.events.slice(0, maxVisible).map((ev) => (
            <EventChip
              key={ev.subscription.id}
              event={ev}
              onClick={() => onSelectSub(ev.subscription)}
            />
          ))}
          {overflow > 0 && (
            <span className="text-[9px] text-[#8A8A88] font-medium pl-1">
              +{overflow} autre{overflow > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}
    </motion.button>
  );
}

// ═══════════════════════════════════════
// WEEK ROW with summary
// ═══════════════════════════════════════

function WeekRow({ week, selectedDay, onSelectDay, onSelectSub, weekIndex }: {
  week: CalendarWeek;
  selectedDay: CalendarDay | null;
  onSelectDay: (d: CalendarDay) => void;
  onSelectSub: (s: Subscription) => void;
  weekIndex: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: weekIndex * 0.03 }}
    >
      <div className="grid grid-cols-7 gap-1">
        {week.days.map((day) => {
          const key = `${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`;
          const sel = selectedDay && selectedDay.date.getTime() === day.date.getTime();
          return (
            <CalendarCell
              key={key}
              day={day}
              isSelected={!!sel}
              onSelect={() => onSelectDay(day)}
              onSelectSub={onSelectSub}
            />
          );
        })}
      </div>
      {/* Week summary strip */}
      {week.weekEventCount > 0 && (
        <div className="flex items-center justify-end gap-3 px-2 py-0.5 text-[9px] text-[#AAA]">
          <span>{week.weekEventCount} prélèvement{week.weekEventCount > 1 ? "s" : ""}</span>
          <span className="font-semibold text-[#8A8A88]">{week.weekTotal.toFixed(0)}€</span>
        </div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════
// DAY SIDEBAR
// ═══════════════════════════════════════

function DaySidebar({ day, onSelectSub, onClose }: {
  day: CalendarDay;
  onSelectSub: (s: Subscription) => void;
  onClose: () => void;
}) {
  const dateStr = day.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-2xl border border-[#E6E6E4] shadow-lg p-5 w-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-bold text-[#191919] capitalize">{dateStr}</h3>
          <p className="text-[12px] text-[#8A8A88]">{day.events.length} prélèvement{day.events.length > 1 ? "s" : ""} · {day.totalAmount.toFixed(0)}€</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#F0F0EE] transition-colors cursor-pointer">
          <X size={16} className="text-[#AAA]" />
        </button>
      </div>

      {day.events.length === 0 ? (
        <p className="text-[13px] text-[#AAA] text-center py-8">Aucun prélèvement ce jour</p>
      ) : (
        <div className="space-y-2">
          {day.events.map((ev) => (
            <SidebarEventRow key={ev.subscription.id} event={ev} onClick={() => onSelectSub(ev.subscription)} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function SidebarEventRow({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  const sub = event.subscription;
  const cat = CATEGORY_CONFIG[sub.category];

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#F0F0EE] hover:border-[#E0E0DE] hover:bg-[#FAFAFA] transition-all text-left cursor-pointer"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
        style={{ background: sub.color_tag || cat.color }}
      >
        {sub.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#191919] truncate">{sub.name}</p>
        <p className="text-[11px] text-[#8A8A88]">
          {cat.label}
          {sub.is_tax_deductible && " · Déductible"}
          {event.isRenewal && " · Renouvellement"}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[14px] font-bold text-[#191919]">{event.amount.toFixed(0)}€</p>
        {sub.status === "to_cancel" && (
          <span className="text-[9px] font-bold text-orange-600">À résilier</span>
        )}
      </div>
    </button>
  );
}

// ═══════════════════════════════════════
// SUBSCRIPTION DETAIL SIDEBAR
// ═══════════════════════════════════════

function SubDetailSidebar({ sub, onBack, onClose }: {
  sub: Subscription;
  onBack: () => void;
  onClose: () => void;
}) {
  const cat = CATEGORY_CONFIG[sub.category];
  const score = healthScore(sub);
  const monthly = monthlyAmount(sub);
  const yearly = yearlyAmount(sub);
  const workDays = costInWorkDays(sub);
  const nextDate = nextBillingDate(sub);
  const daysLeft = daysUntilBilling(sub);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-2xl border border-[#E6E6E4] shadow-lg p-5 w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="text-[12px] text-[#7C3AED] hover:underline cursor-pointer">
          ← Retour
        </button>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#F0F0EE] transition-colors cursor-pointer">
          <X size={16} className="text-[#AAA]" />
        </button>
      </div>

      {/* Logo + name */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-[18px] font-bold shadow-sm"
          style={{ background: sub.color_tag || cat.color }}
        >
          {sub.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-[16px] font-bold text-[#191919]">{sub.name}</h3>
          <p className="text-[12px] text-[#8A8A88]">{sub.domain || cat.label}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: "Mensuel", value: `${monthly.toFixed(0)}€` },
          { label: "Annuel", value: `${yearly.toFixed(0)}€` },
          { label: "Prochain paiement", value: nextDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) },
          { label: "Dans", value: `${daysLeft} jour${daysLeft > 1 ? "s" : ""}` },
          { label: "Coût en temps", value: `${workDays} jour${workDays !== 1 ? "s" : ""}` },
          { label: "Score santé", value: `${score}/100` },
        ].map((item) => (
          <div key={item.label} className="bg-[#F7F7F5] rounded-lg p-2.5">
            <p className="text-[9px] font-medium text-[#AAA] uppercase tracking-wider">{item.label}</p>
            <p className="text-[14px] font-bold text-[#191919]">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border" style={{ color: cat.color, borderColor: `${cat.color}30`, backgroundColor: `${cat.color}08` }}>
          {cat.icon} {cat.label}
        </span>
        {sub.is_tax_deductible && (
          <span className="text-[10px] font-medium text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">Déductible</span>
        )}
        {sub.status === "to_cancel" && (
          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">À résilier</span>
        )}
      </div>

      {/* Notes */}
      {sub.notes && (
        <div className="bg-[#F7F7F5] rounded-lg p-3 text-[12px] text-[#5A5A58]">
          {sub.notes}
        </div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════
// MAIN CALENDAR VIEW
// ═══════════════════════════════════════

interface Props {
  subs: Subscription[];
}

export default function SubsCalendar({ subs }: Props) {
  const cal = useSubscriptionCalendar(subs);

  return (
    <div className="flex gap-5">
      {/* Main calendar area */}
      <div className="flex-1 min-w-0">
        {/* Header: nav + TJM cost */}
        <div className="flex items-center justify-between mb-4">
          <MonthNavigator
            label={cal.monthLabel}
            onPrev={cal.goPrevMonth}
            onNext={cal.goNextMonth}
            onToday={cal.goToday}
          />
          {cal.stats.workDaysCost > 0 && (
            <span className="text-[11px] text-[#8A8A88] bg-[#F7F7F5] px-3 py-1.5 rounded-lg hidden sm:block">
              <Zap size={12} className="inline text-amber-500 mr-1" />
              Ce mois = <strong>{cal.stats.workDaysCost}</strong> jour{cal.stats.workDaysCost !== 1 ? "s" : ""} de travail
            </span>
          )}
        </div>

        {/* KPIs */}
        <KpiCards stats={cal.stats} />

        {/* Insights */}
        <InsightsBar insights={cal.stats.insights} />

        {/* Calendar grid */}
        <div className="bg-white rounded-2xl border border-[#E6E6E4] p-3 shadow-sm">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-[#AAA] uppercase tracking-wider py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="space-y-1">
            {cal.weeks.map((week, i) => (
              <WeekRow
                key={i}
                week={week}
                weekIndex={i}
                selectedDay={cal.selectedDay}
                onSelectDay={cal.selectDay}
                onSelectSub={cal.selectSubscription}
              />
            ))}
          </div>
        </div>

        {/* Empty month state */}
        {cal.stats.chargeCount === 0 && (
          <div className="text-center py-8 text-[#AAA]">
            <CalendarIcon size={24} className="mx-auto mb-2 text-[#DDD]" />
            <p className="text-[13px]">Aucun prélèvement ce mois-ci</p>
          </div>
        )}
      </div>

      {/* Sidebar (desktop only) */}
      <div className="hidden lg:block w-[320px] flex-shrink-0">
        <div className="sticky top-6">
          <AnimatePresence mode="wait">
            {cal.selectedSubscription ? (
              <SubDetailSidebar
                key={`sub-${cal.selectedSubscription.id}`}
                sub={cal.selectedSubscription}
                onBack={() => cal.selectSubscription(null)}
                onClose={cal.clearSelection}
              />
            ) : cal.selectedDay ? (
              <DaySidebar
                key={`day-${cal.selectedDay.date.toISOString()}`}
                day={cal.selectedDay}
                onSelectSub={cal.selectSubscription}
                onClose={cal.clearSelection}
              />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl border border-[#E6E6E4] p-8 text-center"
              >
                <CalendarIcon size={28} className="mx-auto mb-3 text-[#DDD]" />
                <p className="text-[13px] text-[#AAA]">Cliquez sur un jour pour voir les détails</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
