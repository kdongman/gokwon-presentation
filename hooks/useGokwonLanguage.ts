"use client";

import { useEffect, useState } from "react";

import {
  GOKWON_LANGUAGE_EVENT,
  readGokwonLanguage,
  saveGokwonLanguage,
} from "@/lib/gokwon-language";
import type { GokwonPageLanguage } from "@/lib/gokwon-page-translations";

export function useGokwonLanguage() {
  const [language, setLanguage] = useState<GokwonPageLanguage>("en");

  useEffect(() => {
    setLanguage(readGokwonLanguage());

    function handleChange() {
      setLanguage(readGokwonLanguage());
    }

    window.addEventListener(GOKWON_LANGUAGE_EVENT, handleChange);
    window.addEventListener("storage", handleChange);

    return () => {
      window.removeEventListener(GOKWON_LANGUAGE_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  function setLanguageAndPersist(next: GokwonPageLanguage) {
    saveGokwonLanguage(next);
    setLanguage(next);
  }

  return { language, setLanguage: setLanguageAndPersist };
}
