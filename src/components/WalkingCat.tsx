import React, { useState, useEffect } from "react";
import "./WalkingCat.css";

// Import frames
import cat1 from "../assets/cat_frames/cat1.png";
import cat2 from "../assets/cat_frames/cat2.png";
import cat3 from "../assets/cat_frames/cat3.png";
import cat4 from "../assets/cat_frames/cat4.png";
import cat5 from "../assets/cat_frames/cat5.png";
import cat6 from "../assets/cat_frames/cat6.png";

interface WalkingCatProps {
  onClick: () => void;
}

const WALK_FRAMES = [cat1, cat2, cat3, cat4, cat5];
const WAVE_FRAME = cat6;
const FRAME_DURATION = 150; // ms per frame

const WalkingCat: React.FC<WalkingCatProps> = ({ onClick }) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isWaving, setIsWaving] = useState(false);
  // Preload images
  useEffect(() => {
    const preloadImages = [...WALK_FRAMES, WAVE_FRAME];
    preloadImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Frame animation
  useEffect(() => {
    if (isWaving) return;

    const intervalId = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % WALK_FRAMES.length);
    }, FRAME_DURATION);

    return () => clearInterval(intervalId);
  }, [isWaving]);

  const handleClick = () => {
    setIsWaving(true);
    onClick();

    // Wave for 3 seconds then go back to walking (optional, or stay waving until next click/state change)
    // For now, let's just update the visual state. The parent controls the chat.
    setTimeout(() => {
      setIsWaving(false);
    }, 3000);
  };

  const currentSrc = isWaving ? WAVE_FRAME : WALK_FRAMES[currentFrameIndex];

  return (
    <div className="cat-container-fixed" onClick={handleClick}>
      <img src={currentSrc} alt="Cat" className="cat-sprite" />
    </div>
  );
};

export default WalkingCat;
