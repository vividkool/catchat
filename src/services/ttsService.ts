// AudioContext singleton to maintain "unlocked" state
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  return audioContext;
};

// Call this function directly from a user interaction (e.g., button click)
export const prepareAudio = async () => {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  // Create and play a short silent buffer to ensure the context is "warmed up" / unlocked
  // This is helpful for some strict mobile browsers
  const buffer = ctx.createBuffer(1, 1, 22050);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
};

export const playCatVoice = async (text: string) => {
  const apiKey =
    import.meta.env.VITE_TTS_API_KEY || import.meta.env.VITE_AI_API_KEY;

  if (!apiKey) {
    console.warn(
      "TTS API Key is missing. Please set VITE_TTS_API_KEY or VITE_AI_API_KEY in .env"
    );
    return;
  }

  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  const requestBody = {
    input: { text: text },
    voice: {
      languageCode: "ja-JP",
      name: "ja-JP-Neural2-B", // Female, slightly higher pitch base
      ssmlGender: "FEMALE",
    },
    audioConfig: {
      audioEncoding: "MP3",
      pitch: 4.0, // Higher pitch for cat-like "Meow" voice
      speakingRate: 1.1, // Slightly faster
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("TTS Error:", errorData);
      throw new Error(
        errorData.error?.message || "Failed to synthesize speech"
      );
    }

    const data = await response.json();
    const audioContent = data.audioContent; // Base64 string

    if (audioContent) {
      const ctx = getAudioContext();

      // Decode Base64 string to ArrayBuffer
      const binaryString = window.atob(audioContent);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode audio data and play
      const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start(0);
    }
  } catch (error) {
    console.error("Error playing cat voice:", error);
  }
};
