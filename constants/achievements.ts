export interface AchievementDefinition {
  id: number;
  category: 'workout' | 'study' | 'sleep' | 'water' | 'special';
  name: string;
  description: string;
  xp: number;
  target: number;
  img: string;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  { id: 1, category: "workout", name: "First rep", description: "Complete your first workout session.", xp: 100, target: 1, img: "achivement/dumble.png" },
  { id: 2, category: "workout", name: "Heat check", description: "Work out 3 days in a row.", xp: 200, target: 3, img: "achivement/lifting.png" },
  { id: 3, category: "workout", name: "Locked in", description: "Complete 7 straight days of workouts.", xp: 350, target: 7, img: "achivement/muscles.png" },
  { id: 4, category: "workout", name: "Iron week", description: "Hit every workout for a full week with no skips.", xp: 400, target: 7, img: "achivement/lifting.png" },
  { id: 5, category: "workout", name: "On a mission", description: "Log 20 total workout sessions.", xp: 350, target: 20, img: "achivement/dumble.png" },
  { id: 6, category: "workout", name: "Cardio king", description: "Log 10 cardio sessions.", xp: 250, target: 10, img: "achivement/run.png" },
  { id: 7, category: "workout", name: "Lifter", description: "Log 10 strength training sessions.", xp: 250, target: 10, img: "achivement/lifting.png" },
  { id: 8, category: "workout", name: "Sweat streak", description: "Work out 30 days in a month.", xp: 500, target: 30, img: "achivement/muscles.png" },
  { id: 9, category: "workout", name: "Early bird lifts", description: "Complete a workout before 7 AM.", xp: 200, target: 1, img: "achivement/dumble.png" },
  { id: 10, category: "workout", name: "Night grinder", description: "Complete a workout after 9 PM.", xp: 150, target: 1, img: "achivement/lifting.png" },
  { id: 11, category: "workout", name: "Gains machine", description: "Log 50 total workout sessions.", xp: 600, target: 50, img: "achivement/muscles.png" },
  { id: 12, category: "workout", name: "Century", description: "Reach 100 total workouts.", xp: 700, target: 100, img: "achivement/muscles.png" },

  { id: 13, category: "study", name: "First page", description: "Log your first study session.", xp: 100, target: 1, img: "study/study 1.png" },
  { id: 14, category: "study", name: "Study buddy", description: "Study 3 days in a row.", xp: 200, target: 3, img: "study/study 2.png" },
  { id: 15, category: "study", name: "Deep focus", description: "Study for 2+ hours in a single session.", xp: 250, target: 1, img: "study/study 3.png" },
  { id: 16, category: "study", name: "Time investor", description: "Log 10 total hours of studying.", xp: 300, target: 10, img: "study/study 4.png" },
  { id: 17, category: "study", name: "Weekly scholar", description: "Study every day for a full week.", xp: 350, target: 7, img: "study/study 5.png" },
  { id: 18, category: "study", name: "Grind mode", description: "Log 7 study sessions in a week.", xp: 400, target: 7, img: "study/study 6.png" },
  { id: 19, category: "study", name: "Big brain", description: "Log 50 total hours of studying.", xp: 500, target: 50, img: "study/study 7.png" },
  { id: 20, category: "study", name: "Scholar", description: "Study consistently for 30 days.", xp: 550, target: 30, img: "study/study 8.png" },
  { id: 21, category: "study", name: "100 hour club", description: "Hit 100 total study hours.", xp: 700, target: 100, img: "study/study 7.png" },
  { id: 22, category: "study", name: "Morning mind", description: "Start a study session before 8 AM.", xp: 150, target: 1, img: "study/study 1.png" },
  { id: 23, category: "study", name: "Late night grind", description: "Study past midnight.", xp: 150, target: 1, img: "study/study 3.png" },
  { id: 24, category: "study", name: "Consistent learner", description: "Study at least 30 min every day for 14 days.", xp: 400, target: 14, img: "study/study 5.png" },

  { id: 25, category: "sleep", name: "Lights out", description: "Log your first sleep session.", xp: 100, target: 1, img: "study/study 2.png" },
  { id: 26, category: "sleep", name: "Rest locked", description: "Hit your sleep goal 3 nights in a row.", xp: 200, target: 3, img: "study/study 4.png" },
  { id: 27, category: "sleep", name: "8 hours", description: "Sleep 8+ hours in a single night.", xp: 150, target: 1, img: "study/study 6.png" },
  { id: 28, category: "sleep", name: "Perfect rest", description: "Hit your sleep goal 7 nights straight.", xp: 350, target: 7, img: "study/study 8.png" },
  { id: 29, category: "sleep", name: "Sleep king", description: "Maintain your sleep goal for 30 days.", xp: 500, target: 30, img: "study/study 3.png" },
  { id: 30, category: "sleep", name: "Early riser", description: "Wake up before 6 AM after 7+ hours of sleep.", xp: 250, target: 1, img: "study/study 1.png" },
  { id: 31, category: "sleep", name: "Recharge master", description: "Average 8 hours of sleep for a full week.", xp: 400, target: 7, img: "study/study 5.png" },
  { id: 32, category: "sleep", name: "Recovery mode", description: "Log 14 straight nights of solid sleep.", xp: 450, target: 14, img: "study/study 6.png" },
  { id: 33, category: "sleep", name: "Well-rested warrior", description: "Maintain a healthy sleep schedule for 60 days.", xp: 650, target: 60, img: "study/study 8.png" },
  { id: 34, category: "sleep", name: "Dream streak", description: "Never miss your sleep log for 21 days.", xp: 350, target: 21, img: "study/study 2.png" },

  { id: 35, category: "water", name: "First sip", description: "Log your first water intake.", xp: 100, target: 1, img: "study/study 4.png" },
  { id: 36, category: "water", name: "Hydrated", description: "Hit your daily water goal for the first time.", xp: 150, target: 1, img: "study/study 2.png" },
  { id: 37, category: "water", name: "3-day flow", description: "Hit your water goal 3 days in a row.", xp: 200, target: 3, img: "study/study 7.png" },
  { id: 38, category: "water", name: "Hydration streak", description: "Hit your water goal 7 days straight.", xp: 300, target: 7, img: "study/study 4.png" },
  { id: 39, category: "water", name: "Flood season", description: "Drink 3L+ (12+ glasses) in a single day.", xp: 200, target: 1, img: "study/study 1.png" },
  { id: 40, category: "water", name: "H2O master", description: "Hit your water goal for 30 days straight.", xp: 500, target: 30, img: "study/study 3.png" },
  { id: 41, category: "water", name: "Aqua warrior", description: "Log water intake every single day for 14 days.", xp: 350, target: 14, img: "study/study 5.png" },
  { id: 42, category: "water", name: "Water legend", description: "Hit your water goal for 60 days straight.", xp: 650, target: 60, img: "study/study 8.png" },
  { id: 43, category: "water", name: "Morning hydration", description: "Drink water within 10 minutes of waking up, 7 days.", xp: 250, target: 7, img: "study/study 2.png" },
  { id: 44, category: "water", name: "Consistent sipper", description: "Log at least 1.5L (6+ glasses) every day for 21 days.", xp: 400, target: 21, img: "study/study 6.png" },

  { id: 45, category: "special", name: "The full lock-in", description: "Hit all 4 goals in a single day.", xp: 500, target: 1, img: "achivement/muscles.png" },
  { id: 46, category: "special", name: "Perfect week", description: "Hit all 4 goals every day for 7 days straight.", xp: 700, target: 7, img: "achivement/lifting.png" },
  { id: 47, category: "special", name: "30-day grind", description: "Hit all 4 goals every day for 30 days.", xp: 700, target: 30, img: "achivement/muscles.png" },
  { id: 48, category: "special", name: "Grind OG", description: "Use the app for 100 days.", xp: 600, target: 100, img: "study/study 6.png" },
  { id: 49, category: "special", name: "Multi-tasker", description: "Log a workout and study session on the same day.", xp: 300, target: 1, img: "achivement/lifting.png" },
  { id: 50, category: "special", name: "Morning routine", description: "Complete workout, water, and study before noon.", xp: 450, target: 1, img: "achivement/muscles.png" },
  { id: 51, category: "special", name: "No days off", description: "Log at least one activity every day for 60 days.", xp: 650, target: 60, img: "study/study 8.png" },
  { id: 52, category: "special", name: "Level up", description: "Earn 5,000 total XP.", xp: 500, target: 5000, img: "study/study 1.png" },
  { id: 53, category: "special", name: "Fully locked", description: "Earn 10,000 total XP.", xp: 700, target: 10000, img: "study/study 3.png" },
  { id: 54, category: "special", name: "Grind legend", description: "Unlock at least 40 achievements.", xp: 700, target: 40, img: "achivement/muscles.png" }
];
