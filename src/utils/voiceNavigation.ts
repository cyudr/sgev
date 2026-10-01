/**
 * In-App Voice Navigation Service for Singapore EV Network
 * Uses Web Speech API to provide audio turn-by-turn spoken guidance.
 */

let synth: SpeechSynthesis | null = null;
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  synth = window.speechSynthesis;
}

export function speakNavigationInstruction(text: string): void {
  if (!synth) return;

  try {
    // Cancel any ongoing speech
    synth.cancel();

    // Clean up instruction for speech clarity
    const spokenText = text
      .replace(/(\d+)m\b/g, '$1 meters')
      .replace(/(\d+(\.\d+)?)km\b/g, '$1 kilometers')
      .replace(/B(\d)\b/g, 'Basement $1')
      .replace(/EV/g, 'E V');

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 1.05; // Slightly faster for natural driving pace
    utterance.pitch = 1.0;
    utterance.lang = 'en-SG'; // Singapore English / English

    // Prefer English voice if available
    const voices = synth.getVoices();
    const enVoice =
      voices.find((v) => v.lang === 'en-SG') ||
      voices.find((v) => v.lang.startsWith('en')) ||
      null;

    if (enVoice) {
      utterance.voice = enVoice;
    }

    synth.speak(utterance);
  } catch (_e) {
    // Speech synthesis error or blocked by autoplay policy
  }
}

export function stopSpeaking(): void {
  if (synth) {
    try {
      synth.cancel();
    } catch (_e) {
      // Ignore
    }
  }
}
