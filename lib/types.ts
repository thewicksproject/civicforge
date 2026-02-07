export type PostType = "need" | "offer";
export type PostStatus = "active" | "in_progress" | "completed" | "expired";
export type UrgencyLevel = "low" | "medium" | "high";
export type ResponseStatus = "pending" | "accepted" | "declined";
export type MembershipStatus = "pending" | "approved" | "denied";
export type DeletionStatus = "pending" | "processing" | "completed";
export type TrustTier = 1 | 2 | 3;

export type ConsentType =
  | "terms_of_service"
  | "privacy_policy"
  | "ai_processing"
  | "phone_verification";

export interface PostCategory {
  value: string;
  label: string;
  color: string;
}

export const POST_CATEGORIES: PostCategory[] = [
  { value: "home_repair", label: "Home Repair", color: "rose-clay" },
  { value: "yard_garden", label: "Yard & Garden", color: "meadow" },
  { value: "childcare", label: "Childcare", color: "horizon" },
  { value: "pet_care", label: "Pet Care", color: "meadow" },
  { value: "transportation", label: "Transportation", color: "horizon" },
  { value: "tech_help", label: "Tech Help", color: "horizon" },
  { value: "cooking_meals", label: "Cooking & Meals", color: "rose-clay" },
  { value: "tutoring", label: "Tutoring", color: "horizon" },
  { value: "moving", label: "Moving Help", color: "rose-clay" },
  { value: "errands", label: "Errands", color: "meadow" },
  { value: "companionship", label: "Companionship", color: "golden-hour" },
  { value: "other", label: "Other", color: "golden-hour" },
];

export const TRUST_TIER_LABELS: Record<TrustTier, string> = {
  1: "Neighbor",
  2: "Confirmed",
  3: "Verified",
};

export const MAX_PHOTOS_PER_POST = 4;
export const MAX_PHOTO_SIZE_MB = 5;
export const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;
export const PHOTO_MAX_WIDTH = 1200;
export const THUMBNAIL_WIDTH = 300;
export const JPEG_QUALITY = 80;

export const AI_RATE_LIMIT_PER_MINUTE = 10;
export const AI_DAILY_TOKEN_BUDGET = 100_000;
export const PROFILE_LOOKUP_RATE_LIMIT_PER_HOUR = 30;
export const FLAG_THRESHOLD_HIDE = 3;
export const NEW_ACCOUNT_REVIEW_POST_COUNT = 3;
