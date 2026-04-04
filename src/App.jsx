import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

// The Luminance Utility: Determines if text should be dark or light
const getTextColor = (hexColor) => {
  if (!hexColor) return '#ffffff';
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  // Spotify lyrics cards almost always use black text on vibrant backgrounds
  // unless the background is extremely dark.
  return luminance > 0.4 ? '#000000' : '#ffffff'; 
};

function App() {
  const [artist, setArtist] = useState('');
  const [emotion, setEmotion] = useState('');
  const [cardData, setCardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!artist || !emotion) return;
    
    setIsLoading(true);
    setError(null);
    setCardData(null);

    try {
      const response = await fetch('https://lyricard-backend.onrender.com/api/get-lyric-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artist, emotion }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setCardData(data);
    } catch (err) {
      if (err.message.includes("429") || err.message.includes("quota")) {
        setError("AI Rate Limit Reached: Please wait about 60 seconds and try again!");
      } else {
        setError("Failed to fetch lyrics. Make sure your FastAPI backend is running!");
      }
    } finally {
      setIsLoading(false);
    }
  };

return (
    <div className="relative min-h-screen bg-black flex flex-col items-center py-10 px-4 font-sans selection:bg-white/20">
      
      {/* Background Aurora */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[140px] opacity-25 pointer-events-none transition-colors duration-700 ease-in-out"
        style={{ backgroundColor: cardData ? cardData.dominant_color_hex : 'transparent' }}
      />

      {/* Title Section */}
      <div className="relative z-10 text-center space-y-2 mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight whitespace-nowrap">
          Happy 20th Birthday Hrishikha <span className="text-red-500">❤️</span>
        </h1>
        <p className="text-zinc-500 text-sm font-medium">For my favorite music-lover on the planet</p>
      </div>

      {/* Input Section */}
      <div className="relative z-10 w-full max-w-sm flex flex-col gap-3 mb-12">
        <div className="flex flex-col gap-2.5">
          <Input 
            placeholder="Artist (eg: Kendrick Lamar)" 
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="bg-zinc-900/60 backdrop-blur-2xl border-white/5 text-zinc-100 h-12 rounded-xl"
          />
          <Input 
            placeholder="Emotion (eg: Sadness)" 
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            className="bg-zinc-900/60 backdrop-blur-2xl border-white/5 text-zinc-100 h-12 rounded-xl"
          />
          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !artist || !emotion}
            className="h-12 w-full bg-white text-black hover:bg-zinc-200 transition-all font-bold text-base rounded-xl mt-1"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'Generate Card'}
          </Button>
        </div>
      </div>

      {/* The Lyric Card - Restored to PRO size */}
      <div className="relative z-10 w-full flex justify-center pb-12">
        {isLoading && (
          <Skeleton className="w-[450px] h-[550px] rounded-[40px] bg-zinc-900/40 border border-white/5" />
        )}

        {cardData && !isLoading && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <Card 
              className="w-[450px] min-h-[550px] border-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] rounded-[45px] overflow-hidden flex flex-col"
              style={{ backgroundColor: cardData.dominant_color_hex }}
            >
              <CardContent className="p-10 flex flex-col h-full">
                {/* Header: Album Art & Info */}
                <div className="flex items-start gap-5 mb-10">
                  <img 
                    src={cardData.album_art_url} 
                    alt="Album Art" 
                    className="w-20 h-20 rounded-xl shadow-lg object-cover"
                  />
                  <div 
                    className="flex flex-col pt-1"
                    style={{ color: getTextColor(cardData.dominant_color_hex) }}
                  >
                    <h2 className="text-2xl font-extrabold tracking-tight leading-none mb-1">
                      {cardData.target_song}
                    </h2>
                    <p className="text-lg font-medium opacity-70">
                      {cardData.artist}
                    </p>
                  </div>
                </div>

                {/* Body: The Lyrics (The centerpiece) */}
                <div 
                  className="flex-grow flex items-center mb-10"
                  style={{ color: getTextColor(cardData.dominant_color_hex) }}
                >
                  <p className="text-[28px] font-black leading-[1.15] whitespace-pre-wrap tracking-tight">
                    {cardData.lyrics_snippet}
                  </p>
                </div>

                {/* Branding Footer (Mimics the logo in your reference) */}
                <div 
                  className="flex items-center gap-2 pt-4 border-t border-black/5"
                  style={{ color: getTextColor(cardData.dominant_color_hex) }}
                >
                   <div className="w-8 h-8 rounded-full bg-current flex items-center justify-center">
                      <div className="w-4 h-4 bg-transparent border-2 border-current rounded-full" 
                           style={{ borderColor: cardData.dominant_color_hex }} />
                   </div>
                   <span className="font-bold text-xl tracking-tighter">Lyricard</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;