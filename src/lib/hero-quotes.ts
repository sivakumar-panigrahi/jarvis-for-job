export interface HeroQuote {
  quote: string;
  hero: string;
}

export const heroQuotes: HeroQuote[] = [
  { quote: "I am Iron Man.", hero: "Tony Stark" },
  { quote: "I can do this all day.", hero: "Steve Rogers" },
  { quote: "We have a Hulk.", hero: "Tony Stark" },
  { quote: "Whatever it takes.", hero: "The Avengers" },
  { quote: "Avengers... Assemble!", hero: "Captain America" },
  { quote: "That's my secret, Cap. I'm always angry.", hero: "Bruce Banner" },
  { quote: "I'm always picking up after you boys.", hero: "Natasha Romanoff" },
  { quote: "Puny god.", hero: "Hulk" },
  { quote: "Genius, billionaire, playboy, philanthropist.", hero: "Tony Stark" },
  { quote: "I could do this all day.", hero: "Steve Rogers" },
  { quote: "Part of the journey is the end.", hero: "Tony Stark" },
  { quote: "I love you 3000.", hero: "Morgan Stark" },
];

export const getRandomQuote = (): HeroQuote => {
  return heroQuotes[Math.floor(Math.random() * heroQuotes.length)];
};

export const missionMessages = {
  noJobs: "Nick Fury is searching the multiverse for new missions...",
  jobsExpire: "Missions self-destruct in 24 hours. Move fast, Avenger!",
  welcome: "Welcome back, Agent",
  signOut: "Exit Helicarrier",
  profile: "Hero Profile",
  apply: "Accept Mission",
  applied: "Mission Accepted",
  tracked: "Mission Logged",
  dashboard: "Avengers HQ",
  subtitle: "Mission Control",
  activeJobs: "Missions from Your Captain",
  timeSensitive: "Time-Sensitive Missions",
  nextExpires: "Next mission expires in",
  noActive: "Awaiting Orders",
  checkBack: "Stand by for new assignments from Director Fury",
  authTitle: "S.H.I.E.L.D. Portal",
  authSubtitle: "Recruits Welcome",
  authFooter: "Access granted by J.A.R.V.I.S.",
  skills: "Hero Powers",
  education: "Training Records",
  applications: "Mission Log",
  dailyGoal: "Daily Heroics",
  goalAchieved: "Mission Complete! 🦸‍♂️",
};
