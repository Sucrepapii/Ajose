import fs from "fs/promises";
import path from "path";

export interface FeedbackItem {
  id: string;
  name: string;
  email?: string;
  category: "Feature Idea" | "General Feedback" | "Report an Issue" | "Investor / Partnership" | string;
  message: string;
  rating: number; // 1 - 5
  createdAt: string;
  sourceUrl?: string;
  isFeaturedInCommunity: boolean;
  featuredQuote?: string;
  featuredAuthor?: string;
  featuredRole?: string;
  country?: string;
  countryCode?: string;
  location?: string;
}

const DATA_DIR = path.join(process.cwd(), "src", "data");
const FEEDBACK_FILE = path.join(DATA_DIR, "feedback.json");

// Default initial seeded feedback / community testimonials
const SEED_FEEDBACK: FeedbackItem[] = [
  {
    id: "fb-seed-bisi",
    name: "Bisi A.",
    email: "bisi.a@example.com",
    category: "General Feedback",
    message: "Finally, a way to do Ajo without the endless WhatsApp arguments. The automated turns feature is a lifesaver.",
    rating: 5,
    createdAt: "2026-09-01T10:15:00.000Z",
    sourceUrl: "Marketing Landing",
    isFeaturedInCommunity: true,
    featuredQuote: "Finally, a way to do Ajo without the endless WhatsApp arguments. The automated turns feature is a lifesaver.",
    featuredAuthor: "Bisi A.",
    featuredRole: "Group Admin",
    country: "Nigeria",
    countryCode: "NG",
    location: "Lagos, Nigeria",
  },
  {
    id: "fb-seed-emeka",
    name: "Emeka O.",
    email: "emeka.o@example.com",
    category: "General Feedback",
    message: "I love the transparency. Being able to see exactly who has paid and who is next builds so much trust.",
    rating: 5,
    createdAt: "2026-09-05T14:30:00.000Z",
    sourceUrl: "Dashboard Roster",
    isFeaturedInCommunity: true,
    featuredQuote: "I love the transparency. Being able to see exactly who has paid and who is next builds so much trust.",
    featuredAuthor: "Emeka O.",
    featuredRole: "Member",
    country: "Nigeria",
    countryCode: "NG",
    location: "Enugu, Nigeria",
  },
  {
    id: "fb-seed-tola",
    name: "Tola F.",
    email: "tola.f@example.com",
    category: "General Feedback",
    message: "We moved our alumni contribution group here. The dashboard makes managing millions of Naira completely stress-free.",
    rating: 5,
    createdAt: "2026-09-10T16:45:00.000Z",
    sourceUrl: "Alumni Circle Monitor",
    isFeaturedInCommunity: true,
    featuredQuote: "We moved our alumni contribution group here. The dashboard makes managing millions of Naira completely stress-free.",
    featuredAuthor: "Tola F.",
    featuredRole: "Alumni President",
    country: "Nigeria",
    countryCode: "NG",
    location: "Ibadan, Nigeria",
  },
  {
    id: "fb-seed-diaspora",
    name: "Dr. Kunle Adeleke",
    email: "k.adeleke@uk-alumni.org",
    category: "Feature Idea",
    message: "The Open-Banking auto-debit has completely transformed our medical diaspora monthly pool. Would love direct GBP debit rails next!",
    rating: 5,
    createdAt: "2026-09-15T09:20:00.000Z",
    sourceUrl: "Footer Widget",
    isFeaturedInCommunity: true,
    featuredQuote: "The Open-Banking auto-debit has completely transformed our medical diaspora monthly pool.",
    featuredAuthor: "Dr. Kunle A.",
    featuredRole: "Diaspora Circle Lead",
    country: "United Kingdom",
    countryCode: "GB",
    location: "London, UK",
  },
  {
    id: "fb-seed-ghana",
    name: "Kwame Mensah",
    email: "kwame.m@accra-hub.org",
    category: "General Feedback",
    message: "We run our cross-border tech founders Susu on Ajocore. The ledger accuracy and payout countdown give everybody peace of mind.",
    rating: 5,
    createdAt: "2026-09-16T11:10:00.000Z",
    sourceUrl: "Mobile App",
    isFeaturedInCommunity: true,
    featuredQuote: "We run our cross-border tech founders Susu on Ajocore. The ledger accuracy and payout countdown give everybody peace of mind.",
    featuredAuthor: "Kwame M.",
    featuredRole: "Susu Circle Organizer",
    country: "Ghana",
    countryCode: "GH",
    location: "Accra, Ghana",
  },
];

let memoryFeedback: FeedbackItem[] = [...SEED_FEEDBACK];

