export { GuideProvider, useGuide } from "./engine/guide-engine";
export { default as GuideRoot } from "./ui/GuideRoot";
export { default as GuideOverlay } from "./ui/GuideOverlay";
export { CHAPTERS } from "./model/guide.chapters";
export { useAccountState } from "./model/guide.account-state";
export { ensureStepContext, routeMatch, buildPath, waitForElement } from "./engine/step-guard";
export type { GuardOutcome, WaitResult } from "./engine/step-guard";
export { default as MissionSuccessModal } from "./ui/MissionSuccessModal";
export { default as GuideDebugPanel } from "./ui/GuideDebugPanel";
export { default as GuideBridge } from "./missions/GuideBridge";
export { runValidator, missionValidators } from "./missions/validators";
export {
  buildContext,
  canStartChapter,
  findFirstValidChapter,
  resolveRedirectChapter,
  CHAPTER_PREREQUISITES,
} from "./missions/prerequisites";
export type { OnboardingContext } from "./missions/prerequisites";
export {
  getFrustrationScore,
  isUserFrustrated,
  getFrustrationState,
  resetFrustration,
} from "./missions/frustration";
export {
  getGuideExperienceMode,
  getStepCopy,
  getAdaptiveHintDelay,
  shouldShortenEducational,
  STEP_COPY_VARIANTS,
} from "./missions/adaptive";
export type { GuideExperienceMode, AdaptiveCopy } from "./missions/adaptive";
export type {
  GuideStep, GuideChapter, GuideState, AccountState,
  StepKind, Placement, Tone, PreAction, CompleteRule, EngineStatus,
} from "./model/guide.types";
