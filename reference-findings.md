# Reference findings

## `https://www.sesan.studio/vinyl`

The reference uses a very light, almost paper-white canvas with a small text label in the upper-left and a sparse index control in the upper-right. The main visual is a vertical set of wide white ledges with softly cast shadows; records are displayed as square album sleeves resting on each ledge in evenly spaced groups. The result reads as a physical wall shelf or record archive rather than a conventional web card grid. The visual hierarchy is intentionally quiet: the artwork supplies colour while the frame, shelf, and surrounding space stay neutral. This supports the site’s existing minimalist, text-first aesthetic.

For Olayinka’s implementation, keep the existing route and text system, use CSS-first sleeve/disc movement, and let each record open into an accessible detail panel. On small screens, replace hover dependence with click/tap opening and a single-column or swipeable presentation. Preserve visible focus, Escape close, descriptive alt text, and reduced-motion fallbacks.

## Record-label verification sources

- [Tems — For Broken Ears on Spotify](https://open.spotify.com/album/2sU8ByeYc5BOBFNDr58CGV): the result identifies the 2020 release and credits Leading Vibe Ltd.
- [Tems — For Broken Ears at Diggers Factory](https://tems.diggers.store/vinyl/310704/tems-for-broken-ears): the release listing names the label as Leading Vibe.
- [Kendrick Lamar — Untitled Unmastered on Wikipedia](https://en.wikipedia.org/wiki/Untitled_Unmastered): the result identifies Top Dawg Entertainment, Aftermath Entertainment, and Interscope Records.
- [Kanye West — My Beautiful Dark Twisted Fantasy on Wikipedia](https://en.wikipedia.org/wiki/My_Beautiful_Dark_Twisted_Fantasy): the result identifies Def Jam Recordings and Roc-A-Fella Records.

These sources support the label field for the records where the search returned clear results. For the remaining records, the implementation should allow a blank or "label not listed" value rather than inventing metadata.

## Local Vinyl interaction verification

The local `/things/vinyls` preview exposes semantic buttons for all 11 records with descriptive labels. Clicking the first record opens an inline detail section containing a close button, artwork, title, artist, year, verified label, favourite track, note, and Apple Music link. The clicked record label changes from “details” to “close”, and the browser-visible page shows the detail content exactly once. The shelf’s visual desktop preview shows five records per ledge, with artwork above the ledge and a disc partially revealed behind each sleeve.

## Mobile and keyboard verification

At 360px, the Vinyl shelf becomes two columns with readable captions, physical ledges, and no dependency on hover to identify or activate records. The browser interaction test confirmed that Escape closes the open detail panel and returns the record controls to their unopened state.

## Places preview verification

The desktop map renders with nine highlighted countries, including France after normalized-name matching handles its `-99` GeoJSON code. The map remains readable at 360px, with the hint and counter wrapping without overflow. The tooltip is now HTML rather than SVG text, so its copy and close control can scale independently of the map. Visited paths expose keyboard focus and Enter/Space activation as well as click activation; touch does not use a competing `onTouchStart` handler.
