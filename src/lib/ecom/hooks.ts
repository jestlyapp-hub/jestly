"use client";

import { useState, useCallback, useMemo } from "react";
import type { EcomStage, EcomProgress, EcomBadge, EcomHealthScore } from "./types";
import { ECOM_LEVELS } from "./types";
import { ECOM_STAGES, ECOM_BADGES } from "./data";

function computeLevel(xp: number) {
  let level = ECOM_LEVELS[0];
  for (const l of ECOM_LEVELS) {
    if (xp >= l.minXp) level = l;
    else break;
  }
  const nextLevel = ECOM_LEVELS.find((l) => l.minXp > xp);
  const xpToNext = nextLevel ? nextLevel.minXp - xp : 0;
  const xpInLevel = xp - level.minXp;
  const xpLevelRange = nextLevel ? nextLevel.minXp - level.minXp : 1;
  return { level, xpToNext, xpInLevel, xpLevelRange };
}

function computeBusinessHealth(stages: EcomStage[]): EcomHealthScore[] {
  const s1 = stages[0];
  const s2 = stages[1];
  const s3 = stages[2];
  const s4 = stages[3];
  const s5 = stages[4];

  const s1Done = s1.tasks.filter((t) => t.completed).length;
  const s1Total = s1.tasks.length;
  const nicheVal = Math.round((s1Done / s1Total) * 100);

  const s2Done = s2.tasks.filter((t) => t.completed).length;
  const s2Total = s2.tasks.length;
  const storeVal = Math.round((s2Done / s2Total) * 100);

  const s3Done = s3.tasks.filter((t) => t.completed).length;
  const s3Total = s3.tasks.length;
  const adsVal = Math.round((s3Done / s3Total) * 100);

  const s4Done = s4.tasks.filter((t) => t.completed).length;
  const s5Done = s5.tasks.filter((t) => t.completed).length;
  const scalingVal = Math.round(((s4Done + s5Done) / (s4.tasks.length + s5.tasks.length)) * 100);

  const allChecklists = stages.flatMap((s) => s.checklists);
  const allItems = allChecklists.flatMap((c) => c.items);
  const checkedItems = allItems.filter((i) => i.checked).length;
  const opsVal = allItems.length > 0 ? Math.round((checkedItems / allItems.length) * 100) : 0;

  function status(v: number): "critique" | "fragile" | "correct" | "solide" {
    if (v < 20) return "critique";
    if (v < 50) return "fragile";
    if (v < 80) return "correct";
    return "solide";
  }

  return [
    {
      id: "niche",
      label: "Confiance niche",
      value: nicheVal,
      max: 100,
      status: status(nicheVal),
      explanation: nicheVal < 50 ? "Votre niche n'est pas encore suffisamment validée" : "Bonne validation de niche en cours",
      nextMove: s1.validation?.validated ? "Niche validée ✓" : "Finaliser la validation niche",
    },
    {
      id: "store",
      label: "Store readiness",
      value: storeVal,
      max: 100,
      status: status(storeVal),
      explanation: storeVal < 50 ? "Votre boutique n'est pas encore prête au lancement" : "Boutique en bonne progression",
      nextMove: storeVal === 0 ? "Commencer la création de boutique" : "Continuer l'optimisation boutique",
    },
    {
      id: "ads",
      label: "Ads readiness",
      value: adsVal,
      max: 100,
      status: status(adsVal),
      explanation: adsVal === 0 ? "Aucune préparation publicitaire" : "Configuration publicitaire en cours",
      nextMove: adsVal === 0 ? "Valider la boutique d'abord" : "Configurer le tracking",
    },
    {
      id: "scaling",
      label: "Scaling readiness",
      value: scalingVal,
      max: 100,
      status: status(scalingVal),
      explanation: scalingVal === 0 ? "Phase de scaling non démarrée" : "Préparation au scaling en cours",
      nextMove: scalingVal === 0 ? "Maîtriser les Ads d'abord" : "Diversifier les canaux",
    },
    {
      id: "ops",
      label: "Ops maturity",
      value: opsVal,
      max: 100,
      status: status(opsVal),
      explanation: opsVal < 30 ? "Processus opérationnels à construire" : "Opérations en progression",
      nextMove: opsVal < 30 ? "Compléter les checklists en cours" : "Automatiser les processus clés",
    },
  ];
}

