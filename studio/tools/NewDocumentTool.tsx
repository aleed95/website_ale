/**
 * Top-bar shortcuts ("Nuovo articolo", "Nuovo progetto"): one click to a new Italian
 * document, ready to write. Translations are then created from the Translations menu.
 */
import { useEffect } from 'react';
import { useRouter } from 'sanity/router';

export function newDocumentTool(type: string, template: string) {
  return function NewDocumentTool() {
    const router = useRouter();
    useEffect(() => {
      router.navigateIntent('create', { type, template });
    }, [router]);
    return null;
  };
}
