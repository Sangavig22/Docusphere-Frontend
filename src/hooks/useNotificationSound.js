import { useRef } from 'react';

/**
 * Hook for playing notification sound alerts using browser Web Audio API
 * to ensure reliability and avoid 404 resource asset errors.
 */
export const useNotificationSound = () => {
  /**
   * Play a clean, premium dual-chime notification sound
   */
  const playSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const now = ctx.currentTime;
      
      // Tone 1: High crisp ding (A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.18);
      
      // Tone 2: Warm lower follow-up (F5) - delayed by 0.08 seconds
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(698.46, now + 0.08);
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.12, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.38);
      
    } catch (error) {
      console.warn('Could not play synthesized notification sound:', error);
    }
  };

  /**
   * Play sound with optional delay
   */
  const playSoundWithDelay = (delayMs = 0) => {
    if (delayMs > 0) {
      setTimeout(playSound, delayMs);
    } else {
      playSound();
    }
  };

  return {
    playSound,
    playSoundWithDelay,
  };
};