export function useEcom() {
  const [stages, setStages] = useState<EcomStage[]>(ECOM_STAGES);
  const [badges, setBadges] = useState<EcomBadge[]>(ECOM_BADGES);
  const [selectedStageId, setSelectedStageId] = useState<string>("s1");
  const [streak] = useState(7);

  // ── Derived state ──

  const xp = useMemo(
    () =>
      stages.reduce(
        (acc, s) =>
          acc + s.tasks.filter((t) => t.completed).reduce((a, t) => a + t.xp, 0) +
          s.modules.filter((m) => m.completed).reduce((a, m) => a + m.xp, 0),
        0
      ),
    [stages]
  );

  const { level, xpToNext, xpInLevel, xpLevelRange } = useMemo(() => computeLevel(xp), [xp]);

  const totalTasks = useMemo(() => stages.reduce((a, s) => a + s.tasks.length, 0), [stages]);
  const completedTasks = useMemo(
    () => stages.reduce((a, s) => a + s.tasks.filter((t) => t.completed).length, 0),
    [stages]
  );
  const totalModules = useMemo(() => stages.reduce((a, s) => a + s.modules.length, 0), [stages]);
  const completedModules = useMemo(
    () => stages.reduce((a, s) => a + s.modules.filter((m) => m.completed).length, 0),
    [stages]
  );
  const completedStages = useMemo(
    () => stages.filter((s) => s.status === "completed" || s.status === "validated").length,
    [stages]
  );

  const percentage = useMemo(
    () => (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0),
    [completedTasks, totalTasks]
  );

  const currentStage = useMemo(
    () =>
      stages.find(
        (s) => s.status === "in_progress" || s.status === "pending_validation"
      ) || stages.find((s) => s.status === "available") || stages[0],
    [stages]
  );

  const nextAction = useMemo(() => {
    const stage = currentStage;
    const task = stage.tasks.find((t) => !t.completed);
    if (!task) return null;
    const reason =
      task.priority === "validation"
        ? "Cette validation débloque l'étape suivante"
        : task.priority === "blocking"
          ? "Cette tâche est bloquante pour la suite"
          : "Prochaine tâche dans votre progression";
    return { stageTitle: stage.title, task: task.title, reason, xp: task.xp, unlocks: task.unlocks };
  }, [currentStage]);

  const actionsToNextStage = useMemo(() => {
    return currentStage.tasks.filter((t) => !t.completed).length;
  }, [currentStage]);

  const nextStageName = useMemo(() => {
    const idx = stages.findIndex((s) => s.id === currentStage.id);
    return idx < stages.length - 1 ? stages[idx + 1].title : "Objectif atteint";
  }, [stages, currentStage]);

  const estimatedTimeLeft = useMemo(() => {
    const remaining = stages.filter(
      (s) => s.status !== "completed" && s.status !== "validated"
    );
    if (remaining.length === 0) return "Terminé";
    if (remaining.length <= 2) return "2-4 semaines";
    return "6-12 semaines";
  }, [stages]);

  const estimatedDaysLeft = useMemo(() => {
    const remaining = stages.filter(
      (s) => s.status !== "completed" && s.status !== "validated"
    );
    if (remaining.length === 0) return 0;
    if (remaining.length <= 1) return 7;
    if (remaining.length <= 2) return 21;
    if (remaining.length <= 3) return 42;
    return 60;
  }, [stages]);

  const selectedStage = useMemo(
    () => stages.find((s) => s.id === selectedStageId) || stages[0],
    [stages, selectedStageId]
  );

  const businessHealth = useMemo(() => computeBusinessHealth(stages), [stages]);

  const globalReadiness = useMemo(() => {
    const avg = businessHealth.reduce((a, h) => a + h.value, 0) / businessHealth.length;
    return Math.round(avg);
  }, [businessHealth]);

  const progress: EcomProgress = useMemo(
    () => ({
      level,
      xp,
      xpToNext,
      xpInLevel,
      xpLevelRange,
      streak,
      completedTasks,
      totalTasks,
      completedModules,
      totalModules,
      completedStages,
      totalStages: stages.length,
      percentage,
      estimatedTimeLeft,
      estimatedDaysLeft,
      currentStageId: currentStage.id,
      nextAction,
      actionsToNextStage,
      nextStageName,
      businessHealth,
      globalReadiness,
    }),
    [
      level, xp, xpToNext, xpInLevel, xpLevelRange, streak, completedTasks, totalTasks,
      completedModules, totalModules, completedStages, stages.length,
      percentage, estimatedTimeLeft, estimatedDaysLeft, currentStage.id, nextAction,
      actionsToNextStage, nextStageName, businessHealth, globalReadiness,
    ]
  );

  // ── Actions ──

  const toggleTask = useCallback((stageId: string, taskId: string) => {
    setStages((prev) =>
      prev.map((s) => {
        if (s.id !== stageId) return s;
        return {
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ),
        };
      })
    );
  }, []);

  const toggleModule = useCallback((stageId: string, moduleId: string) => {
    setStages((prev) =>
      prev.map((s) => {
        if (s.id !== stageId) return s;
        return {
          ...s,
          modules: s.modules.map((m) =>
            m.id === moduleId ? { ...m, completed: !m.completed } : m
          ),
        };
      })
    );
  }, []);

  const toggleChecklistItem = useCallback(
    (stageId: string, checklistIdx: number, itemIdx: number) => {
      setStages((prev) =>
        prev.map((s) => {
          if (s.id !== stageId) return s;
          const newChecklists = s.checklists.map((cl, ci) => {
            if (ci !== checklistIdx) return cl;
            return {
              ...cl,
              items: cl.items.map((item, ii) =>
                ii === itemIdx ? { ...item, checked: !item.checked } : item
              ),
            };
          });
          return { ...s, checklists: newChecklists };
        })
      );
    },
    []
  );

  const updateNotes = useCallback((stageId: string, notes: string) => {
    setStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, notes } : s))
    );
  }, []);

  const validateStage = useCallback((stageId: string) => {
    setStages((prev) =>
      prev.map((s) => {
        if (s.id !== stageId || !s.validation) return s;
        return {
          ...s,
          validation: { ...s.validation, validated: true },
          status: "validated",
        };
      })
    );
    // Unlock badge
    const stageIdx = stages.findIndex((s) => s.id === stageId);
    if (stageIdx >= 0 && stageIdx < badges.length) {
      setBadges((prev) =>
        prev.map((b, i) => (i === stageIdx + 1 ? { ...b, unlocked: true } : b))
      );
    }
  }, [stages, badges]);

  return {
    stages,
    badges,
    selectedStage,
    selectedStageId,
    setSelectedStageId,
    progress,
    toggleTask,
    toggleModule,
    toggleChecklistItem,
    updateNotes,
    validateStage,
  };
}
