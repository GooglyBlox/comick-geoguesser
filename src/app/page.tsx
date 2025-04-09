/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useCallback } from "react";
import type {
  Comic,
  Genre,
  ComicDetail,
  Chapter,
  ChapterImage,
  GenreInfo,
} from "@/types";
import FilterPanel from "@/components/FilterPanel";
import ComicPanel from "@/components/ComicPanel";
import GuessForm from "@/components/GuessForm";
import RevealModal from "@/components/RevealModal";
import {
  Loader2,
  RefreshCcw,
  Trophy,
  History,
  AlertCircle,
} from "lucide-react";

const MAX_PAGES_TO_TRY = 30;
const HINTS_PER_COMIC = 3;

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundComic, setFoundComic] = useState<Comic | null>(null);
  const [comicDetail, setComicDetail] = useState<ComicDetail | null>(null);
  const [chapterHid, setChapterHid] = useState<string | null>(null);
  const [chapterImages, setChapterImages] = useState<ChapterImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [guessHistory, setGuessHistory] = useState<
    Array<{ comic: Comic; correct: boolean }>
  >([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalCorrect, setModalCorrect] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(HINTS_PER_COMIC);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [usedHintTypes, setUsedHintTypes] = useState<string[]>([]);

  // Filter states
  const [contentRating, setContentRating] = useState<string[]>([
    "safe",
    "suggestive",
    "erotica",
  ]);
  const [origin, setOrigin] = useState<string[]>([
    "jp",
    "kr",
    "cn",
    "hk",
    "gb",
  ]);
  const [status, setStatus] = useState<number[]>([1, 2, 3, 4]);
  const [includedGenres, setIncludedGenres] = useState<number[]>([]);
  const [excludedGenres, setExcludedGenres] = useState<number[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genreMap, setGenreMap] = useState<Map<number, Genre>>(new Map());
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  useEffect(() => {
    const savedContentRating = localStorage.getItem("contentRating");
    const savedOrigin = localStorage.getItem("origin");
    const savedStatus = localStorage.getItem("status");
    const savedHistory = localStorage.getItem("guessHistory");
    const savedIncludedGenres = localStorage.getItem("includedGenres");
    const savedExcludedGenres = localStorage.getItem("excludedGenres");
    const savedStreak = localStorage.getItem("streak");
    const savedBestStreak = localStorage.getItem("bestStreak");

    if (savedContentRating) {
      try {
        const parsed = JSON.parse(savedContentRating);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setContentRating(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved content rating");
      }
    }

    if (savedOrigin) {
      try {
        const parsed = JSON.parse(savedOrigin);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrigin(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved origin");
      }
    }

    if (savedStatus) {
      try {
        const parsed = JSON.parse(savedStatus);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStatus(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved status");
      }
    }

    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setGuessHistory(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved guess history");
      }
    }

    if (savedIncludedGenres) {
      try {
        const parsed = JSON.parse(savedIncludedGenres);
        if (Array.isArray(parsed)) {
          setIncludedGenres(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved included genres");
      }
    }

    if (savedExcludedGenres) {
      try {
        const parsed = JSON.parse(savedExcludedGenres);
        if (Array.isArray(parsed)) {
          setExcludedGenres(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved excluded genres");
      }
    }

    if (savedStreak) {
      try {
        const parsed = parseInt(savedStreak);
        if (!isNaN(parsed)) {
          setStreak(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved streak");
      }
    }

    if (savedBestStreak) {
      try {
        const parsed = parseInt(savedBestStreak);
        if (!isNaN(parsed)) {
          setBestStreak(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved best streak");
      }
    }

    const fetchGenres = async () => {
      setIsLoadingGenres(true);
      try {
        const response = await fetch("/api/comick/genre");
        if (response.ok) {
          const genresData: Genre[] = await response.json();
          setGenres(genresData);

          const map = new Map<number, Genre>();
          genresData.forEach((genre) => {
            map.set(genre.id, genre);
          });
          setGenreMap(map);
        }
      } catch (err) {
        console.error("Failed to load genre mapping", err);
      } finally {
        setIsLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    localStorage.setItem("contentRating", JSON.stringify(contentRating));
  }, [contentRating]);

  useEffect(() => {
    localStorage.setItem("origin", JSON.stringify(origin));
  }, [origin]);

  useEffect(() => {
    localStorage.setItem("status", JSON.stringify(status));
  }, [status]);

  useEffect(() => {
    localStorage.setItem("guessHistory", JSON.stringify(guessHistory));
  }, [guessHistory]);

  useEffect(() => {
    localStorage.setItem("includedGenres", JSON.stringify(includedGenres));
  }, [includedGenres]);

  useEffect(() => {
    localStorage.setItem("excludedGenres", JSON.stringify(excludedGenres));
  }, [excludedGenres]);

  useEffect(() => {
    localStorage.setItem("streak", streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem("bestStreak", bestStreak.toString());
  }, [bestStreak]);

  const fetchComicsFromPage = async (page: number) => {
    try {
      const response = await fetch(`/api/comick?limit=50&page=${page}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const text = await response.text();
      if (!text || text.trim() === "") {
        console.warn(`Empty response received from page ${page}`);
        return [];
      }

      try {
        const data = JSON.parse(text);
        return data;
      } catch (parseError) {
        console.error(`Error parsing JSON from page ${page}:`, parseError);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      throw error;
    }
  };

  const fetchComicDetail = async (slug: string) => {
    try {
      const response = await fetch(`/api/comick/comic?slug=${slug}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch comic details with status ${response.status}`
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching comic details:", error);
      throw error;
    }
  };

  const fetchChapters = async (hid: string) => {
    try {
      const response = await fetch(`/api/comick/chapters?hid=${hid}&limit=10`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch chapters with status ${response.status}`
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching chapters:", error);
      throw error;
    }
  };

  const fetchImages = async (hid: string) => {
    try {
      const response = await fetch(`/api/comick/images?hid=${hid}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch images with status ${response.status}`
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching images:", error);
      throw error;
    }
  };

  const filterComics = useCallback(
    (comics: Comic[]) => {
      return comics.filter((comic: Comic) => {
        const ratingMatch = comic.content_rating
          ? contentRating.includes(comic.content_rating)
          : true;

        const originMatch = comic.country
          ? origin.includes(comic.country)
          : true;

        const statusMatch = comic.status ? status.includes(comic.status) : true;

        let genreMatch = true;

        if (includedGenres.length > 0 && comic.genres) {
          genreMatch = includedGenres.every((genreId) =>
            comic.genres?.includes(genreId)
          );
        }

        if (genreMatch && excludedGenres.length > 0 && comic.genres) {
          genreMatch = !excludedGenres.some((genreId) =>
            comic.genres?.includes(genreId)
          );
        }

        const isInHistory = guessHistory
          .map((item) => item.comic.id)
          .includes(comic.id);

        return (
          ratingMatch &&
          originMatch &&
          statusMatch &&
          genreMatch &&
          !isInHistory
        );
      });
    },
    [
      contentRating,
      origin,
      status,
      includedGenres,
      excludedGenres,
      guessHistory,
    ]
  );

  const findRandomComic = async () => {
    setIsLoading(true);
    setError(null);
    setCurrentHint(null);
    setHintsRemaining(HINTS_PER_COMIC);
    setUsedHintTypes([]);

    try {
      const pagesToTry = Array.from(
        { length: MAX_PAGES_TO_TRY },
        (_, i) => i + 1
      );

      for (let i = pagesToTry.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pagesToTry[i], pagesToTry[j]] = [pagesToTry[j], pagesToTry[i]];
      }

      let filteredComics: Comic[] = [];
      let pagesTriedCount = 0;
      const maxAttempts = 3;
      let attempt = 0;

      while (attempt < maxAttempts && filteredComics.length === 0) {
        attempt++;
        pagesTriedCount = 0;

        for (const page of pagesToTry) {
          pagesTriedCount++;

          try {
            const comicsResponse = await fetchComicsFromPage(page);

            const comics = Array.isArray(comicsResponse)
              ? comicsResponse
              : comicsResponse && Array.isArray(comicsResponse.data)
              ? comicsResponse.data
              : [];

            if (comics.length === 0) {
              console.warn(`No comics data found on page ${page}`);
              continue;
            }

            const filtered = filterComics(comics);

            if (filtered.length > 0) {
              filteredComics = filtered;
              break;
            }

            if (pagesTriedCount === Math.floor(MAX_PAGES_TO_TRY / 2)) {
              setError(
                "Still searching for comics that match your criteria..."
              );
            }
          } catch (err) {
            console.error(`Error fetching page ${page}:`, err);
            continue;
          }
        }

        if (filteredComics.length === 0 && attempt === maxAttempts - 1) {
          for (const page of pagesToTry.slice(0, 5)) {
            try {
              const comicsResponse = await fetchComicsFromPage(page);

              const comics = Array.isArray(comicsResponse)
                ? comicsResponse
                : comicsResponse && Array.isArray(comicsResponse.data)
                ? comicsResponse.data
                : [];

              if (comics.length === 0) {
                continue;
              }

              const filtered = comics.filter((comic: Comic) => {
                const ratingMatch = comic.content_rating
                  ? contentRating.includes(comic.content_rating)
                  : true;
                const originMatch = comic.country
                  ? origin.includes(comic.country)
                  : true;
                const statusMatch = comic.status
                  ? status.includes(comic.status)
                  : true;

                return ratingMatch && originMatch && statusMatch;
              });

              if (filtered.length > 0) {
                filteredComics = filtered;
                break;
              }
            } catch (err) {
              console.error(`Error fetching page ${page} (fallback):`, err);
              continue;
            }
          }
        }
      }

      if (filteredComics.length === 0) {
        throw new Error(
          "No comics found matching your criteria. Try adjusting your filters."
        );
      }

      const randomIndex = Math.floor(Math.random() * filteredComics.length);
      const selectedComic = filteredComics[randomIndex];

      setFoundComic(selectedComic);
      setError(null);

      setIsLoadingImages(true);
      const detail = await fetchComicDetail(selectedComic.slug);
      setComicDetail(detail);

      let targetChapterHid = null;
      let chaptersData = null;
      let chaptersError = null;

      try {
        if (detail.firstChap && detail.firstChap.chap === "0") {
          chaptersData = await fetchChapters(detail.hid);
        }
      } catch (err) {
        chaptersError = err;
        console.error("Error with primary chapter fetch:", err);
      }

      if (chaptersData && chaptersData.chapters) {
        const chapter1s = chaptersData.chapters.filter(
          (chap: Chapter) => chap.chap === "1"
        );

        if (chapter1s.length > 0) {
          chapter1s.sort((a: Chapter, b: Chapter) => b.up_count - a.up_count);
          targetChapterHid = chapter1s[0].hid;
        } else {
          targetChapterHid = chaptersData.chapters[0].hid;
        }
      } else if (detail.firstChap) {
        targetChapterHid = detail.firstChap.hid;
      } else {
        const backupChaptersData = await fetchComicsFromPage(1);
        if (backupChaptersData && backupChaptersData.length > 0) {
          const backupComic = backupChaptersData[0];
          if (backupComic && backupComic.hid) {
            targetChapterHid = backupComic.hid;
          }
        }
      }

      setChapterHid(targetChapterHid);

      if (targetChapterHid) {
        try {
          const imagesData = await fetchImages(targetChapterHid);
          if (imagesData && Array.isArray(imagesData)) {
            setChapterImages(imagesData);
          } else {
            throw new Error("Failed to load chapter images");
          }
        } catch (imgError) {
          console.error("Error fetching images:", imgError);
          throw new Error("Failed to load comic images. Please try again.");
        }
      } else {
        throw new Error(
          "No valid chapter found for this comic. Please try again."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
      setIsLoadingImages(false);
    }
  };

  const getValidTitles = () => {
    if (!comicDetail) return [];

    const comic = comicDetail.comic;
    if (!comic) return [];

    const titles =
      comic.title && typeof comic.title === "string" ? [comic.title] : [];

    if (comic.md_titles && Array.isArray(comic.md_titles)) {
      comic.md_titles.forEach((titleObj) => {
        if (
          titleObj &&
          titleObj.title &&
          typeof titleObj.title === "string" &&
          titleObj.title.trim() !== ""
        ) {
          titles.push(titleObj.title);
        }
      });
    }

    console.log("Valid titles for this comic:", titles);

    return titles
      .filter((title) => typeof title === "string" && title.trim() !== "")
      .filter((title, index, self) => self.indexOf(title) === index);
  };

  const generateHint = () => {
    if (!comicDetail || !comicDetail.comic) return null;

    const comic = comicDetail.comic;
    const title = comic.title || "";

    const possibleHintTypes = [
      "first-letter",
      "last-letter",
      "word-count",
      "contains-word",
      "first-word",
      "last-word",
      "vowels",
      "consonants",
      "title-length",
      "uppercase-count",
      "title-spaces",
      "shortest-word",
      "longest-word",
      "special-chars",
      "numbers-in-title",
      "alternate-title",

      "origin",
      "year",
      "genre",
      "genre-count",
      "demographic",
      "content-rating",
      "translation-status",

      "status",
      "chapters",
      "chapter-count",
      "follow-count",
      "follow-rank",
    ];

    const availableHintTypes = possibleHintTypes.filter(
      (type) => !usedHintTypes.includes(type)
    );

    if (availableHintTypes.length === 0) {
      return "This is your last hint: it's a comic on ComicK.io!";
    }

    const hintType =
      availableHintTypes[Math.floor(Math.random() * availableHintTypes.length)];

    setUsedHintTypes((prev) => [...prev, hintType]);

    if (!title || typeof title !== "string") {
      return `This comic is from ${
        comic.country === "jp"
          ? "Japan"
          : comic.country === "kr"
          ? "Korea"
          : comic.country === "cn"
          ? "China"
          : comic.country === "hk"
          ? "Hong Kong"
          : "an English-speaking country"
      }`;
    }

    switch (hintType) {
      // Title-based hints
      case "first-letter":
        return title.length > 0
          ? `The title starts with the letter "${title[0].toUpperCase()}"`
          : "This title is very short";

      case "last-letter":
        return title.length > 0
          ? `The title ends with the letter "${title[
              title.length - 1
            ].toUpperCase()}"`
          : "This title is very short";

      case "word-count": {
        const words = title.split(" ").filter(Boolean);
        const wordCount = words.length;
        return `The title has ${wordCount} word${wordCount !== 1 ? "s" : ""}`;
      }

      case "contains-word": {
        const words = title
          .split(" ")
          .filter((word) => word && word.length > 3);
        if (words.length > 0) {
          const randomWordIndex = Math.floor(Math.random() * words.length);
          const randomWord = words[randomWordIndex];
          return `The title contains the word "${randomWord}"`;
        }
        return `The publication year is ${comic.year || "unknown"}`;
      }

      case "first-word": {
        const words = title.split(" ").filter(Boolean);
        if (words.length > 0) {
          return `The first word of the title is "${words[0]}"`;
        }
        return `The title is a single word`;
      }

      case "last-word": {
        const words = title.split(" ").filter(Boolean);
        if (words.length > 1) {
          return `The last word of the title is "${words[words.length - 1]}"`;
        }
        return `The title is a single word`;
      }

      case "vowels": {
        const vowelMatches = title.match(/[aeiou]/gi);
        const vowelCount = vowelMatches ? vowelMatches.length : 0;
        return `The title contains ${vowelCount} vowel${
          vowelCount !== 1 ? "s" : ""
        }`;
      }

      case "consonants": {
        const consonantMatches = title.match(/[bcdfghjklmnpqrstvwxyz]/gi);
        const consonantCount = consonantMatches ? consonantMatches.length : 0;
        return `The title contains ${consonantCount} consonant${
          consonantCount !== 1 ? "s" : ""
        }`;
      }

      case "title-length":
        return `The title is ${title.length} characters long`;

      case "uppercase-count": {
        const uppercaseMatches = title.match(/[A-Z]/g);
        const uppercaseCount = uppercaseMatches ? uppercaseMatches.length : 0;
        return `The title contains ${uppercaseCount} uppercase letter${
          uppercaseCount !== 1 ? "s" : ""
        }`;
      }

      case "title-spaces": {
        const spaceCount = title.split(" ").length - 1;
        return `The title contains ${spaceCount} space${
          spaceCount !== 1 ? "s" : ""
        }`;
      }

      case "shortest-word": {
        const words = title.split(" ").filter(Boolean);
        if (words.length > 1) {
          const shortest = words.reduce((a, b) =>
            a.length <= b.length ? a : b
          );
          return `The shortest word in the title is "${shortest}" (${shortest.length} letters)`;
        }
        return `The title is "${title}" (a single word)`;
      }

      case "longest-word": {
        const words = title.split(" ").filter(Boolean);
        if (words.length > 1) {
          const longest = words.reduce((a, b) =>
            a.length >= b.length ? a : b
          );
          return `The longest word in the title is "${longest}" (${longest.length} letters)`;
        }
        return `The title is "${title}" (a single word)`;
      }

      case "special-chars": {
        const specialMatches = title.match(/[^\w\s]/g);
        const specialCount = specialMatches ? specialMatches.length : 0;
        return `The title contains ${specialCount} special character${
          specialCount !== 1 ? "s" : ""
        }`;
      }

      case "numbers-in-title": {
        const numberMatches = title.match(/\d/g);
        if (numberMatches && numberMatches.length > 0) {
          return `The title contains the number${
            numberMatches.length > 1 ? "s" : ""
          } ${numberMatches.join(", ")}`;
        }
        return "The title doesn't contain any numbers";
      }

      case "alternate-title": {
        if (comic.md_titles && comic.md_titles.length > 0) {
          const altTitles = comic.md_titles.filter(
            (t) => t.title && t.title !== title && t.title.trim() !== ""
          );

          if (altTitles.length > 0) {
            const randomTitle =
              altTitles[Math.floor(Math.random() * altTitles.length)];
            const titleWords = randomTitle.title.split(" ");
            if (titleWords.length > 2) {
              return `One of this comic's alternate titles starts with "${titleWords[0]}"`;
            } else {
              return `One of this comic's alternate titles is ${randomTitle.title.length} characters long`;
            }
          }
        }
        return "This comic doesn't have any alternate titles";
      }

      case "origin":
        return `This comic is from ${
          comic.country === "jp"
            ? "Japan (it's a manga)"
            : comic.country === "kr"
            ? "Korea (it's a manhwa)"
            : comic.country === "cn"
            ? "China (it's a manhua)"
            : comic.country === "hk"
            ? "Hong Kong"
            : "an English-speaking country"
        }`;

      case "year":
        return comic.year
          ? `This comic was first published in ${comic.year}`
          : "The publication year of this comic is unknown";

      case "genre": {
        if (
          comicDetail.md_comic_md_genres &&
          Array.isArray(comicDetail.md_comic_md_genres) &&
          comicDetail.md_comic_md_genres.length > 0
        ) {
          const genreNames = comicDetail.md_comic_md_genres
            .map((g: GenreInfo) => g.md_genres?.name)
            .filter(Boolean);

          if (genreNames.length > 0) {
            const randomGenre =
              genreNames[Math.floor(Math.random() * genreNames.length)];
            return `This comic belongs to the "${randomGenre}" genre`;
          }
        }
        return `This comic has ${
          comic.last_chapter || "multiple"
        } chapters available`;
      }

      case "content-rating":
        return `This comic has a content rating of "${
          comic.content_rating || "unknown"
        }"`;

      case "translation-status":
        return comic.translation_completed === true
          ? "The translation for this comic is complete"
          : comic.translation_completed === false
          ? "The translation for this comic is still ongoing"
          : "The translation status for this comic is unknown";

      case "status":
        return `The publication status is: ${
          comic.status === 1
            ? "Ongoing"
            : comic.status === 2
            ? "Completed"
            : comic.status === 3
            ? "Cancelled"
            : comic.status === 4
            ? "On Hiatus"
            : "Unknown"
        }`;

      case "chapters":
        return comic.last_chapter
          ? `This comic has ${comic.last_chapter} chapters available to read`
          : "This comic is relatively new with few chapters";

      case "follow-count":
        return comic.user_follow_count
          ? `This comic has ${comic.user_follow_count.toLocaleString()} followers on ComicK`
          : "The number of followers for this comic is unknown";

      case "follow-rank":
        return comic.follow_rank
          ? `This comic's popularity rank on ComicK is #${comic.follow_rank.toLocaleString()}`
          : "This comic's popularity rank is unknown";

      default:
        return `This comic has ${
          comic.user_follow_count
            ? comic.user_follow_count.toLocaleString()
            : "many"
        } followers on ComicK`;
    }
  };

  const handleCorrectGuess = () => {
    if (foundComic) {
      setGuessHistory((prev: Array<{ comic: Comic; correct: boolean }>) => [
        { comic: foundComic, correct: true },
        ...prev.slice(0, 9),
      ]);

      const newStreak = streak + 1;
      setStreak(newStreak);

      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }

      setModalCorrect(true);
      setShowModal(true);
    }
  };

  const handleSkip = () => {
    if (foundComic) {
      setGuessHistory((prev: Array<{ comic: Comic; correct: boolean }>) => [
        { comic: foundComic, correct: false },
        ...prev.slice(0, 9),
      ]);

      setStreak(0);

      setModalCorrect(false);
      setShowModal(true);
    }
  };

  const handleNextComic = () => {
    setShowModal(false);
    setChapterImages([]);
    setChapterHid(null);
    setComicDetail(null);
    setFoundComic(null);
    setHintsRemaining(HINTS_PER_COMIC);
    setUsedHintTypes([]);
    findRandomComic();
  };

  const handleContentRatingChange = (selectedRatings: string[]) => {
    setContentRating(selectedRatings);
  };

  const handleOriginChange = (selectedOrigins: string[]) => {
    setOrigin(selectedOrigins);
  };

  const handleStatusChange = (selectedStatus: number[]) => {
    setStatus(selectedStatus);
  };

  const handleIncludeGenre = (genreId: number) => {
    setExcludedGenres((prev) => prev.filter((id) => id !== genreId));
    setIncludedGenres((prev) => [...prev, genreId]);
  };

  const handleExcludeGenre = (genreId: number) => {
    setIncludedGenres((prev) => prev.filter((id) => id !== genreId));
    setExcludedGenres((prev) => [...prev, genreId]);
  };

  const handleRemoveGenre = (genreId: number) => {
    setIncludedGenres((prev) => prev.filter((id) => id !== genreId));
    setExcludedGenres((prev) => prev.filter((id) => id !== genreId));
  };

  const handleClearGenreFilters = () => {
    setIncludedGenres([]);
    setExcludedGenres([]);
  };

  const useHint = () => {
    if (hintsRemaining <= 0) return;

    const hint = generateHint();
    setCurrentHint(hint);
    setHintsRemaining((prev: number) => prev - 1);
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-white">
              Comic Geoguesser
            </h1>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl">
                <div className="flex items-center gap-1 text-yellow-300">
                  <Trophy size={18} />
                  <span className="font-medium text-slate-300">
                    Best Streak:
                  </span>
                  <span className="text-lg font-bold">{bestStreak}</span>
                </div>
              </div>
            </div>
          </div>

          <FilterPanel
            contentRating={contentRating}
            origin={origin}
            status={status}
            includedGenres={includedGenres}
            excludedGenres={excludedGenres}
            onContentRatingChange={handleContentRatingChange}
            onOriginChange={handleOriginChange}
            onStatusChange={handleStatusChange}
            onIncludeGenre={handleIncludeGenre}
            onExcludeGenre={handleExcludeGenre}
            onRemoveGenre={handleRemoveGenre}
            onClearGenreFilters={handleClearGenreFilters}
            genres={genres}
            isLoading={isLoadingGenres}
            isExpanded={isFilterExpanded}
            onToggleExpand={() => setIsFilterExpanded(!isFilterExpanded)}
          />

          {!foundComic ? (
            <div className="mt-8 mb-10 flex justify-center">
              <button
                onClick={findRandomComic}
                disabled={isLoading}
                className="btn btn-primary px-6 py-4 text-base rounded-xl flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={22} className="animate-spin" />
                    Finding comic...
                  </>
                ) : (
                  <>
                    <RefreshCcw size={22} />
                    Start New Game
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="mt-6 mb-8 flex justify-end">
              <button
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to start a new game? Your current progress will be lost."
                    )
                  ) {
                    setHintsRemaining(HINTS_PER_COMIC);
                    setUsedHintTypes([]);
                    handleNextComic();
                  }
                }}
                className="btn btn-secondary px-3 py-1.5 text-sm rounded-lg flex items-center gap-1"
              >
                <RefreshCcw size={14} />
                New Game
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700/40 rounded-xl text-center animate-fadeIn flex items-center justify-center gap-2">
              <AlertCircle size={20} className="text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {foundComic && chapterImages.length > 0 && (
            <div className="animate-fadeIn mb-8 comic-container">
              <div className="mb-8">
                <ComicPanel
                  images={chapterImages}
                  isLoading={isLoadingImages}
                />
              </div>

              <GuessForm
                validTitles={getValidTitles()}
                onCorrectGuess={handleCorrectGuess}
                onSkip={handleSkip}
                streak={streak}
                useHint={useHint}
                hintsRemaining={hintsRemaining}
                hint={currentHint}
              />
            </div>
          )}

          {guessHistory.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-700/70 pb-2">
                <History size={18} className="text-sky-400" />
                <h2 className="text-lg font-medium text-slate-100">
                  Recent Comics
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guessHistory.map(
                  (item: { comic: Comic; correct: boolean }, index: number) => (
                    <div
                      key={`${item.comic.id}-${index}`}
                      className={`p-4 rounded-xl flex gap-4 transition-all hover:translate-y-[-2px] ${
                        item.correct
                          ? "glass border-green-700/40"
                          : "glass border-red-700/40"
                      }`}
                    >
                      {item.comic.md_covers &&
                      item.comic.md_covers.length > 0 ? (
                        <img
                          src={`https://meo.comick.pictures/${item.comic.md_covers[0].b2key}`}
                          alt={item.comic.title}
                          className="w-16 h-24 object-cover rounded-lg border border-slate-700/80"
                        />
                      ) : (
                        <div className="w-16 h-24 bg-slate-800 rounded-lg border border-slate-700/80 flex items-center justify-center text-slate-600 text-xs">
                          No Cover
                        </div>
                      )}
                      <div className="overflow-hidden flex-1">
                        <h4 className="font-medium text-white mb-1.5 truncate">
                          {item.comic.title}
                        </h4>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {item.comic.country && (
                            <span className="badge badge-secondary">
                              {item.comic.country.toUpperCase()}
                            </span>
                          )}
                          {item.comic.status !== undefined && (
                            <span className="badge badge-secondary">
                              {item.comic.status === 1
                                ? "Ongoing"
                                : item.comic.status === 2
                                ? "Completed"
                                : item.comic.status === 3
                                ? "Cancelled"
                                : "Hiatus"}
                            </span>
                          )}
                          <span
                            className={`badge ${
                              item.correct
                                ? "bg-green-900/50 text-green-100 border-green-800/30"
                                : "bg-red-900/50 text-red-100 border-red-800/30"
                            }`}
                          >
                            {item.correct ? "Correct" : "Skipped"}
                          </span>
                        </div>
                        {item.comic.desc && (
                          <p className="text-xs text-slate-300 line-clamp-2">
                            {item.comic.desc}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <RevealModal
          comic={foundComic}
          onClose={handleNextComic}
          correct={modalCorrect}
          genreMap={genreMap}
        />
      )}
    </main>
  );
}
