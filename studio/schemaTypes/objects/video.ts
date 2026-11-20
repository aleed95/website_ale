import { PlayIcon } from '@sanity/icons/Play';
import { defineField, defineType } from 'sanity';

const VIDEO_LINK = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com|vimeo\.com|player\.vimeo\.com)\//i;

/** Video: a YouTube/Vimeo link (recommended) or an uploaded file. */
export const video = defineType({
  name: 'video',
  title: 'Video',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'source',
      title: 'Origine',
      type: 'string',
      options: {
        list: [
          { title: 'Link YouTube o Vimeo (consigliato)', value: 'link' },
          { title: 'File caricato', value: 'file' },
        ],
        layout: 'radio',
      },
      initialValue: 'link',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Link al video',
      type: 'url',
      description: 'Copia l’indirizzo dalla barra del browser, es.: https://www.youtube.com/watch?v=…',
      hidden: ({ parent }) => parent?.source !== 'link',
      validation: (rule) =>
        rule.custom((value, context) => {
          if ((context.parent as { source?: string })?.source !== 'link') return true;
          if (!value) return 'Inserisci il link al video.';
          return VIDEO_LINK.test(String(value)) ? true : 'Sono supportati solo link YouTube e Vimeo.';
        }),
    }),
    defineField({
      name: 'file',
      title: 'File video',
      type: 'file',
      options: { accept: 'video/mp4,video/webm' },
      description:
        'MP4 o WebM, il più leggero possibile (meglio sotto i 50 MB, max 1080p). I video pesanti consumano la banda gratuita di Sanity: per video lunghi usa YouTube o Vimeo.',
      hidden: ({ parent }) => parent?.source !== 'file',
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.parent as { source?: string })?.source === 'file' && !(value as { asset?: unknown })?.asset
            ? 'Carica il file video.'
            : true,
        ),
    }),
    defineField({
      name: 'title',
      title: 'Titolo del video',
      type: 'string',
      description: 'Breve, descrive il contenuto. Viene letto dai lettori di schermo.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'poster',
      title: 'Immagine di copertina',
      type: 'accessibleImage',
      description: 'Facoltativa. Mostrata prima di avviare il video.',
    }),
    defineField({ name: 'caption', title: 'Didascalia', type: 'string' }),
  ],
  preview: {
    select: { title: 'title', source: 'source', media: 'poster' },
    prepare: ({ title, source, media }) => ({
      title: title || 'Video',
      subtitle: source === 'file' ? 'File caricato' : 'YouTube / Vimeo',
      media: media ?? PlayIcon,
    }),
  },
});
