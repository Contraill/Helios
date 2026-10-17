import {
  SOCIAL_IMAGE_ALT,
  SOCIAL_IMAGE_SIZE,
} from "@/lib/metadata/page-metadata";

import { createSocialImage } from "./social-image";

export const alt = SOCIAL_IMAGE_ALT;
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";

export default function TwitterImage() {
  return createSocialImage();
}