async function ensureDataFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(FEEDBACK_FILE);
    } catch {
      await fs.writeFile(FEEDBACK_FILE, JSON.stringify(SEED_FEEDBACK, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Could not write feedback.json file, using in-memory fallback:", err);
  }
}

export async function getAllFeedback(): Promise<FeedbackItem[]> {
  await ensureDataFile();
  try {
    const raw = await fs.readFile(FEEDBACK_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryFeedback = parsed;
      return parsed;
    }
  } catch {
    // fallback to memory
  }
  return memoryFeedback;
}

export async function addFeedback(input: {
  name?: string;
  email?: string;
  category: string;
  message: string;
  rating?: number;
  sourceUrl?: string;
  country?: string;
  countryCode?: string;
  location?: string;
}): Promise<FeedbackItem> {
  const items = await getAllFeedback();

  const cleanName = (input.name || "").trim() || "Anonymous Member";
  // Format initial author like "Bisi A." if full name provided
  const parts = cleanName.split(" ");
  const defaultAuthor = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.` : cleanName;

  const newItem: FeedbackItem = {
    id: `fb-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    name: cleanName,
    email: input.email?.trim(),
    category: input.category || "General Feedback",
    message: input.message.trim(),
    rating: Math.max(1, Math.min(5, Number(input.rating) || 5)),
    createdAt: new Date().toISOString(),
    sourceUrl: input.sourceUrl || "Footer Widget",
    isFeaturedInCommunity: false,
    featuredQuote: input.message.trim(),
    featuredAuthor: defaultAuthor,
    featuredRole: "Verified Member",
    country: input.country || "Nigeria",
    countryCode: input.countryCode || "NG",
    location: input.location || input.country || "Nigeria",
  };

  items.unshift(newItem);
  memoryFeedback = items;

  try {
    await fs.writeFile(FEEDBACK_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to persist feedback to disk:", err);
  }

  return newItem;
}

export async function toggleFeatureInCommunity(
  id: string,
  updates?: {
    isFeaturedInCommunity?: boolean;
    featuredQuote?: string;
    featuredAuthor?: string;
    featuredRole?: string;
    country?: string;
    countryCode?: string;
    location?: string;
  }
): Promise<FeedbackItem | null> {
  const items = await getAllFeedback();
  const index = items.findIndex((f) => f.id === id);
  if (index === -1) return null;

  const item = items[index];
  const nextFeatured = updates?.isFeaturedInCommunity !== undefined 
    ? updates.isFeaturedInCommunity 
    : !item.isFeaturedInCommunity;

  const updated: FeedbackItem = {
    ...item,
    isFeaturedInCommunity: nextFeatured,
    featuredQuote: updates?.featuredQuote?.trim() || item.featuredQuote || item.message,
    featuredAuthor: updates?.featuredAuthor?.trim() || item.featuredAuthor || item.name,
    featuredRole: updates?.featuredRole?.trim() || item.featuredRole || "Verified Member",
    country: updates?.country !== undefined ? updates.country : item.country,
    countryCode: updates?.countryCode !== undefined ? updates.countryCode : item.countryCode,
    location: updates?.location !== undefined ? updates.location : item.location,
  };

  items[index] = updated;
  memoryFeedback = items;

  try {
    await fs.writeFile(FEEDBACK_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to update feedback.json:", err);
  }

  return updated;
}

export async function deleteFeedback(id: string): Promise<boolean> {
  const items = await getAllFeedback();
  const filtered = items.filter((f) => f.id !== id);
  if (filtered.length === items.length) return false;

  memoryFeedback = filtered;
  try {
    await fs.writeFile(FEEDBACK_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to delete feedback item:", err);
  }
  return true;
}

export async function getFeaturedCommunityTestimonials(): Promise<
  Array<{
    quote: string;
    author: string;
    role: string;
    rating: number;
    country?: string;
    countryCode?: string;
    location?: string;
  }>
> {
  const all = await getAllFeedback();
  const featured = all.filter((f) => f.isFeaturedInCommunity);
  
  if (featured.length === 0) {
    // Fallback to seed defaults if none are flagged
    return SEED_FEEDBACK.filter((f) => f.isFeaturedInCommunity).map((f) => ({
      quote: f.featuredQuote || f.message,
      author: f.featuredAuthor || f.name,
      role: f.featuredRole || "Member",
      rating: f.rating || 5,
      country: f.country || "Nigeria",
      countryCode: f.countryCode || "NG",
      location: f.location || "Nigeria",
    }));
  }

  return featured.map((f) => ({
    quote: f.featuredQuote || f.message,
    author: f.featuredAuthor || f.name,
    role: f.featuredRole || "Verified Member",
    rating: f.rating || 5,
    country: f.country || (f.name.includes("UK") || (f.email && f.email.includes("uk")) ? "United Kingdom" : "Nigeria"),
    countryCode: f.countryCode || (f.name.includes("UK") || (f.email && f.email.includes("uk")) ? "GB" : "NG"),
    location: f.location || (f.countryCode === "GB" ? "London, UK" : "Nigeria"),
  }));
}
