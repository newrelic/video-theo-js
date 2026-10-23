import TheoTracker from '../tracker';
import { version } from '../../package.json';

function makePlayer() {
  return {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    currentTime: 0,
    duration: 120,
    muted: false,
    playbackRate: 1,
    autoplay: false,
    preload: 'none',
    source: null,
    videoTracks: { length: 0, addEventListener: jest.fn(), removeEventListener: jest.fn() },
    metrics: null,
    error: null,
    version: '11.0.0',
  };
}

describe('TheoTracker', () => {
  let tracker;

  beforeEach(() => {
    tracker = new TheoTracker(makePlayer(), {});
  });

  it('should return the tracker name', () => {
    expect(tracker.getTrackerName()).toBe('theo');
  });

  it('should return the tracker version', () => {
    expect(tracker.getTrackerVersion()).toBe(version);
  });

  it('should return the player name', () => {
    expect(tracker.getPlayerName()).toBe('THEOplayer');
  });

  it('should return the instrumentation provider', () => {
    expect(tracker.getInstrumentationProvider()).toBe('New Relic');
  });

  it('should return the instrumentation name', () => {
    expect(tracker.getInstrumentationName()).toBe('THEOplayer');
  });
});

describe('getPlayhead', () => {
  let tracker;

  beforeEach(() => {
    tracker = new TheoTracker(makePlayer(), {});
  });

  it('should return currentTime in milliseconds', () => {
    tracker.player.currentTime = 10;
    expect(tracker.getPlayhead()).toBe(10000);
  });
});

describe('getDuration', () => {
  let tracker;

  beforeEach(() => {
    tracker = new TheoTracker(makePlayer(), {});
  });

  it('should return duration in milliseconds', () => {
    tracker.player.duration = 120;
    expect(tracker.getDuration()).toBe(120000);
  });
});

describe('getSrc', () => {
  let tracker;

  beforeEach(() => {
    tracker = new TheoTracker(makePlayer(), {});
  });

  it('should return null when player has no source', () => {
    tracker.player.source = null;
    expect(tracker.getSrc()).toBeNull();
  });

  it('should return src from array sources', () => {
    tracker.player.source = {
      sources: [{ src: 'https://example.com/video.m3u8', type: 'application/x-mpegurl' }],
    };
    expect(tracker.getSrc()).toBe('https://example.com/video.m3u8');
  });

  it('should return src from object sources', () => {
    tracker.player.source = {
      sources: { src: 'https://example.com/video.mpd' },
    };
    expect(tracker.getSrc()).toBe('https://example.com/video.mpd');
  });

  it('should return null when sources is empty array', () => {
    tracker.player.source = { sources: [] };
    expect(tracker.getSrc()).toBeNull();
  });
});

describe('isMuted', () => {
  let tracker;

  beforeEach(() => {
    tracker = new TheoTracker(makePlayer(), {});
  });

  it('should return false when player is not muted', () => {
    tracker.player.muted = false;
    expect(tracker.isMuted()).toBe(false);
  });

  it('should return true when player is muted', () => {
    tracker.player.muted = true;
    expect(tracker.isMuted()).toBe(true);
  });
});

describe('getPlayrate', () => {
  let tracker;

  beforeEach(() => {
    tracker = new TheoTracker(makePlayer(), {});
  });

  it('should return the playback rate', () => {
    tracker.player.playbackRate = 1.5;
    expect(tracker.getPlayrate()).toBe(1.5);
  });
});

describe('isAutoplayed', () => {
  let tracker;

  beforeEach(() => {
    tracker = new TheoTracker(makePlayer(), {});
  });

  it('should return false when autoplay is off', () => {
    tracker.player.autoplay = false;
    expect(tracker.isAutoplayed()).toBe(false);
  });

  it('should return true when autoplay is on', () => {
    tracker.player.autoplay = true;
    expect(tracker.isAutoplayed()).toBe(true);
  });
});

