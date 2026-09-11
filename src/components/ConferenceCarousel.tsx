"use client";

import {ChevronLeft, ChevronRight, Pause, Play} from "lucide-react";
import Image from "next/image";
import {useCallback, useEffect, useState} from "react";
import type {Slide} from "@/lib/conferenceSlides";

export default function ConferenceCarousel({slides, caption, hideCaption = false}: {
    slides: Slide[];
    caption?: string;
    hideCaption?: boolean
}) {
    const [index, setIndex] = useState(0);
    const [manualPaused, setManualPaused] = useState(false);
    const [interactionPaused, setInteractionPaused] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);
    const hasMultiple = slides.length > 1;
    const paused = manualPaused || interactionPaused || reduceMotion;

    const next = useCallback(() => setIndex((value) => (value + 1) % slides.length), [slides.length]);
    const previous = useCallback(() => setIndex((value) => (value - 1 + slides.length) % slides.length), [slides.length]);

    useEffect(() => {
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReduceMotion(media.matches);
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
            className="relative mx-auto mb-4 w-full max-w-4xl overflow-hidden rounded-lg shadow-lg focus-within:ring-2"
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
            <div className="relative h-72 bg-gray-100 sm:h-80 md:h-96">
                {slides.map((slide, slideIndex) => <div key={slide.src} aria-hidden={slideIndex !== index}
                                                        className={`absolute inset-0 transition-opacity duration-500 ${slideIndex === index ? "opacity-100" : "pointer-events-none opacity-0"}`}>
                    <Image src={slide.src} alt={slide.alt} fill
                           sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 896px" className="object-cover"
                           loading="eager"/></div>)}
                {caption ? <div
                    className="absolute left-4 top-4 rounded bg-black/65 px-3 py-1 text-sm text-white">{caption}</div> : null}
                {!hideCaption && slides[index].caption ? <div
                    className="absolute bottom-4 left-4 max-w-[70%] rounded bg-black/70 px-3 py-1 text-sm text-white">{slides[index].caption}</div> : null}
                {hasMultiple ? <>
                    <button type="button" onClick={previous}
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            aria-label="Previous slide"><ChevronLeft aria-hidden/></button>
                    <button type="button" onClick={next}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            aria-label="Next slide"><ChevronRight aria-hidden/></button>
                    <button type="button" onClick={() => setManualPaused((value) => !value)}
                            className="absolute right-3 top-3 rounded-full bg-black/55 p-2 text-white hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            aria-label={manualPaused ? "Resume slideshow" : "Pause slideshow"}>{manualPaused ?
                        <Play aria-hidden className="h-4 w-4"/> : <Pause aria-hidden className="h-4 w-4"/>}</button>
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2"
                         aria-label={`Slide ${index + 1} of ${slides.length}`}>{slides.map((slide, slideIndex) =>
                        <button key={slide.src} type="button" aria-label={`Show slide ${slideIndex + 1}`}
                                aria-current={slideIndex === index ? "true" : undefined}
                                onClick={() => setIndex(slideIndex)}
                                className={`h-3 w-3 rounded-full ring-1 ring-black/20 ${slideIndex === index ? "bg-white" : "bg-white/60"}`}/>)}</div>
                </> : null}
            </div>
        </section>
    );
}
