/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import Header from "@/components/Header";
import FilterControls from "@/components/FilterControls";
import GameInterface from "@/components/GameInterface";
import HistorySection from "@/components/HistorySection";
import RevealModal from "@/components/RevealModal";
import { AlertCircle, RefreshCw } from "lucide-react";

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
  const [titlePool, setTitlePool] = useState<string[]>([]);

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

  const fetchAndUpdateTitlePool = useCallback(async () => {
    try {
      const pages = [1, 2, 3, 4, 5];
      for (const page of pages) {
        const response = await fetch(`/api/comick?limit=50&page=${page}`);
        if (response.ok) {
          const data = await response.json();
          const comics = Array.isArray(data)
            ? data
            : data && Array.isArray(data.data)
            ? data.data
            : [];

          const titles = comics
            .filter(
              (comic: Comic) => comic.title && typeof comic.title === "string"
            )
            .map((comic: Comic) => comic.title);

          setTitlePool((prev) => {
            return [...new Set([...prev, ...titles])];
          });
        }
      }
    } catch (error) {
      console.error("Error fetching title pool:", error);
    }
  }, []);

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

    fetchAndUpdateTitlePool();
  }, [fetchAndUpdateTitlePool]);

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

        const comics = Array.isArray(data) ? data : data.data || [];
        const titles = comics
          .filter(
            (comic: Comic) => comic.title && typeof comic.title === "string"
          )
          .map((comic: Comic) => comic.title);

        setTitlePool((prev) => [...new Set([...prev, ...titles])]);

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

  const generateTitleOptions = useCallback(() => {
    if (!comicDetail || !comicDetail.comic || !comicDetail.comic.title)
      return [];

    const correctTitle = comicDetail.comic.title;

    const calculateSimilarity = (title1: string, title2: string): number => {
      const t1 = title1.toLowerCase();
      const t2 = title2.toLowerCase();

      const words1 = t1.split(/\s+/).filter((w) => w.length > 1);
      const words2 = t2.split(/\s+/).filter((w) => w.length > 1);

      let commonWords = 0;
      for (const word1 of words1) {
        if (word1.length < 3) continue;
        if (words2.some((word2) => word2 === word1)) {
          commonWords++;
        }
      }

      const wordOverlapRatio =
        commonWords / Math.max(words1.length, words2.length);

      const lengthRatio =
        Math.min(t1.length, t2.length) / Math.max(t1.length, t2.length);

      let charOverlap = 0;
      const checkLength = Math.min(t1.length, t2.length, 5);
      for (let i = 0; i < checkLength; i++) {
        if (t1[i] === t2[i]) charOverlap++;
      }
      const charOverlapRatio = charOverlap / checkLength;

      return (
        wordOverlapRatio * 0.6 + lengthRatio * 0.2 + charOverlapRatio * 0.2
      );
    };

    const similarTitles = titlePool
      .filter((title) => title !== correctTitle)
      .map((title) => ({
        title,
        similarity: calculateSimilarity(correctTitle, title),
      }))
      .filter((item) => item.similarity > 0.2)
      .sort((a, b) => b.similarity - a.similarity);

    const selectedAlternatives: string[] = [];

    if (similarTitles.length > 0) {
      selectedAlternatives.push(similarTitles[0].title);

      if (similarTitles.length > 1) {
        for (let i = 1; i < Math.min(similarTitles.length, 10); i++) {
          const firstSelected = selectedAlternatives[0];
          const currentTitle = similarTitles[i].title;

          if (calculateSimilarity(firstSelected, currentTitle) < 0.7) {
            selectedAlternatives.push(currentTitle);
            break;
          }
        }

        if (selectedAlternatives.length === 1) {
          selectedAlternatives.push(similarTitles[1].title);
        }
      }
    }

    if (selectedAlternatives.length < 2) {
      const randomTitles = titlePool
        .filter(
          (title) =>
            title !== correctTitle && !selectedAlternatives.includes(title)
        )
        .sort(() => 0.5 - Math.random())
        .slice(0, 2 - selectedAlternatives.length);

      selectedAlternatives.push(...randomTitles);
    }

    while (selectedAlternatives.length < 2) {
      const words = correctTitle.split(" ");
      if (words.length > 1) {
        const copy = [...words];
        copy.splice(Math.floor(Math.random() * copy.length), 1);
        const variant = copy.join(" ");

        if (
          !selectedAlternatives.includes(variant) &&
          variant !== correctTitle
        ) {
          selectedAlternatives.push(variant);
        } else {
          const suffixes = ["Series", "Chronicles", "Adventures", "Stories"];
          selectedAlternatives.push(
            `${correctTitle} ${
              suffixes[Math.floor(Math.random() * suffixes.length)]
            }`
          );
        }
      } else {
        const suffixes = ["Next", "Z", "X", "DX", "2", "II"];
        const variant = `${correctTitle} ${
          suffixes[Math.floor(Math.random() * suffixes.length)]
        }`;
        selectedAlternatives.push(variant);
      }
    }

    const options = [correctTitle, ...selectedAlternatives];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return options;
  }, [comicDetail, titlePool]);

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
    <main className="min-h-screen bg-zinc-950 text-white">
      <Header bestStreak={bestStreak} currentStreak={streak} />

      <div className="container max-w-6xl mx-auto px-4 pt-8 pb-16">
        <FilterControls
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
        />

        {!foundComic ? (
          <div className="mt-16 mb-16 text-center">
            <div className="inline-block mb-1 p-1 rounded-full">
              <img
                src="/unicorn-512.png"
                alt="Game icon"
                width={128}
                height={128}
              />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to Guess Some Comics?
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto mb-8">
              Test your comic knowledge! We&apos;ll show you random panels, and
              you&apos;ll try to guess the title.
            </p>
            <button
              onClick={findRandomComic}
              disabled={isLoading}
              className="btn px-6 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium inline-flex items-center gap-2 shadow-lg shadow-violet-500/20"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Finding comic...
                </>
              ) : (
                <>
                  <RefreshCw size={20} />
                  Start New Game
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="mt-8">
            {error ? (
              <div className="p-4 bg-rose-900/30 border border-rose-700/40 rounded-xl text-center mb-8 flex items-center justify-center gap-2">
                <AlertCircle size={20} className="text-rose-400" />
                <span className="text-rose-100">{error}</span>
              </div>
            ) : (
              <GameInterface
                images={chapterImages}
                isLoading={isLoadingImages}
                correctTitle={comicDetail?.comic?.title || ""}
                generateOptions={generateTitleOptions}
                onCorrectGuess={handleCorrectGuess}
                onSkip={handleSkip}
                streak={streak}
                useHint={useHint}
                hintsRemaining={hintsRemaining}
                hint={currentHint}
                comic={foundComic}
              />
            )}

            <div className="flex justify-end mt-5">
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
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg inline-flex items-center gap-1"
              >
                <RefreshCw size={14} />
                New Game
              </button>
            </div>
          </div>
        )}

        <HistorySection guessHistory={guessHistory} />
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
