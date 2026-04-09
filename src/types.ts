export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
  content: string;
  spot?: string;
  saved?: boolean;
}

export interface AIProcessedNews {
  news_id: string;
  title: string;
  category: string;
  spot: string;
  importance: 'High' | 'Medium' | 'Low';
  trend: 'Trending' | 'Normal';

  full_news: string;
  "1_min_summary": string[];
  "30_sec_summary": string;

  neutral_view: string;
  supportive_view: string;
  critical_view: string;

  sentiment: string;
  bias: string;

  truth_status: 'Verified' | 'Partially Verified' | 'Unverified';
  confidence_score: string;

  why_it_matters: string;
  share_text: string;
  saved: boolean;
}

export interface UserPreferences {
  name?: string;
  email?: string;
  interests: string[];
  summaryLength: 'short' | 'medium' | 'detailed';
  tone: 'neutral' | 'professional' | 'simple';
  autoPlayTTS: boolean;
}
