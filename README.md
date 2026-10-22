[![Community Project header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Community_Project.png)](https://opensource.newrelic.com/oss-category/#community-project)

# New Relic THEOplayer Tracker

[![npm version](https://badge.fury.io/js/%40newrelic%2Fvideo-theo.svg)](https://badge.fury.io/js/%40newrelic%2Fvideo-theo)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

The New Relic THEOplayer Tracker provides comprehensive video analytics for applications using THEOplayer. Track video events, monitor playback quality, identify errors, and gain deep insights into user engagement and streaming performance for HLS and DASH content.

## Features

- 🎯 **Automatic Event Detection** - Captures THEOplayer events automatically without manual instrumentation
- 📊 **Comprehensive Bitrate Tracking** - Multiple bitrate metrics for complete quality analysis
- 🔧 **Multi-Format Support** - Works with HLS, DASH, and other formats supported by THEOplayer
- 📈 **QoE Metrics** - Quality of Experience aggregation for startup time, buffering, and playback quality
- 🎨 **Event Segregation** - Organized event types: `VideoAction`, `VideoAdAction`, `VideoErrorAction`, `VideoCustomAction`
- 🚀 **Easy Integration** - NPM package or direct script include
- ⚡ **Real-Time Performance** - Bandwidth estimation and rendition quality monitoring
- 🎬 **Adaptive Streaming** - Optimized for adaptive bitrate streaming with per-track quality analysis

## Table of Contents

- [Installation](#installation)
  - [Option 1: NPM/Yarn](#option-1-install-via-npmyarn)
  - [Option 2: Direct Script Include](#option-2-direct-script-include-without-npm)
- [Prerequisites](#prerequisites)
- [Usage](#usage)
- [Best Practices](#best-practices)
- [Configuration Options](#configuration-options)
- [API Reference](#api-reference)
- [Bitrate Metrics](#bitrate-metrics)
- [Data Model](#data-model)
- [Support](#support)
- [Contribute](#contribute)
- [License](#license)

## Installation

### Option 1: Install via NPM/Yarn

Install the package using your preferred package manager:

**NPM:**
```bash
npm install @newrelic/video-theo
```

**Yarn:**
```bash
yarn add @newrelic/video-theo
```


### Option 2: Direct Script Include (Without NPM)

For quick integration without a build system, include the tracker directly in your HTML:

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- THEOplayer CSS -->
    <link rel="stylesheet" type="text/css" href="YOUR_SDK_LIBRARY_LOCATION/ui.css" />

    <!-- THEOplayer JS -->
    <script src="YOUR_SDK_LIBRARY_LOCATION/THEOplayer.js"></script>

    <!-- New Relic THEOplayer Tracker -->
    <script src="path/to/newrelic-video-theo.min.js"></script>
  </head>
  <body>
    <div class="theoplayer-container video-js theoplayer-skin vjs-16-9"></div>

    <script>
      var element = document.querySelector('.theoplayer-container');
      var player = new THEOplayer.Player(element, {
        license: 'YOUR_THEOPLAYER_LICENSE',
        libraryLocation: 'YOUR_SDK_LIBRARY_LOCATION',
      });

      // Configure New Relic tracker with info from one.newrelic.com
      var options = {
        info: {
          licenseKey: 'YOUR_LICENSE_KEY',
          beacon: 'YOUR_BEACON_URL',
          applicationId: 'YOUR_APP_ID',
        },
      };

      // Initialize tracker
      var tracker = new TheoTracker(player, options);

      // Load content
      player.source = {
        sources: [{ src: 'https://your-content.m3u8', type: 'application/x-mpegurl' }],
      };
    </script>
  </body>
</html>
```

**Setup Steps:**

1. **Get Configuration** - Visit [one.newrelic.com](https://one.newrelic.com) and follow the Streaming Video & Ads onboarding flow to get your `licenseKey`, `beacon`, `applicationId`, and integration code snippet.
2. **Integrate** - Include the script in your HTML and initialize with your configuration

## Prerequisites

Before using the tracker, ensure you have:

- **New Relic Account** - Active New Relic account with valid application credentials (`beacon`, `applicationId`, `licenseKey`)
- **THEOplayer** - THEOplayer integrated in your application with a valid Web SDK license

## Usage

### Browser Player Setup

**Obtain your credentials:**

1. Log in to [one.newrelic.com](https://one.newrelic.com)
2. Navigate to the video agent onboarding flow
3. Copy your credentials: `licenseKey`, `beacon`, and `applicationId`

```javascript
import * as THEOplayer from 'theoplayer';
import 'theoplayer/ui.css';
import { TheoTracker } from '@newrelic/video-theo/browser';

// Create a container element in your HTML:
// <div id="player" class="theoplayer-container video-js theoplayer-skin"></div>
const element = document.getElementById('player');

// Initialize THEOplayer
const player = new THEOplayer.Player(element, {
  license: 'YOUR_THEOPLAYER_LICENSE',
  libraryLocation: `${import.meta.env.BASE_URL}vendor/theoplayer/`,
  ui: { fluid: true },
});

// Configure tracker with credentials from one.newrelic.com
const options = {
  info: {
    licenseKey: 'YOUR_LICENSE_KEY',
    beacon: 'YOUR_BEACON_URL',
    applicationId: 'YOUR_APP_ID',
  },
};

// Initialize tracker
const tracker = new TheoTracker(player, options);

// Load and play content
player.source = {
  sources: [{ src: 'https://your-content.m3u8', type: 'application/x-mpegurl' }],
};
```

### Advanced Configuration

```javascript
const options = {
  info: {
    licenseKey: 'YOUR_LICENSE_KEY',
    beacon: 'YOUR_BEACON_URL',
    applicationId: 'YOUR_APP_ID',
  },
  config: {
    qoeIntervalFactor: 2,      // Send QoE events every 2 harvest cycles
  },
  customData: {
    contentTitle: 'My Video Title',
    customPlayerName: 'MyCustomPlayer',
    customAttribute: 'customValue',
  },
};

const tracker = new TheoTracker(player, options);
```

## Best Practices

### 1. Setting `contentTitle`

The `contentTitle` attribute will display a value if your video metadata contains title information. For best results, explicitly set this attribute during initialization:

```javascript
const tracker = new TheoTracker(player, {
  info: {
    licenseKey: 'YOUR_LICENSE_KEY',
    beacon: 'YOUR_BEACON_URL',
    applicationId: 'YOUR_APP_ID',
  },
  customData: {
    contentTitle: 'My Video Title',
  },
});
```

If your title changes dynamically (e.g., playlist or queue):

```javascript
tracker.setOptions({
  customData: {
    contentTitle: 'New Video Title',
  },
});
```

### 2. Setting `userId`

Set a user identifier to track video analytics per user:

```javascript
// Set userId during initialization
const tracker = new TheoTracker(player, {
  info: {
    licenseKey: 'YOUR_LICENSE_KEY',
    beacon: 'YOUR_BEACON_URL',
    applicationId: 'YOUR_APP_ID',
  },
  customData: {
    contentTitle: 'Video Title',
    userId: 'user-12345',
  },
});

// Or set userId separately using the API method
tracker.setUserId('user-12345');
```

### 3. Adding Custom Attributes for Your Deployment

```javascript
const tracker = new TheoTracker(player, {
  info: {
    licenseKey: 'YOUR_LICENSE_KEY',
    beacon: 'YOUR_BEACON_URL',
    applicationId: 'YOUR_APP_ID',
  },
  customData: {
    contentTitle: videoMetadata.title,
    userId: currentUser.id,
    subscriptionTier: 'premium',
    contentProvider: 'studio-abc',
    region: 'us-west-2',
    cdnProvider: 'cloudflare',
    deviceType: 'desktop',
    appVersion: '2.1.0',
  },
});
```

**Use these attributes in New Relic queries:**

```sql
-- Analyze by subscription tier
SELECT count(*) FROM VideoAction WHERE actionName = 'CONTENT_START'
FACET subscriptionTier SINCE 1 day ago

-- Monitor by region
SELECT average(contentBitrate) FROM VideoAction
FACET region SINCE 1 hour ago
```


### 4. Gradual Rollout with Feature Flags

When deploying to production, use feature flags to enable the tracker gradually. This helps you:

- Validate data collection without impacting all users
- Monitor performance impact at scale
- Catch issues before full deployment
- Control monitoring costs

```javascript
// Example using a feature flag
const rolloutPercentage = 5; // Start with 5% of users

function shouldEnableTracking(userId) {
  // Simple percentage-based rollout
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (hash % 100) < rolloutPercentage;
}

// Only initialize tracker if user is in rollout
if (shouldEnableTracking(currentUser.id)) {
  const tracker = new TheoTracker(player, {
    info: {
      licenseKey: 'YOUR_LICENSE_KEY',
      beacon: 'YOUR_BEACON_URL',
      applicationId: 'YOUR_APP_ID',
    },
    customData: {
      contentTitle: videoMetadata.title,
      userId: currentUser.id,
      rolloutGroup: `${rolloutPercentage}%`,  // Track which rollout group
    },
  });
}
```

**Recommended Rollout Schedule:**

| Phase | Percentage | Duration | Validation |
|-------|-----------|----------|------------|
| Initial | 5% | 2-3 days | Verify data flowing to New Relic |
| Early | 15% | 3-5 days | Check data quality and performance |
| Expansion | 25% | 5-7 days | Validate across device types |
| Majority | 50% | 1-2 weeks | Monitor at scale |
| Full | 100% | Ongoing | Complete deployment |

## Configuration Options

### QoE (Quality of Experience) Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `qoeIntervalFactor` | number | `1` | Controls QoE event frequency. A value of `N` sends QoE events once every N harvest cycles. Must be a positive integer. |

### Custom Data

Add custom attributes to all events:

```javascript
customData: {
  contentTitle: 'My Video Title',
  customPlayerName: 'MyPlayer',
  customPlayerVersion: '1.0.0',
  userId: '12345',
  contentSeries: 'Season 1',
}
```

> **Limit:** The maximum total number of custom attributes per event is **150**. Any attributes beyond this limit will be dropped.

> **Note:** There are special keywords reserved for default attributes (see [DATAMODEL.md](./DATAMODEL.md)). Please do not use these as custom attributes, as they will be dropped. Examples of reserved keywords include `actionName`, `contentId`, `contentTitle`, `playerName`, `playerVersion`, `viewSession`, `viewId`, and others listed in the data model documentation.

## API Reference

### Core Methods

#### `tracker.setUserId(userId)`
Set a unique identifier for the current user.

```javascript
tracker.setUserId('user-12345');
```

#### `tracker.setHarvestInterval(milliseconds)`
Configure how frequently data is sent to New Relic. Accepts values between 1000ms (1 second) and 300000ms (5 minutes).

```javascript
tracker.setHarvestInterval(30000); // Send data every 30 seconds
```

### Live Stream Configuration

For live streams, reduce the harvest interval to 5,000–10,000 ms for near-real-time data delivery:

```javascript
// Live content — flush every 5 seconds
tracker.setHarvestInterval(5000);

// VOD content — default 10s is sufficient
```

#### `tracker.sendCustom(actionName, attributes)`
Send custom events with arbitrary attributes.

```javascript
tracker.sendCustom('VideoBookmarked', {
  timestamp: Date.now(),
  position: player.currentTime,
  userId: 'user-12345',
  bookmarkId: 'bookmark-789',
});
```

#### `tracker.setOptions(options)`
Update tracker configuration after initialization.

```javascript
tracker.setOptions({
  customData: {
    contentTitle: 'New Video Title',
    season: '1',
    episode: '3',
  },
});
```

### Example: Complete Integration

```javascript
import * as THEOplayer from 'theoplayer';
import 'theoplayer/ui.css';
import { TheoTracker } from '@newrelic/video-theo/browser';

const element = document.getElementById('player');
const player = new THEOplayer.Player(element, {
  license: 'YOUR_THEOPLAYER_LICENSE',
  libraryLocation: `${import.meta.env.BASE_URL}vendor/theoplayer/`,
  ui: { fluid: true },
});

const tracker = new TheoTracker(player, {
  info: {
    licenseKey: 'YOUR_LICENSE_KEY',
    beacon: 'YOUR_BEACON_URL',
    applicationId: 'YOUR_APP_ID',
  },
  config: {
    qoeIntervalFactor: 1,
  },
});

// Set user context
tracker.setUserId('user-12345');

// Configure reporting interval
tracker.setHarvestInterval(30000);

// Send custom events
player.addEventListener('playing', () => {
  tracker.sendCustom('PlaybackStarted', {
    timestamp: Date.now(),
  });
});

// Load content
player.source = {
  sources: [{ src: 'https://your-content.m3u8', type: 'application/x-mpegurl' }],
};
```

## Bitrate Metrics

The tracker captures multiple bitrate metrics providing complete quality analysis:

| Attribute | Description | Use Case |
|-----------|-------------|----------|
| `contentBitrate` | Bandwidth (in bps) of the currently active video quality level from the active track | Monitor actual video quality being delivered |
| `contentManifestBitrate` | Highest available bandwidth (in bps) across all quality levels in the manifest | Understand the maximum quality available |
| `contentSegmentDownloadBitrate` | Estimated bandwidth (in bps) from THEOplayer's ABR algorithm via `metrics.currentBandwidthEstimate` | Analyze ABR decision-making |
| `contentNetworkDownloadBitrate` | Same as `contentSegmentDownloadBitrate` — effective download throughput derived from the metrics API | Monitor real-time network performance |

### Bitrate Monitoring Example

```sql
-- NRQL Query Examples:
SELECT average(contentBitrate) FROM VideoAction WHERE actionName = 'CONTENT_HEARTBEAT'
SELECT contentBitrate, contentManifestBitrate FROM VideoAction WHERE actionName = 'CONTENT_RENDITION_CHANGE'
```

## Data Model

The tracker captures comprehensive video analytics across four event types:

- **VideoAction** - Playback events (play, pause, buffer, seek, quality changes, heartbeats)
- **VideoAdAction** - Ad events (ad start, quartiles, completions, clicks)
- **VideoErrorAction** - Error events (playback failures, network errors, media errors)
- **VideoCustomAction** - Custom events defined by your application

**Full Documentation:** See [DATAMODEL.md](./DATAMODEL.md) for complete event and attribute reference.

## Support

Should you need assistance with New Relic products, you are in good hands with several support channels.

If the issue has been confirmed as a bug or is a feature request, please file a GitHub issue.

### Support Channels

- [New Relic Documentation](https://docs.newrelic.com): Comprehensive guidance for using our platform
- [New Relic Community](https://discuss.newrelic.com): The best place to engage in troubleshooting questions
- [New Relic University](https://learn.newrelic.com): A range of online training for New Relic users of every level
- [New Relic Technical Support](https://support.newrelic.com): 24/7/365 ticketed support. Read more about our [Technical Support Offerings](https://docs.newrelic.com/docs/licenses/license-information/general-usage-licenses/support-plan)

## Contribute

We encourage your contributions to improve the THEOplayer Tracker! Keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. You only have to sign the CLA one time per project.

If you have any questions, or to execute our corporate CLA (which is required if your contribution is on behalf of a company), drop us an email at opensource@newrelic.com.

For more details on how best to contribute, see [CONTRIBUTING.md](./CONTRIBUTING.md).

### A note about vulnerabilities

As noted in our [security policy](../../security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the security community are important means to achieve our security goals.

If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through our [bug bounty program](https://docs.newrelic.com/docs/security/security-privacy/information-security/report-security-vulnerabilities/).

If you would like to contribute to this project, review [these guidelines](./CONTRIBUTING.md).

To all contributors, we thank you! Without your contribution, this project would not be what it is today.

## License

The THEOplayer Tracker is licensed under the [Apache 2.0](http://apache.org/licenses/LICENSE-2.0.txt) License.

The THEOplayer Tracker also uses source code from third-party libraries. Full details on which libraries are used and the terms under which they are licensed can be found in the [third-party notices document](./THIRD_PARTY_NOTICES.md).
