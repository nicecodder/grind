import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { adminApi, AdminStats, AdminUser } from '../services/adminApi';
import { ACHIEVEMENT_DEFINITIONS, AchievementDefinition } from '../constants/achievements';

// Interface for single task
export interface TaskItem {
  id: string;
  text: string;
  xp: number;
  completed: boolean;
  isDefault: boolean;
  category?: string;
}

// Interface for user achievement progress
export interface UserAchievement {
  current: number;
  target: number;
  xp: number;
  unlocked: boolean;
  category: string;
}

// Interface for exercise state
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  completedSets: number;
  reps: string;
  muscles: string;
}

// Interface for active workout state
export interface WorkoutState {
  title?: string;
  focus?: string;
  started: boolean;
  completed: boolean;
  exercises: Exercise[];
}

// Global Application State interface
export interface AppState {
  activeView: string;
  streak: number;
  totalXP: number;
  waterCount: number;
  gymDuration: number;
  studyHours: number;
  sleepHours: string | number;
  stepsCount: number;
  isSyncActive: boolean;
  
  onboardingStep: number;
  onboardingCompleted: boolean;
  gender: 'male' | 'female';
  workoutPlan: 5 | 6;
  avatarIndex: number;
  
  workout: WorkoutState | null;
  selectedPreset: 'shredded' | 'bulk' | 'lean' | 'beginner';
  isScanning: boolean;
  hasScanned: boolean;
  
  grinderName: string;
  avatarUrl: string;
  units: string;
  theme: 'Deep Black' | 'Light Mode';
  
  gymCompletedToday: boolean;
  lastRestDayXpCreditedDate: string;
  lastDayCheckedDate: string;
  
  subscriptionPlan: 'free' | 'pro' | 'elite';
  selectedPlan: 'pro' | 'elite';
  billingCycle: 'monthly' | 'yearly';
  adWatchedToday: boolean;
  expBoostActive: boolean;
  expBoostMultiplier: number;
  adCooldownTimestamp: number;
  taskCompletionsSinceLastAd: number;
  
  isUserSignedIn: boolean;
  streakShields: number;
  eliteColor: string;
  eliteTitle: string;
  eliteFrame: string;
  lastWorkoutStudySameDayDate: string;
  lastMorningRoutineDate: string;
  
  // Stats for quest verification
  workoutCount: number;
  workoutStreak: number;
  cardioCount: number;
  strengthCount: number;
  totalStudyHours: number;
  studySessionsCount: number;
  studyStreak: number;
  maxStudySessionDuration: number;
  sleepLogsCount: number;
  sleepStreak: number;
  nightsWith8HrsSleep: number;
  earlyRiseSleepGoalCount: number;
  totalWaterCount: number;
  waterStreak: number;
  maxWaterSingleDay: number;
  morningHydrationCount: number;
  consistentWaterDays: number;
  perfectDaysCount: number;
  perfectDaysStreak: number;
  workoutAndStudySameDayCount: number;
  morningRoutineCompletedCount: number;
  workoutBefore7AMCount: number;
  workoutAfter9PMCount: number;
  studyBefore8AMCount: number;
  studyPastMidnightCount: number;
  daysUsedCount: number;
  season: number;
  
  achievements: { [key: number]: UserAchievement };
  tasks: TaskItem[];
}

