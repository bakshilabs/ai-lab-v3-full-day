// Which build this is, so feedback can be tied to it. build.mjs fills in the version (from package.json), the
// commit and the date; a copy run straight from the source files says "dev".
/* global __ECO_BUILD__ */
export const BUILD = typeof __ECO_BUILD__ !== 'undefined' ? __ECO_BUILD__ : { version: 'dev', commit: 'local', date: '' };
export const buildLabel = () => `version ${BUILD.version}${BUILD.commit && BUILD.commit !== 'local' ? ` (${BUILD.commit}${BUILD.date ? `, ${BUILD.date}` : ''})` : ''}`;
