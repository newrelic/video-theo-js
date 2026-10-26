## [1.0.0](https://github.com/newrelic/video-theo-js/compare/v0.0.1-beta...v1.0.0) (2026-10-26)

### Added

- **THEOplayer Web SDK support:** Initial stable release of the New Relic THEOplayer tracker for browser environments. Import via `@newrelic/video-theo/browser`.
- **Browser entry point:** Dedicated `@newrelic/video-theo/browser` subpath that excludes the Vega/connected-device pipeline for browser-only bundles.
- **video-core 5.1.0:** Upgraded to `@newrelic/video-core ^5.1.0`, enabling QoE drain callbacks on `sendStart`/`sendEnd` via `getHarvester()`.
- **Bitrate tracking:** Reports `contentBitrate`, `contentManifestBitrate`, `contentSegmentDownloadBitrate`, and `contentNetworkDownloadBitrate`.
- **Rendition quality tracking:** Tracks active rendition height, width, and bandwidth via track-level quality change events.
- **Multi-format support:** HLS and DASH streams supported through THEOplayer's native adaptive streaming.

### Changed

- **Player name:** `playerName` attribute reports as `THEOplayer`.
- **Error code handling:** `errorCode` is omitted from events when no SDK-provided code is available, avoiding meaningless sentinel values in NRDB.

# CHANGELOG
