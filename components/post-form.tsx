"use client";

import { useActionState } from "react";
import { createPost } from "@/app/actions/posts";
import { POST_CATEGORIES } from "@/lib/types";
import { PhotoUpload } from "./photo-upload";

type ActionState = { success: boolean; error: string };
const initialState: ActionState = { success: false, error: "" };

export function PostForm() {
  const boundAction = async (_prev: ActionState, formData: FormData) => {
    const result = await createPost(formData);
    return { success: result.success, error: result.error ?? "" };
  };
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Post type */}
      <fieldset>
        <legend className="text-sm font-medium mb-2">
          What would you like to do?
        </legend>
        <div className="flex gap-3">
          <label className="flex-1 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="need"
              defaultChecked
              className="peer sr-only"
            />
            <div className="rounded-lg border-2 border-border p-4 text-center transition-colors peer-checked:border-need peer-checked:bg-need-light">
              <span className="text-2xl block mb-1">🙋</span>
              <span className="text-sm font-medium">I need help</span>
            </div>
          </label>
          <label className="flex-1 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="offer"
              className="peer sr-only"
            />
            <div className="rounded-lg border-2 border-border p-4 text-center transition-colors peer-checked:border-offer peer-checked:bg-offer-light">
              <span className="text-2xl block mb-1">🤝</span>
              <span className="text-sm font-medium">I can help</span>
            </div>
          </label>
        </div>
      </fieldset>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1.5">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={5}
          maxLength={100}
          placeholder="e.g., Need help moving a couch this Saturday"
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium mb-1.5"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          placeholder="Tell your neighbors what you need or what you can offer..."
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1.5">
          Category
        </label>
        <select
          id="category"
          name="category"
          required
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select a category</option>
          {POST_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Urgency */}
      <div>
        <label htmlFor="urgency" className="block text-sm font-medium mb-1.5">
          Urgency (optional)
        </label>
        <select
          id="urgency"
          name="urgency"
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Not urgent</option>
          <option value="low">Low — whenever you can</option>
          <option value="medium">Medium — this week</option>
          <option value="high">High — as soon as possible</option>
        </select>
      </div>

      {/* Available times */}
      <div>
        <label
          htmlFor="available_times"
          className="block text-sm font-medium mb-1.5"
        >
          When are you available? (optional)
        </label>
        <input
          id="available_times"
          name="available_times"
          type="text"
          maxLength={200}
          placeholder="e.g., Weekday evenings, Saturday mornings"
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Photos */}
      <PhotoUpload />

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? "Posting..." : "Post to Board"}
      </button>
    </form>
  );
}
