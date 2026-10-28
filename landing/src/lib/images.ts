import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/images/**/*.{png,jpg,jpeg,webp}', { eager: true });

export function imageAsset(src: string): ImageMetadata {
  const asset = files[`../assets${src}`]?.default;
  if (!asset) throw new Error(`Missing optimisable image asset: ${src}`);
  return asset;
}
