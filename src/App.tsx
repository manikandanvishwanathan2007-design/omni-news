import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, 
  Search, 
  Bookmark, 
  Share2, 
  User, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  Menu, 
  X, 
  Heart,
  ArrowRight,
  Sparkles,
  Filter,
  LayoutGrid,
  Loader2,
  ChevronLeft,
  History,
  ExternalLink,
  Moon,
  Sun,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { fetchLatestNews } from './lib/news';
import { processNewsArticle } from './lib/gemini';
import { NewsItem, AIProcessedNews } from './types';
import { getLocalPreferences } from './lib/user';

type View = 'home' | 'profile' | 'detail';

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    technology: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    sports: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    politics: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    business: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    science: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    health: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    general: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  };
  return colors[category.toLowerCase()] || colors.general;
};

export default function App() {
  const [view, setView] = useState<View>('home');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<AIProcessedNews | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');
  const [activeSpot, setActiveSpot] = useState('');
  const [savedNews, setSavedNews] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadNews();
    loadSavedNews();
    loadHistory();
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, [activeCategory, activeSpot]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await fetchLatestNews(activeCategory, activeSpot);
      setNews(data);
    } catch (error) {
      toast.error('Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedNews = async () => {
    try {
      const res = await fetch('/api/saved');
      const data = await res.json();
      setSavedNews(data);
    } catch (error) {
      console.error('Failed to load saved news', error);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history', error);
    }
  };

  const handleProcessArticle = async (article: NewsItem) => {
    setProcessingId(article.id);
    try {
      const processed = await processNewsArticle(article);
      const isSaved = savedNews.some(n => n.news_id === processed.news_id);
      setSelectedArticle({ ...processed, saved: isSaved });
      setView('detail');
      
      // Add to history
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          news_id: processed.news_id,
          title: processed.title,
          summary: processed["30_sec_summary"],
          category: processed.category
        })
      });
      loadHistory();
    } catch (error) {
      toast.error('AI processing failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSave = async (article: AIProcessedNews) => {
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          news_id: article.news_id,
          title: article.title,
          summary: article["30_sec_summary"]
        })
      });
      const data = await res.json();
      setSavedNews(data.savedNews);
      setSelectedArticle(prev => prev ? { ...prev, saved: true } : null);
      toast.success('Saved to your library');
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const handleUnsave = async (news_id: string) => {
    try {
      const res = await fetch('/api/unsave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ news_id })
      });
      const data = await res.json();
      setSavedNews(data.savedNews);
      setSelectedArticle(prev => prev ? { ...prev, saved: false } : null);
      toast.success('Removed from library');
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  const handleShare = async (article: AIProcessedNews) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.share_text,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(article.share_text);
        toast.success('Share text copied! 🚀');
      }
    } catch (error) {
      console.error('Error sharing', error);
    }
  };

  const filteredNews = useMemo(() => {
    if (!searchQuery) return news;
    return news.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [news, searchQuery]);

  const topNews = useMemo(() => news[0], [news]);
  const trendingNews = useMemo(() => news.slice(1, 5), [news]);
  const forYouNews = useMemo(() => news.slice(5, 9), [news]);
  
  const categories = ['Technology', 'Sports', 'Politics', 'Business', 'Health', 'Entertainment', 'Science'];
  const categoryNews = useMemo(() => {
    const map: Record<string, NewsItem[]> = {};
    categories.forEach(cat => {
      map[cat] = news.filter(n => n.category.toLowerCase() === cat.toLowerCase());
    });
    return map;
  }, [news]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <Toaster position="top-center" theme={isDarkMode ? 'dark' : 'light'} />
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-effect h-16 border-b border-border/50">
        <div className="container mx-auto h-full flex items-center justify-between px-4">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => setView('home')}
          >
            <div className="h-9 w-9 brand-gradient-bg rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Globe size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight brand-gradient-text">OmniNews</span>
          </div>

          <div className="hidden md:flex flex-1 max-w-2xl mx-8 gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
              <Input 
                placeholder="Search intelligence..." 
                className="w-full pl-10 bg-secondary/50 border-none rounded-xl h-10 focus:ring-2 focus:ring-primary/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative w-48 group">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors" size={16} />
              <Input 
                placeholder="Filter by Spot..." 
                className="w-full pl-10 bg-secondary/50 border-none rounded-xl h-10 focus:ring-2 focus:ring-primary/20 transition-all"
                value={activeSpot}
                onChange={(e) => setActiveSpot(e.target.value)}
              />
              {activeSpot && (
                <X 
                  size={14} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground" 
                  onClick={() => setActiveSpot('')}
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl"
              onClick={() => { setView('profile'); }}
            >
              <User size={20} className={view === 'profile' ? "text-primary" : ""} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl"
              onClick={() => { setView('profile'); }}
            >
              <Heart size={20} className={savedNews.length > 0 ? "text-destructive" : ""} />
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              {/* Mobile Spot Filter */}
              <div className="md:hidden">
                <div className="relative w-full">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={16} />
                  <Input 
                    placeholder="Filter by Spot..." 
                    className="w-full pl-10 bg-secondary/50 border-none rounded-xl h-10 focus:ring-2 focus:ring-primary/20"
                    value={activeSpot}
                    onChange={(e) => setActiveSpot(e.target.value)}
                  />
                  {activeSpot && (
                    <X 
                      size={14} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground" 
                      onClick={() => setActiveSpot('')}
                    />
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['general', 'technology', 'politics', 'business', 'sports', 'science', 'health'].map((cat) => (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? 'default' : 'ghost'}
                    className={cn(
                      "rounded-xl px-6 h-9 capitalize text-sm font-medium transition-all shrink-0",
                      activeCategory === cat ? "brand-gradient-bg text-white shadow-md shadow-primary/20" : "bg-card text-muted-foreground border border-border"
                    )}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {loading ? (
                <div className="space-y-10">
                  <div className="h-[400px] w-full bg-muted animate-pulse rounded-xl" />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />)}
                  </div>
                </div>
              ) : (
                <>
                  {/* Top World News */}
                  {topNews && (
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                        <Globe size={16} />
                        Top World News
                      </div>
                      <div 
                        className="group relative h-[500px] rounded-xl overflow-hidden cursor-pointer shadow-2xl shadow-primary/5 hover-glow border border-border"
                        onClick={() => handleProcessArticle(topNews)}
                      >
                        <img 
                          src={`https://picsum.photos/seed/${topNews.id}/1200/800`} 
                          alt={topNews.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-primary/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-10 space-y-4">
                          <div className="flex gap-2">
                            <Badge className={cn("border shadow-sm text-xs font-bold uppercase px-4 py-1 rounded-full", getCategoryColor(topNews.category))}>
                              {topNews.category}
                            </Badge>
                            {topNews.spot && (
                              <Badge variant="outline" className="glass-effect text-foreground border-none px-4 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                                <MapPin size={10} /> {topNews.spot}
                              </Badge>
                            )}
                          </div>
                          <h2 className="text-3xl md:text-5xl font-bold leading-tight max-w-4xl">
                            {topNews.title}
                          </h2>
                          <p className="text-muted-foreground text-lg line-clamp-2 max-w-3xl">
                            {topNews.content}
                          </p>
                          <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} />
                              <span>{new Date(topNews.publishedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck size={14} className="text-success" />
                              <span>{topNews.source}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Trending */}
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-accent font-bold text-sm uppercase tracking-wider">
                        <Zap size={18} className="text-amber-400" />
                        Trending Now
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {trendingNews.map((article) => (
                        <Card 
                          key={article.id} 
                          className={cn(
                            "app-card group cursor-pointer hover-glow flex flex-col h-full",
                            article.spot && "bg-primary/5 border-primary/10"
                          )}
                          onClick={() => handleProcessArticle(article)}
                        >
                          <div className="relative h-44 overflow-hidden rounded-t-xl">
                            <img 
                              src={`https://picsum.photos/seed/${article.id}/600/400`} 
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                              <Badge className={cn("border shadow-sm text-[10px] uppercase font-bold", getCategoryColor(article.category))}>
                                {article.category}
                              </Badge>
                              {article.spot && (
                                <Badge className="bg-primary text-white border-none shadow-sm text-[10px] uppercase font-bold flex items-center gap-1">
                                  <MapPin size={8} /> {article.spot}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <CardHeader className="p-5 pb-2">
                            <CardTitle className="text-base font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                              {article.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-5 pt-0 flex-1">
                            <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                              {article.content}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>

                  {/* For You */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                      <Sparkles size={18} className="text-primary" />
                      For You
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {forYouNews.map((article) => (
                        <div 
                          key={article.id}
                          className={cn(
                            "app-card flex gap-5 p-5 cursor-pointer hover-glow",
                            article.spot && "bg-primary/5 border-primary/10"
                          )}
                          onClick={() => handleProcessArticle(article)}
                        >
                          <div className="h-28 w-28 shrink-0 rounded-xl overflow-hidden shadow-sm">
                            <img 
                              src={`https://picsum.photos/seed/${article.id}/300/300`} 
                              alt={article.title}
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex flex-col justify-center gap-2">
                            <div className="flex gap-2">
                              <Badge className={cn("w-fit text-[10px] uppercase tracking-widest px-2 py-0.5 border", getCategoryColor(article.category))}>
                                {article.category}
                              </Badge>
                              {article.spot && (
                                <Badge variant="outline" className="w-fit text-[10px] uppercase tracking-widest px-2 py-0.5 border-primary/20 text-primary flex items-center gap-1">
                                  <MapPin size={10} /> {article.spot}
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-bold text-foreground text-lg line-clamp-2 leading-tight">
                              {article.title}
                            </h4>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
                              <span className="flex items-center gap-1"><ShieldCheck size={12} /> {article.source}</span>
                              <span>•</span>
                              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* All Categories */}
                  <section className="space-y-10">
                    <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm uppercase tracking-wider">
                      <LayoutGrid size={18} />
                      All Categories
                    </div>
                    
                    {categories.map(cat => (
                      <div key={cat} className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            {cat}
                          </h3>
                          <Button variant="ghost" size="sm" className="text-primary font-bold text-xs uppercase tracking-widest rounded-xl">
                            Explore <ArrowRight size={14} className="ml-1" />
                          </Button>
                        </div>
                        <div className="horizontal-scroll">
                          {(categoryNews[cat] || []).length > 0 ? (
                            categoryNews[cat].map(article => (
                              <div 
                                key={article.id} 
                                className={cn(
                                  "app-card min-w-[300px] max-w-[300px] group cursor-pointer hover-glow flex flex-col",
                                  article.spot && "bg-primary/5 border-primary/10"
                                )}
                                onClick={() => handleProcessArticle(article)}
                              >
                                <div className="relative h-40 overflow-hidden rounded-t-xl">
                                  <img 
                                    src={`https://picsum.photos/seed/${article.id}/600/400`} 
                                    alt={article.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                                    <Badge className={cn("border shadow-sm text-[10px] uppercase font-bold", getCategoryColor(article.category))}>
                                      {article.category}
                                    </Badge>
                                    {article.spot && (
                                      <Badge className="bg-primary text-white border-none shadow-sm text-[10px] uppercase font-bold flex items-center gap-1">
                                        <MapPin size={8} /> {article.spot}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="p-5 space-y-2">
                                  <h4 className="font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                    {article.title}
                                  </h4>
                                  <p className="text-muted-foreground text-xs line-clamp-2">
                                    {article.content}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="w-full py-10 text-center text-muted-foreground app-card border-dashed">
                              No recent intelligence in {cat}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </section>
                </>
              )}
            </motion.div>
          )}

          {view === 'detail' && selectedArticle && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto space-y-8 pb-20"
            >
              <Button 
                variant="ghost" 
                className="rounded-xl pl-2 pr-4 text-muted-foreground hover:text-primary"
                onClick={() => setView('home')}
              >
                <ChevronLeft size={20} className="mr-1" /> Back to Feed
              </Button>

              <div className="relative h-[400px] rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src={`https://picsum.photos/seed/${selectedArticle.news_id}/1200/800`} 
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-primary/5 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Badge className={cn("border shadow-sm px-4 py-1 rounded-full text-xs font-bold uppercase", getCategoryColor(selectedArticle.category))}>
                        {selectedArticle.category}
                      </Badge>
                      {selectedArticle.spot && (
                        <Badge variant="outline" className="glass-effect text-foreground border-none flex items-center gap-1">
                          <MapPin size={12} /> {selectedArticle.spot}
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-foreground leading-tight">
                      {selectedArticle.title}
                    </h1>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className={cn(
                        "h-12 w-12 rounded-full shadow-lg transition-all",
                        selectedArticle.saved ? "bg-destructive text-white" : "glass-effect text-foreground"
                      )}
                      onClick={() => selectedArticle.saved ? handleUnsave(selectedArticle.news_id) : handleSave(selectedArticle)}
                    >
                      <Heart size={20} fill={selectedArticle.saved ? "currentColor" : "none"} />
                    </Button>
                    <Button 
                      className="h-12 w-12 rounded-full glass-effect text-foreground shadow-lg"
                      onClick={() => handleShare(selectedArticle)}
                    >
                      <Share2 size={20} />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-10 px-2">
                {/* Full News */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground font-bold text-xs uppercase tracking-widest">
                    <Globe size={14} />
                    Full Intelligence Report
                  </div>
                  <div className="text-lg text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedArticle.full_news}
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 1-Min Summary */}
                  <section className="space-y-4 p-8 bg-secondary/30 rounded-[2rem] border border-border">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                      <Clock size={14} />
                      1-Minute Summary
                    </div>
                    <ul className="space-y-4">
                      {selectedArticle["1_min_summary"].map((point, i) => (
                        <li key={i} className="flex gap-3 text-muted-foreground text-sm leading-relaxed">
                          <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* 30-Sec Summary */}
                  <section className="space-y-4 p-8 bg-accent/10 rounded-[2rem] border border-accent/20">
                    <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest">
                      <Zap size={14} />
                      30-Second Summary
                    </div>
                    <p className="text-foreground text-sm leading-relaxed italic">
                      {selectedArticle["30_sec_summary"]}
                    </p>
                  </section>
                </div>

                {/* Why it matters */}
                <section className="p-8 brand-gradient-bg rounded-xl text-white shadow-xl shadow-primary/10">
                  <h4 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-4 flex items-center gap-2">
                    <Sparkles size={14} />
                    Why this matters to you
                  </h4>
                  <p className="text-xl font-bold leading-relaxed">
                    {selectedArticle.why_it_matters}
                  </p>
                </section>

                {/* Triple View */}
                <section className="space-y-6">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Triple Perspective Analysis</h4>
                  <div className="grid gap-4">
                    <div className="p-6 app-card">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-2">Neutral View</span>
                      <p className="text-sm text-muted-foreground">{selectedArticle.neutral_view}</p>
                    </div>
                    <div className="p-6 app-card bg-emerald-500/5 border-emerald-500/20">
                      <span className="text-[10px] font-bold uppercase text-emerald-500 block mb-2">Supportive View</span>
                      <p className="text-sm text-foreground">{selectedArticle.supportive_view}</p>
                    </div>
                    <div className="p-6 app-card bg-destructive/5 border-destructive/20">
                      <span className="text-[10px] font-bold uppercase text-destructive block mb-2">Critical View</span>
                      <p className="text-sm text-foreground">{selectedArticle.critical_view}</p>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {view === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto space-y-8 pb-20"
            >
              {/* Profile Header (Top Section) */}
              <section className="brand-gradient-bg rounded-xl p-10 text-white shadow-2xl flex flex-col items-center text-center space-y-4">
                <div className="h-32 w-32 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/30 flex items-center justify-center text-4xl font-bold shadow-xl overflow-hidden">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${getLocalPreferences().name}`} 
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold tracking-tight">{getLocalPreferences().name}</h2>
                  <p className="text-white/80 font-medium">{getLocalPreferences().email}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 w-full pt-4">
                  <div className="bg-blue-500/20 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-lg shadow-blue-500/5">
                    <div className="text-2xl font-bold">{history.length}</div>
                    <div className="text-[10px] uppercase font-bold opacity-70">Articles Read</div>
                  </div>
                  <div className="bg-purple-500/20 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-lg shadow-purple-500/5">
                    <div className="text-2xl font-bold">{savedNews.length}</div>
                    <div className="text-[10px] uppercase font-bold opacity-70">Saved Items</div>
                  </div>
                  <div className="bg-emerald-500/20 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-lg shadow-emerald-500/5">
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-[10px] uppercase font-bold opacity-70">Day Streak</div>
                  </div>
                </div>
              </section>

              {/* Profile Details Section */}
              <Card className="app-card p-8 border-none shadow-lg">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 group">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Full Name</span>
                      <p className="text-lg font-bold text-foreground">{getLocalPreferences().name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-xl">📧</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Email Address</span>
                      <p className="text-lg font-bold text-foreground">{getLocalPreferences().email}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Saved News Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-destructive font-bold text-sm uppercase tracking-wider">
                  <Heart size={18} fill="currentColor" />
                  Saved News
                </div>
                {savedNews.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {savedNews.map((item) => (
                      <div 
                        key={item.news_id} 
                        className={cn(
                          "app-card p-4 flex gap-6 group relative hover-glow cursor-pointer",
                          news.find(n => n.id === item.news_id)?.spot && "bg-primary/5 border-primary/10"
                        )}
                        onClick={() => {
                          const article = news.find(n => n.id === item.news_id);
                          if (article) handleProcessArticle(article);
                        }}
                      >
                        <div className="h-24 w-24 shrink-0 rounded-xl overflow-hidden shadow-sm">
                          <img 
                            src={`https://picsum.photos/seed/${item.news_id}/300/300`} 
                            alt={item.title}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex flex-col justify-center gap-1 flex-1">
                          <h4 className="font-bold text-foreground text-lg line-clamp-1 leading-tight group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-4 right-4 text-muted-foreground hover:text-destructive rounded-xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnsave(item.news_id);
                          }}
                        >
                          <X size={18} />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-16 text-center app-card border-dashed text-muted-foreground flex flex-col items-center gap-4">
                    <Bookmark size={32} className="opacity-20" />
                    <p className="font-medium">No saved articles yet.</p>
                  </div>
                )}
              </section>

              {/* Recently Viewed Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm uppercase tracking-wider">
                  <History size={18} />
                  Recently Viewed
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {history.map((item) => (
                    <div 
                      key={item.news_id} 
                      className={cn(
                        "app-card p-4 flex gap-4 hover-glow cursor-pointer",
                        news.find(n => n.id === item.news_id)?.spot && "bg-primary/5 border-primary/10"
                      )}
                      onClick={() => {
                        const article = news.find(n => n.id === item.news_id);
                        if (article) handleProcessArticle(article);
                      }}
                    >
                      <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden shadow-sm">
                        <img 
                          src={`https://picsum.photos/seed/${item.news_id}/300/300`} 
                          alt={item.title}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col justify-center gap-1">
                        <Badge variant="outline" className="w-fit text-[8px] uppercase px-1 py-0 border-border text-muted-foreground">
                          {item.category}
                        </Badge>
                        <h4 className="font-bold text-foreground line-clamp-2 leading-tight">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground">{new Date(item.viewed_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Processing Overlay */}
      <AnimatePresence>
        {processingId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative h-24 w-24 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-primary">
                <Sparkles size={32} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 brand-gradient-text">Omni Intelligence</h2>
            <p className="text-muted-foreground max-w-xs">AI is analyzing multiple sources to provide a balanced perspective...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Mobile Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden h-16 glass-effect border-t border-border flex items-center justify-around px-6">
        <Button variant="ghost" size="icon" className={cn("rounded-xl", view === 'home' && "text-primary")} onClick={() => setView('home')}>
          <LayoutGrid size={24} />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-xl">
          <Search size={24} />
        </Button>
        <Button variant="ghost" size="icon" className={cn("rounded-xl", view === 'profile' && "text-primary")} onClick={() => setView('profile')}>
          <User size={24} />
        </Button>
      </div>
    </div>
  );
}
