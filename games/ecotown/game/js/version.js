// Which build this is, so feedback can be tied to it. build.mjs fills in the version (from package.json), the
// commit and the date; a copy run straight from the source files says "dev".
/* global __ECO_BUILD__ */
export const BUILD = typeof __ECO_BUILD__ !== 'undefined' ? __ECO_BUILD__ : { version: 'dev', commit: 'local', date: '' };
export const buildLabel = () => `version ${BUILD.version}${BUILD.commit && BUILD.commit !== 'local' ? ` (${BUILD.commit}${BUILD.date ? `, ${BUILD.date}` : ''})` : ''}`;
// The start page that shows the welcome and the four parts, and the game page itself. In a copy run from the source
// files they are start.html and index.html; build.mjs makes the start page the site's front door.
/* global __ECO_HUB__, __ECO_GAME__ */
export const HUB = typeof __ECO_HUB__ !== 'undefined' ? __ECO_HUB__ : 'start.html';
export const GAME = typeof __ECO_GAME__ !== 'undefined' ? __ECO_GAME__ : 'index.html';
