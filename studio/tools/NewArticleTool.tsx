/**
 * "Nuovo articolo": one click from the top bar to a new Italian article, ready to write.
 * (Translations are then created from the article's Translations menu.)
 */
import { useEffect } from 'react';
import { useRouter } from 'sanity/router';

export function NewArticleTool() {
  const router = useRouter();
  useEffect(() => {
    router.navigateIntent('create', { type: 'article', template: 'article-it' });
  }, [router]);
  return null;
}
