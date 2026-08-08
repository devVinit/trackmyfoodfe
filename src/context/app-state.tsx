import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import * as authApi from '@/api/auth';
import { ApiError } from '@/api/auth';
import * as bcaApi from '@/api/bca';
import * as foodLogsApi from '@/api/food-logs';
import { clearTokens, loadTokens } from '@/api/token-storage';
import * as usersApi from '@/api/users';

export type Gender = 'male' | 'female';
export type Meal = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
export type GoalsSource = 'calc' | 'bca';
export type HealthProvider = 'apple' | 'google';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very';

/** TDEE multipliers applied to BMR, keyed by activity level. */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
};

export type UserProfile = {
  name: string;
  age: string;
  height: string;
  weight: string;
  gender: Gender;
  activity: ActivityLevel;
};

export type Goals = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
};

export type LogEntry = {
  id: string;
  name: string;
  time: string;
  meal: Meal;
  cal: number;
  p: number;
  f: number;
  c: number;
  fi: number;
  gradient: readonly [string, string];
  /** Presigned S3 URL of the logged photo, if any — null falls back to the gradient thumbnail. */
  photoUrl: string | null;
};

/** Fields needed to log a new entry — `photoKey` comes from a prior scanFoodPhoto() call. */
export type NewLogEntry = {
  name: string;
  time: string;
  meal: Meal;
  cal: number;
  p: number;
  f: number;
  c: number;
  fi: number;
  photoKey?: string;
};

export type HistoryDay = {
  /** Display label, e.g. "Fri, Jul 11". */
  date: string;
  /** ISO `YYYY-MM-DD`, used to fetch that day's entries. */
  isoDate: string;
  cal: number;
  p: number;
  f: number;
  c: number;
  fi: number;
};

export type BcaReport = {
  id: number;
  date: string;
  weight: string;
  fat: string;
  muscle: string;
  bmr: string;
};

const GRADIENTS = {
  breakfast: ['#EFC98A', '#D9A45B'] as const,
  lunch: ['#B7C68B', '#8A9A4B'] as const,
  snack: ['#E8A08A', '#C05B45'] as const,
  dinner: ['#EF8340', '#D9631C'] as const,
};

function mealGradient(meal: Meal): readonly [string, string] {
  switch (meal) {
    case 'Breakfast':
      return GRADIENTS.breakfast;
    case 'Lunch':
      return GRADIENTS.lunch;
    case 'Snack':
      return GRADIENTS.snack;
    case 'Dinner':
      return GRADIENTS.dinner;
  }
}

function mealToApi(meal: Meal): foodLogsApi.MealTypeApi {
  return meal.toLowerCase() as foodLogsApi.MealTypeApi;
}

function mealFromApi(meal: foodLogsApi.MealTypeApi): Meal {
  return (meal.charAt(0).toUpperCase() + meal.slice(1)) as Meal;
}

const INITIAL_USER: UserProfile = { name: '', age: '', height: '', weight: '', gender: 'male', activity: 'light' };

const INITIAL_GOALS: Goals = { calories: 2000, protein: 150, fat: 65, carbs: 200, fiber: 30 };

function profileFromApi(p: usersApi.UserProfileApi): UserProfile {
  return {
    name: p.name ?? '',
    age: p.age != null ? String(p.age) : '',
    height: p.height_cm != null ? String(p.height_cm) : '',
    weight: p.weight_kg != null ? String(p.weight_kg) : '',
    gender: p.gender ?? 'male',
    activity: p.activity_level ?? 'light',
  };
}

export function goalsFromApi(g: { calories: number; protein_g: number; fat_g: number; carbs_g: number; fiber_g: number }): Goals {
  return { calories: g.calories, protein: g.protein_g, fat: g.fat_g, carbs: g.carbs_g, fiber: g.fiber_g };
}