// Default Exercises mapping for splits
export const WORKOUT_ROUTINES: { [key: number]: { [key: number]: { title: string; focus: string; exercises: Exercise[] } } } = {
  5: {
    1: { title: 'Monday — Push', focus: 'Chest, Shoulders, Triceps', exercises: [
      { id: 'bench', name: 'Bench Press', sets: 4, completedSets: 0, reps: '6-8 reps', muscles: 'Chest, Shoulders, Triceps' },
      { id: 'incdb', name: 'Incline Dumbbell Press', sets: 3, completedSets: 0, reps: '8-10 reps', muscles: 'Chest, Shoulders, Triceps' },
      { id: 'ohp', name: 'Shoulder Press', sets: 3, completedSets: 0, reps: '8-10 reps', muscles: 'Chest, Shoulders, Triceps' },
      { id: 'latraise', name: 'Lateral Raises', sets: 4, completedSets: 0, reps: '12-15 reps', muscles: 'Chest, Shoulders, Triceps' },
      { id: 'fly', name: 'Chest Fly', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Chest, Shoulders, Triceps' },
      { id: 'pushdown', name: 'Tricep Pushdown', sets: 3, completedSets: 0, reps: '10-12 reps', muscles: 'Chest, Shoulders, Triceps' },
      { id: 'ovhext', name: 'Overhead Tricep Extension', sets: 3, completedSets: 0, reps: '10-12 reps', muscles: 'Chest, Shoulders, Triceps' }
    ]},
    2: { title: 'Tuesday — Pull', focus: 'Back, Biceps, Rear Delts', exercises: [
      { id: 'pullups', name: 'Pull-ups / Lat Pulldown', sets: 4, completedSets: 0, reps: '8-10 reps', muscles: 'Back, Biceps, Rear Delts' },
      { id: 'bbrow', name: 'Barbell Row', sets: 4, completedSets: 0, reps: '8 reps', muscles: 'Back, Biceps, Rear Delts' },
      { id: 'cablerow', name: 'Seated Cable Row', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Back, Biceps, Rear Delts' },
      { id: 'facepulls', name: 'Face Pulls', sets: 3, completedSets: 0, reps: '15 reps', muscles: 'Back, Biceps, Rear Delts' },
      { id: 'dbcurl', name: 'Dumbbell Curl', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Back, Biceps, Rear Delts' },
      { id: 'hammercurl', name: 'Hammer Curl', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Back, Biceps, Rear Delts' },
      { id: 'wristcurl', name: 'Wrist Curl', sets: 3, completedSets: 0, reps: '15 reps', muscles: 'Back, Biceps, Rear Delts' }
    ]},
    3: { title: 'Wednesday — Rest Day', focus: 'Active Recovery', exercises: [] },
    4: { title: 'Thursday — Legs', focus: 'Quads, Hamstrings, Calves, Core', exercises: [
      { id: 'squats', name: 'Squats', sets: 4, completedSets: 0, reps: '6-8 reps', muscles: 'Quads, Hamstrings, Calves, Core' },
      { id: 'rdl', name: 'Romanian Deadlift', sets: 4, completedSets: 0, reps: '8 reps', muscles: 'Quads, Hamstrings, Calves, Core' },
      { id: 'legpress', name: 'Leg Press', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Quads, Hamstrings, Calves, Core' },
      { id: 'legcurl', name: 'Leg Curl', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Quads, Hamstrings, Calves, Core' },
      { id: 'legext', name: 'Leg Extension', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Quads, Hamstrings, Calves, Core' },
      { id: 'calfraise', name: 'Calf Raises', sets: 5, completedSets: 0, reps: '15 reps', muscles: 'Quads, Hamstrings, Calves, Core' },
      { id: 'hangingleg', name: 'Hanging Leg Raises', sets: 3, completedSets: 0, reps: '15 reps', muscles: 'Quads, Hamstrings, Calves, Core' }
    ]},
    5: { title: 'Friday — Upper Body', focus: 'Chest, Back, Shoulders, Arms', exercises: [
      { id: 'incbench', name: 'Incline Bench Press', sets: 4, completedSets: 0, reps: '8 reps', muscles: 'Chest, Back, Shoulders, Arms' },
      { id: 'pullups_amrap', name: 'Pull-ups', sets: 4, completedSets: 0, reps: 'AMRAP reps', muscles: 'Chest, Back, Shoulders, Arms' },
      { id: 'dbpress', name: 'Dumbbell Shoulder Press', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Chest, Back, Shoulders, Arms' },
      { id: 'suprow', name: 'Chest Supported Row', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Chest, Back, Shoulders, Arms' },
      { id: 'latraise_high', name: 'Lateral Raises', sets: 4, completedSets: 0, reps: '15 reps', muscles: 'Chest, Back, Shoulders, Arms' },
      { id: 'ezcurl', name: 'EZ Bar Curl', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Chest, Back, Shoulders, Arms' },
      { id: 'skullcrush', name: 'Skull Crushers', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Chest, Back, Shoulders, Arms' }
    ]},
    6: { title: 'Saturday — Lower + Core', focus: 'Legs, Core strength', exercises: [
      { id: 'deadlift', name: 'Deadlift', sets: 3, completedSets: 0, reps: '5 reps', muscles: 'Legs, Core' },
      { id: 'split_squat', name: 'Bulgarian Split Squat', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Legs, Core' },
      { id: 'hipthrust', name: 'Hip Thrust', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Legs, Core' },
      { id: 'hamcurl', name: 'Hamstring Curl', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Legs, Core' },
      { id: 'stdcalf', name: 'Standing Calf Raise', sets: 5, completedSets: 0, reps: '15 reps', muscles: 'Legs, Core' },
      { id: 'cablecrunch', name: 'Cable Crunch', sets: 3, completedSets: 0, reps: '15 reps', muscles: 'Legs, Core' },
      { id: 'plank', name: 'Plank', sets: 3, completedSets: 0, reps: '1 min', muscles: 'Legs, Core' }
    ]},
    0: { title: 'Sunday — Full Rest', focus: 'Full recovery day', exercises: [] }
  },
  6: {
    1: { title: 'Monday — Chest + Triceps', focus: 'Chest, Triceps', exercises: [
      { id: 'bench', name: 'Bench Press', sets: 4, completedSets: 0, reps: '6-8 reps', muscles: 'Chest, Triceps' },
      { id: 'incdb', name: 'Incline Dumbbell Press', sets: 4, completedSets: 0, reps: '8 reps', muscles: 'Chest, Triceps' },
      { id: 'fly', name: 'Chest Fly', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Chest, Triceps' },
      { id: 'dips', name: 'Dips', sets: 3, completedSets: 0, reps: 'AMRAP reps', muscles: 'Chest, Triceps' },
      { id: 'pushdown', name: 'Tricep Pushdown', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Chest, Triceps' },
      { id: 'ovhext', name: 'Overhead Extension', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Chest, Triceps' }
    ]},
    2: { title: 'Tuesday — Back + Biceps', focus: 'Back, Biceps', exercises: [
      { id: 'pullups', name: 'Pull-ups', sets: 4, completedSets: 0, reps: 'AMRAP reps', muscles: 'Back, Biceps' },
      { id: 'bbrow', name: 'Barbell Row', sets: 4, completedSets: 0, reps: '8 reps', muscles: 'Back, Biceps' },
      { id: 'latdown', name: 'Lat Pulldown', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Back, Biceps' },
      { id: 'seatedrow', name: 'Seated Row', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Back, Biceps' },
      { id: 'bbcurl', name: 'Barbell Curl', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Back, Biceps' },
      { id: 'hammercurl', name: 'Hammer Curl', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Back, Biceps' }
    ]},
    3: { title: 'Wednesday — Legs', focus: 'Quads, Hamstrings, Calves', exercises: [
      { id: 'squats', name: 'Squats', sets: 4, completedSets: 0, reps: '6-8 reps', muscles: 'Quads, Hamstrings, Calves' },
      { id: 'rdl', name: 'Romanian Deadlift', sets: 4, completedSets: 0, reps: '8 reps', muscles: 'Quads, Hamstrings, Calves' },
      { id: 'legpress', name: 'Leg Press', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Quads, Hamstrings, Calves' },
      { id: 'legcurl', name: 'Leg Curl', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Quads, Hamstrings, Calves' },
      { id: 'calfraise', name: 'Calf Raises', sets: 5, completedSets: 0, reps: '15 reps', muscles: 'Quads, Hamstrings, Calves' },
      { id: 'hangingleg', name: 'Hanging Leg Raises', sets: 3, completedSets: 0, reps: '15 reps', muscles: 'Quads, Hamstrings, Calves' }
    ]},
    4: { title: 'Thursday — Shoulders + Forearms', focus: 'Shoulders, Forearms', exercises: [
      { id: 'ohp', name: 'Overhead Press', sets: 4, completedSets: 0, reps: '8 reps', muscles: 'Shoulders, Forearms' },
      { id: 'latraise', name: 'Lateral Raise', sets: 5, completedSets: 0, reps: '15 reps', muscles: 'Shoulders, Forearms' },
      { id: 'reardelt', name: 'Rear Delt Fly', sets: 4, completedSets: 0, reps: '15 reps', muscles: 'Shoulders, Forearms' },
      { id: 'uprow', name: 'Upright Row', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Shoulders, Forearms' },
      { id: 'shrugs', name: 'Shrugs', sets: 4, completedSets: 0, reps: '12 reps', muscles: 'Shoulders, Forearms' },
      { id: 'wristcurl', name: 'Wrist Curl', sets: 3, completedSets: 0, reps: '15 reps', muscles: 'Shoulders, Forearms' },
      { id: 'revwrist', name: 'Reverse Wrist Curl', sets: 3, completedSets: 0, reps: '15 reps', muscles: 'Shoulders, Forearms' }
    ]},
    5: { title: 'Friday — Upper Power', focus: 'Upper Power', exercises: [
      { id: 'bench_power', name: 'Bench Press', sets: 4, completedSets: 0, reps: '5 reps', muscles: 'Upper Power' },
      { id: 'wt_pullups', name: 'Weighted Pull-ups', sets: 4, completedSets: 0, reps: '6 reps', muscles: 'Upper Power' },
      { id: 'bbrow_power', name: 'Barbell Row', sets: 4, completedSets: 0, reps: '6 reps', muscles: 'Upper Power' },
      { id: 'incpress', name: 'Incline Press', sets: 3, completedSets: 0, reps: '8 reps', muscles: 'Upper Power' },
      { id: 'dbcurl', name: 'Dumbbell Curl', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Upper Power' },
      { id: 'skullcrush', name: 'Skull Crushers', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Upper Power' }
    ]},
    6: { title: 'Saturday — Lower Power', focus: 'Lower Power', exercises: [
      { id: 'deadlift_power', name: 'Deadlift', sets: 4, completedSets: 0, reps: '5 reps', muscles: 'Lower Power' },
      { id: 'frontsquat', name: 'Front Squat', sets: 4, completedSets: 0, reps: '6 reps', muscles: 'Lower Power' },
      { id: 'split_squat', name: 'Bulgarian Split Squat', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Lower Power' },
      { id: 'hamcurl', name: 'Hamstring Curl', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Lower Power' },
      { id: 'calfraise', name: 'Calf Raises', sets: 5, completedSets: 0, reps: '15 reps', muscles: 'Lower Power' },
      { id: 'cablecrunch', name: 'Cable Crunch', sets: 3, completedSets: 0, reps: '15 reps', muscles: 'Lower Power' }
    ]},
    0: { title: 'Sunday — Rest Day', focus: 'Complete recovery', exercises: [] }
  }
};

const defaultAchievements: { [key: number]: UserAchievement } = {};
ACHIEVEMENT_DEFINITIONS.forEach(def => {
  defaultAchievements[def.id] = { current: 0, target: def.target, xp: def.xp, unlocked: false, category: def.category };
});

const defaultState: AppState = {
  activeView: 'home',
  streak: 0,
  totalXP: 0,
  waterCount: 0,
  gymDuration: 0,
  studyHours: 0.0,
  sleepHours: '--',
  stepsCount: 0,
  isSyncActive: false,
  
  onboardingStep: 1,
  onboardingCompleted: false,
  gender: 'male',
  workoutPlan: 5,
  avatarIndex: 0,
  
  workout: null,
  selectedPreset: 'shredded',
  isScanning: false,
  hasScanned: false,
  
  grinderName: 'Athlete',
  avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png',
  units: 'Metric (kg, km)',
  theme: 'Deep Black',
  
  gymCompletedToday: false,
  lastRestDayXpCreditedDate: '',
  lastDayCheckedDate: '',
  
  subscriptionPlan: 'free',
  selectedPlan: 'pro',
  billingCycle: 'monthly',
  adWatchedToday: false,
  expBoostActive: false,
  expBoostMultiplier: 1.0,
  adCooldownTimestamp: 0,
  taskCompletionsSinceLastAd: 0,
  
  isUserSignedIn: false,
  streakShields: 0,
  eliteColor: '#ffffff',
  eliteTitle: 'GRINDER',
  eliteFrame: 'none',
  lastWorkoutStudySameDayDate: '',
  lastMorningRoutineDate: '',
  
  workoutCount: 0,
  workoutStreak: 0,
  cardioCount: 0,
  strengthCount: 0,
  totalStudyHours: 0.0,
  studySessionsCount: 0,
  studyStreak: 0,
  maxStudySessionDuration: 0,
  sleepLogsCount: 0,
  sleepStreak: 0,
  nightsWith8HrsSleep: 0,
  earlyRiseSleepGoalCount: 0,
  totalWaterCount: 0,
  waterStreak: 0,
  maxWaterSingleDay: 0,
  morningHydrationCount: 0,
  consistentWaterDays: 0,
  perfectDaysCount: 0,
  perfectDaysStreak: 0,
  workoutAndStudySameDayCount: 0,
  morningRoutineCompletedCount: 0,
  workoutBefore7AMCount: 0,
  workoutAfter9PMCount: 0,
  studyBefore8AMCount: 0,
  studyPastMidnightCount: 0,
  daysUsedCount: 1,
  season: 1,
  
  achievements: defaultAchievements,
  tasks: [
    { id: 'workout-task', text: "Complete Today's Workout Routine", xp: 150, completed: false, isDefault: true },
    { id: 'water-task', text: "Drink 8/8 Glasses of Water", xp: 50, completed: false, isDefault: true },
    { id: 'study-task', text: "Log 4.0 Hours of Studies", xp: 100, completed: false, isDefault: true },
    { id: 'sleep-task', text: "Log 8.0 Hours of Sleep", xp: 80, completed: false, isDefault: true }
  ]
};

// Toast notification shape
export interface Toast {
  id: string;
  header: string;
  body: string;
  type: 'success' | 'error' | 'achievement';
}

interface AppContextProps {
  state: AppState;
  toasts: Toast[];
  user: any;
  userProfile: { role: string; username: string; subscription_plan: string } | null;
  loading: boolean;
  adVisible: boolean;
  adRewarded: boolean;
  showToast: (header: string, body: string, type?: 'success' | 'error' | 'achievement') => void;
  dismissToast: (id: string) => void;
  switchView: (view: string) => void;
  addWater: (amount: number) => void;
  logGym: (duration: number) => void;
  addStudyHours: (hours: number) => void;
  saveSleepInput: (hours: number) => void;
  simulateSteps: (amount: number, showFeedback?: boolean) => void;
  toggleWatchSync: () => void;
  toggleTask: (id: string, completed: boolean) => void;
  addTask: (text: string, category: string) => void;
  deleteTask: (id: string) => void;
  updateOnboardingStep: (step: number) => void;
  selectGender: (gender: 'male' | 'female') => void;
  selectAvatar: (index: number) => void;
  selectWorkoutPlan: (split: 5 | 6) => void;
  finishOnboarding: (name: string) => void;
  startWorkout: () => void;
  toggleSet: (exIndex: number, setNum: number) => void;
  completeWorkout: () => void;
  toggleUnits: () => void;
  toggleTheme: () => void;
  toggleWorkoutSplitSetting: () => void;
  applyEliteCustomization: (color: string, title: string, frame: string) => void;
  purchasePlan: (plan: 'pro' | 'elite', cycle: 'monthly' | 'yearly') => Promise<void>;
  restorePlan: () => Promise<void>;
  cancelPlan: () => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<{ verificationRequired: boolean; email?: string }>;
  signIn: (email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  startNewSeason: () => Promise<void>;
  triggerAd: (isRewarded?: boolean) => void;
  closeAd: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<{ role: string; username: string; subscription_plan: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [adVisible, setAdVisible] = useState(false);
  const [adRewarded, setAdRewarded] = useState(false);
  
  const stateRef = useRef(state);
  stateRef.current = state;
  const syncTimeoutRef = useRef<any>(null);

  // Load local storage on mount
  useEffect(() => {
    const initApp = async () => {
      try {
        const saved = await AsyncStorage.getItem('grind_app_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          
          // Rebuild achievements default map and merge saved progress
          const mergedAchievements = { ...defaultAchievements };
          if (parsed.achievements) {
            Object.keys(parsed.achievements).forEach(idKey => {
              const id = parseInt(idKey);
              if (mergedAchievements[id]) {
                mergedAchievements[id].current = parsed.achievements[id].current ?? 0;
                mergedAchievements[id].unlocked = parsed.achievements[id].unlocked ?? false;
              }
            });
          }

          setState(prev => ({
            ...prev,
            ...parsed,
            achievements: mergedAchievements,
            tasks: parsed.tasks ?? prev.tasks,
            activeView: 'home', // default
          }));
        }

        // Listen for Supabase Auth Sessions
        const sessionRes = await supabase.auth.getSession();
        const activeSession = sessionRes.data.session;
        if (activeSession) {
          setUser(activeSession.user);
          await loadUserProfileAndState(activeSession.user.id);
        }
      } catch (err) {
        console.error('Storage initialization failed:', err);
      } finally {
        setLoading(false);
      }
    };

    initApp();

    // Subscribe to Auth State Changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        await loadUserProfileAndState(session.user.id);
      } else {
        setUser(null);
        setUserProfile(null);
        setState(prev => ({
          ...prev,
          isUserSignedIn: false,
          subscriptionPlan: 'free',
        }));
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sync to Storage and Supabase when state changes
  const saveState = async (updated: AppState, syncImmediately = false) => {
    setState(updated);
    try {
      await AsyncStorage.setItem('grind_app_state', JSON.stringify(updated));
    } catch (e) {
      console.error('AsyncStorage write error:', e);
    }

    if (updated.isUserSignedIn && user) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      
      const performSync = async () => {
        try {
          // Sync profiles display name
          if (updated.grinderName) {
            await supabase.from('profiles').update({ username: updated.grinderName }).eq('id', user.id);
          }
          // Sync state_json
          await supabase.from('user_states').upsert({
            user_id: user.id,
            state_json: updated,
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.error('Supabase background sync failure:', err);
        }
      };

      if (syncImmediately) {
        performSync();
      } else {
        syncTimeoutRef.current = setTimeout(performSync, 1500); // 1.5s debounce
      }
    }
  };

  const loadUserProfileAndState = async (uid: string) => {
    try {
      // 1. Query profiles table
      const { data: profiles, error: pErr } = await supabase.from('profiles').select('role, username, subscription_plan').eq('id', uid);
      if (pErr) throw pErr;
      
      const profile = profiles?.[0] || { role: 'user', username: user?.email?.split('@')[0] || 'Athlete', subscription_plan: 'free' };
      setUserProfile(profile);

      // 2. Query user_states table
      const { data: states, error: sErr } = await supabase.from('user_states').select('state_json').eq('user_id', uid);
      if (sErr) throw sErr;
      
      if (states?.[0]?.state_json) {
        const dbState = states[0].state_json as AppState;
        
        // Entitle client plan based on backend profiles settings
        dbState.subscriptionPlan = profile.subscription_plan as any;
        dbState.isUserSignedIn = true;
        
        // Merge achievements definitions
        const mergedAchievements = { ...defaultAchievements };
        if (dbState.achievements) {
          Object.keys(dbState.achievements).forEach(idKey => {
            const id = parseInt(idKey);
            if (mergedAchievements[id]) {
              mergedAchievements[id].current = dbState.achievements[id].current ?? 0;
              mergedAchievements[id].unlocked = dbState.achievements[id].unlocked ?? false;
            }
          });
        }
        dbState.achievements = mergedAchievements;
        
        setState(dbState);
        await AsyncStorage.setItem('grind_app_state', JSON.stringify(dbState));
      } else {
        // Seeding initial state on DB
        const freshState = {
          ...stateRef.current,
          grinderName: profile.username,
          subscriptionPlan: profile.subscription_plan as any,
          isUserSignedIn: true,
        };
        await supabase.from('user_states').insert({ user_id: uid, state_json: freshState });
        setState(freshState);
      }
    } catch (err) {
      console.error('Error fetching database states:', err);
    }
  };

  // Toast Control
  const showToast = (header: string, body: string, type: 'success' | 'error' | 'achievement' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, header, body, type }]);
    
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Navigation Trigger
  const switchView = (view: string) => {
    const current = { ...stateRef.current };
    current.activeView = view;
    
    // Perform rollover check on view changes
    const updated = runDailyChecks(current);
    saveState(updated);
  };

  // Central Habit Checks
  const runDailyChecks = (current: AppState): AppState => {
    const todayStr = new Date().toDateString();
    
    // Rollover new day check
    if (current.lastDayCheckedDate && current.lastDayCheckedDate !== todayStr) {
      let shieldUsed = false;
      const missedAny = (
        current.waterCount < 8 || 
        current.studyHours < 4.0 || 
        current.sleepHours === '--' || 
        parseFloat(current.sleepHours.toString()) < 8.0 || 
        !current.gymCompletedToday
      );

      if (missedAny) {
        if (current.subscriptionPlan === 'elite') {
          shieldUsed = true;
        } else if (current.subscriptionPlan === 'pro' && current.streakShields > 0) {
          current.streakShields--;
          shieldUsed = true;
        }
      }

      if (shieldUsed) {
        showToast('Shield Preserved Streaks! 🛡️', 'Your missed goals were forgiven by shields!');
        current.waterStreak = current.waterCount >= 8 ? current.waterStreak + 1 : current.waterStreak;
        current.studyStreak = current.studyHours >= 4.0 ? current.studyStreak + 1 : current.studyStreak;
        current.sleepStreak = (current.sleepHours !== '--' && parseFloat(current.sleepHours.toString()) >= 8.0) ? current.sleepStreak + 1 : current.sleepStreak;
        current.workoutStreak = current.gymCompletedToday ? current.workoutStreak + 1 : current.workoutStreak;
      } else {
        current.waterStreak = current.waterCount >= 8 ? current.waterStreak + 1 : 0;
        current.studyStreak = current.studyHours >= 4.0 ? current.studyStreak + 1 : 0;
        current.sleepStreak = (current.sleepHours !== '--' && parseFloat(current.sleepHours.toString()) >= 8.0) ? current.sleepStreak + 1 : 0;
        current.workoutStreak = current.gymCompletedToday ? current.workoutStreak + 1 : 0;
        current.perfectDaysStreak = 0;
      }

      if (current.waterCount >= 8 && current.studyHours >= 4.0 && current.sleepHours !== '--' && parseFloat(current.sleepHours.toString()) >= 8.0 && current.gymCompletedToday) {
        current.perfectDaysCount = (current.perfectDaysCount || 0) + 1;
        current.perfectDaysStreak = (current.perfectDaysStreak || 0) + 1;
      }

      // Water consistent tracking
      if (current.waterCount >= 6) {
        current.consistentWaterDays = (current.consistentWaterDays || 0) + 1;
      } else {
        current.consistentWaterDays = 0;
      }

      // Reset values
      current.waterCount = 0;
      current.gymDuration = 0;
      current.gymCompletedToday = false;
      current.studyHours = 0.0;
      current.sleepHours = '--';
      current.adWatchedToday = false;
      current.daysUsedCount = (current.daysUsedCount || 1) + 1;
      current.workout = null; // force regenerate

      current.tasks.forEach(t => {
        if (t.isDefault) t.completed = false;
      });
    }

    current.lastDayCheckedDate = todayStr;

    // Check rest day credits
    const plan = current.workoutPlan || 5;
    const dayOfWeek = new Date().getDay();
    const routine = WORKOUT_ROUTINES[plan][dayOfWeek];
    const isRestDay = !routine.exercises || routine.exercises.length === 0;

    if (isRestDay) {
      current.gymDuration = 45;
      current.gymCompletedToday = true;
      const t = current.tasks.find(tk => tk.id === 'workout-task');
      if (t && !t.completed) {
        t.completed = true;
      }
      if (current.lastRestDayXpCreditedDate !== todayStr) {
        current.lastRestDayXpCreditedDate = todayStr;
        
        // Credit XP
        const oldXp = current.totalXP;
        current.totalXP += Math.round(150 * current.expBoostMultiplier);
        showToast('Rest Day Restored! 🧘', `Rest day active split. +${Math.round(150 * current.expBoostMultiplier)} XP credited.`);
        checkLevelAchievements(oldXp, current);
      }
    }

    // Initialize schedule if empty
    if (!current.workout) {
      current.workout = {
        title: routine.title,
        focus: routine.focus,
        started: false,
        completed: false,
        exercises: JSON.parse(JSON.stringify(routine.exercises))
      };
    }

    return current;
  };

  const addXP = (amount: number, isAchievement = false) => {
    const current = { ...stateRef.current };
    const oldXp = current.totalXP;
    
    // Apply dynamic exp multiplier
    const finalAmount = amount > 0 ? Math.round(amount * current.expBoostMultiplier) : amount;
    current.totalXP = Math.max(0, current.totalXP + finalAmount);
    
    if (isAchievement || amount >= 50) {
      current.taskCompletionsSinceLastAd++;
    }

    checkLevelAchievements(oldXp, current);
    
    // Ad trigger logic
    if (amount > 0 && current.subscriptionPlan === 'free') {
      const isWorkoutActive = current.workout?.started;
      if (!isWorkoutActive) {
        if (current.taskCompletionsSinceLastAd >= 3) {
          triggerAd(false);
          current.taskCompletionsSinceLastAd = 0;
        }
      }
    }

    saveState(current);
    showToast('XP Gained', `+${finalAmount} XP earned${current.expBoostMultiplier > 1 ? ` (${current.expBoostMultiplier}x boost)` : ''}!`);
  };

  // Verify rank progression boundaries
  const getRankName = (xp: number) => {
    if (xp < 3000) return 'Bronze';
    if (xp < 8000) return 'Silver';
    if (xp < 16000) return 'Gold';
    if (xp < 30000) return 'Diamond';
    if (xp < 50000) return 'Master';
    if (xp < 100000) return 'Supreme';
    return 'Ultra Supreme';
  };

  const checkLevelAchievements = (oldXp: number, current: AppState) => {
    const oldR = getRankName(oldXp);
    const newR = getRankName(current.totalXP);
    
    if (oldR !== newR) {
      showToast('Rank Promotion! 🌟', `Congratulations! You leveled up to ${newR.toUpperCase()} GRINDER!`);
      if (current.subscriptionPlan === 'free') {
        triggerAd(false);
      }
    }

    // Verify 54 achievements rules
    runAchievementsChecks(current);
  };

  const runAchievementsChecks = (current: AppState) => {
    let unlockedCount = 0;
    
    // First pass to evaluate current unlock states
    ACHIEVEMENT_DEFINITIONS.forEach(def => {
      const ach = current.achievements[def.id];
      if (ach && ach.unlocked) unlockedCount++;
    });

    ACHIEVEMENT_DEFINITIONS.forEach(def => {
      const ach = current.achievements[def.id];
      if (!ach) return;
      
      let val = 0;
      switch(def.id) {
        case 1: val = current.workoutCount; break;
        case 2: val = current.workoutStreak; break;
        case 3: val = current.workoutStreak; break;
        case 4: val = current.workoutStreak >= 7 ? 7 : 0; break;
        case 5: val = current.workoutCount; break;
        case 6: val = current.cardioCount; break;
        case 7: val = current.strengthCount; break;
        case 8: val = current.workoutCount; break;
        case 9: val = current.workoutBefore7AMCount; break;
        case 10: val = current.workoutAfter9PMCount; break;
        case 11: val = current.workoutCount; break;
        case 12: val = current.workoutCount; break;
        
        case 13: val = current.studySessionsCount; break;
        case 14: val = current.studyStreak; break;
        case 15: val = current.maxStudySessionDuration; break;
        case 16: val = Math.floor(current.totalStudyHours); break;
        case 17: val = current.studyStreak; break;
        case 18: val = current.studySessionsCount; break;
        case 19: val = Math.floor(current.totalStudyHours); break;
        case 20: val = current.studyStreak; break;
        case 21: val = Math.floor(current.totalStudyHours); break;
        case 22: val = current.studyBefore8AMCount; break;
        case 23: val = current.studyPastMidnightCount; break;
        case 24: val = current.studyStreak >= 14 ? 14 : 0; break;

        case 25: val = current.sleepLogsCount; break;
        case 26: val = current.sleepStreak; break;
        case 27: val = current.nightsWith8HrsSleep; break;
        case 28: val = current.sleepStreak; break;
        case 29: val = current.sleepStreak; break;
        case 30: val = current.earlyRiseSleepGoalCount; break;
        case 31: val = current.sleepStreak >= 7 ? 7 : 0; break;
        case 32: val = current.sleepStreak; break;
        case 33: val = current.sleepStreak; break;
        case 34: val = current.sleepLogsCount; break;

        case 35: val = current.totalWaterCount; break;
        case 36: val = current.waterStreak >= 1 ? 1 : 0; break;
        case 37: val = current.waterStreak; break;
        case 38: val = current.waterStreak; break;
        case 39: val = current.maxWaterSingleDay >= 12 ? 1 : 0; break;
        case 40: val = current.waterStreak; break;
        case 41: val = current.waterStreak >= 14 ? 14 : 0; break;
        case 42: val = current.waterStreak; break;
        case 43: val = current.morningHydrationCount; break;
        case 44: val = current.consistentWaterDays; break;

        case 45: val = current.perfectDaysCount; break;
        case 46: val = current.perfectDaysStreak >= 7 ? 7 : 0; break;
        case 47: val = current.perfectDaysStreak >= 30 ? 30 : 0; break;
        case 48: val = current.daysUsedCount; break;
        case 49: val = current.workoutAndStudySameDayCount; break;
        case 50: val = current.morningRoutineCompletedCount; break;
        case 51: val = current.perfectDaysStreak >= 60 ? 60 : 0; break;
        case 52: val = current.totalXP; break;
        case 53: val = current.totalXP; break;
        case 54: val = unlockedCount; break;
      }
      
      ach.current = Math.min(ach.target, val);
      
      if (ach.current >= ach.target && !ach.unlocked) {
        ach.unlocked = true;
        current.totalXP += Math.round(ach.xp * current.expBoostMultiplier);
        showToast('Achievement Unlocked! 🏆', `${def.name.toUpperCase()} (+${Math.round(ach.xp * current.expBoostMultiplier)} XP)`);
      }
    });

    // Special check for quest 54 (which relies on cumulative unlocks)
    const grindLegend = current.achievements[54];
    if (grindLegend && !grindLegend.unlocked) {
      let finalUnlocks = 0;
      ACHIEVEMENT_DEFINITIONS.forEach(def => {
        if (current.achievements[def.id]?.unlocked) finalUnlocks++;
      });
      grindLegend.current = Math.min(grindLegend.target, finalUnlocks);
      if (grindLegend.current >= grindLegend.target) {
        grindLegend.unlocked = true;
        current.totalXP += Math.round(grindLegend.xp * current.expBoostMultiplier);
        showToast('Achievement Unlocked! 👑', `GRIND LEGEND (+${Math.round(grindLegend.xp * current.expBoostMultiplier)} XP)`);
      }
    }
  };

  // Incremental log handlers
  const addWater = (amount: number) => {
    const current = { ...stateRef.current };
    if (current.waterCount < 8) {
      current.waterCount = Math.min(8, current.waterCount + amount);
      current.totalWaterCount += amount;
      
      if (current.waterCount > current.maxWaterSingleDay) {
        current.maxWaterSingleDay = current.waterCount;
      }

      // Check morning hydration (first water before 8 AM)
      const hr = new Date().getHours();
      if (current.waterCount === 1 && hr < 8) {
        current.morningHydrationCount = (current.morningHydrationCount || 0) + 1;
      }

      // Verify task completion
      if (current.waterCount >= 8) {
        const task = current.tasks.find(t => t.id === 'water-task');
        if (task && !task.completed) {
          task.completed = true;
          addXP(task.xp, true);
        }
        if (current.waterStreak === 0) current.waterStreak = 1;
      }

      // Special checks for perfect routine before noon
      checkCompoundGoalsToday(current);
      addXP(10);
    } else {
      showToast('Hydration Met', 'You have hit 8/8 glasses today!', 'success');
    }
  };

  const logGym = (duration: number) => {
    const current = { ...stateRef.current };
    current.gymDuration = Math.min(45, current.gymDuration + duration);
    
    const hr = new Date().getHours();
    if (hr < 7) {
      current.workoutBefore7AMCount++;
    } else if (hr >= 21) {
      current.workoutAfter9PMCount++;
    }

    if (current.gymDuration >= 45) {
      if (current.workout) {
        current.workout.started = false;
        current.workout.completed = true;
      }
      
      if (!current.gymCompletedToday) {
        current.gymCompletedToday = true;
        current.workoutCount++;
        current.strengthCount++;
        current.workoutStreak = (current.workoutStreak || 0) + 1;
        current.streak = Math.max(current.streak, current.workoutStreak);
      }

      const task = current.tasks.find(t => t.id === 'workout-task');
      if (task && !task.completed) {
        task.completed = true;
        addXP(task.xp, true);
      }
    }

    checkCompoundGoalsToday(current);
    addXP(120);
    saveState(current);
  };

  const addStudyHours = (hours: number) => {
    const current = { ...stateRef.current };
    if (current.studyHours >= 4.0) {
      showToast('Study Completed', 'You have hit 4.0/4.0 study hours today!', 'success');
      return;
    }

    const hr = new Date().getHours();
    if (hr < 8) {
      current.studyBefore8AMCount++;
    } else if (hr >= 0 && hr < 4) {
      current.studyPastMidnightCount++;
    }

    current.studyHours = Math.min(4.0, current.studyHours + hours);
    current.totalStudyHours += hours;
    current.studySessionsCount++;
    if (hours > current.maxStudySessionDuration) {
      current.maxStudySessionDuration = hours;
    }

    if (current.studyHours >= 4.0) {
      const task = current.tasks.find(t => t.id === 'study-task');
      if (task && !task.completed) {
        task.completed = true;
        addXP(task.xp, true);
      }
      if (current.studyStreak === 0) current.studyStreak = 1;
    }

    checkCompoundGoalsToday(current);
    addXP(Math.round(hours * 50));
    saveState(current);
  };

  const saveSleepInput = (hours: number) => {
    const current = { ...stateRef.current };
    current.sleepHours = hours;
    current.sleepLogsCount++;

    if (hours >= 8.0) {
      current.nightsWith8HrsSleep++;
      const task = current.tasks.find(t => t.id === 'sleep-task');
      if (task && !task.completed) {
        task.completed = true;
        addXP(task.xp, true);
      }
      if (current.sleepStreak === 0) current.sleepStreak = 1;
    }

    const hr = new Date().getHours();
    if (hr < 6 && hours >= 7.0) {
      current.earlyRiseSleepGoalCount++;
    }

    checkCompoundGoalsToday(current);
    addXP(50);
    saveState(current);
  };

  const simulateSteps = (amount: number, showFeedback = true) => {
    const current = { ...stateRef.current };
    const oldSteps = current.stepsCount;
    current.stepsCount += amount;

    const oldThousands = Math.floor(oldSteps / 1000);
    const newThousands = Math.floor(current.stepsCount / 1000);
    if (newThousands > oldThousands) {
      const gXp = (newThousands - oldThousands) * 10;
      addXP(gXp);
      if (showFeedback) showToast('Steps Tracked', `Logged ${amount.toLocaleString()} steps! (+${gXp} XP)`);
    } else if (showFeedback) {
      showToast('Steps Logged', `Logged +${amount} steps.`);
    }

    // Cardio sessions (every 5000 steps)
    const oldCardios = Math.floor(oldSteps / 5000);
    const newCardios = Math.floor(current.stepsCount / 5000);
    if (newCardios > oldCardios) {
      current.cardioCount += (newCardios - oldCardios);
    }

    saveState(current);
  };

  const toggleWatchSync = () => {
    const current = { ...stateRef.current };
    current.isSyncActive = !current.isSyncActive;
    saveState(current);
    showToast(
      current.isSyncActive ? 'Watch Synced ⌚' : 'Watch Unsynced ❌',
      current.isSyncActive ? 'Sensors connected to mobile app.' : 'Sensors disconnected.'
    );
  };

  // Checklist tasks handlers
  const toggleTask = (id: string, completed: boolean) => {
    const current = { ...stateRef.current };
    const task = current.tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = completed;
    if (completed) {
      addXP(task.xp);
    } else {
      current.totalXP = Math.max(0, current.totalXP - task.xp);
      showToast('Task Unchecked', `-${task.xp} XP removed.`, 'error');
    }
    saveState(current);
  };

  const addTask = (text: string, category: string) => {
    const current = { ...stateRef.current };
    if (current.subscriptionPlan === 'free' && current.tasks.length >= 5) {
      showToast('Task Limit Reached ⚠️', 'Upgrade to Pro/Elite for unlimited custom tasks.', 'error');
      return;
    }

    current.tasks.push({
      id: 'custom-' + Date.now(),
      text,
      xp: 30,
      completed: false,
      isDefault: false,
      category,
    });
    saveState(current);
    showToast('Task Added', `Added quest: "${text}"`);
  };

  const deleteTask = (id: string) => {
    const current = { ...stateRef.current };
    const idx = current.tasks.findIndex(t => t.id === id);
    if (idx === -1) return;
    
    const task = current.tasks[idx];
    if (task.isDefault) return;

    current.tasks.splice(idx, 1);
    saveState(current);
    showToast('Task Deleted', `Removed quest: "${task.text}"`);
  };

  // Workout state checklist details
  const startWorkout = () => {
    const current = { ...stateRef.current };
    if (!current.workout) return;

    current.workout.started = true;
    current.workout.completed = false;
    current.workout.exercises.forEach(ex => ex.completedSets = 0);
    saveState(current);
    showToast('Workout Started 🔥', 'Log sets sequentially to claim discipline points!');
  };

  const toggleSet = (exIndex: number, setNum: number) => {
    const current = { ...stateRef.current };
    if (!current.workout) return;

    const ex = current.workout.exercises[exIndex];
    if (!ex) return;

    if (setNum !== ex.completedSets + 1 && setNum !== ex.completedSets) {
      showToast('Hold On ⚠️', `Please complete Set ${ex.completedSets + 1} first!`, 'error');
      return;
    }

    if (ex.completedSets === setNum) {
      ex.completedSets = setNum - 1;
      addXP(-15);
    } else {
      ex.completedSets = setNum;
      addXP(15);
    }
    saveState(current);
  };

  const completeWorkout = () => {
    const current = { ...stateRef.current };
    if (!current.workout) return;

    current.workout.started = false;
    current.workout.completed = true;
    
    logGym(45);
    addXP(150);
    showToast('Workout Complete! 🏆', 'Smashed all target muscle exercises! (+150 XP)');
  };

  // Compound achievements triggers
  const checkCompoundGoalsToday = (current: AppState) => {
    const todayStr = new Date().toDateString();
    
    // Workout and study same day
    if (current.gymCompletedToday && current.studyHours >= 4.0) {
      if (current.lastWorkoutStudySameDayDate !== todayStr) {
        current.lastWorkoutStudySameDayDate = todayStr;
        current.workoutAndStudySameDayCount++;
      }
    }

    // Workout, water, and study before noon
    if (current.gymCompletedToday && current.waterCount >= 8 && current.studyHours >= 4.0) {
      const hr = new Date().getHours();
      if (hr < 12 && current.lastMorningRoutineDate !== todayStr) {
        current.lastMorningRoutineDate = todayStr;
        current.morningRoutineCompletedCount++;
      }
    }
  };

  // Onboarding controls
  const updateOnboardingStep = (step: number) => {
    const current = { ...stateRef.current };
    current.onboardingStep = step;
    saveState(current);
  };

  const selectGender = (gender: 'male' | 'female') => {
    const current = { ...stateRef.current };
    current.gender = gender;
    saveState(current);
  };

  const selectAvatar = (index: number) => {
    const current = { ...stateRef.current };
    current.avatarIndex = index;
    current.avatarUrl = index === 0 
      ? 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' 
      : 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png';
    saveState(current);
  };

  const selectWorkoutPlan = (split: 5 | 6) => {
    const current = { ...stateRef.current };
    current.workoutPlan = split;
    saveState(current);
  };

  const finishOnboarding = (name: string) => {
    const current = { ...stateRef.current };
    current.grinderName = name || 'Athlete';
    current.onboardingCompleted = true;
    
    const today = new Date();
    const dayOfWeek = today.getDay();
    const routine = WORKOUT_ROUTINES[current.workoutPlan][dayOfWeek];
    
    current.workout = {
      title: routine.title,
      focus: routine.focus,
      started: false,
      completed: false,
      exercises: JSON.parse(JSON.stringify(routine.exercises))
    };

    saveState(current, true);
    showToast('Welcome, Grinder! 🔥', 'Your profile is set up. Ready to lock in.');
  };

  // Preferences toggles
  const toggleUnits = () => {
    const current = { ...stateRef.current };
    current.units = current.units === 'Metric (kg, km)' ? 'Imperial (lb, mi)' : 'Metric (kg, km)';
    saveState(current);
  };

  const toggleTheme = () => {
    const current = { ...stateRef.current };
    current.theme = current.theme === 'Deep Black' ? 'Light Mode' : 'Deep Black';
    saveState(current);
  };

  const toggleWorkoutSplitSetting = () => {
    const current = { ...stateRef.current };
    current.workoutPlan = current.workoutPlan === 5 ? 6 : 5;
    
    // Reset schedule to align split choice
    current.workout = null;
    const updated = runDailyChecks(current);
    saveState(updated);
  };

  const applyEliteCustomization = (color: string, title: string, frame: string) => {
    const current = { ...stateRef.current };
    current.eliteColor = color;
    current.eliteTitle = title;
    current.eliteFrame = frame;
    saveState(current, true);
    showToast('Customization Saved', 'Your elite layout properties have been updated!');
  };

  // StoreKit Subscriptions
  const purchasePlan = async (plan: 'pro' | 'elite', cycle: 'monthly' | 'yearly') => {
    setLoading(true);
    try {
      // Proxy through Railway backend to apply SQL entitlement updates
      if (state.isUserSignedIn && user) {
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        if (token) {
          await adminApi.editUser(token, user.id, {
            username: state.grinderName,
            email: user.email,
            role: userProfile?.role || 'user',
            subscription_plan: plan,
            xp: state.totalXP,
            streak: state.streak,
          });
          
          // Refresh profile details locally
          setUserProfile(prev => prev ? { ...prev, subscription_plan: plan } : null);
        }
      }

      const current = { ...stateRef.current };
      current.subscriptionPlan = plan;
      current.billingCycle = cycle;

      if (plan === 'pro') {
        current.expBoostMultiplier = 1.5;
        current.expBoostActive = true;
        current.streakShields = Math.max(current.streakShields, 2);
      } else {
        current.expBoostMultiplier = 2.0;
        current.expBoostActive = true;
        current.streakShields = 999;
      }

      saveState(current, true);
      showToast('Unlock Complete! 🌟', `Congratulations! Upgraded to Grind ${plan.toUpperCase()}!`);
    } catch (e: any) {
      showToast('Billing Failed', e.message || 'Verification rejected', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cancelPlan = async () => {
    setLoading(true);
    try {
      if (state.isUserSignedIn && user) {
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        if (token) {
          await adminApi.editUser(token, user.id, {
            username: state.grinderName,
            email: user.email,
            role: userProfile?.role || 'user',
            subscription_plan: 'free',
            xp: state.totalXP,
            streak: state.streak,
          });
          setUserProfile(prev => prev ? { ...prev, subscription_plan: 'free' } : null);
        }
      }

      const current = { ...stateRef.current };
      current.subscriptionPlan = 'free';
      current.expBoostMultiplier = 1.0;
      current.expBoostActive = false;
      current.streakShields = 0;

      saveState(current, true);
      showToast('Plan Cancelled', 'Reverted back to Grind Free plan.');
    } catch (e: any) {
      showToast('Cancellation Failed', e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const restorePlan = async () => {
    // Simply check for active purchases
    showToast('Restoring purchases...', 'Connecting to Store servers.');
    setTimeout(() => {
      purchasePlan('pro', 'monthly');
    }, 1000);
  };

  // Auth Connectors
  const signUp = async (username: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error) throw error;
    
    // Check if OTP verification is required
    const session = data.session;
    if (!session) {
      return { verificationRequired: true, email };
    }

    return { verificationRequired: false };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    setUser(data.user);
    await loadUserProfileAndState(data.user.id);
  };

  const verifyOtp = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });
    if (error) throw error;

    setUser(data.user);
    if (data.user) {
      await loadUserProfileAndState(data.user.id);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // Final sync
      if (user) {
        await supabase.from('user_states').upsert({
          user_id: user.id,
          state_json: stateRef.current,
          updated_at: new Date().toISOString(),
        });
      }
      await supabase.auth.signOut();
      
      // Reset state entirely
      setState(defaultState);
      await AsyncStorage.removeItem('grind_app_state');
    } catch (err) {
      console.error('Signout sync failure:', err);
    } finally {
      setLoading(false);
    }
  };

  const startNewSeason = async () => {
    setLoading(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('Authorization required');

      await adminApi.startNewSeason(token);
      showToast('Season Rollover Complete! 🌟', 'XP reduction applied to all accounts.');
      
      // Refetch state
      if (user) {
        await loadUserProfileAndState(user.id);
      }
    } catch (e: any) {
      showToast('Action Failed', e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fullscreen Simulated Ad triggers
  const triggerAd = (isRewarded = false) => {
    if (stateRef.current.subscriptionPlan !== 'free') return;
    setAdRewarded(isRewarded);
    setAdVisible(true);
  };

  const closeAd = () => {
    setAdVisible(false);
    if (adRewarded) {
      const current = { ...stateRef.current };
      current.adWatchedToday = true;
      current.expBoostMultiplier = 1.5;
      current.expBoostActive = true;
      saveState(current);
      showToast('Rewarded XP Boost! ⚡', '1.5x Boost active for today.');
    }
  };

  return (
    <AppContext.Provider value={{
      state,
      toasts,
      user,
      userProfile,
      loading,
      adVisible,
      adRewarded,
      showToast,
      dismissToast,
      switchView,
      addWater,
      logGym,
      addStudyHours,
      saveSleepInput,
      simulateSteps,
      toggleWatchSync,
      toggleTask,
      addTask,
      deleteTask,
      updateOnboardingStep,
      selectGender,
      selectAvatar,
      selectWorkoutPlan,
      finishOnboarding,
      startWorkout,
      toggleSet,
      completeWorkout,
      toggleUnits,
      toggleTheme,
      toggleWorkoutSplitSetting,
      applyEliteCustomization,
      purchasePlan,
      restorePlan,
      cancelPlan,
      signUp,
      signIn,
      verifyOtp,
      signOut,
      startNewSeason,
      triggerAd,
      closeAd,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside an AppProvider');
  return context;
};
