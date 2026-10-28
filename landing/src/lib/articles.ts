import type { CollectionEntry } from 'astro:content';

const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
});

export const formatArticleDate = (date: string) => dateFormatter.format(new Date(date));

export function articleReadingTime(article: CollectionEntry<'articles'>['data']): string {
  const text = [article.title, article.description, ...article.sections.flatMap(section => [
    section.title, ...section.paragraphs, ...(section.bullets ?? []), ...(section.steps ?? []),
    ...(section.table ? [section.table.caption, ...section.table.columns, ...section.table.rows.flat()] : []),
  ])].join(' ');
  const minutes = Math.max(1, Math.ceil(text.trim().split(/\s+/u).length / 200));
  return `${minutes} min read`;
}
