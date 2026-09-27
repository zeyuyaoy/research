"use client";

import {ChevronLeft, ChevronRight, Pause, Play} from "lucide-react";
import Image from "next/image";
import {useCallback, useEffect, useState, useSyncExternalStore} from "react";
import type {Slide} from "@/lib/conferenceSlides";
import {appearanceStore} from "@/lib/theme-store";

export default function ConferenceCarousel({
                                               slides,
                                               caption,
                                               hideCaption = false,
                                               sizes = "(max-width: 359px) calc(100vw - 32px), (max-width: 599px) calc(100vw - 48px), (max-width: 980px) calc(100vw - 64px), 668px"
                                           }: {
    slides: Slide[];
    caption?: string;
    hideCaption?: boolean;
    sizes?: string;
}) {
    const [index, setIndex] = useState(0);
    const [visited, setVisited] = useState(() => new Set([0]));
    const [manualPaused, setManualPaused] = useState(false);
    const [interactionPaused, setInteractionPaused] = useState(false);
    const [systemReduceMotion, setSystemReduceMotion] = useState(false);
    const appearance = useSyncExternalStore(appearanceStore.subscribe, appearanceStore.getSnapshot, appearanceStore.getServerSnapshot);
    const reduceMotion = systemReduceMotion || appearance.motion === "reduce";
    const hasMultiple = slides.length > 1;
    const paused = manualPaused || interactionPaused || reduceMotion;

    const selectSlide = useCallback((value: number) => {
        setIndex(value);
        setVisited((current) => new Set([...current, value]));
    }, []);
    const next = useCallback(() => selectSlide((index + 1) % slides.length), [index, selectSlide, slides.length]);
    const previous = useCallback(() => selectSlide((index - 1 + slides.length) % slides.length), [index, selectSlide, slides.length]);

    useEffect(() => {
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setSystemReduceMotion(media.matches);
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);

    useEffect(() => {
        if (!hasMultiple || paused) return;
        const timer = window.setInterval(next, 5_000);
        return () => window.clearInterval(timer);
    }, [hasMultiple, next, paused]);

    if (!slides.length) return null;

    return (
        <section
            className="research-carousel relative mx-auto mb-4 w-full overflow-hidden"
            aria-roledescription="carousel" aria-label={caption || "Conference photos"}
            onMouseEnter={() => setInteractionPaused(true)} onMouseLeave={() => setInteractionPaused(false)}
            onFocusCapture={() => setInteractionPaused(true)} onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setInteractionPaused(false);
        }} onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                previous();
            }
            if (event.key === "ArrowRight") {
                event.preventDefault();
                next();
            }
        }}>
            <div className="carousel-stage relative h-72 sm:h-80 md:h-96">
                {slides.map((slide, slideIndex) => <div key={slide.src} aria-hidden={slideIndex !== index}
                                                        className={`absolute inset-0 transition-opacity duration-500 ${slideIndex === index ? "opacity-100" : "pointer-events-none opacity-0"}`}>
                    {visited.has(slideIndex) ? <Image src={slide.src} alt={slide.alt} fill
                                                      sizes={sizes} className="object-cover"
                                                      loading="eager"/> : null}</div>)}
                {caption ? <div
                    className="absolute left-4 top-4 rounded bg-black/65 px-3 py-1 text-sm text-white">{caption}</div> : null}
                {!hideCaption && slides[index].caption ? <div
                    className="absolute bottom-4 left-4 max-w-[70%] rounded bg-black/70 px-3 py-1 text-sm text-white">{slides[index].caption}</div> : null}
                {hasMultiple ? <>
                    <button type="button" onClick={previous}
                            className="carousel-control absolute left-2 top-1/2 -translate-y-1/2 rounded-full"
                            aria-label="Previous slide"><ChevronLeft aria-hidden/></button>
                    <button type="button" onClick={next}
                            className="carousel-control absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                            aria-label="Next slide"><ChevronRight aria-hidden/></button>
                    <button type="button" onClick={() => setManualPaused((value) => !value)}
                            disabled={reduceMotion}
                            className="carousel-control absolute right-3 top-3 rounded-full"
                            aria-label={reduceMotion ? "Slideshow paused for reduced motion" : manualPaused ? "Resume slideshow" : "Pause slideshow"}>{manualPaused || reduceMotion ?
                        <Play aria-hidden/> : <Pause aria-hidden/>}</button>
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2"
                         aria-label={`Slide ${index + 1} of ${slides.length}`}>{slides.map((slide, slideIndex) =>
                        <button key={slide.src} type="button" aria-label={`Show slide ${slideIndex + 1}`}
                                aria-current={slideIndex === index ? "true" : undefined}
                                onClick={() => selectSlide(slideIndex)}
                                className="carousel-dot"/>)}</div>
                </> : null}
            </div>
            <p className="sr-only"
               aria-live={paused ? "polite" : "off"}>Photo {index + 1} of {slides.length}: {slides[index].alt}</p>
        </section>
    );
}