function logEntryFromApi(e: foodLogsApi.FoodLogEntryApi): LogEntry {
  const meal = mealFromApi(e.meal_type);
  return {
    id: String(e.id),
    name: e.name,
    time: new Date(e.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    meal,
    cal: e.calories,
    p: e.protein_g,
    f: e.fat_g,
    c: e.carbs_g,
    fi: e.fiber_g,
    gradient: mealGradient(meal),
    photoUrl: e.photo_url,
  };
}

function historyDayFromApi(d: foodLogsApi.DailyTotalApi): HistoryDay {
  // log_date is a plain YYYY-MM-DD string — parse it as local, not UTC
  // midnight, so the display label doesn't roll back a day near midnight.
  const [y, m, day] = d.log_date.split('-').map(Number);
  const dateObj = new Date(y, m - 1, day);
  return {
    date: dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    isoDate: d.log_date,
    cal: d.calories,
    p: d.protein_g,
    f: d.fat_g,
    c: d.carbs_g,
    fi: d.fiber_g,
  };
}

function formatReportDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

export function reportFromApi(r: bcaApi.BcaReportListItem): BcaReport {
  return {
    id: r.id,
    date: formatReportDate(r.report_date),
    weight: String(r.weight_kg),
    fat: r.body_fat_pct.toFixed(1),
    muscle: r.muscle_mass_kg.toFixed(1),
    bmr: r.bmr_kcal.toLocaleString('en-US'),
  };
}

export function calcGoals(user: UserProfile): Goals {
  const w = parseFloat(user.weight) || 70;
  const h = parseFloat(user.height) || 175;
  const a = parseFloat(user.age) || 28;
  const bmr = user.gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
  const tdee = Math.round((bmr * ACTIVITY_FACTORS[user.activity]) / 10) * 10;
  return {
    calories: tdee,
    protein: Math.round((tdee * 0.3) / 4),
    fat: Math.round((tdee * 0.25) / 9),
    carbs: Math.round((tdee * 0.4) / 4),
    fiber: user.gender === 'male' ? 30 : 25,
  };
}

type AppState = {
  /** False until the persisted session has been restored on app launch. */
  authReady: boolean;
  isSignedIn: boolean;
  /** Signed-in user's account (id/email) from the backend, once known. */
  account: authApi.AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, confirmPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  /** Persists which onboarding screen the user has reached, so a later sign-in resumes here. */
  advanceOnboarding: (step: number) => Promise<void>;
  /** Marks onboarding as finished — future sign-ins land on the home tab. */
  finishOnboarding: () => Promise<void>;

  user: UserProfile;
  updateUser: (patch: Partial<UserProfile>) => void;
  /** Persists the current `user` fields to the backend. Throws on failure. */
  saveProfile: () => Promise<void>;

  goals: Goals;
  goalsSource: GoalsSource;
  setGoals: (goals: Goals) => void;
  /** Persists the current `goals` fields to the backend. Throws on failure. */
  saveGoals: () => Promise<void>;
  applyCalculatedGoals: () => Promise<void>;
  applyBcaGoals: (goals: Goals) => void;

  healthProvider: HealthProvider | null;
  setHealthProvider: (p: HealthProvider | null) => void;

  todayLog: LogEntry[];
  addLogEntry: (entry: NewLogEntry) => Promise<void>;
  removeLogEntry: (id: string) => Promise<void>;
  /** Re-fetches today's log from the backend — call on screen focus so a
   * change made elsewhere (e.g. the scan modal) is reflected immediately. */
  refreshTodayLog: () => Promise<void>;

  history: HistoryDay[];
  loadDayEntries: (isoDate: string) => Promise<LogEntry[]>;

  reports: BcaReport[];
  addReport: (report: BcaReport) => void;
  reanalysingIndex: number | null;
  reanalyseReport: (index: number) => Promise<void>;

  toast: string;
  showToast: (msg: string) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [account, setAccount] = useState<authApi.AuthUser | null>(null);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [goals, setGoalsState] = useState<Goals>(INITIAL_GOALS);
  const [goalsSource, setGoalsSource] = useState<GoalsSource>('calc');
  const [healthProvider, setHealthProvider] = useState<HealthProvider | null>(null);
  const [todayLog, setTodayLog] = useState<LogEntry[]>([]);
  const [history, setHistory] = useState<HistoryDay[]>([]);
  const [reports, setReports] = useState<BcaReport[]>([]);
  const [reanalysingIndex, setReanalysingIndex] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(''), 1900);
  }, []);

  const updateUser = useCallback((patch: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...patch }));
  }, []);

  const setGoals = useCallback((next: Goals) => setGoalsState(next), []);

  // Loads everything the home/history/profile tabs need. Best-effort: on
  // failure the screens just keep showing defaults/empty state rather than
  // blocking navigation — the user can retry by reopening the tab.
  const loadUserData = useCallback(async () => {
    try {
      const [profile, goalsRes, logs, totals, reportsRes] = await Promise.all([
        usersApi.getProfile(),
        usersApi.getGoals(),
        foodLogsApi.listFoodLogs(),
        foodLogsApi.getDailyTotals(30),
        bcaApi.listBcaReports(),
      ]);
      setUser(profileFromApi(profile));
      setGoalsState(goalsFromApi(goalsRes));
      setGoalsSource(goalsRes.goals_source);
      setTodayLog(logs.map(logEntryFromApi));
      setHistory(totals.map(historyDayFromApi));
      setReports(reportsRes.map(reportFromApi));
    } catch {
      // See comment above.
    }
  }, []);

  const saveProfile = useCallback(async () => {
    const updated = await usersApi.updateProfile({
      name: user.name || null,
      age: user.age ? parseInt(user.age, 10) : null,
      height_cm: user.height ? parseFloat(user.height) : null,
      weight_kg: user.weight ? parseFloat(user.weight) : null,
      gender: user.gender,
      activity_level: user.activity,
    });
    setUser(profileFromApi(updated));
  }, [user]);

  const saveGoals = useCallback(async () => {
    const updated = await usersApi.updateGoals({
      calories: goals.calories,
      protein_g: goals.protein,
      fat_g: goals.fat,
      carbs_g: goals.carbs,
      fiber_g: goals.fiber,
    });
    setGoalsState(goalsFromApi(updated));
    setGoalsSource(updated.goals_source);
  }, [goals]);

  const applyCalculatedGoals = useCallback(async () => {
    const next = calcGoals(user);
    setGoalsSource('calc');
    setGoalsState(next);
    try {
      const updated = await usersApi.updateGoals({
        calories: next.calories,
        protein_g: next.protein,
        fat_g: next.fat,
        carbs_g: next.carbs,
        fiber_g: next.fiber,
      });
      setGoalsState(goalsFromApi(updated));
      setGoalsSource(updated.goals_source);
    } catch {
      // Best-effort — the locally calculated goals still apply this session;
      // a later save/reload will retry persisting them.
    }
  }, [user]);

  const applyBcaGoals = useCallback((next: Goals) => {
    // The /bca-reports/scan call already persisted these goals server-side —
    // this just syncs local state to match.
    setGoalsSource('bca');
    setGoalsState(next);
  }, []);

  const addLogEntry = useCallback(
    async (entry: NewLogEntry) => {
      try {
        const created = await foodLogsApi.createFoodLog({
          name: entry.name,
          meal_type: mealToApi(entry.meal),
          calories: entry.cal,
          protein_g: entry.p,
          fat_g: entry.f,
          carbs_g: entry.c,
          fiber_g: entry.fi,
          photo_key: entry.photoKey,
        });
        setTodayLog((prev) => [...prev, logEntryFromApi(created)]);
      } catch (err) {
        showToast(err instanceof ApiError ? err.message : 'Could not save log entry');
        throw err;
      }
    },
    [showToast],
  );

  const removeLogEntry = useCallback(
    async (id: string) => {
      try {
        await foodLogsApi.deleteFoodLog(Number(id));
        setTodayLog((prev) => prev.filter((e) => e.id !== id));
      } catch (err) {
        showToast(err instanceof ApiError ? err.message : 'Could not remove entry');
        throw err;
      }
    },
    [showToast],
  );

  const loadDayEntries = useCallback(async (isoDate: string) => {
    const entries = await foodLogsApi.listFoodLogs(isoDate);
    return entries.map(logEntryFromApi);
  }, []);

  const refreshTodayLog = useCallback(async () => {
    try {
      const entries = await foodLogsApi.listFoodLogs();
      setTodayLog(entries.map(logEntryFromApi));
    } catch {
      // Best-effort — keep showing whatever's already in state.
    }
  }, []);

  const addReport = useCallback((report: BcaReport) => {
    setReports((prev) => [report, ...prev]);
  }, []);

  const reanalyseReport = useCallback(
    async (index: number) => {
      const report = reports[index];
      if (!report || reanalysingIndex !== null) return;
      setReanalysingIndex(index);
      try {
        const result = await bcaApi.reanalyseBcaReport(report.id);
        setReports((prev) => {
          const next = prev.slice();
          next[index] = reportFromApi(result.report);
          return next;
        });
        setGoalsState(goalsFromApi(result.goals));
        setGoalsSource('bca');
        showToast('Report re-analysed by AI');
      } catch (err) {
        showToast(err instanceof ApiError ? err.message : 'Could not re-analyse report');
      } finally {
        setReanalysingIndex(null);
      }
    },
    [reports, reanalysingIndex, showToast],
  );

  // Restore a persisted session on launch: if tokens exist, validate them
  // against the backend before treating the user as signed in.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tokens = await loadTokens();
        if (!tokens) return;
        const acct = await authApi.me();
        if (!cancelled) {
          setAccount(acct);
          setIsSignedIn(true);
          void loadUserData();
        }
      } catch {
        await clearTokens();
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadUserData]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await authApi.signin(email, password);
      const acct = await authApi.me();
      setAccount(acct);
      setIsSignedIn(true);
      void loadUserData();
    },
    [loadUserData],
  );

  const signUp = useCallback(
    async (email: string, password: string, confirmPassword: string) => {
      await authApi.signup(email, password, confirmPassword);
      const acct = await authApi.me();
      setAccount(acct);
      setIsSignedIn(true);
      void loadUserData();
    },
    [loadUserData],
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    await authApi.forgotPassword(email);
  }, []);

  // Best-effort: a failed write here just means a later sign-in resumes a
  // step earlier than expected, which is safe, so navigation never blocks on it.
  const advanceOnboarding = useCallback(async (step: number) => {
    try {
      await usersApi.setOnboardingStep(step);
      setAccount((prev) => (prev ? { ...prev, onboarding_step: step } : prev));
    } catch {
      // Ignored — see comment above.
    }
  }, []);

  const finishOnboarding = useCallback(async () => {
    try {
      await usersApi.completeOnboarding();
      setAccount((prev) => (prev ? { ...prev, is_onboarded: true } : prev));
    } catch {
      // Ignored — see comment above.
    }
  }, []);

  const resetLocalState = useCallback(() => {
    setAccount(null);
    setIsSignedIn(false);
    setUser(INITIAL_USER);
    setGoalsState(INITIAL_GOALS);
    setGoalsSource('calc');
    setTodayLog([]);
    setHistory([]);
    setReports([]);
    setHealthProvider(null);
  }, []);

  const logout = useCallback(() => {
    void clearTokens();
    resetLocalState();
  }, [resetLocalState]);

  const deleteAccount = useCallback(async () => {
    try {
      await usersApi.deleteAccount();
    } catch {
      // Best-effort — the local session is cleared below regardless, so the
      // user is signed out even if the server call failed transiently.
    }
    await clearTokens();
    resetLocalState();
  }, [resetLocalState]);

  const value = useMemo<AppState>(
    () => ({
      authReady,
      isSignedIn,
      account,
      signIn,
      signUp,
      requestPasswordReset,
      logout,
      deleteAccount,
      advanceOnboarding,
      finishOnboarding,
      user,
      updateUser,
      saveProfile,
      goals,
      goalsSource,
      setGoals,
      saveGoals,
      applyCalculatedGoals,
      applyBcaGoals,
      healthProvider,
      setHealthProvider,
      todayLog,
      addLogEntry,
      removeLogEntry,
      refreshTodayLog,
      history,
      loadDayEntries,
      reports,
      addReport,
      reanalysingIndex,
      reanalyseReport,
      toast,
      showToast,
    }),
    [
      authReady,
      isSignedIn,
      account,
      signIn,
      signUp,
      requestPasswordReset,
      logout,
      deleteAccount,
      advanceOnboarding,
      finishOnboarding,
      user,
      updateUser,
      saveProfile,
      goals,
      goalsSource,
      setGoals,
      saveGoals,
      applyCalculatedGoals,
      applyBcaGoals,
      healthProvider,
      todayLog,
      addLogEntry,
      removeLogEntry,
      refreshTodayLog,
      history,
      loadDayEntries,
      reports,
      addReport,
      reanalysingIndex,
      reanalyseReport,
      toast,
      showToast,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
