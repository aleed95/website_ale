import { defineField, defineType } from 'sanity';

/**
 * Image with mandatory alternative text (accessibility) and optional caption/credit.
 * Hotspot lets the editor choose the focal point used when the image is cropped.
 */
export const accessibleImage = defineType({
  name: 'accessibleImage',
  title: 'Immagine',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Testo alternativo',
      type: 'string',
      description:
        'Descrivi in breve cosa mostra l’immagine, per chi usa un lettore di schermo e per i motori di ricerca. Es.: "Airone cenerino in volo sopra il canneto".',
      validation: (rule) =>
        rule.custom((alt, context) => {
          const parent = context.parent as { asset?: unknown } | undefined;
          if (parent?.asset && !alt) return 'Il testo alternativo è obbligatorio.';
          return true;
        }),
    }),
    defineField({
      name: 'caption',
      title: 'Didascalia',
      type: 'string',
      description: 'Facoltativa. Mostrata sotto l’immagine.',
    }),
    defineField({
      name: 'credit',
      title: 'Crediti fotografici',
      type: 'string',
      description: 'Facoltativo. Es.: "Foto di Mario Rossi".',
    }),
  ],
});
