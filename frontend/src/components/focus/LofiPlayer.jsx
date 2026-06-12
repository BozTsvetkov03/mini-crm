import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2, Disc3 } from "lucide-react";
import { getTrendingLofi, getStreamUrl, shuffle } from "../../api/audiusApi";

function LofiPlayer() {
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [volume, setVolume] = useState(0.7);

  const audioRef = useRef(null);
  // Consecutive failures cap so a dead node can't loop the queue forever
  const errorStreakRef = useRef(0);

  const track = queue[index] ?? null;

  useEffect(() => {
    let cancelled = false;
    getTrendingLofi()
      .then((tracks) => {
        if (cancelled) return;
        if (tracks.length === 0) {
          setLoadError("No lofi tracks available right now.");
          return;
        }
        setQueue(shuffle(tracks));
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't reach the lofi radio. Try again later.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const playTrack = async (i) => {
    const target = queue[i];
    const audio = audioRef.current;
    if (!target || !audio) return;

    setIndex(i);
    try {
      audio.src = await getStreamUrl(target.id);
      await audio.play();
      errorStreakRef.current = 0;
      setPlaying(true);
    } catch {
      handleTrackError(i);
    }
  };

  // Decentralized hosting means individual tracks occasionally 404 — skip on
  const handleTrackError = (i) => {
    errorStreakRef.current += 1;
    if (errorStreakRef.current >= 5) {
      setPlaying(false);
      setLoadError("The radio keeps skipping — the music nodes may be down.");
      return;
    }
    playTrack((i + 1) % queue.length);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else if (audio.src) {
      audio.play().then(() => setPlaying(true)).catch(() => handleTrackError(index));
    } else {
      playTrack(index);
    }
  };

  const next = () => playTrack((index + 1) % queue.length);
  const prev = () => playTrack((index - 1 + queue.length) % queue.length);

  return (
    <section className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900">
      <audio ref={audioRef} preload="none" onEnded={next} onError={() => playing && handleTrackError(index)} />

      {/* Vinyl: artwork disk that only spins while music plays */}
      <div className="relative mt-2 h-48 w-48">
        <div
          className="vinyl-disc h-full w-full overflow-hidden rounded-full border-6 border-gray-900 shadow-lg dark:border-gray-950"
          style={{ animationPlayState: playing ? "running" : "paused" }}
        >
          {track?.artwork ? (
            <img src={track.artwork} alt="" className="h-full w-full object-cover" draggable="false" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-800 text-gray-500">
              <Disc3 size={56} />
            </div>
          )}
        </div>
        {/* center label + spindle hole */}
        <div className="absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-gray-900 bg-emerald-600 dark:border-gray-950" />
        <div className="absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-900 dark:bg-gray-950" />
      </div>

      <div className="mt-5 min-h-[3.25rem] text-center">
        {loadError ? (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{loadError}</p>
        ) : track ? (
          <>
            <p className="max-w-[16rem] truncate font-semibold text-gray-900 dark:text-gray-100">
              {track.title}
            </p>
            <p className="max-w-[16rem] truncate text-sm text-gray-500 dark:text-gray-400">
              {track.artist}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Tuning the radio…</p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={prev}
          disabled={!track}
          title="Previous track"
          className="rounded-xl border border-gray-300 p-2.5 text-gray-700 transition hover:cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <SkipBack size={18} />
        </button>
        <button
          type="button"
          onClick={togglePlay}
          disabled={!track}
          title={playing ? "Pause" : "Play"}
          className="rounded-full bg-emerald-600 p-4 text-white transition hover:cursor-pointer hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {playing ? <Pause size={22} /> : <Play size={22} />}
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!track}
          title="Next track"
          className="rounded-xl border border-gray-300 p-2.5 text-gray-700 transition hover:cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <SkipForward size={18} />
        </button>
      </div>

      <div className="mt-4 flex w-full max-w-[14rem] items-center gap-2 text-gray-500 dark:text-gray-400">
        <Volume2 size={16} />
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Volume"
          className="w-full accent-emerald-600 hover:cursor-pointer"
        />
      </div>

      {track && (
        <a
          href={track.permalink}
          target="_blank"
          rel="noreferrer"
          className="mt-4 text-xs text-gray-400 transition hover:text-emerald-600 dark:text-gray-500 dark:hover:text-emerald-400"
        >
          Streaming free music from Audius ↗
        </a>
      )}
    </section>
  );
}

export default LofiPlayer;
