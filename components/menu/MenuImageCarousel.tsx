"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { resolveMenuImageUrls } from "@/lib/menu-images";

type MenuImageCarouselProps = {
  images: string[];
  imagePosition?: string;
  fallback?: string;
  alt: string;
  children?: ReactNode;
  className?: string;
};

export default function MenuImageCarousel({
  images,
  imagePosition = "center",
  fallback,
  alt,
  children,
  className = "",
}: MenuImageCarouselProps) {
  const slides = useMemo(
    () => resolveMenuImageUrls(images, fallback),
    [images, fallback],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const updateIndexFromScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const width = element.clientWidth;
    if (width <= 0) {
      return;
    }

    const index = Math.round(element.scrollLeft / width);
    setActiveIndex(Math.min(Math.max(index, 0), slides.length - 1));
  }, [slides.length]);

  useEffect(() => {
    setActiveIndex(0);
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [slides]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element || slides.length <= 1) {
      return;
    }

    element.addEventListener("scroll", updateIndexFromScroll, { passive: true });
    return () => element.removeEventListener("scroll", updateIndexFromScroll);
  }, [slides.length, updateIndexFromScroll]);

  function goToSlide(index: number) {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    element.scrollTo({
      left: index * element.clientWidth,
      behavior: "smooth",
    });
    setActiveIndex(index);
  }

  if (slides.length <= 1) {
    return (
      <div
        className={`relative h-52 bg-cover bg-slate-100 sm:h-56 ${className}`}
        style={{
          backgroundImage: `url('${slides[0]}')`,
          backgroundPosition: imagePosition,
        }}
        role="img"
        aria-label={alt}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        {children}
      </div>
    );
  }

  return (
    <div className={`relative h-52 sm:h-56 ${className}`}>
      <div
        ref={scrollRef}
        className="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={alt}
      >
        {slides.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative h-full w-full shrink-0 snap-center bg-cover bg-slate-100"
            style={{
              backgroundImage: `url('${url}')`,
              backgroundPosition: imagePosition,
            }}
            role="img"
            aria-label={`${alt} ${index + 1}`}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

      {children}

      <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-1.5">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`${index + 1} / ${slides.length}`}
            aria-current={index === activeIndex ? "true" : undefined}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all ${
              index === activeIndex
                ? "h-2 w-5 bg-white shadow-sm"
                : "h-2 w-2 bg-white/55 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
