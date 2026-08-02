export type HistoryKind =
  | "program"
  | "project"
  | "review"
  | "notes"
  | "convert"
  | "interview";

export type HistoryItem = {
  id: string;
  kind: HistoryKind;
  title: string;
  createdAt: number;
  data: unknown;
};

export type BookmarkItem = HistoryItem;

const HISTORY_KEY = "codemate.history";
const BOOKMARK_KEY = "codemate.bookmarks";
const SETTINGS_KEY = "codemate.settings";
const ONBOARDED_KEY = "codemate.onboarded";
const CHALLENGE_KEY = "codemate.challengeProgress";
const INTERVIEW_KEY = "codemate.interviewProgress";

function safeParse<T>(v: string | null, fallback: T): T {
  if (!v) return fallback;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

export const storage = {
  isBrowser: () => typeof window !== "undefined",

  getHistory(): HistoryItem[] {
    if (!this.isBrowser()) return [];
    return safeParse<HistoryItem[]>(localStorage.getItem(HISTORY_KEY), []);
  },
  addHistory(item: Omit<HistoryItem, "id" | "createdAt">) {
    if (!this.isBrowser()) return;
    const list = this.getHistory();
    const entry: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    list.unshift(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 200)));
    return entry;
  },
  deleteHistory(id: string) {
    if (!this.isBrowser()) return;
    const list = this.getHistory().filter((i) => i.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  },
  updateHistory(id: string, patch: Partial<Pick<HistoryItem, "title" | "data">>) {
    if (!this.isBrowser()) return;
    const list = this.getHistory().map((i) => (i.id === id ? { ...i, ...patch } : i));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  },
  clearHistory(kind?: HistoryKind) {
    if (!this.isBrowser()) return;
    if (!kind) {
      localStorage.removeItem(HISTORY_KEY);
      return;
    }
    const list = this.getHistory().filter((i) => i.kind !== kind);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  },

  getBookmarks(): BookmarkItem[] {
    if (!this.isBrowser()) return [];
    return safeParse<BookmarkItem[]>(localStorage.getItem(BOOKMARK_KEY), []);
  },
  addBookmark(item: Omit<BookmarkItem, "id" | "createdAt">) {
    if (!this.isBrowser()) return;
    const list = this.getBookmarks();
    const entry: BookmarkItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    list.unshift(entry);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list));
    return entry;
  },
  deleteBookmark(id: string) {
    if (!this.isBrowser()) return;
    const list = this.getBookmarks().filter((i) => i.id !== id);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list));
  },

  isOnboarded(): boolean {
    if (!this.isBrowser()) return false;
    return localStorage.getItem(ONBOARDED_KEY) === "1";
  },
  setOnboarded() {
    if (!this.isBrowser()) return;
    localStorage.setItem(ONBOARDED_KEY, "1");
  },

  getSettings(): { name?: string } {
    if (!this.isBrowser()) return {};
    return safeParse(localStorage.getItem(SETTINGS_KEY), {});
  },
  setSettings(s: { name?: string }) {
    if (!this.isBrowser()) return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  },

  getChallengeProgress(): Record<string, boolean> {
    if (!this.isBrowser()) return {};
    return safeParse(localStorage.getItem(CHALLENGE_KEY), {});
  },
  markChallengeDone(dateKey: string) {
    if (!this.isBrowser()) return;
    const p = this.getChallengeProgress();
    p[dateKey] = true;
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(p));
  },

  getInterviewProgress(): Record<string, number> {
    if (!this.isBrowser()) return {};
    return safeParse(localStorage.getItem(INTERVIEW_KEY), {} as Record<string, number>);
  },
  markInterviewPracticed(category: string) {
    if (!this.isBrowser()) return {} as Record<string, number>;
    const p = this.getInterviewProgress();
    p[category] = (p[category] ?? 0) + 1;
    localStorage.setItem(INTERVIEW_KEY, JSON.stringify(p));
    return p;
  },
};

export function useHydrated() {
  if (typeof window === "undefined") return false;
  return true;
}
