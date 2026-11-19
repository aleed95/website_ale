/**
 * Interface strings (navigation fallbacks, accessibility labels, buttons, field labels).
 *
 * Only fixed UI text belongs here. Editorial content — titles, texts, contacts — comes
 * from Sanity and must never be added to this file.
 */
import type { Locale, RouteKey } from './config';

type PublicationType = 'paper' | 'book' | 'chapter' | 'report' | 'popular' | 'proceedings' | 'other';

interface UiStrings {
  nav: Record<RouteKey, string>;
  a11y: {
    skipToContent: string;
    mainNavigation: string;
    footerNavigation: string;
    legalNavigation: string;
    openMenu: string;
    closeMenu: string;
    languageSwitcher: string;
    homeLink: string;
    breadcrumb: string;
    opensInNewTab: string;
  };
  footer: {
    navigationTitle: string;
    contactTitle: string;
    followTitle: string;
    allRightsReserved: string;
    vat: string;
  };
  common: {
    readMore: string;
    discover: string;
    ongoing: string;
    present: string;
    empty: string;
    backTo: string;
  };
  home: {
    services: string;
    allServices: string;
    selectedProjects: string;
    allProjects: string;
    latestArticles: string;
    allArticles: string;
    selectedPublications: string;
    allPublications: string;
  };
  about: {
    education: string;
    experience: string;
    skills: string;
    qualifications: string;
  };
  services: {
    relatedProjects: string;
    contactCta: string;
  };
  projects: {
    period: string;
    client: string;
    location: string;
    category: string;
    gallery: string;
    relatedServices: string;
  };
  articles: {
    publishedOn: string;
    by: string;
    categories: string;
    tags: string;
  };
  publications: {
    types: Record<PublicationType, string>;
    authors: string;
    doi: string;
    link: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
    social: string;
  };
  notFound: {
    title: string;
    text: string;
    backHome: string;
  };
}

export const ui: Record<Locale, UiStrings> = {
  it: {
    nav: {
      home: 'Home',
      about: 'Chi sono',
      services: 'Servizi',
      projects: 'Progetti',
      publications: 'Pubblicazioni',
      articles: 'Articoli',
      contact: 'Contatti',
    },
    a11y: {
      skipToContent: 'Vai al contenuto',
      mainNavigation: 'Navigazione principale',
      footerNavigation: 'Navigazione a piè di pagina',
      legalNavigation: 'Note legali',
      openMenu: 'Apri il menu',
      closeMenu: 'Chiudi il menu',
      languageSwitcher: 'Lingua',
      homeLink: 'Torna alla home',
      breadcrumb: 'Percorso di navigazione',
      opensInNewTab: '(si apre in una nuova scheda)',
    },
    footer: {
      navigationTitle: 'Sezioni',
      contactTitle: 'Contatti',
      followTitle: 'Seguimi',
      allRightsReserved: 'Tutti i diritti riservati.',
      vat: 'P. IVA',
    },
    common: {
      readMore: 'Leggi di più',
      discover: 'Scopri',
      ongoing: 'in corso',
      present: 'oggi',
      empty: 'Nessun contenuto pubblicato per ora.',
      backTo: 'Torna a',
    },
    home: {
      services: 'Servizi',
      allServices: 'Tutti i servizi',
      selectedProjects: 'Progetti in evidenza',
      allProjects: 'Tutti i progetti',
      latestArticles: 'Ultimi articoli',
      allArticles: 'Tutti gli articoli',
      selectedPublications: 'Pubblicazioni',
      allPublications: 'Tutte le pubblicazioni',
    },
    about: {
      education: 'Formazione',
      experience: 'Esperienza',
      skills: 'Competenze',
      qualifications: 'Certificazioni e riconoscimenti',
    },
    services: {
      relatedProjects: 'Progetti collegati',
      contactCta: 'Richiedi informazioni',
    },
    projects: {
      period: 'Periodo',
      client: 'Committente',
      location: 'Luogo',
      category: 'Categoria',
      gallery: 'Galleria',
      relatedServices: 'Servizi collegati',
    },
    articles: {
      publishedOn: 'Pubblicato il',
      by: 'di',
      categories: 'Categorie',
      tags: 'Tag',
    },
    publications: {
      types: {
        paper: 'Articolo scientifico',
        book: 'Libro',
        chapter: 'Capitolo di libro',
        report: 'Report tecnico',
        popular: 'Articolo divulgativo',
        proceedings: 'Atti di convegno',
        other: 'Altro',
      },
      authors: 'Autori',
      doi: 'DOI',
      link: 'Leggi la pubblicazione',
    },
    contact: {
      email: 'Email',
      phone: 'Telefono',
      address: 'Dove',
      social: 'Social',
    },
    notFound: {
      title: 'Pagina non trovata',
      text: 'La pagina che cerchi non esiste o è stata spostata.',
      backHome: 'Torna alla home',
    },
  },
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      services: 'Services',
      projects: 'Projects',
      publications: 'Publications',
      articles: 'Articles',
      contact: 'Contact',
    },
    a11y: {
      skipToContent: 'Skip to content',
      mainNavigation: 'Main navigation',
      footerNavigation: 'Footer navigation',
      legalNavigation: 'Legal',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      languageSwitcher: 'Language',
      homeLink: 'Back to home page',
      breadcrumb: 'Breadcrumb',
      opensInNewTab: '(opens in a new tab)',
    },
    footer: {
      navigationTitle: 'Sections',
      contactTitle: 'Contact',
      followTitle: 'Follow',
      allRightsReserved: 'All rights reserved.',
      vat: 'VAT',
    },
    common: {
      readMore: 'Read more',
      discover: 'Discover',
      ongoing: 'ongoing',
      present: 'present',
      empty: 'Nothing published yet.',
      backTo: 'Back to',
    },
    home: {
      services: 'Services',
      allServices: 'All services',
      selectedProjects: 'Selected projects',
      allProjects: 'All projects',
      latestArticles: 'Latest articles',
      allArticles: 'All articles',
      selectedPublications: 'Publications',
      allPublications: 'All publications',
    },
    about: {
      education: 'Education',
      experience: 'Experience',
      skills: 'Skills',
      qualifications: 'Certifications and awards',
    },
    services: {
      relatedProjects: 'Related projects',
      contactCta: 'Get in touch',
    },
    projects: {
      period: 'Period',
      client: 'Client',
      location: 'Location',
      category: 'Category',
      gallery: 'Gallery',
      relatedServices: 'Related services',
    },
    articles: {
      publishedOn: 'Published on',
      by: 'by',
      categories: 'Categories',
      tags: 'Tags',
    },
    publications: {
      types: {
        paper: 'Scientific paper',
        book: 'Book',
        chapter: 'Book chapter',
        report: 'Technical report',
        popular: 'Popular article',
        proceedings: 'Conference proceedings',
        other: 'Other',
      },
      authors: 'Authors',
      doi: 'DOI',
      link: 'Read the publication',
    },
    contact: {
      email: 'Email',
      phone: 'Phone',
      address: 'Where',
      social: 'Social',
    },
    notFound: {
      title: 'Page not found',
      text: 'The page you are looking for does not exist or has been moved.',
      backHome: 'Back to home page',
    },
  },
};

export function t(locale: Locale): UiStrings {
  return ui[locale];
}
