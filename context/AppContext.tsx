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
  desc?: string;
}

// Interface for customizable/progression exercises
export interface CustomExercise {
  id: string;
  name: string;
  muscles: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  enabled: boolean;
  isCustom: boolean;
  sets: number;
  reps: string;
  desc?: string;
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
  workoutType?: 'calisthenics' | 'gym' | 'home' | null;
  workoutDaysCompleted?: number;
  calisthenicsExercises?: CustomExercise[];
  homeWorkoutExercises?: CustomExercise[];
  
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

export const DEFAULT_CALISTHENICS_EXERCISES: CustomExercise[] = [
  // Beginner
  { id: 'cal-b1', name: 'Push-ups', muscles: 'Chest, Shoulders, Triceps', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '10 reps', desc: 'Keep your elbows tucked in at a 45-degree angle.' },
  { id: 'cal-b2', name: 'Knee Push-ups', muscles: 'Chest, Shoulders', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '12 reps', desc: 'Great for building baseline push strength.' },
  { id: 'cal-b3', name: 'Wall Push-ups', muscles: 'Chest, Shoulders', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '15 reps', desc: 'Focus on slow, controlled movement.' },
  { id: 'cal-b4', name: 'Jumping Jacks', muscles: 'Cardio, Legs', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '30 sec', desc: 'Keep a steady, rhythmic pace.' },
  { id: 'cal-b5', name: 'Plank (20-30 sec)', muscles: 'Core', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '25 sec', desc: 'Keep your core tight and back flat. Do not let hips sag.' },
  { id: 'cal-b6', name: 'Glute Bridge', muscles: 'Glutes, Hamstrings', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '12 reps', desc: 'Squeeze your glutes at the top of the movement.' },
  { id: 'cal-b7', name: 'Bodyweight Squat', muscles: 'Quads, Glutes', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '15 reps', desc: 'Go down until thighs are parallel to the ground.' },
  { id: 'cal-b8', name: 'Reverse Lunges', muscles: 'Quads, Hamstrings', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '10 reps/leg', desc: 'Step back and lower knee close to the floor.' },
  { id: 'cal-b9', name: 'Mountain Climbers', muscles: 'Core, Cardio', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '30 sec', desc: 'Drive your knees rapidly toward your chest.' },
  { id: 'cal-b10', name: 'Dead Bug', muscles: 'Core', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '10 reps/side', desc: 'Press your lower back flat into the floor.' },
  // Intermediate
  { id: 'cal-i1', name: 'Diamond Push-ups', muscles: 'Triceps, Chest', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '10 reps', desc: 'Hands close together forming a diamond shape.' },
  { id: 'cal-i2', name: 'Wide Push-ups', muscles: 'Outer Chest, Shoulders', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '10 reps', desc: 'Place hands wider than shoulder width.' },
  { id: 'cal-i3', name: 'Pike Push-ups', muscles: 'Shoulders, Triceps', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '8 reps', desc: 'Keep hips high in an inverted V shape.' },
  { id: 'cal-i4', name: 'Dips (using chair)', muscles: 'Triceps, Shoulders', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '12 reps', desc: 'Lower your hips close to the chair edge.' },
  { id: 'cal-i5', name: 'Jump Squats', muscles: 'Quads, Cardio', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '12 reps', desc: 'Explode upwards and land softly.' },
  { id: 'cal-i6', name: 'Bulgarian Split Squats', muscles: 'Quads, Glutes', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '10 reps/leg', desc: 'Place rear foot on a chair or bench.' },
  { id: 'cal-i7', name: 'Plank (45-60 sec)', muscles: 'Core', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '50 sec', desc: 'Maintain a straight line from head to toe.' },
  { id: 'cal-i8', name: 'Hollow Body Hold', muscles: 'Core', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '30 sec', desc: 'Lift shoulder blades and legs off the floor.' },
  { id: 'cal-i9', name: 'L-Sit Hold', muscles: 'Core, Triceps', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '10 sec', desc: 'Support weight on hands and lift legs straight.' },
  { id: 'cal-i10', name: 'Tuck Planche Lean', muscles: 'Shoulders, Core', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '15 sec', desc: 'Lean forward from plank to place weight on shoulders.' },
  // Advanced
  { id: 'cal-a1', name: 'Archer Push-ups', muscles: 'Chest, Shoulders', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '6 reps/side', desc: 'Extend one arm straight to the side as you lower.' },
  { id: 'cal-a2', name: 'Pseudo Planche Push-ups', muscles: 'Shoulders, Chest', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '8 reps', desc: 'Place hands near waist and lean forward.' },
  { id: 'cal-a3', name: 'Handstand Wall Hold', muscles: 'Shoulders, Core', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '30 sec', desc: 'Walk feet up wall to hold a handstand position.' },
  { id: 'cal-a4', name: 'One-Arm Push-up Progression', muscles: 'Chest, Core', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '5 reps/side', desc: 'Keep feet wide for balance and push.' },
  { id: 'cal-a5', name: 'Pistol Squat Progression', muscles: 'Quads, Balance', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '5 reps/leg', desc: 'Squat down on one leg while extending other forward.' },
  { id: 'cal-a6', name: 'Front Lever Tuck Hold', muscles: 'Back, Core', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '12 sec', desc: 'Hang from bar and pull body horizontal with knees tucked.' },
  { id: 'cal-a7', name: 'Back Lever Tuck Hold', muscles: 'Lower Back, Shoulders', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '12 sec', desc: 'Hang upside down and lower body horizontal with knees tucked.' },
  { id: 'cal-a8', name: 'Dragon Flag Negatives', muscles: 'Core, Lats', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '5 reps', desc: 'Lower your body down as slowly as possible.' },
  { id: 'cal-a9', name: 'Muscle-Up Progression', muscles: 'Lats, Chest, Triceps', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '5 reps', desc: 'Pull up explosively to transition above the bar.' },
  { id: 'cal-a10', name: 'Ring Dips', muscles: 'Triceps, Chest', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '8 reps', desc: 'Keep rings close to your body and stabilize.' }
];

export const DEFAULT_HOME_EXERCISES: CustomExercise[] = [
  // Beginner
  { id: 'home-b1', name: 'Bodyweight Squats', muscles: 'Quads, Glutes', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '15 reps', desc: 'Keep chest up and heels flat on the floor.' },
  { id: 'home-b2', name: 'Wall Sit', muscles: 'Quads', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '30 sec', desc: 'Press back flat against wall with knees at 90 degrees.' },
  { id: 'home-b3', name: 'Glute Bridge', muscles: 'Glutes', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '15 reps', desc: 'Drive heels into the floor and raise hips.' },
  { id: 'home-b4', name: 'Push-ups', muscles: 'Chest, Arms', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '10 reps', desc: 'Keep body straight from head to heels.' },
  { id: 'home-b5', name: 'Incline Push-ups', muscles: 'Lower Chest', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '12 reps', desc: 'Place hands on an elevated surface like a bed/couch.' },
  { id: 'home-b6', name: 'Plank (20-30 sec)', muscles: 'Core', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '25 sec', desc: 'Squeeze glutes and core, look slightly forward.' },
  { id: 'home-b7', name: 'Superman Hold', muscles: 'Lower Back', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '20 sec', desc: 'Lift chest and thighs off floor simultaneously.' },
  { id: 'home-b8', name: 'Calf Raises', muscles: 'Calves', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '20 reps', desc: 'Pause at the top of each raise for maximum squeeze.' },
  { id: 'home-b9', name: 'Step-ups (using stair)', muscles: 'Quads, Glutes', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '12 reps/leg', desc: 'Step up onto a step and drive opposite knee up.' },
  { id: 'home-b10', name: 'High Knees', muscles: 'Cardio, Core', level: 'beginner', enabled: true, isCustom: false, sets: 3, reps: '35 sec', desc: 'Run in place bringing knees to hip height.' },
  // Intermediate
  { id: 'home-i1', name: 'Jump Squats', muscles: 'Quads, Cardio', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '12 reps', desc: 'Lower into squat then jump explosively.' },
  { id: 'home-i2', name: 'Single-Leg Glute Bridge', muscles: 'Glutes, Hamstrings', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '10 reps/leg', desc: 'Perform glute bridge with one leg extended.' },
  { id: 'home-i3', name: 'Decline Push-ups', muscles: 'Upper Chest', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '10 reps', desc: 'Place feet on elevated surface and hands on floor.' },
  { id: 'home-i4', name: 'Pike Push-ups', muscles: 'Shoulders', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '8 reps', desc: 'Drive top of head toward the floor between your hands.' },
  { id: 'home-i5', name: 'Side Plank', muscles: 'Obliques', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '30 sec/side', desc: 'Support weight on elbow and side of foot.' },
  { id: 'home-i6', name: 'Flutter Kicks', muscles: 'Lower Abs', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '40 sec', desc: 'Keep legs straight and kick them up and down rapidly.' },
  { id: 'home-i7', name: 'Reverse Lunges', muscles: 'Quads, Glutes', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '12 reps/leg', desc: 'Keep front knee aligned over ankle.' },
  { id: 'home-i8', name: 'Burpees', muscles: 'Cardio, Full Body', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '10 reps', desc: 'Drop to floor, push up, jump up explosively.' },
  { id: 'home-i9', name: 'Bear Crawl', muscles: 'Core, Shoulders', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '30 sec', desc: 'Move forward on hands and toes keeping hips low.' },
  { id: 'home-i10', name: 'V-Up Crunches', muscles: 'Abs', level: 'intermediate', enabled: true, isCustom: false, sets: 3, reps: '12 reps', desc: 'Reach for your toes while raising torso and legs.' },
  // Advanced
  { id: 'home-a1', name: 'Pistol Squat Progression', muscles: 'Quads, Balance', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '5 reps/leg', desc: 'Single leg squat down to parallel or below.' },
  { id: 'home-a2', name: 'Plyometric Push-ups', muscles: 'Chest, Power', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '8 reps', desc: 'Push up explosively so hands leave the floor.' },
  { id: 'home-a3', name: 'Hindu Push-ups', muscles: 'Shoulders, Chest', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '8 reps', desc: 'Swoop body down and arch back up in a circular motion.' },
  { id: 'home-a4', name: 'Tuck Jumps', muscles: 'Leg Power, Cardio', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '10 reps', desc: 'Jump up drawing knees high to chest.' },
  { id: 'home-a5', name: 'Shrimp Squat', muscles: 'Quads, Balance', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '5 reps/leg', desc: 'Squat on one leg holding rear foot with hand.' },
  { id: 'home-a6', name: 'Handstand Wall Hold', muscles: 'Shoulders', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '40 sec', desc: 'Hold vertical posture against wall to build overhead strength.' },
  { id: 'home-a7', name: 'Dragon Flag Negatives', muscles: 'Core, Full Body', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '6 reps', desc: 'Control the eccentric lowering phase of the dragon flag.' },
  { id: 'home-a8', name: 'One-Arm Push-up Progression', muscles: 'Chest, Core', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '5 reps/side', desc: 'Perform one-armed push-ups off elevated surface first.' },
  { id: 'home-a9', name: 'Planche Lean', muscles: 'Shoulders, Wrist', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '15 sec', desc: 'Lean forward in plank keeping arms fully locked.' },
  { id: 'home-a10', name: 'L-Sit Progression', muscles: 'Core, Lats', level: 'advanced', enabled: true, isCustom: false, sets: 3, reps: '12 sec', desc: 'Support body on floor or books and raise legs off ground.' }
];

export const generateDailyWorkout = (type: 'calisthenics' | 'home', currentState: AppState): WorkoutState => {
  const days = currentState.workoutDaysCompleted || 0;
  let level: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  if (days >= 60) level = 'advanced';
  else if (days >= 30) level = 'intermediate';

  const pool = type === 'calisthenics' 
    ? (currentState.calisthenicsExercises || DEFAULT_CALISTHENICS_EXERCISES)
    : (currentState.homeWorkoutExercises || DEFAULT_HOME_EXERCISES);

  // Filter enabled exercises for the current level
  const levelExercises = pool.filter(ex => ex.level === level && ex.enabled);

  // Pick 5-6 exercises (let's pick min(6, levelExercises.length))
  // To avoid shuffling on every render/read, we use a pseudo-random rotation based on the days completed
  // This keeps the workout stable for the day but rotates which ones are selected
  const selected: CustomExercise[] = [];
  const poolSize = levelExercises.length;
  if (poolSize > 0) {
    const count = Math.min(6, poolSize);
    for (let i = 0; i < count; i++) {
      const idx = (days + i) % poolSize;
      selected.push(levelExercises[idx]);
    }
  }

  const title = `${type === 'calisthenics' ? 'Calisthenics' : 'Home'} Workout — Day ${days + 1}`;
  const focus = level.toUpperCase() + ' LEVEL';

  return {
    title,
    focus,
    started: false,
    completed: false,
    exercises: selected.map(ex => ({
      id: ex.id,
      name: ex.name,
      sets: ex.sets,
      completedSets: 0,
      reps: ex.reps,
      muscles: ex.muscles,
      desc: ex.desc
    }))
  };
};

export const generateGymWorkout = (currentState: AppState): WorkoutState => {
  const plan = currentState.workoutPlan || 5;
  const dayOfWeek = new Date().getDay();
  const routine = WORKOUT_ROUTINES[plan][dayOfWeek];
  return {
    title: routine.title,
    focus: routine.focus,
    started: false,
    completed: false,
    exercises: JSON.parse(JSON.stringify(routine.exercises))
  };
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
  workoutType: null,
  workoutDaysCompleted: 0,
  calisthenicsExercises: DEFAULT_CALISTHENICS_EXERCISES,
  homeWorkoutExercises: DEFAULT_HOME_EXERCISES,
  
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

export interface LeaderboardPlayer {
  id?: string;
  name: string;
  xp: number;
  priorityXP?: number;
  lvl: number;
  badge: string;
  plan: 'free' | 'pro' | 'elite';
  handle: string;
  avatarUrl: string;
  isUser: boolean;
  isRealUser?: boolean;
}

interface AppContextProps {
  state: AppState;
  toasts: Toast[];
  user: any;
  userProfile: { role: string; username: string; subscription_plan: string } | null;
  loading: boolean;
  adVisible: boolean;
  adRewarded: boolean;
  competitors: LeaderboardPlayer[];
  loadingLeaderboard: boolean;
  fetchLeaderboardData: () => Promise<void>;
  showToast: (header: string, body: string, type?: 'success' | 'error' | 'achievement') => void;
  dismissToast: (id: string) => void;
  switchView: (view: string) => void;
  selectPreset: (preset: 'shredded' | 'bulk' | 'lean' | 'beginner') => void;
  startScanSimulation: () => void;
  addWater: (amount: number, currentState?: AppState) => void;
  logGym: (duration: number, currentState?: AppState) => void;
  addStudyHours: (hours: number, currentState?: AppState) => void;
  saveSleepInput: (hours: number, currentState?: AppState) => void;
  simulateSteps: (amount: number, showFeedback?: boolean, currentState?: AppState) => void;
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
  selectWorkoutType: (type: 'calisthenics' | 'gym' | 'home' | null) => void;
  addCustomExercise: (name: string, muscles: string) => void;
  removeExercise: (exerciseId: string) => void;
  toggleExercise: (exerciseId: string) => void;
  reorderExercises: (exercises: CustomExercise[]) => void;
  resetExercisesToDefault: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

const STATIC_BOTS = [
  { name: 'mollitommy', xp: 55200, lvl: 150, plan: 'pro', badge: 'badges/ultrasupreme.png', handle: '@mollitommy', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'jefryjerry', xp: 35200, lvl: 120, plan: 'pro', badge: 'badges/master.png', handle: '@jefryjerry', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'kolitrurne', xp: 25200, lvl: 100, plan: 'pro', badge: 'badges/dimond.png', handle: '@kolitrurne', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'Theresa Webb', xp: 18500, lvl: 100, plan: 'free', badge: 'badges/gold.png', handle: '@meraty', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'Kathryn Murphy', xp: 15200, lvl: 50, plan: 'free', badge: 'badges/silver.png', handle: '@faueod', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'Jane Cooper', xp: 12100, lvl: 25, plan: 'free', badge: 'badges/bronze.png', handle: '@jikolim', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'Zyzz', xp: 15000, lvl: 19, badge: 'badges/gold.png', plan: 'elite', handle: '@zyzz', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'David Laid', xp: 16200, lvl: 22, badge: 'badges/gold.png', plan: 'pro', handle: '@davidlaid', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'C-Bum', xp: 13320, lvl: 16, badge: 'badges/silver.png', plan: 'free', handle: '@cbum', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'Sam Sulek', xp: 13100, lvl: 15, badge: 'badges/silver.png', plan: 'free', handle: '@samsulek', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'Arnold', xp: 11800, lvl: 13, badge: 'badges/silver.png', plan: 'free', handle: '@arnold', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'Noel Deyzel', xp: 10400, lvl: 11, badge: 'badges/bronze.png', plan: 'free', handle: '@noeldeyzel', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'Ronnie C', xp: 10150, lvl: 10, badge: 'badges/bronze.png', plan: 'free', handle: '@ronniec', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'Jeff Seid', xp: 8650, lvl: 8, badge: 'badges/bronze.png', plan: 'free', handle: '@jeffseid', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'Alex Eubank', xp: 7400, lvl: 5, badge: 'badges/bronze.png', plan: 'free', handle: '@alexeubank', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' }
];

export const getRankDetails = (xp: number) => {
  if (xp < 1500) {
    return { name: 'Iron I', minXp: 0, maxXp: 1500, badge: 'badges/bronze.png', next: 'Iron II' };
  } else if (xp < 3000) {
    return { name: 'Iron II', minXp: 1500, maxXp: 3000, badge: 'badges/bronze.png', next: 'Bronze I' };
  } else if (xp < 3500) {
    return { name: 'Bronze I', minXp: 3000, maxXp: 3500, badge: 'badges/bronze.png', next: 'Bronze II' };
  } else if (xp < 5000) {
    return { name: 'Bronze II', minXp: 3500, maxXp: 5000, badge: 'badges/bronze.png', next: 'Silver' };
  } else if (xp < 8000) {
    return { name: 'Silver', minXp: 5000, maxXp: 8000, badge: 'badges/silver.png', next: 'Gold' };
  } else if (xp < 16000) {
    return { name: 'Gold', minXp: 8000, maxXp: 16000, badge: 'badges/gold.png', next: 'Diamond' };
  } else if (xp < 30000) {
    return { name: 'Diamond', minXp: 16000, maxXp: 30000, badge: 'badges/dimond.png', next: 'Master' };
  } else if (xp < 50000) {
    return { name: 'Master', minXp: 30000, maxXp: 50000, badge: 'badges/master.png', next: 'Supreme' };
  } else if (xp < 100000) {
    return { name: 'Supreme', minXp: 50000, maxXp: 100000, badge: 'badges/supreme.png', next: 'Ultra Supreme' };
  } else {
    return { name: 'Ultra Supreme', minXp: 100000, maxXp: 100000, badge: 'badges/ultrasupreme.png', next: 'Max Rank' };
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<{ role: string; username: string; subscription_plan: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [adVisible, setAdVisible] = useState(false);
  const [adRewarded, setAdRewarded] = useState(false);
  const [competitors, setCompetitors] = useState<LeaderboardPlayer[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  
  const stateRef = useRef(state);
  stateRef.current = state;
  const syncTimeoutRef = useRef<any>(null);

  const fetchLeaderboardData = async () => {
    setLoadingLeaderboard(true);
    try {
      const activeState = stateRef.current;
      const session = (await supabase.auth.getSession()).data.session;
      if (session && activeState.isUserSignedIn) {
        const { data: rows, error } = await supabase
          .from('profiles')
          .select('id, username, subscription_plan, user_states(state_json)')
          .neq('subscription_plan', 'free');

        if (error) throw error;

        const dbCompetitors: LeaderboardPlayer[] = [];
        rows?.forEach((row: any) => {
          const uState = row.user_states?.state_json || {};
          const totalXP = uState.totalXP || 0;
          
          let lvl = 10;
          let badge = 'badges/bronze.png';
          if (totalXP < 3000) { lvl = 10; badge = 'badges/bronze.png'; }
          else if (totalXP < 8000) { lvl = 20; badge = 'badges/silver.png'; }
          else if (totalXP < 16000) { lvl = 30; badge = 'badges/gold.png'; }
          else if (totalXP < 30000) { lvl = 40; badge = 'badges/dimond.png'; }
          else if (totalXP < 50000) { lvl = 50; badge = 'badges/master.png'; }
          else if (totalXP < 100000) { lvl = 60; badge = 'badges/supreme.png'; }
          else { lvl = 70; badge = 'badges/ultrasupreme.png'; }

          const priorityXP = row.subscription_plan === 'elite' ? totalXP + 1000 : totalXP;
          const isUser = row.username === activeState.grinderName;

          dbCompetitors.push({
            id: row.id,
            name: row.username,
            xp: totalXP,
            priorityXP,
            lvl,
            badge,
            plan: row.subscription_plan,
            handle: `@${row.username.toLowerCase().replace(/\s+/g, '')}`,
            avatarUrl: uState.avatarUrl || 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png',
            isUser,
            isRealUser: true,
          });
        });

        const botsList: LeaderboardPlayer[] = STATIC_BOTS.map((bot) => ({
          name: bot.name,
          xp: bot.xp,
          lvl: bot.lvl,
          badge: bot.badge,
          plan: bot.plan as any,
          handle: bot.handle,
          avatarUrl: bot.avatarUrl,
          isUser: false,
        }));

        const userExistsInDb = dbCompetitors.some(p => p.isUser);
        if (!userExistsInDb && activeState.subscriptionPlan !== 'free') {
          dbCompetitors.push({
            name: activeState.grinderName,
            xp: activeState.totalXP,
            lvl: Math.floor(activeState.totalXP / 400) + 1,
            badge: getBadgeSrcLocal(activeState.totalXP),
            plan: activeState.subscriptionPlan,
            handle: `@${activeState.grinderName.toLowerCase().replace(/\s+/g, '')}`,
            avatarUrl: activeState.avatarUrl || 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png',
            isUser: true,
          });
        }

        const combined = [...dbCompetitors, ...botsList];
        const unique = combined.filter((v, i, a) => a.findIndex(t => (t.handle === v.handle)) === i);
        
        unique.sort((a, b) => {
          const aVal = a.priorityXP !== undefined ? a.priorityXP : a.xp;
          const bVal = b.priorityXP !== undefined ? b.priorityXP : b.xp;
          return bVal - aVal;
        });

        setCompetitors(unique);
      } else {
        generateMockOfflineLeaderboard();
      }
    } catch (err) {
      console.error('Failed to load online leaderboard, loading fallback:', err);
      generateMockOfflineLeaderboard();
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const getBadgeSrcLocal = (xp: number) => {
    if (xp < 3000) return 'badges/bronze.png';
    if (xp < 8000) return 'badges/silver.png';
    if (xp < 16000) return 'badges/gold.png';
    if (xp < 30000) return 'badges/dimond.png';
    if (xp < 50000) return 'badges/master.png';
    if (xp < 100000) return 'badges/supreme.png';
    return 'badges/ultrasupreme.png';
  };

  const generateMockOfflineLeaderboard = () => {
    const activeState = stateRef.current;
    const list: LeaderboardPlayer[] = STATIC_BOTS.map((bot) => ({
      name: bot.name,
      xp: bot.xp,
      lvl: bot.lvl,
      badge: bot.badge,
      plan: bot.plan as any,
      handle: bot.handle,
      avatarUrl: bot.avatarUrl,
      isUser: false,
    }));

    if (activeState.subscriptionPlan !== 'free') {
      let lvl = 10;
      let badge = 'badges/bronze.png';
      if (activeState.totalXP < 3000) { lvl = 10; badge = 'badges/bronze.png'; }
      else if (activeState.totalXP < 8000) { lvl = 20; badge = 'badges/silver.png'; }
      else if (activeState.totalXP < 16000) { lvl = 30; badge = 'badges/gold.png'; }
      else if (activeState.totalXP < 30000) { lvl = 40; badge = 'badges/dimond.png'; }
      else if (activeState.totalXP < 50000) { lvl = 50; badge = 'badges/master.png'; }
      else if (activeState.totalXP < 100000) { lvl = 60; badge = 'badges/supreme.png'; }
      else { lvl = 70; badge = 'badges/ultrasupreme.png'; }

      const priorityXP = activeState.subscriptionPlan === 'elite' ? activeState.totalXP + 1000 : activeState.totalXP;
      
      list.push({
        name: activeState.grinderName,
        xp: activeState.totalXP,
        priorityXP,
        lvl,
        badge,
        plan: activeState.subscriptionPlan,
        handle: `@${activeState.grinderName.toLowerCase().replace(/\s+/g, '')}`,
        avatarUrl: activeState.avatarUrl || 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png',
        isUser: true,
      });
    }

    list.sort((a, b) => {
      const aVal = a.priorityXP !== undefined ? a.priorityXP : a.xp;
      const bVal = b.priorityXP !== undefined ? b.priorityXP : b.xp;
      return bVal - aVal;
    });

    setCompetitors(list);
  };

  useEffect(() => {
    if (!loading) {
      fetchLeaderboardData();
    }
  }, [state.totalXP, state.subscriptionPlan, state.grinderName, loading]);

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
        
        // Seed default values for new fields if they are missing in database state
        dbState.workoutType = dbState.workoutType !== undefined ? dbState.workoutType : null;
        dbState.workoutDaysCompleted = dbState.workoutDaysCompleted !== undefined ? dbState.workoutDaysCompleted : 0;
        dbState.calisthenicsExercises = dbState.calisthenicsExercises !== undefined ? dbState.calisthenicsExercises : DEFAULT_CALISTHENICS_EXERCISES;
        dbState.homeWorkoutExercises = dbState.homeWorkoutExercises !== undefined ? dbState.homeWorkoutExercises : DEFAULT_HOME_EXERCISES;

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

  const selectPreset = (preset: 'shredded' | 'bulk' | 'lean' | 'beginner') => {
    const current = { ...stateRef.current };
    current.selectedPreset = preset;
    saveState(current);
  };

  const startScanSimulation = () => {
    const current = { ...stateRef.current };
    if (current.isScanning) return;

    current.isScanning = true;
    current.hasScanned = false;
    saveState(current);

    showToast('AI Scanner Initializing 🔍', 'Positioning camera and computing grid...', 'success');

    setTimeout(() => {
      const updated = { ...stateRef.current };
      updated.isScanning = false;
      updated.hasScanned = true;
      
      // Credit 150 XP
      const oldXp = updated.totalXP;
      updated.totalXP += Math.round(150 * updated.expBoostMultiplier);
      checkLevelAchievements(oldXp, updated);
      
      saveState(updated);
      showToast('Scan Completed 🏆', 'Your physique ratings have been generated. (+150 XP)', 'success');
    }, 2500);
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

    // Check rest day credits (only applicable to gym / standard splits)
    const plan = current.workoutPlan || 5;
    const dayOfWeek = new Date().getDay();
    const routine = WORKOUT_ROUTINES[plan][dayOfWeek];
    const isRestDay = (current.workoutType === 'gym' || !current.workoutType) && (!routine.exercises || routine.exercises.length === 0);

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
      if (current.workoutType === 'calisthenics' || current.workoutType === 'home') {
        current.workout = generateDailyWorkout(current.workoutType, current);
      } else {
        current.workout = generateGymWorkout(current);
      }
    }

    return current;
  };

  const addXP = (amount: number, isAchievement = false, currentState?: AppState) => {
    const current = currentState || { ...stateRef.current };
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

    if (!currentState) {
      saveState(current);
    }
    showToast('XP Gained', `+${finalAmount} XP earned${current.expBoostMultiplier > 1 ? ` (${current.expBoostMultiplier}x boost)` : ''}!`);
  };

  // Verify rank progression boundaries
  const getRankName = (xp: number) => {
    return getRankDetails(xp).name;
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
  const addWater = (amount: number, currentState?: AppState) => {
    const current = currentState || { ...stateRef.current };
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
          addXP(task.xp, true, current);
        }
        if (current.waterStreak === 0) current.waterStreak = 1;
      }

      // Special checks for perfect routine before noon
      checkCompoundGoalsToday(current);
      addXP(10, false, current);

      if (!currentState) {
        saveState(current);
      }
    } else {
      showToast('Hydration Met', 'You have hit 8/8 glasses today!', 'success');
    }
  };

  const logGym = (duration: number, currentState?: AppState) => {
    const current = currentState || { ...stateRef.current };
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
        addXP(task.xp, true, current);
      }
    }

    checkCompoundGoalsToday(current);
    addXP(120, false, current);

    if (!currentState) {
      saveState(current);
    }
  };

  const addStudyHours = (hours: number, currentState?: AppState) => {
    const current = currentState || { ...stateRef.current };
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
        addXP(task.xp, true, current);
      }
      if (current.studyStreak === 0) current.studyStreak = 1;
    }

    checkCompoundGoalsToday(current);
    addXP(Math.round(hours * 50), false, current);

    if (!currentState) {
      saveState(current);
    }
  };

  const saveSleepInput = (hours: number, currentState?: AppState) => {
    const current = currentState || { ...stateRef.current };
    current.sleepHours = hours;
    current.sleepLogsCount++;

    if (hours >= 8.0) {
      current.nightsWith8HrsSleep++;
      const task = current.tasks.find(t => t.id === 'sleep-task');
      if (task && !task.completed) {
        task.completed = true;
        addXP(task.xp, true, current);
      }
      if (current.sleepStreak === 0) current.sleepStreak = 1;
    }

    const hr = new Date().getHours();
    if (hr < 6 && hours >= 7.0) {
      current.earlyRiseSleepGoalCount++;
    }

    checkCompoundGoalsToday(current);
    addXP(50, false, current);

    if (!currentState) {
      saveState(current);
    }
  };

  const simulateSteps = (amount: number, showFeedback = true, currentState?: AppState) => {
    const current = currentState || { ...stateRef.current };
    const oldSteps = current.stepsCount;
    current.stepsCount += amount;

    const oldThousands = Math.floor(oldSteps / 1000);
    const newThousands = Math.floor(current.stepsCount / 1000);
    if (newThousands > oldThousands) {
      const gXp = (newThousands - oldThousands) * 10;
      addXP(gXp, false, current);
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

    if (!currentState) {
      saveState(current);
    }
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
      addXP(task.xp, false, current);
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
      addXP(-15, false, current);
    } else {
      ex.completedSets = setNum;
      addXP(15, false, current);
    }
    saveState(current);
  };

  const completeWorkout = () => {
    const current = { ...stateRef.current };
    if (!current.workout) return;

    current.workout.started = false;
    current.workout.completed = true;

    // Increment completed workouts count
    const oldDays = current.workoutDaysCompleted || 0;
    const newDays = oldDays + 1;
    current.workoutDaysCompleted = newDays;

    // Progression level change checks
    const oldLevel = oldDays >= 60 ? 'advanced' : oldDays >= 30 ? 'intermediate' : 'beginner';
    const newLevel = newDays >= 60 ? 'advanced' : newDays >= 30 ? 'intermediate' : 'beginner';
    
    if (oldLevel !== newLevel) {
      showToast('Workout Split Promoted! 🚀', `You have advanced to the ${newLevel.toUpperCase()} workout split level!`);
    }
    
    logGym(45, current);
    addXP(150, false, current);
    saveState(current);
    showToast('Workout Complete! 🏆', 'Smashed all target muscle exercises! (+150 XP)');
  };

  const selectWorkoutType = (type: 'calisthenics' | 'gym' | 'home' | null) => {
    const current = { ...stateRef.current };
    current.workoutType = type;
    current.workout = null; // force regenerate
    
    // Regenerate immediately
    if (type === 'calisthenics' || type === 'home') {
      current.workout = generateDailyWorkout(type, current);
    } else if (type === 'gym') {
      current.workout = generateGymWorkout(current);
    }
    
    saveState(current);
    showToast('Split Choice Updated 🏋️', `Workout plan changed to ${type ? type.toUpperCase() : 'NONE'}.`);
  };

  const addCustomExercise = (name: string, muscles: string) => {
    const current = { ...stateRef.current };
    const type = current.workoutType;
    if (type !== 'calisthenics' && type !== 'home') return;

    const days = current.workoutDaysCompleted || 0;
    let level: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (days >= 60) level = 'advanced';
    else if (days >= 30) level = 'intermediate';

    const newEx: CustomExercise = {
      id: 'custom-ex-' + Date.now(),
      name,
      muscles,
      level,
      enabled: true,
      isCustom: true,
      sets: 3,
      reps: '10 reps',
      desc: 'Custom user added exercise.'
    };

    if (type === 'calisthenics') {
      current.calisthenicsExercises = [...(current.calisthenicsExercises || DEFAULT_CALISTHENICS_EXERCISES), newEx];
    } else {
      current.homeWorkoutExercises = [...(current.homeWorkoutExercises || DEFAULT_HOME_EXERCISES), newEx];
    }

    // Add directly to today's active exercises list so it appears immediately!
    if (current.workout && current.workout.exercises) {
      current.workout.exercises = [
        ...current.workout.exercises,
        {
          id: newEx.id,
          name: newEx.name,
          sets: newEx.sets,
          completedSets: 0,
          reps: newEx.reps,
          muscles: newEx.muscles,
          desc: newEx.desc
        }
      ];
    }

    saveState(current);
    showToast('Exercise Added 🏋️', `"${name}" added to your current pool.`);
  };

  const removeExercise = (exerciseId: string) => {
    const current = { ...stateRef.current };
    const type = current.workoutType;
    if (type !== 'calisthenics' && type !== 'home') return;

    if (type === 'calisthenics') {
      current.calisthenicsExercises = (current.calisthenicsExercises || DEFAULT_CALISTHENICS_EXERCISES).filter(ex => ex.id !== exerciseId);
    } else {
      current.homeWorkoutExercises = (current.homeWorkoutExercises || DEFAULT_HOME_EXERCISES).filter(ex => ex.id !== exerciseId);
    }

    // Also remove from active workout today if it exists
    if (current.workout && current.workout.exercises) {
      current.workout.exercises = current.workout.exercises.filter(ex => ex.id !== exerciseId);
    }

    saveState(current);
    showToast('Exercise Removed 🗑️', 'Exercise has been removed from your plan.');
  };

  const toggleExercise = (exerciseId: string) => {
    const current = { ...stateRef.current };
    const type = current.workoutType;
    if (type !== 'calisthenics' && type !== 'home') return;

    if (type === 'calisthenics') {
      current.calisthenicsExercises = (current.calisthenicsExercises || DEFAULT_CALISTHENICS_EXERCISES).map(ex => 
        ex.id === exerciseId ? { ...ex, enabled: !ex.enabled } : ex
      );
    } else {
      current.homeWorkoutExercises = (current.homeWorkoutExercises || DEFAULT_HOME_EXERCISES).map(ex => 
        ex.id === exerciseId ? { ...ex, enabled: !ex.enabled } : ex
      );
    }

    saveState(current);
  };

  const reorderExercises = (exercises: CustomExercise[]) => {
    const current = { ...stateRef.current };
    const type = current.workoutType;
    if (type !== 'calisthenics' && type !== 'home') return;

    // Filter out the exercises of other levels to merge them correctly
    const days = current.workoutDaysCompleted || 0;
    let level: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (days >= 60) level = 'advanced';
    else if (days >= 30) level = 'intermediate';

    if (type === 'calisthenics') {
      const otherLevels = (current.calisthenicsExercises || DEFAULT_CALISTHENICS_EXERCISES).filter(ex => ex.level !== level);
      current.calisthenicsExercises = [...exercises, ...otherLevels];
    } else {
      const otherLevels = (current.homeWorkoutExercises || DEFAULT_HOME_EXERCISES).filter(ex => ex.level !== level);
      current.homeWorkoutExercises = [...exercises, ...otherLevels];
    }

    // Also update today's active workout list sequence to match the new order!
    if (current.workout && current.workout.exercises) {
      const sorted = [];
      for (const ex of exercises) {
        const found = current.workout.exercises.find(e => e.id === ex.id);
        if (found) sorted.push(found);
      }
      // If there are any exercises in today's list not in the new order, append them
      for (const ex of current.workout.exercises) {
        if (!sorted.some(e => e.id === ex.id)) sorted.push(ex);
      }
      current.workout.exercises = sorted;
    }

    saveState(current);
  };

  const resetExercisesToDefault = () => {
    const current = { ...stateRef.current };
    const type = current.workoutType;
    if (type !== 'calisthenics' && type !== 'home') return;

    if (type === 'calisthenics') {
      current.calisthenicsExercises = JSON.parse(JSON.stringify(DEFAULT_CALISTHENICS_EXERCISES));
    } else {
      current.homeWorkoutExercises = JSON.parse(JSON.stringify(DEFAULT_HOME_EXERCISES));
    }

    current.workout = generateDailyWorkout(type, current);

    saveState(current);
    showToast('Restored Defaults 🔄', 'All exercises reset to system defaults.');
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
      competitors,
      loadingLeaderboard,
      fetchLeaderboardData,
      showToast,
      dismissToast,
      switchView,
      selectPreset,
      startScanSimulation,
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
      selectWorkoutType,
      addCustomExercise,
      removeExercise,
      toggleExercise,
      reorderExercises,
      resetExercisesToDefault,
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
