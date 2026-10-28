# JPMorgan Chase - ThoughtSpot demo portal

Built by DemoPrep. The hosted copy is at:

    https://thoughtspot-demoprep-portals.static.hf.space/jpmorgan-chase-918b244c/index.html

## Show it

    npx serve dist

Serves the built files with no install. **Serve `dist`, not this folder** - the
top level holds the SOURCE, whose index.html points at `/src/main.tsx`, and a
plain static server hands that over as the wrong content type. `dist` is the
compiled output.

## Edit it

    npm install
    npm run dev

Takes a moment the first time. Use this to change anything the interview could
not express - the landing page, the custom-action modal, a bespoke tab. Pointing
Claude Code at this folder works well.

## Before showing it to a customer

The dashboards are embedded from se-thoughtspot-cloud.thoughtspot.cloud, so:

- be signed in to that cluster in the same browser, and
- the address you serve from must be on its CORS allowlist
  (Develop -> Customizations -> Security Settings).
