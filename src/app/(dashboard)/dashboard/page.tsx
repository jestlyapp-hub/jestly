"use client";

import { motion } from "framer-motion";
import StatCard from "@/components/ui/StatCard";
import BadgeStatus from "@/components/ui/BadgeStatus";
import TodayFocus from "@/components/dashboard/TodayFocus";
import UpcomingDeadlines from "@/components/dashboard/UpcomingDeadlines";
import WorkloadSnapshot from "@/components/dashboard/WorkloadSnapshot";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import NotificationPanel from "@/components/dashboard/NotificationPanel";
import type { OrderStatus } from "@/types";
import { useApi } from "@/lib/hooks/use-api";

interface DashboardStats {
  totalRevenue: number;
  ordersCount: number;
  pendingOrders: number;
  clientsCount: number;
  activeProductsCount: number;
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentOrders: any[];
}

const emptyStats: DashboardStats = {
  totalRevenue: 0,
  ordersCount: 0,
  pendingOrders: 0,
  clientsCount: 0,
  activeProductsCount: 0,
  monthlyRevenue: [],
  recentOrders: [],
};

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const, delay: i * 0.06 },
  }),
};

const sectionFade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const, delay: 0.3 + i * 0.1 },
  }),
};

export default function DashboardPage() {
  const { data: apiStats, loading, error, mutate } = useApi<DashboardStats>("/api/dashboard/stats");
  const stats = apiStats || (loading ? null : emptyStats);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="h-8 w-48 bg-[#F7F7F5] rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E6E6E4] p-5 h-24 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
          <div className="lg:col-span-3 bg-white rounded-xl border border-[#E6E6E4] p-4 h-64 animate-pulse" />
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E6E6E4] p-4 h-64 animate-pulse" />
        </div>
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-4 h-64 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center">
        <p className="text-[14px] text-red-500 mb-2">Erreur : {error}</p>
        <button onClick={mutate} className="text-[13px] text-[#4F46E5] hover:underline cursor-pointer">Reessayer</button>
      </div>
    );
  }

  const statCards = [
    { label: "Revenu total", value: `${stats?.totalRevenue?.toLocaleString("fr-FR") ?? 0} EUR`, change: `${stats?.ordersCount ?? 0} commandes`, positive: true },
    { label: "Commandes en attente", value: String(stats?.pendingOrders ?? 0), change: "a traiter", positive: true },
    { label: "Clients", value: String(stats?.clientsCount ?? 0), change: "actifs", positive: true },
    { label: "Produits actifs", value: String(stats?.activeProductsCount ?? 0), change: "en ligne", positive: true },
  ];

  const recentOrders = stats?.recentOrders?.slice(0, 5) || [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Greeting + Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Dashboard</h1>
          <p className="text-[14px] text-[#999] mt-1">
            Voici un apercu de votre activite.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationPanel />
          <QuickActions />
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            variants={fadeIn}
            custom={i}
            initial="hidden"
            animate="visible"
          >
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Row 1: TodayFocus + UpcomingDeadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
        <motion.div
          className="lg:col-span-3"
          variants={sectionFade}
          custom={0}
          initial="hidden"
          animate="visible"
        >
          <TodayFocus />
        </motion.div>
        <motion.div
          className="lg:col-span-2"
          variants={sectionFade}
          custom={1}
          initial="hidden"
          animate="visible"
        >
          <UpcomingDeadlines />
        </motion.div>
      </div>

      {/* Row 2: WorkloadSnapshot + ActivityFeed */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
        <motion.div
          className="lg:col-span-2"
          variants={sectionFade}
          custom={2}
          initial="hidden"
          animate="visible"
        >
          <WorkloadSnapshot stats={stats ? { pendingOrders: stats.pendingOrders, clientsCount: stats.clientsCount } : undefined} />
        </motion.div>
        <motion.div
          className="lg:col-span-3"
          variants={sectionFade}
          custom={3}
          initial="hidden"
          animate="visible"
        >
          <ActivityFeed />
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        className="bg-white rounded-xl border border-[#E6E6E4]"
        variants={sectionFade}
        custom={4}
        initial="hidden"
        animate="visible"
      >
        <div className="px-5 py-4 border-b border-[#E6E6E4] flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[#1A1A1A]">
            Commandes recentes
          </h2>
          <a
            href="/commandes"
            className="text-[12px] font-medium text-[#4F46E5] hover:underline"
          >
            Tout voir
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EFEFEF]">
                <th className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-5 py-3">Client</th>
                <th className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-5 py-3">Produit</th>
                <th className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-5 py-3">Prix</th>
                <th className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-5 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: { id: string; title: string; amount: number; status: string; clients?: { name: string } }) => (
                <tr
                  key={order.id}
                  className="border-b border-[#F8F8FA] last:border-b-0 hover:bg-[#FBFBFA] transition-colors"
                >
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#1A1A1A] max-w-[200px] truncate">
                    {order.clients?.name ?? "\u2014"}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#666] max-w-[200px] truncate">
                    {order.title || "\u2014"}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#1A1A1A]">
                    {order.amount} &euro;
                  </td>
                  <td className="px-5 py-3.5">
                    <BadgeStatus status={order.status as OrderStatus} />
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-[14px] text-[#BBB]">
                    Aucune commande pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
