"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface SnapshotItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  alert?: boolean;
  href: string;
}

interface WorkloadSnapshotProps {
  pendingOrders: number;
  activeTasks: number;       // inProgressOrders from dashboard stats
  pendingInvoices: number;   // pendingOrders (no separate invoice count in API yet)
  clientsCount: number;
  weekEvents: number;        // computed from calendarData week days
  overdueItems: number;      // overdueOrders from dashboard stats
}

function getSnapshotItems(props: WorkloadSnapshotProps): SnapshotItem[] {
  return [
    {
      label: "Commandes en cours",
      value: props.pendingOrders,
      href: "/commandes",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
        </svg>
      ),
    },
    {
      label: "Taches actives",
      value: props.activeTasks,
      href: "/taches",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Factures en attente",
      value: props.pendingInvoices,
      href: "/facturation",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      label: "Clients actifs",
      value: props.clientsCount,
      href: "/clients",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      label: "Événements cette semaine",
      value: props.weekEvents,
      href: "/calendrier",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
    {
      label: "Elements en retard",
      value: props.overdueItems,
      alert: props.overdueItems > 0,
      href: "/taches",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
    },
  ];
}

export default function WorkloadSnapshot(props: WorkloadSnapshotProps) {
  const items = getSnapshotItems(props);

  return (
    <div className="bg-white rounded-xl border border-[#E6E6E4]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E6E6E4]">
        <h2 className="text-[14px] font-semibold text-[#1A1A1A]">Vue d&apos;ensemble</h2>
      </div>

      {/* Grid */}
      <div className="p-5 grid grid-cols-2 gap-3">
        {items.map((item, i) => (
          <Link key={item.label} href={item.href}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className={`p-3.5 rounded-lg border transition-colors cursor-pointer ${
                item.alert
                  ? "border-red-200 bg-red-50/50 hover:bg-red-50"
                  : "border-[#EFEFEF] bg-[#FBFBFA] hover:bg-[#F7F7F5]"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={item.alert ? "text-red-500" : "text-[#999]"}>{item.icon}</span>
                <span className="text-[11px] text-[#999] leading-tight">{item.label}</span>
              </div>
              <div className={`text-[18px] font-bold ${item.alert ? "text-red-500" : "text-[#1A1A1A]"}`}>
                {item.value}
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
