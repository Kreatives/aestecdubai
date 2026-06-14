# Aēstec Dubai

Marketing website for Aēstec Dubai — a private aesthetic clinic. Static HTML/CSS/JS, no build step; deploys to Vercel as a static site.

## Structure

```
.
├── index.html                     # Homepage
├── about.html                     # About / Heritage
├── treatments.html                # Treatments overview
├── treatment-aeslift.html         # Treatment template — Aēslift™ (signature)
├── treatment-fillers.html         # Treatment template — Fillers
├── treatment-muscle-relaxers.html # Treatment template — Muscle relaxers
├── treatment-profhilo.html        # Treatment template — Profhilo®
├── before-after.html              # Results (filterable before/after grid)
├── reviews.html                   # All reviews (masonry)
├── echography.html                # Ultrasound-guided method
├── pricing.html                   # Pricing
├── consult.html                   # Plan a consultation (contact)
├── register-interest.html         # Aēslift waitlist (typeform-style flow)
├── styles/
│   ├── main.css                   # Tokens + homepage + nav/mega
│   └── pages.css                  # Subpage components
├── scripts/
│   ├── main.js                    # FAQ, nav theme, book-cta, GSAP reveals
│   └── pages.js                   # Results filter, typeform, before/after slider
└── images/                        # Photography (hero image/, Echography/, Aestec all images/)
```

## Local preview

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

## Deploy

Pushed to GitHub (`Kreatives/aestecdubai`); Vercel builds it as a static site from the repository root.
