/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Set by the middleware on /anteprima/ requests: drafts + click-to-edit. */
    sanity?: import('./lib/sanity/fetch').SanityContext;
  }
}
