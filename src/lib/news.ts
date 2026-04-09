import { NewsItem } from "../types";

// In a real app, this would call a News API or RSS feeds.
// For this demo, we'll use a set of diverse mock news items.

export async function fetchLatestNews(category: string = "general", spot: string = ""): Promise<NewsItem[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const mockNews: NewsItem[] = [
    {
      id: "1",
      title: "Breakthrough in Fusion Energy: Scientists Achieve Net Energy Gain",
      source: "Science Daily",
      publishedAt: new Date().toISOString(),
      category: "technology",
      spot: "Global",
      url: "https://example.com/fusion",
      content: "Researchers at the National Ignition Facility have successfully produced more energy from a fusion reaction than the laser energy used to drive it. This milestone brings us one step closer to a future of clean, limitless energy. The experiment used 192 powerful lasers to compress a tiny pellet of hydrogen isotopes..."
    },
    {
      id: "2",
      title: "Global Markets Rally as Inflation Data Shows Cooling Trend",
      source: "Financial Times",
      publishedAt: new Date().toISOString(),
      category: "business",
      spot: "New York",
      url: "https://example.com/markets",
      content: "Stock markets across the globe saw significant gains today after the latest consumer price index report indicated that inflation is slowing down faster than economists predicted. The Federal Reserve is now expected to pause its rate-hiking cycle, providing relief to investors and businesses alike..."
    },
    {
      id: "3",
      title: "New Climate Policy Sparks Debate in Parliament",
      source: "The Guardian",
      publishedAt: new Date().toISOString(),
      category: "politics",
      spot: "London",
      url: "https://example.com/climate",
      content: "The government's proposed 'Green Transition Act' has met with fierce opposition from both environmental groups and industrial lobbyists. While the bill aims to reach net-zero by 2040, critics argue it doesn't go far enough to curb emissions from the transport sector, while others claim it will hurt economic growth..."
    },
    {
      id: "4",
      title: "AI-Powered Healthcare: New Diagnostic Tool Outperforms Doctors",
      source: "Wired",
      publishedAt: new Date().toISOString(),
      category: "technology",
      spot: "San Francisco",
      url: "https://example.com/ai-health",
      content: "A new artificial intelligence system developed by a Silicon Valley startup has demonstrated remarkable accuracy in diagnosing rare skin conditions. In a double-blind study, the AI correctly identified 98% of cases, compared to 85% for a panel of board-certified dermatologists. The system uses deep learning models trained on millions of clinical images..."
    },
    {
      id: "5",
      title: "Underdog Team Wins Championship in Historic Overtime Victory",
      source: "ESPN",
      publishedAt: new Date().toISOString(),
      category: "sports",
      spot: "Chicago",
      url: "https://example.com/sports",
      content: "In a stunning upset that will be remembered for decades, the city's underdog team secured the national championship title last night. The game went into triple overtime, with the winning goal scored in the final seconds. Fans flooded the streets in celebration as the team lifted the trophy for the first time in history..."
    },
    {
      id: "6",
      title: "Mars Rover Discovers Ancient Riverbed, Suggesting Past Life",
      source: "NASA",
      publishedAt: new Date().toISOString(),
      category: "science",
      spot: "Mars",
      url: "https://example.com/mars",
      content: "The Perseverance rover has sent back high-resolution images of what appears to be a dried-up river delta on the Martian surface. Geologists say the rock formations are consistent with long-term water flow, significantly increasing the chances that Mars once hosted microbial life billions of years ago..."
    },
    {
      id: "7",
      title: "Global Summit Reaches Landmark Agreement on Plastic Waste",
      source: "BBC News",
      publishedAt: new Date().toISOString(),
      category: "world news",
      spot: "Nairobi",
      url: "https://example.com/plastic",
      content: "Representatives from over 170 nations have signed a legally binding treaty to end plastic pollution by 2040. The agreement includes strict limits on single-use plastics and mandates a global recycling infrastructure. Environmentalists are hailing it as the most significant environmental pact since the Paris Agreement..."
    },
    {
      id: "8",
      title: "Local Community Garden Project Transforms Urban Wasteland",
      source: "City Gazette",
      publishedAt: new Date().toISOString(),
      category: "local news",
      spot: "London",
      url: "https://example.com/garden",
      content: "A group of dedicated volunteers has turned a derelict lot in the city center into a thriving community garden. The project now provides fresh produce to over 50 families and has become a hub for local education and social interaction. 'It's more than just plants; it's about growing community,' said the project lead..."
    },
    {
      id: "9",
      title: "The Future of Quantum Computing: Google and IBM Compete for Supremacy",
      source: "TechCrunch",
      publishedAt: new Date().toISOString(),
      category: "technology",
      spot: "Global",
      url: "https://example.com/quantum",
      content: "Quantum computing is no longer a theoretical dream. Recent breakthroughs in error correction and qubit stability have brought us to the brink of a new era in computation. Google's Sycamore and IBM's Osprey are leading the charge, promising to solve problems that would take classical supercomputers millennia..."
    },
    {
      id: "10",
      title: "Olympic Committee Announces New Sports for 2028 Games",
      source: "Reuters",
      publishedAt: new Date().toISOString(),
      category: "sports",
      spot: "Los Angeles",
      url: "https://example.com/olympics",
      content: "The International Olympic Committee has officially added flag football, squash, and cricket to the lineup for the 2028 Los Angeles Games. This move is seen as an effort to modernize the Olympics and appeal to a younger, more global audience while respecting traditional athletic disciplines..."
    },
    {
      id: "11",
      title: "New Study Links Mediterranean Diet to Improved Brain Health in Seniors",
      source: "Healthline",
      publishedAt: new Date().toISOString(),
      category: "health",
      spot: "Barcelona",
      url: "https://example.com/health-diet",
      content: "A decade-long study involving over 5,000 participants has found that those who strictly followed a Mediterranean diet—rich in olive oil, nuts, and fish—showed significantly lower rates of cognitive decline. The research suggests that healthy fats and antioxidants play a crucial role in protecting neural pathways..."
    },
    {
      id: "12",
      title: "Hollywood's Next Big Thing: AI-Generated Scripts and Virtual Actors",
      source: "Variety",
      publishedAt: new Date().toISOString(),
      category: "entertainment",
      spot: "Los Angeles",
      url: "https://example.com/hollywood-ai",
      content: "The entertainment industry is undergoing a seismic shift as studios begin experimenting with AI-generated screenplays and photorealistic virtual actors. While some actors' unions are pushing back, proponents argue that these tools will democratize filmmaking and allow for unprecedented creative freedom..."
    },
    {
      id: "13",
      title: "SpaceX Successfully Launches Next-Generation Starlink Satellites",
      source: "Space.com",
      publishedAt: new Date().toISOString(),
      category: "science",
      spot: "Cape Canaveral",
      url: "https://example.com/spacex",
      content: "SpaceX has deployed another batch of Starlink satellites, featuring upgraded laser inter-satellite links. This launch brings the total number of active satellites to over 5,000, aiming to provide high-speed, low-latency internet to even the most remote corners of the globe..."
    },
    {
      id: "14",
      title: "Global Tax Reform: G7 Nations Agree on Minimum Corporate Tax",
      source: "The Economist",
      publishedAt: new Date().toISOString(),
      category: "business",
      spot: "London",
      url: "https://example.com/tax-reform",
      content: "In a historic move, the G7 nations have reached an agreement to implement a global minimum corporate tax rate of at least 15%. The deal aims to prevent multinational corporations from shifting profits to low-tax jurisdictions and ensure they pay their fair share in the countries where they operate..."
    },
    {
      id: "15",
      title: "Mental Health in the Workplace: Companies Adopt New Wellness Policies",
      source: "Forbes",
      publishedAt: new Date().toISOString(),
      category: "health",
      spot: "New York",
      url: "https://example.com/workplace-wellness",
      content: "As burnout rates reach record highs, major corporations are introducing comprehensive mental health benefits, including mandatory 'unplugged' days and on-site counseling. HR experts say these initiatives are not just ethical but essential for maintaining productivity and retaining talent in a competitive market..."
    },
    {
      id: "16",
      title: "The Rise of Indie Games: How Small Studios are Outshining AAA Titles",
      source: "IGN",
      publishedAt: new Date().toISOString(),
      category: "entertainment",
      spot: "Tokyo",
      url: "https://example.com/indie-games",
      content: "In recent years, independent game developers have captured the hearts of gamers with innovative mechanics and deeply personal stories. Titles like 'Hades' and 'Stardew Valley' have shown that you don't need a billion-dollar budget to create a masterpiece that resonates globally..."
    }
  ];

  let filtered = mockNews;
  if (spot) {
    filtered = filtered.filter(n => n.spot?.toLowerCase().includes(spot.toLowerCase()));
  }
  if (category !== "general") {
    filtered = filtered.filter(n => n.category.toLowerCase() === category.toLowerCase());
  }
  
  return filtered;
}
