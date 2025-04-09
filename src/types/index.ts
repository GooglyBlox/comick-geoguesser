export interface Comic {
  id: number;
  hid: string;
  slug: string;
  title: string;
  content_rating?: "safe" | "suggestive" | "erotica";
  country?: "jp" | "kr" | "cn" | "hk" | "gb";
  desc?: string;
  status?: number; // 1: Ongoing, 2: Completed, 3: Cancelled, 4: Hiatus
  last_chapter?: number;
  translation_completed?: boolean | null;
  view_count?: number;
  demographic?: number | null;
  uploaded_at?: string;
  genres?: number[];
  user_follow_count?: number;
  year?: number;
  is_english_title?: boolean | null;
  md_titles?: Array<{ title: string; lang?: string | null }>;
  md_covers?: Array<{ w: number; h: number; b2key: string }>;
  rating?: number | null;
  bayesian_rating?: number | null;
  rating_count?: number;
  follow_count?: number;
  follow_rank?: number;
}

export interface GenreInfo {
  md_genres?: {
    name?: string;
    type?: string | null;
    slug?: string;
    group?: string;
  };
}

export interface ComicDetail extends Comic {
  firstChap?: {
    chap: string;
    hid: string;
    lang: string;
    group_name: string[];
    vol: string | null;
  };
  md_comic_md_genres?: GenreInfo[];
  comic: Comic;
  artists?: Array<{ name: string; slug: string }>;
  authors?: Array<{ name: string; slug: string }>;
}

export interface Chapter {
  id: number;
  chap: string;
  title: string | null;
  vol: string | null;
  lang: string;
  up_count: number;
  down_count: number;
  group_name: string[];
  hid: string;
}

export interface ChapterImage {
  h: number;
  w: number;
  name: string;
  s: number;
  b2key: string;
  optimized: string | null;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
  comic_count: number;
  group: string;
}
