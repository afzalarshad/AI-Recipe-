import type { YoutubeRecipeResult } from "../types.js";

const CHANNELS = ["Tasty Kitchen", "Home Chef Hub", "Cook With Sara", "Simple Bites", "Foodie Nation"];

const POSITIVE_SAMPLE_COMMENTS = [
  "Made this last night and my family loved it, will make again!",
  "This turned out great, so easy to follow.",
  "Best recipe I've tried for this dish, thank you!",
  "Delicious and quick, definitely making this weekly now.",
  "5 stars, worked perfectly on the first try.",
];

/**
 * Deterministic offline generator used when no YOUTUBE_API_KEY is configured,
 * so the search UI stays demoable without hitting the real API.
 */
export function generateMockYoutubeResults(query: string): YoutubeRecipeResult[] {
  const clean = query.trim() || "recipe";
  const count = 5;
  const results: YoutubeRecipeResult[] = [];

  for (let i = 0; i < count; i++) {
    const viewCount = 50000 - i * 6000 + 3000;
    const likeCount = Math.round(viewCount * (0.06 - i * 0.008));
    const commentCount = 40 - i * 5;
    const positiveCommentRatio = Math.max(0.5, 0.95 - i * 0.1);
    const feedbackScore = Math.round(
      (Math.min(likeCount / viewCount, 0.2) / 0.2) * 40 + positiveCommentRatio * 50 + Math.min(commentCount / 50, 1) * 10,
    );

    results.push({
      videoId: `mock-${i}-${clean.replace(/\s+/g, "-").toLowerCase()}`,
      title: `${capitalize(clean)} Recipe #${i + 1} - Easy & Delicious`,
      channelTitle: CHANNELS[i % CHANNELS.length],
      thumbnailUrl: "",
      videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(clean + " recipe")}`,
      publishedAt: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount,
      likeCount,
      commentCount,
      feedbackScore: Math.min(100, Math.max(0, feedbackScore)),
      positiveCommentRatio,
      topPositiveComments: POSITIVE_SAMPLE_COMMENTS.slice(0, Math.max(1, 3 - i)),
    });
  }

  return results.sort((a, b) => b.feedbackScore - a.feedbackScore);
}

function capitalize(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
