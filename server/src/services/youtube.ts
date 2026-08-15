import type { YoutubeRecipeResult } from "../types.js";
import { classifyComment, computeFeedbackScore } from "./sentiment.js";
import { generateMockYoutubeResults } from "./mockYoutube.js";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const MAX_CANDIDATES = 8;
const MAX_COMMENTS_PER_VIDEO = 40;
const TOP_COMMENTS_TO_RETURN = 3;

interface SearchItem {
  id: { videoId: string };
}

interface VideoStatsItem {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: { medium?: { url: string }; default?: { url: string } };
  };
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

interface CommentThreadItem {
  snippet: {
    topLevelComment: {
      snippet: { textDisplay: string };
    };
  };
}

async function ytFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("YOUTUBE_API_KEY not configured");

  const url = new URL(`${YOUTUBE_API_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API error (${res.status}): ${body}`);
  }
  return res.json() as Promise<T>;
}

async function fetchComments(videoId: string): Promise<string[]> {
  try {
    const data = await ytFetch<{ items: CommentThreadItem[] }>("/commentThreads", {
      part: "snippet",
      videoId,
      maxResults: String(MAX_COMMENTS_PER_VIDEO),
      order: "relevance",
      textFormat: "plainText",
    });
    return (data.items ?? []).map((i) => i.snippet.topLevelComment.snippet.textDisplay);
  } catch {
    // Comments can be disabled on a video; treat as no comments rather than failing the whole search.
    return [];
  }
}

export async function searchYoutubeRecipes(query: string): Promise<YoutubeRecipeResult[]> {
  if (!process.env.YOUTUBE_API_KEY) {
    return generateMockYoutubeResults(query);
  }

  const searchData = await ytFetch<{ items: SearchItem[] }>("/search", {
    part: "snippet",
    q: `${query} recipe`,
    type: "video",
    maxResults: String(MAX_CANDIDATES),
    videoEmbeddable: "true",
    relevanceLanguage: "en",
  });

  const videoIds = searchData.items.map((i) => i.id.videoId).filter(Boolean);
  if (videoIds.length === 0) return [];

  const statsData = await ytFetch<{ items: VideoStatsItem[] }>("/videos", {
    part: "snippet,statistics",
    id: videoIds.join(","),
  });

  const results: YoutubeRecipeResult[] = [];

  for (const video of statsData.items) {
    const comments = await fetchComments(video.id);
    let positiveCount = 0;
    let negativeCount = 0;
    const topPositiveComments: string[] = [];

    for (const comment of comments) {
      const { isPositive, isNegative } = classifyComment(comment);
      if (isPositive) {
        positiveCount++;
        if (topPositiveComments.length < TOP_COMMENTS_TO_RETURN) {
          topPositiveComments.push(comment.slice(0, 240));
        }
      } else if (isNegative) {
        negativeCount++;
      }
    }

    const viewCount = Number(video.statistics.viewCount ?? 0);
    const likeCount = Number(video.statistics.likeCount ?? 0);
    const commentCount = Number(video.statistics.commentCount ?? comments.length);

    const { feedbackScore, positiveCommentRatio } = computeFeedbackScore({
      likeCount,
      viewCount,
      positiveCount,
      negativeCount,
      totalComments: comments.length,
    });

    results.push({
      videoId: video.id,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      thumbnailUrl: video.snippet.thumbnails.medium?.url ?? video.snippet.thumbnails.default?.url ?? "",
      videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
      publishedAt: video.snippet.publishedAt,
      viewCount,
      likeCount,
      commentCount,
      feedbackScore,
      positiveCommentRatio,
      topPositiveComments,
    });
  }

  return results.sort((a, b) => b.feedbackScore - a.feedbackScore);
}
