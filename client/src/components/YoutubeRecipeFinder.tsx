import { useState } from "react";
import { searchYoutubeRecipes } from "../api";
import type { YoutubeRecipeResult } from "../types";

export function YoutubeRecipeFinder() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<YoutubeRecipeResult[]>([]);
  const [mode, setMode] = useState<"live" | "mock" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchYoutubeRecipes(query.trim());
      setResults(res.results);
      setMode(res.mode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a dish, e.g. butter chicken"
          className="input"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg whitespace-nowrap transition-colors"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {mode === "mock" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-2">
          Running in offline demo mode (no YOUTUBE_API_KEY set on the server) — showing sample results, not live
          YouTube data.
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}

      <p className="text-xs text-gray-500">
        Results are ranked by a feedback score combining like ratio and positive-sentiment comments, so the
        best-received recipe videos surface first.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {results.map((video) => (
          <VideoCard key={video.videoId} video={video} />
        ))}
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: YoutubeRecipeResult }) {
  return (
    <a
      href={video.videoUrl}
      target="_blank"
      rel="noreferrer"
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-medium text-gray-900 leading-snug">{video.title}</h4>
        <span className="shrink-0 text-xs font-semibold bg-brand-50 text-brand-700 px-2 py-1 rounded-full">
          {video.feedbackScore}% positive
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-2">{video.channelTitle}</p>
      <div className="flex gap-3 text-xs text-gray-500 mb-2">
        <span>{formatCount(video.viewCount)} views</span>
        <span>{formatCount(video.likeCount)} likes</span>
        <span>{formatCount(video.commentCount)} comments</span>
      </div>
      {video.topPositiveComments.length > 0 && (
        <div className="border-t border-gray-100 pt-2 mt-2">
          <p className="text-xs font-semibold text-gray-600 mb-1">Top positive feedback</p>
          <ul className="text-xs text-gray-600 space-y-1 italic">
            {video.topPositiveComments.map((c, i) => (
              <li key={i}>"{c}"</li>
            ))}
          </ul>
        </div>
      )}
    </a>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