describe('getPlayerVersion', () => {
  let tracker;

  beforeEach(() => {
    tracker = new TheoTracker(makePlayer(), {});
  });

  it('should return version from player instance', () => {
    tracker.player.version = '11.0.0';
    expect(tracker.getPlayerVersion()).toBe('11.0.0');
  });

  it('should return null when no version is available', () => {
    tracker.player.version = undefined;
    expect(tracker.getPlayerVersion()).toBeNull();
  });
});

describe('getRenditionHeight', () => {
  let tracker;

  beforeEach(() => {
    tracker = new TheoTracker(makePlayer(), {});
  });

  it('should return height from active quality', () => {
    tracker.currentTrack = { activeQuality: { height: 1080, width: 1920 } };
    expect(tracker.getRenditionHeight()).toBe(1080);
  });

  it('should return null when no currentTrack', () => {
    tracker.currentTrack = null;
    expect(tracker.getRenditionHeight()).toBeNull();
  });
});

describe('getRenditionWidth', () => {
  let tracker;

  beforeEach(() => {
    tracker = new TheoTracker(makePlayer(), {});
  });

  it('should return width from active quality', () => {
    tracker.currentTrack = { activeQuality: { height: 1080, width: 1920 } };
    expect(tracker.getRenditionWidth()).toBe(1920);
  });

  it('should return null when no currentTrack', () => {
    tracker.currentTrack = null;
    expect(tracker.getRenditionWidth()).toBeNull();
  });
});

describe('getBitrate', () => {
  let tracker;

  beforeEach(() => {
    tracker = new TheoTracker(makePlayer(), {});
  });

  it('should return bandwidth from active quality', () => {
    tracker.currentTrack = { activeQuality: { bandwidth: 5000000 } };
    expect(tracker.getBitrate()).toBe(5000000);
  });

  it('should return null when bandwidth is 0', () => {
    tracker.currentTrack = { activeQuality: { bandwidth: 0 } };
    expect(tracker.getBitrate()).toBeNull();
  });

  it('should return null when no currentTrack', () => {
    tracker.currentTrack = null;
    expect(tracker.getBitrate()).toBeNull();
  });
});

describe('getManifestBitrate', () => {
  let tracker;

  beforeEach(() => {
    tracker = new TheoTracker(makePlayer(), {});
  });

  it('should return highest bandwidth from all qualities', () => {
    tracker.player.videoTracks = [{
      qualities: [
        { bandwidth: 1000000 },
        { bandwidth: 3000000 },
        { bandwidth: 2000000 },
      ],
    }];
    expect(tracker.getManifestBitrate()).toBe(3000000);
  });

  it('should return null when videoTracks is empty', () => {
    tracker.player.videoTracks = [];
    expect(tracker.getManifestBitrate()).toBeNull();
  });

  it('should return null when qualities is empty', () => {
    tracker.player.videoTracks = [{ qualities: [] }];
    expect(tracker.getManifestBitrate()).toBeNull();
  });
});

describe('getSegmentDownloadBitrate', () => {
  let tracker;

  beforeEach(() => {
    tracker = new TheoTracker(makePlayer(), {});
  });

  it('should return currentBandwidthEstimate from metrics', () => {
    tracker.player.metrics = { currentBandwidthEstimate: 8000000 };
    expect(tracker.getSegmentDownloadBitrate()).toBe(8000000);
  });

  it('should return null when estimate is 0', () => {
    tracker.player.metrics = { currentBandwidthEstimate: 0 };
    expect(tracker.getSegmentDownloadBitrate()).toBeNull();
  });

  it('should return null when metrics is null', () => {
    tracker.player.metrics = null;
    expect(tracker.getSegmentDownloadBitrate()).toBeNull();
  });
});

