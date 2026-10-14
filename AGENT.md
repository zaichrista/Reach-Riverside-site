# The Reach Riverside — Codex Project Instructions

## Project

This repository contains the production website for The Reach Riverside,
a restaurant in Fulham Reach / Hammersmith, London.

The site is currently hand-coded in HTML, CSS and JavaScript unless the
repository itself demonstrates otherwise.

The website is actively used by the business.

## Primary objective

Improve this site into an exceptionally strong local-search, conversion,
accessibility and performance platform for The Reach Riverside.

Priorities, in order:

1. Technical correctness
2. Preserve the existing visual identity
3. Local SEO
4. Conversion to restaurant bookings/enquiries
5. Accessibility
6. Performance
7. Maintainability
8. Analytics and measurement

## Business identity

Public-facing brand:
The Reach Riverside

Primary area:
Fulham Reach / Hammersmith, London

Address:
Goldhurst House
Parr's Way
London
W6 9AN

Before implementing canonical-domain work, inspect the repository and
existing deployment configuration and identify the currently configured
production domain.

Do not assume a domain migration is technically possible until the hosting
and DNS configuration are understood.

## Critical rules

- NEVER invent restaurant facts.
- NEVER invent menu items.
- NEVER invent prices.
- NEVER invent opening hours.
- NEVER invent accessibility features.
- NEVER invent events.
- NEVER invent awards, reviews or testimonials.
- If information cannot be verified from repository content, mark it as
  requiring human confirmation.
- Preserve the existing visual language unless explicitly instructed to
  redesign something.
- Do not migrate this project to React, Next.js, Astro or another framework
  merely because it would be convenient.
- Prefer simple solutions compatible with the existing architecture.
- Do not introduce paid services.
- Do not add unnecessary dependencies.
- Do not expose secrets or credentials.
- Do not alter DNS.
- Do not deploy production changes unless explicitly instructed.
- Do not force-push Git.
- Do not delete substantial existing content without explaining why.

## SEO rules

Follow current Google Search guidelines.

Prioritize useful, people-first local content.

Do NOT:
- keyword stuff
- create near-identical location pages
- generate dozens of thin SEO pages
- create doorway pages
- hide SEO text
- create content primarily to manipulate rankings

A dedicated landing page should exist only when the search intent is
meaningfully different and the page provides useful unique information.

Examples of potentially distinct intents:
- Sunday roast
- brunch
- private dining
- catering
- pre-theatre dining
- dog-friendly dining
- Christmas
- Boat Race

Hammersmith and Fulham Reach variations should normally be handled naturally
within strong pages rather than by duplicating the same page for each keyword.

## Technical SEO requirements

Where appropriate:

- one unique title per page
- one useful meta description per page
- one clear H1
- semantic heading structure
- canonical URL
- Open Graph metadata
- descriptive image alt text
- sitemap.xml
- robots.txt
- Restaurant structured data
- Event structured data where appropriate
- valid internal links
- descriptive anchor text
- usable mobile experience

Structured data must reflect visible, truthful business information.

## Performance

Prioritize:

- sensible image dimensions
- modern image formats where safe
- lazy-loading below-the-fold imagery
- avoiding unnecessary JavaScript
- preventing layout shift
- fast mobile rendering

Preserve image quality appropriate to a premium restaurant.

## Accessibility

Maintain or improve:

- semantic HTML
- keyboard navigation
- focus states
- form labels
- meaningful alt text
- sufficient accessible names
- reduced-motion support where appropriate

## Working process

For significant work:

1. Inspect before editing.
2. Explain the current implementation.
3. Identify risks.
4. Create/update the execution plan.
5. Make the smallest coherent set of changes.
6. Test the result.
7. Review the diff.
8. Report exactly what changed.
9. Report anything still requiring human action.

When possible, verify pages locally rather than reasoning only from source.

## Git

Keep unrelated changes separate.

Do not silently overwrite user work.

Never use destructive Git commands without explicit permission.

## Definition of done

A task is not complete merely because files were edited.

It is complete when:

- implementation is coherent
- links work
- HTML remains valid
- major responsive states work
- existing features have not obviously regressed
- SEO metadata is internally consistent
- structured data is valid where applicable
- outstanding manual actions are documented