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
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      audio.play().catch((e) => console.error("Audio play failed:", e));
    }
  } catch (error) {
    console.error("Error playing cat voice:", error);
  }
};
