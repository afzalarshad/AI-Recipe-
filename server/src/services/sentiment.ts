const POSITIVE_WORDS = [
  "delicious", "amazing", "great", "love", "loved", "perfect", "easy", "best",
  "excellent", "yummy", "tasty", "awesome", "fantastic", "wonderful", "good",
  "worked", "works", "thanks", "thank you", "favorite", "favourite", "nice",
  "incredible", "superb", "delish", "yum", "recommend", "5 stars", "family loved",
  "so good", "turned out great", "will make again", "definitely making",
];

const NEGATIVE_WORDS = [
  "bad", "terrible", "awful", "disgusting", "worst", "bland", "gross",
  "didn't work", "did not work", "failed", "waste", "burnt", "ruined",
  "too salty", "too sweet", "disappointing", "hate", "hated", "dry",
  "not good", "won't make", "never again",
];

export interface SentimentResult {
  isPositive: boolean;
  isNegative: boolean;
}

export function classifyComment(text: string): SentimentResult {
  const lower = text.toLowerCase();
  const isNegative = NEGATIVE_WORDS.some((w) => lower.includes(w));
  const isPositive = !isNegative && POSITIVE_WORDS.some((w) => lower.includes(w));
  return { isPositive, isNegative };
}

/**
 * Combines like-ratio and comment sentiment into a single 0-100 feedback score
 * used to rank candidate recipe videos.
 */
export function computeFeedbackScore(params: {
  likeCount: number;
  viewCount: number;
  positiveCount: number;
  negativeCount: number;
  totalComments: number;
}): { feedbackScore: number; positiveCommentRatio: number } {
  const { likeCount, viewCount, positiveCount, negativeCount, totalComments } = params;

  const likeRatio = viewCount > 0 ? Math.min(likeCount / viewCount, 0.2) / 0.2 : 0;
  const judgedComments = positiveCount + negativeCount;
  const positiveCommentRatio = judgedComments > 0 ? positiveCount / judgedComments : 0.5;
  const commentVolumeWeight = Math.min(totalComments / 50, 1);

  const feedbackScore = Math.round(
    (likeRatio * 0.4 + positiveCommentRatio * 0.5 + commentVolumeWeight * 0.1) * 100,
  );

  return { feedbackScore: Math.min(100, Math.max(0, feedbackScore)), positiveCommentRatio };
}
