import { UserPreferences } from "../types";

const PREFS_KEY = 'veritas_user_prefs';
const HISTORY_KEY = 'veritas_user_history';

export function getLocalPreferences(): UserPreferences {
  const stored = localStorage.getItem(PREFS_KEY);
  if (stored) return JSON.parse(stored);
  return {
    name: 'Manikandan Vishvanathan',
    email: 'manikandanvishwanathan2007@gmail.com',
    interests: ['technology', 'science', 'business'],
    summaryLength: 'medium',
    tone: 'neutral',
    autoPlayTTS: false
  };
}

export function saveLocalPreferences(prefs: UserPreferences) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function trackInteraction(articleId: string, category: string) {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  history.push({ articleId, category, timestamp: new Date().toISOString() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-50))); // Keep last 50
  
  // Simple learning: if they click a category often, add it to interests
  const counts: Record<string, number> = {};
  history.forEach((h: any) => {
    counts[h.category] = (counts[h.category] || 0) + 1;
  });
  
  const prefs = getLocalPreferences();
  Object.entries(counts).forEach(([cat, count]) => {
    if (count > 5 && !prefs.interests.includes(cat)) {
      prefs.interests.push(cat);
    }
  });
  saveLocalPreferences(prefs);
}

export function getTopCategories(): string[] {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  const counts: Record<string, number> = {};
  history.forEach((h: any) => {
    counts[h.category] = (counts[h.category] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);
}
