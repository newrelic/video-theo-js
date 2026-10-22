import TheoTracker from './tracker';

/**
 * Browser-only entry for the `/browser` webpack build.
 *
 * Combined with the webpack `resolve.alias` that rewires
 * `@newrelic/video-core` -> `@newrelic/video-core/browser` for this build,
 * the resulting bundle contains only the Browser pipeline (no Vega/connected-device chain).
 */
export default TheoTracker;
export { default as TheoTracker } from './tracker';
