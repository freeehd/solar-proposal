"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type ScenarioType = "day" | "night";

interface ScenarioContent {
  title: string;
  description: string;
  video: string;
  icon: React.ElementType;
  textColor: string;
  accentColor: string;
}

const scenarios: Record<ScenarioType, ScenarioContent> = {
  day: {
    title: "Daytime Energy Generation",
    description:
      "During peak sunlight hours, advanced photovoltaic panels convert solar radiation into clean, renewable electricity. This powers your home and charges high-capacity batteries for nighttime use.",
    video: "/day.mp4",
    icon: Sun,
    textColor: "text-amber-50",
    accentColor: "from-amber-400 to-amber-600",
  },
  night: {
    title: "Nighttime Energy Management",
    description:
      "As daylight fades, your home seamlessly transitions to stored energy. Smart systems optimize power distribution, ensuring energy independence through the night.",
    video: "/night.mp4",
    icon: Moon,
    textColor: "text-blue-50",
    accentColor: "from-blue-400 to-blue-600",
  },
};

export default function HowSolarWorksx() {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>("day");
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const switchScenario = (scenario: ScenarioType) => {
    setActiveScenario(scenario);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleVideoEnd = () => {
        switchScenario(activeScenario === "day" ? "night" : "day");
        video.play();
      };

      video.addEventListener("loadeddata", () => setIsVideoLoaded(true));
      video.addEventListener("ended", handleVideoEnd);

      return () => {
        video.removeEventListener("loadeddata", () => setIsVideoLoaded(true));
        video.removeEventListener("ended", handleVideoEnd);
      };
    }
  }, [activeScenario]); // Removed switchScenario from dependencies

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.src = scenarios[activeScenario].video;
      video.load();
      video.play();
    }
  }, [activeScenario]);

  return (
    <section className="relative h-screen  bg-gray-900">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isVideoLoaded ? 1 : 0 }}
          transition={{ duration: 1.5 }}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
          >
            <source src={scenarios[activeScenario].video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </motion.div>
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center px-4 text-white">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-extralight mb-4">
            How Solar Works
          </h2>
          <motion.div
            className={`h-1 w-24 mx-auto bg-gradient-to-r ${scenarios[activeScenario].accentColor}`}
            layoutId="underline"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeScenario}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl"
          >
            <h3
              className={`text-3xl md:text-4xl font-light mb-6 ${scenarios[activeScenario].textColor}`}
            >
              {scenarios[activeScenario].title}
            </h3>
            <p
              className={`text-lg md:text-xl mb-12 ${scenarios[activeScenario].textColor} opacity-90 leading-relaxed`}
            >
              {scenarios[activeScenario].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Scenario Navigation */}
        <div className="flex justify-center items-center space-x-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => switchScenario("day")}
            className={`rounded-full transition-all duration-300 ${
              activeScenario === "day"
                ? `bg-gradient-to-r ${scenarios.day.accentColor} text-white`
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            <Sun
              className={`h-6 w-6 mr-2 ${
                activeScenario === "day" ? "text-white" : "text-amber-400"
              }`}
            />
            Daytime
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => switchScenario("night")}
            className={`rounded-full transition-all duration-300 ${
              activeScenario === "night"
                ? `bg-gradient-to-r ${scenarios.night.accentColor} text-white`
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            <Moon
              className={`h-6 w-6 mr-2 ${
                activeScenario === "night" ? "text-white" : "text-blue-400"
              }`}
            />
            Nighttime
          </Button>
        </div>
      </div>

      {/* Premium Decorative Elements */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
        <motion.div
          className="w-2 h-2 rounded-full bg-white/50"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="w-3 h-3 rounded-full bg-white/70"
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: 0.3,
          }}
        />
        <motion.div
          className={`w-4 h-4 rounded-full bg-gradient-to-r ${scenarios[activeScenario].accentColor}`}
          layoutId="activeDot"
        />
        <motion.div
          className="w-3 h-3 rounded-full bg-white/70"
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: 0.6,
          }}
        />
        <motion.div
          className="w-2 h-2 rounded-full bg-white/50"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: 0.9,
          }}
        />
      </div>

      {/* Side Navigation Hints */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors duration-300"
        onClick={() =>
          switchScenario(activeScenario === "day" ? "night" : "day")
        }
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors duration-300"
        onClick={() =>
          switchScenario(activeScenario === "day" ? "night" : "day")
        }
      >
        <ChevronRight className="h-8 w-8" />
      </Button>
    </section>
  );
}
