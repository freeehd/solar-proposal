"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

type ScenarioType = "day" | "night";

interface ScenarioContent {
  title: string;
  description: string;
  video: string;
  icon: React.ElementType;
}

const scenarios: Record<ScenarioType, ScenarioContent> = {
  day: {
    title: "Daytime",
    description:
      "Solar panels efficiently convert sunlight into clean electricity, powering your home and storing excess energy.",
    video: "/day.mp4",
    icon: Sun,
  },
  night: {
    title: "Nighttime",
    description:
      "Your home seamlessly switches to stored energy or the grid, ensuring continuous power.",
    video: "/night.mp4",
    icon: Moon,
  },
};

export default function HowSolarWorks() {
  const [scenario, setScenario] = useState<ScenarioType>("day");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentVideoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Initialize particles
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });

    // Preload videos
    Object.values(scenarios).forEach(({ video }) => {
      const videoElement = document.createElement("video");
      videoElement.src = video;
      videoElement.load();
    });
  }, []);

  const switchScenario = useCallback(
    async (targetScenario?: ScenarioType) => {
      if (isTransitioning) return;
      setIsTransitioning(true);

      const nextScenario =
        targetScenario || (scenario === "day" ? "night" : "day");
      const nextVideo = nextVideoRef.current;
      const currentVideo = currentVideoRef.current;

      if (nextVideo && currentVideo) {
        // Prepare next video
        nextVideo.src = scenarios[nextScenario].video;
        nextVideo.currentTime = 0;

        try {
          // Load and play the next video
          await nextVideo.load();
          await nextVideo.play();

          // Update scenario after ensuring next video is playing
          setScenario(nextScenario);

          // Reset transition state after animation completes
          setTimeout(() => {
            setIsTransitioning(false);
            // Update current video source after transition
            currentVideo.src = scenarios[nextScenario].video;
            currentVideo.load();
          }, 1000);
        } catch (error) {
          console.error("Error during video transition:", error);
          setIsTransitioning(false);
        }
      }
    },
    [isTransitioning, scenario]
  );

  useEffect(() => {
    const currentVideo = currentVideoRef.current;
    const nextVideo = nextVideoRef.current;

    if (!currentVideo || !nextVideo) return;

    const handleVideoEnd = () => {
      if (!isTransitioning) {
        switchScenario();
      }
    };

    const handleCanPlay = () => {
      setIsLoaded(true);
      currentVideo.play().catch(console.error);
    };

    currentVideo.addEventListener("ended", handleVideoEnd);
    currentVideo.addEventListener("canplay", handleCanPlay);
    nextVideo.addEventListener("ended", handleVideoEnd);

    // Start playing when mounted
    if (currentVideo.readyState >= 3) {
      // HAVE_FUTURE_DATA or higher
      handleCanPlay();
    }

    return () => {
      currentVideo.removeEventListener("ended", handleVideoEnd);
      currentVideo.removeEventListener("canplay", handleCanPlay);
      nextVideo.removeEventListener("ended", handleVideoEnd);
    };
  }, [isTransitioning, switchScenario]);

  const particlesOptions: ISourceOptions = {
    particles: {
      number: { value: 100, density: { enable: true } },
      color: { value: "#ffffff" },
      shape: { type: "circle" },
      opacity: {
        value: 0.5,
      },
      size: {
        value: 1,
      },
      move: {
        enable: true,
        speed: 0.1,
        direction: "none",
        random: false,
        straight: false,
      },
    },
    interactivity: {
      detect_on: "canvas",
    },
    background: {
      color: { value: "transparent" },
    },
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background transitions */}
      <motion.div
        className="absolute inset-0 bg-[url('/day1.png')] bg-cover bg-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: scenario === "day" ? 1 : 0 }}
        transition={{ duration: 3 }}
      />
      <motion.div
        className="absolute inset-0 bg-[url('/night3.png')] bg-cover bg-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: scenario === "night" ? 1 : 0 }}
        transition={{ duration: 3 }}
      />

      {/* Night particles */}
      <AnimatePresence>
        {scenario === "night" && (
          <motion.div
            className="absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            <Particles id="tsparticles" options={particlesOptions} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-20 w-screen h-full flex flex-col justify-between py-10 px-6 ">
        <div className="w-full mx-auto flex-grow flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Left text */}
          <div className="md:w-1/4 text-center md:text-left">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`text-5xl md:text-6xl font-medium  mb-6 transition-colors duration-1000
                ${scenario === "day" ? "text-black" : "text-white"}`}
            >
              How Solar Works
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`text-3xl md:text-4xl font-normal leading-tight transition-colors duration-1000
                ${scenario === "day" ? "text-black" : "text-white"}`}
            >
              {scenarios[scenario].title}
            </motion.h3>
          </div>

          {/* Center video */}
          <div className="md:w-[180vh] md:h-[70vh]">
            <motion.div
              className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative w-full h-full">
                <video
                  ref={currentVideoRef}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000
                    ${isTransitioning ? "opacity-0" : "opacity-100"}`}
                  muted
                  playsInline
                >
                  <source src={scenarios[scenario].video} type="video/mp4" />
                </video>
                <video
                  ref={nextVideoRef}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000
                    ${isTransitioning ? "opacity-100" : "opacity-0"}`}
                  muted
                  playsInline
                >
                  <source
                    src={scenarios[scenario === "day" ? "night" : "day"].video}
                    type="video/mp4"
                  />
                </video>
              </div>
            </motion.div>
          </div>

          {/* Right text */}
          <div className="md:w-1/4 text-center md:text-left">
            <AnimatePresence mode="wait">
              <motion.p
                key={scenario}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className={`text-xl md:text-2xl transition-colors duration-1000
                  ${scenario === "day"
                    ? "text-black text-opacity-80"
                    : "text-white text-opacity-80"
                  }`}
              >
                {scenarios[scenario].description}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Scenario indicators */}
        <div className="flex justify-center gap-6 mt-8">
          {(Object.entries(scenarios) as [ScenarioType, ScenarioContent][]).map(
            ([key, { title, icon: Icon }]) => (
              <button
                key={key}
                onClick={() => {
                  if (!isTransitioning && scenario !== key) {
                    switchScenario();
                  }
                }}
                disabled={isTransitioning}
                aria-label={`Switch to ${title} scenario`}
                aria-pressed={scenario === key}
                className={`
                  flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${scenario === key
                    ? scenario === "day"
                      ? "bg-amber-200 text-black"
                      : "bg-violet-200 text-black"
                    : "bg-gray-800 bg-opacity-50 text-white hover:bg-opacity-70"
                  }
                `}
              >
                <Icon
                  className={`w-6 h-6 ${scenario === key
                    ? scenario === "day"
                      ? "text-black"
                      : "text-gray-800"
                    : "text-white opacity-60"
                    }`}
                />
                <span
                  className={`text-lg font-normal leading-tight ${scenario === key
                    ? scenario === "day"
                      ? "text-black"
                      : "text-gray-800"
                    : "text-white opacity-60"
                    }`}
                >
                  {title}
                </span>
              </button>
            )
          )}
        </div>
      </div>
    </section>
  );
}