describe('registerListeners', () => {
  let tracker;

  beforeEach(() => {
    tracker = new TheoTracker(makePlayer(), {});
    tracker.player.addEventListener.mockClear();
  });

  it('should register all required event listeners', () => {
    tracker.registerListeners();

    const registeredEvents = tracker.player.addEventListener.mock.calls.map(c => c[0]);
    expect(registeredEvents).toContain('canplay');
    expect(registeredEvents).toContain('play');
    expect(registeredEvents).toContain('playing');
    expect(registeredEvents).toContain('pause');
    expect(registeredEvents).toContain('seeking');
    expect(registeredEvents).toContain('seeked');
    expect(registeredEvents).toContain('error');
    expect(registeredEvents).toContain('ended');
    expect(registeredEvents).toContain('waiting');
  });
});

describe('unregisterListeners', () => {
  let tracker;

  beforeEach(() => {
    tracker = new TheoTracker(makePlayer(), {});
    tracker.player.removeEventListener.mockClear();
    tracker.registerListeners();
    tracker.player.removeEventListener.mockClear();
  });

  it('should unregister all event listeners', () => {
    tracker.unregisterListeners();

    const removedEvents = tracker.player.removeEventListener.mock.calls.map(c => c[0]);
    expect(removedEvents).toContain('canplay');
    expect(removedEvents).toContain('play');
    expect(removedEvents).toContain('playing');
    expect(removedEvents).toContain('pause');
    expect(removedEvents).toContain('seeking');
    expect(removedEvents).toContain('seeked');
    expect(removedEvents).toContain('error');
    expect(removedEvents).toContain('ended');
    expect(removedEvents).toContain('waiting');
  });
});

describe('Tracker Event Handlers', () => {
  let tracker;

  beforeEach(() => {
    tracker = new TheoTracker(makePlayer(), {});
    tracker.sendDownload = jest.fn();
    tracker.sendRequest = jest.fn();
    tracker.sendBufferEnd = jest.fn();
    tracker.sendResume = jest.fn();
    tracker.sendStart = jest.fn();
    tracker.sendPause = jest.fn();
    tracker.sendSeekStart = jest.fn();
    tracker.sendSeekEnd = jest.fn();
    tracker.sendError = jest.fn();
    tracker.sendEnd = jest.fn();
    tracker.sendBufferStart = jest.fn();
    tracker.sendRenditionChanged = jest.fn();
  });

  it('should call sendDownload on onDownload', () => {
    tracker.onDownload({ type: 'canplay' });
    expect(tracker.sendDownload).toHaveBeenCalledWith({ state: 'canplay' });
  });

  it('should call sendRequest on onPlay', () => {
    tracker.onPlay();
    expect(tracker.sendRequest).toHaveBeenCalled();
  });

  it('should call sendBufferEnd, sendResume, sendStart on onPlaying', () => {
    tracker.onPlaying();
    expect(tracker.sendBufferEnd).toHaveBeenCalled();
    expect(tracker.sendResume).toHaveBeenCalled();
    expect(tracker.sendStart).toHaveBeenCalled();
  });

  it('should call sendPause on onPause', () => {
    tracker.onPause();
    expect(tracker.sendPause).toHaveBeenCalled();
  });

  it('should call sendSeekStart on onSeeking', () => {
    tracker.onSeeking();
    expect(tracker.sendSeekStart).toHaveBeenCalled();
  });

  it('should call sendSeekEnd on onSeeked', () => {
    tracker.onSeeked();
    expect(tracker.sendSeekEnd).toHaveBeenCalled();
  });

  it('should call sendEnd on onEnded', () => {
    tracker.onEnded();
    expect(tracker.sendEnd).toHaveBeenCalled();
  });

  it('should call sendError with errorCode and errorMessage on onError', () => {
    tracker.player.error = { code: 1001, message: 'Network error' };
    tracker.onError({ error: { code: 1001, message: 'Network error' } });
    expect(tracker.sendError).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: 1001, errorMessage: 'Network error' })
    );
  });

  it('should call sendBufferStart on onWaiting when readyState < 4', () => {
    tracker.player.element = {
      querySelector: jest.fn().mockReturnValue({ readyState: 2 }),
    };
    tracker.onWaiting();
    expect(tracker.sendBufferStart).toHaveBeenCalled();
  });
});
