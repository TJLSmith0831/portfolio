import React, { useEffect, useRef } from 'react';
import aboutStyles from '@/app/styles/About.module.css'; // Ensure correct import path
import { BubbleProps, PersonalSectionProps } from '@/app/types/about';
import gsap from 'gsap';

const Bubble: React.FC<BubbleProps> = ({ style, imageUrl, onBubbleClick }) => {
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bubbleRef.current) {
      gsap.to(bubbleRef.current, {
        duration: 20,
        ease: 'power1.inOut',
        y: gsap.utils.random(-100, 100),
        x: gsap.utils.random(-100, 100),
        repeat: -1,
        yoyo: true,
        repeatRefresh: true,
      });
    }
  }, []);

  return (
    <div
      ref={bubbleRef}
      className={aboutStyles.bubble}
      style={{
        ...style,
        backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
        backgroundSize: 'cover', // Ensure the image covers the bubble
        backgroundColor: imageUrl ? 'transparent' : 'skyblue', // Fallback color if no image
      }}
      onClick={onBubbleClick}
    />
  );
};

const PersonalLifeBubbles: React.FC<PersonalSectionProps> = ({
  bubblesData,
}) => {
  const handleBubbleClick = () => {
    console.log('Bubble clicked');
  };

  return (
    <div className={aboutStyles.personalSection}>
      {bubblesData.map((bubble) => (
        <Bubble
          key={bubble.id}
          style={bubble.style}
          //   imageUrl={bubble.imageUrl} TODO: Fix
          onBubbleClick={handleBubbleClick}
        />
      ))}
    </div>
  );
};

export default PersonalLifeBubbles;
