import type { ComponentType } from "react";
import {
  Wrench,
  Sprout,
  Baby,
  PawPrint,
  Car,
  Laptop,
  CookingPot,
  BookOpen,
  Package,
  ShoppingBag,
  HeartHandshake,
  Ellipsis,
} from "lucide-react";

export const CATEGORY_ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  home_repair: Wrench,
  yard_garden: Sprout,
  childcare: Baby,
  pet_care: PawPrint,
  transportation: Car,
  tech_help: Laptop,
  cooking_meals: CookingPot,
  tutoring: BookOpen,
  moving: Package,
  errands: ShoppingBag,
  companionship: HeartHandshake,
  other: Ellipsis,
};
