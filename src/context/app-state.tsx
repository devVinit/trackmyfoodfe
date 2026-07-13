import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

export type Gender = 'male' | 'female';
export type Meal = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
export type GoalsSource = 'calc' | 'bca';
export type HealthProvider = 'apple' | 'google';

export type UserProfile = {
  name: string;
  age: string;
  height: string;
  weight: string;
  gender: Gender;
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
};

export type HistoryDay = {
  date: string;
  cal: number;
  p: number;
  f: number;
  c: number;
  fi: number;
};

export type BcaReport = {
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

const INITIAL_USER: UserProfile = { name: 'Alex Rivera', age: '28', height: '175', weight: '70', gender: 'male' };

const INITIAL_GOALS: Goals = { calories: 2280, protein: 171, fat: 63, carbs: 228, fiber: 30 };

const INITIAL_LOG: LogEntry[] = [
  { id: 'seed-1', name: 'Greek yogurt bowl', time: '8:12 AM', meal: 'Breakfast', cal: 320, p: 24, f: 9, c: 38, fi: 4, gradient: GRADIENTS.breakfast },
  { id: 'seed-2', name: 'Grilled chicken salad', time: '12:40 PM', meal: 'Lunch', cal: 465, p: 42, f: 18, c: 28, fi: 7, gradient: GRADIENTS.lunch },
  { id: 'seed-3', name: 'Apple & almonds', time: '3:30 PM', meal: 'Snack', cal: 210, p: 5, f: 11, c: 24, fi: 5, gradient: GRADIENTS.snack },
];

const MEAL_SETS: [string, Meal, string, number][][] = [
  [
    ['Oat & berry bowl', 'Breakfast', '8:05 AM', 0.2],
    ['Chicken burrito bowl', 'Lunch', '1:05 PM', 0.34],
    ['Trail mix', 'Snack', '4:10 PM', 0.12],
    ['Salmon & greens', 'Dinner', '7:45 PM', 0.34],
  ],
  [
    ['Veggie omelette', 'Breakfast', '8:40 AM', 0.24],
    ['Turkey sandwich', 'Lunch', '12:30 PM', 0.3],
    ['Greek yogurt', 'Snack', '3:20 PM', 0.1],
    ['Beef stir-fry', 'Dinner', '8:00 PM', 0.36],
  ],
  [
    ['Smoothie bowl', 'Breakfast', '7:55 AM', 0.22],
    ['Poke bowl', 'Lunch', '12:50 PM', 0.32],
    ['Apple & almonds', 'Snack', '4:00 PM', 0.12],
    ['Pasta primavera', 'Dinner', '7:30 PM', 0.34],
  ],
];

const INITIAL_HISTORY: HistoryDay[] = [
  { date: 'Fri, Jul 11', cal: 2140, p: 168, f: 61, c: 224, fi: 29 },
  { date: 'Thu, Jul 10', cal: 2410, p: 175, f: 71, c: 241, fi: 31 },
  { date: 'Wed, Jul 9', cal: 1985, p: 150, f: 55, c: 205, fi: 26 },
  { date: 'Tue, Jul 8', cal: 2255, p: 172, f: 62, c: 226, fi: 30 },
  { date: 'Mon, Jul 7', cal: 1760, p: 128, f: 48, c: 178, fi: 22 },
  { date: 'Sun, Jul 6', cal: 2295, p: 169, f: 66, c: 235, fi: 28 },
];

const INITIAL_REPORTS: BcaReport[] = [
  { date: 'Jun 02, 2026', weight: '70.4', fat: '18.2', muscle: '33.1', bmr: '1,655' },
  { date: 'Mar 15, 2026', weight: '72.8', fat: '20.6', muscle: '32.4', bmr: '1,640' },
];

export function historyDayMeals(day: HistoryDay, index: number) {
  const set = MEAL_SETS[index % MEAL_SETS.length];
  return set.map(([name, meal, time, ratio]) => ({
    name,
    meal,
    time,
    gradient: mealGradient(meal),
    cal: Math.round(day.cal * ratio),
    p: Math.round(day.p * ratio),
    f: Math.round(day.f * ratio),
    c: Math.round(day.c * ratio),
    fi: Math.round(day.fi * ratio),
  }));
}

export function calcGoals(user: UserProfile): Goals {
  const w = parseFloat(user.weight) || 70;
  const h = parseFloat(user.height) || 175;
  const a = parseFloat(user.age) || 28;
  const bmr = user.gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
  const tdee = Math.round((bmr * 1.375) / 10) * 10;
  return {
    calories: tdee,
    protein: Math.round((tdee * 0.3) / 4),
    fat: Math.round((tdee * 0.25) / 9),
    carbs: Math.round((tdee * 0.4) / 4),
    fiber: user.gender === 'male' ? 30 : 25,
  };
}

let idSeq = 0;
function nextId() {
  idSeq += 1;
  return `entry-${Date.now()}-${idSeq}`;
}

type AppState = {
  isSignedIn: boolean;
  signIn: () => void;
  signUp: () => void;
  completeAuthAsSignedIn: () => void;
  logout: () => void;
  deleteAccount: () => void;

  user: UserProfile;
  updateUser: (patch: Partial<UserProfile>) => void;

  goals: Goals;
  goalsSource: GoalsSource;
  setGoals: (goals: Goals) => void;
  applyCalculatedGoals: () => void;
  applyBcaGoals: () => void;

  healthProvider: HealthProvider | null;
  setHealthProvider: (p: HealthProvider | null) => void;

  todayLog: LogEntry[];
  addLogEntry: (entry: Omit<LogEntry, 'id' | 'gradient'>) => void;
  removeLogEntry: (id: string) => void;

  history: HistoryDay[];

  reports: BcaReport[];
  addReport: (report: BcaReport) => void;
  reanalysingIndex: number | null;
  reanalyseReport: (index: number) => void;

  toast: string;
  showToast: (msg: string) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [goals, setGoalsState] = useState<Goals>(INITIAL_GOALS);
  const [goalsSource, setGoalsSource] = useState<GoalsSource>('calc');
  const [healthProvider, setHealthProvider] = useState<HealthProvider | null>(null);
  const [todayLog, setTodayLog] = useState<LogEntry[]>(INITIAL_LOG);
  const [history] = useState<HistoryDay[]>(INITIAL_HISTORY);
  const [reports, setReports] = useState<BcaReport[]>(INITIAL_REPORTS);
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

  const applyCalculatedGoals = useCallback(() => {
    setGoalsSource('calc');
    setGoalsState((_) => calcGoals(user));
  }, [user]);

  const applyBcaGoals = useCallback(() => {
    setGoalsSource('bca');
    setGoalsState({ calories: 2150, protein: 165, fat: 60, carbs: 210, fiber: 32 });
  }, []);

  const addLogEntry = useCallback((entry: Omit<LogEntry, 'id' | 'gradient'>) => {
    setTodayLog((prev) => [...prev, { ...entry, id: nextId(), gradient: mealGradient(entry.meal) }]);
  }, []);

  const removeLogEntry = useCallback((id: string) => {
    setTodayLog((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addReport = useCallback((report: BcaReport) => {
    setReports((prev) => [report, ...prev]);
  }, []);

  const reanalyseReport = useCallback((index: number) => {
    setReanalysingIndex((current) => (current !== null ? current : index));
    setTimeout(() => {
      setReports((prev) => {
        const next = prev.slice();
        const r = next[index];
        if (r) {
          next[index] = {
            ...r,
            fat: (parseFloat(r.fat) - 0.2).toFixed(1),
            muscle: (parseFloat(r.muscle) + 0.1).toFixed(1),
          };
        }
        return next;
      });
      setReanalysingIndex(null);
      showToast('Report re-analysed by AI');
    }, 1800);
  }, [showToast]);

  const signIn = useCallback(() => setIsSignedIn(true), []);
  const signUp = useCallback(() => {}, []);
  const completeAuthAsSignedIn = useCallback(() => setIsSignedIn(true), []);
  const logout = useCallback(() => {
    setIsSignedIn(false);
  }, []);
  const deleteAccount = useCallback(() => {
    setIsSignedIn(false);
    setUser(INITIAL_USER);
    setGoalsState(INITIAL_GOALS);
    setTodayLog(INITIAL_LOG);
    setReports(INITIAL_REPORTS);
    setHealthProvider(null);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      isSignedIn,
      signIn,
      signUp,
      completeAuthAsSignedIn,
      logout,
      deleteAccount,
      user,
      updateUser,
      goals,
      goalsSource,
      setGoals,
      applyCalculatedGoals,
      applyBcaGoals,
      healthProvider,
      setHealthProvider,
      todayLog,
      addLogEntry,
      removeLogEntry,
      history,
      reports,
      addReport,
      reanalysingIndex,
      reanalyseReport,
      toast,
      showToast,
    }),
    [
      isSignedIn,
      signIn,
      signUp,
      completeAuthAsSignedIn,
      logout,
      deleteAccount,
      user,
      updateUser,
      goals,
      goalsSource,
      setGoals,
      applyCalculatedGoals,
      applyBcaGoals,
      healthProvider,
      todayLog,
      addLogEntry,
      removeLogEntry,
      history,
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
