import nrvideo from '@newrelic/video-core';
import pkg from '../package.json';

export default class TheoTracker extends nrvideo.VideoTracker {
  constructor(player, options) {
    super(player, options);
    nrvideo.Core.addTracker(this, options);
    this.options = options;
    this.previousQuality = null; // Track previous quality for comparison
    this.currentTrack = null; // Track the current video track
    this.trackQualityListeners = {
      activequalitychanged: null,
      updatequality: null
    }; // Store bound listener references for removal
  }

  getTrackerName() {
    return 'theo';
  }

  getPlayerName() {
    return 'Theo';
  }

  getInstrumentationProvider() {
    return 'New Relic';
  }

  getInstrumentationName() {
    return this.getPlayerName();
  }

  getInstrumentationVersion() {
    return this.getPlayerVersion();
  }

  getTrackerVersion() {
    return pkg.version;
  }

  getPlayhead() {
    return this.player.currentTime * 1000;
  }

  getDuration() {
    return this.player.duration * 1000;
  }

  getSrc() {
    if (!this.player || !this.player.source) {
      return null;
    }

    // Handle both array and object formats
    if (this.player.source.sources) {
      if (Array.isArray(this.player.source.sources)) {
        return this.player.source.sources[0]?.src || null;
      } else if (this.player.source.sources.src) {
        return this.player.source.sources.src;
      }
    }

    return null;
  }

  isMuted() {
    return this.player.muted;
  }

  getPlayerVersion() {
    return THEOPlayer.version;
  }

  getRenditionHeight() {
    // Use stored current track for quality information
    if (this.currentTrack && this.currentTrack.activeQuality) {
      return this.currentTrack.activeQuality.height || null;
    }
    // Fallback to video element height
    const video = this.player.element?.querySelector('video');
    return video ? video.videoHeight : null;
  }

  getRenditionWidth() {
    // Use stored current track for quality information
    if (this.currentTrack && this.currentTrack.activeQuality) {
      return this.currentTrack.activeQuality.width || null;
    }
    // Fallback to video element width
    const video = this.player.element?.querySelector('video');
    return video ? video.videoWidth : null;
  }

  getPlayrate() {
    return this.player.playbackRate;
  }

  isAutoplayed() {
    return this.player.autoplay;
  }

  getPreload() {
    return this.player.preload;
  }

  registerListeners() {
    nrvideo.Log.debugCommonVideoEvents(this.player);

    // BIND LISTENER METHODS - preserve 'this' context
    this.onDownload = this.onDownload.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onPlaying = this.onPlaying.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onSeeking = this.onSeeking.bind(this);
    this.onSeeked = this.onSeeked.bind(this);
    this.onError = this.onError.bind(this);
    this.onEnded = this.onEnded.bind(this);
    this.onWaiting = this.onWaiting.bind(this);
    this.onQualityChange = this.onQualityChange.bind(this);
    this.onTrackChange = this.onTrackChange.bind(this);

    
    // Create bound handlers for track-level quality change events
    this.onTrackActiveQualityChange = this.onTrackActiveQualityChange.bind(this);
    this.onTrackUpdateQuality = this.onTrackUpdateQuality.bind(this);

    // Register THEO Player event listeners
    this.player.addEventListener('canplay', this.onDownload);
    this.player.addEventListener('play', this.onPlay);
    this.player.addEventListener('playing', this.onPlaying);
    this.player.addEventListener('pause', this.onPause);
    this.player.addEventListener('seeking', this.onSeeking);
    this.player.addEventListener('seeked', this.onSeeked);
    this.player.addEventListener('error', this.onError);
    this.player.addEventListener('ended', this.onEnded);
    this.player.addEventListener('waiting', this.onWaiting);


    // ---- Listen for track and source changes ----
    // Note: Quality changes are handled at the track level, not player level
    this.player.addEventListener("trackchange", this.onTrackChange);
  
    // Helper function to setup videoTracks listeners
    const setupVideoTracksListeners = () => {
      if (this.player.videoTracks) {
        // Listen for changes on the video tracks collection
        this.player.videoTracks.addEventListener("change", this.onTrackChange);
        
        // Initialize track listeners if a track is already available
        const initialTrack = this.player.videoTracks.length > 0 ? this.player.videoTracks[0] : null;
        if (initialTrack) {
          this.onTrackChange({ track: initialTrack, target: initialTrack });
        }
      }
    };

    // Setup videoTracks listeners - check if videoTracks exists first
    // videoTracks may not be available immediately after player creation
    if (this.player.videoTracks) {
      setupVideoTracksListeners();
    } else {
      // If videoTracks is not available yet, wait for it
      console.warn('[TheoTracker] videoTracks not available yet, will listen after source loads');
      
      // Try to attach listeners after source is loaded
      const attachVideoTracksListeners = () => {
        setupVideoTracksListeners();
        // Remove this one-time listener after attaching
        this.player.removeEventListener('loadedmetadata', attachVideoTracksListeners);
      };
      
      // Listen for loadedmetadata to ensure tracks are available
      this.player.addEventListener('loadedmetadata', attachVideoTracksListeners);
    }
  }

  unregisterListeners() {
    if (!this.player) return;

    // Unregister all event listeners using the bound methods
    this.player.removeEventListener('canplay', this.onDownload);
    this.player.removeEventListener('play', this.onPlay);
    this.player.removeEventListener('playing', this.onPlaying);
    this.player.removeEventListener('pause', this.onPause);
    this.player.removeEventListener('seeking', this.onSeeking);
    this.player.removeEventListener('seeked', this.onSeeked);
    this.player.removeEventListener('error', this.onError);
    this.player.removeEventListener('ended', this.onEnded);
    this.player.removeEventListener('waiting', this.onWaiting);
    
    // Unregister track and source change listeners
    this.player.removeEventListener('trackchange', this.onTrackChange);    
    // Unregister videoTracks listeners if available
    if (this.player.videoTracks) {
      this.player.videoTracks.removeEventListener('change', this.onTrackChange);
    }
    
    // Remove track-level quality change listeners if track exists
    if (this.currentTrack) {
      if (this.trackQualityListeners.activequalitychanged) {
        this.currentTrack.removeEventListener('activequalitychanged', this.trackQualityListeners.activequalitychanged);
      }
      if (this.trackQualityListeners.updatequality) {
        this.currentTrack.removeEventListener('updatequality', this.trackQualityListeners.updatequality);
      }
      this.currentTrack = null;
    }
    
    // Clear listener references
    this.trackQualityListeners = {
      activequalitychanged: null,
      updatequality: null
    };
  }

  onQualityChange(e) {
    // THEO Player activequalitychanged event
    // The event object should contain quality information
    const quality = e.quality || e.target?.activeQuality;
    const track = e.track || (this.player.videoTracks?.length > 0 ? this.player.videoTracks[0] : null);
    const activeQuality = track?.activeQuality || quality;
    
    // Send quality change event to New Relic
    if (activeQuality) {
      // Store current quality for comparison
      this.previousQuality = {
        height: activeQuality.height,
        width: activeQuality.width,
        bandwidth: activeQuality.bandwidth
      };
      this.sendRenditionChanged();
    }
  }

  onTrackChange(e) {
    // Track change event - fired when video track changes
    // Extract current player track
    const currentTrack = e.track || e.target || (this.player.videoTracks?.length > 0 ? this.player.videoTracks[0] : null);
    
    // Remove existing event listeners from previous track if it exists
    if (this.currentTrack && this.currentTrack !== currentTrack) {
      
      // Remove activequalitychanged listener
      if (this.trackQualityListeners.activequalitychanged) {
        this.currentTrack.removeEventListener('activequalitychanged', this.trackQualityListeners.activequalitychanged);
        this.trackQualityListeners.activequalitychanged = null;
      }
      
      // Remove updatequality listener
      if (this.trackQualityListeners.updatequality) {
        this.currentTrack.removeEventListener('updatequality', this.trackQualityListeners.updatequality);
        this.trackQualityListeners.updatequality = null;
      }
      
    }
    
    // Store current track reference
    this.currentTrack = currentTrack;
    
    // Add new event listeners to current track for quality changes
    if (currentTrack) {

      // Listen for active quality changes on the track
      this.trackQualityListeners.activequalitychanged = this.onTrackActiveQualityChange;
      currentTrack.addEventListener('activequalitychanged', this.trackQualityListeners.activequalitychanged);
      
      // Listen for quality updates on the track
      this.trackQualityListeners.updatequality = this.onTrackUpdateQuality;
      currentTrack.addEventListener('updatequality', this.trackQualityListeners.updatequality);
      
      // Update previous quality if active quality is available
      const activeQuality = currentTrack?.activeQuality;
      if (activeQuality) {
        // Check if quality changed
        if (this.previousQuality) {
          const prevHeight = this.previousQuality.height;
          const newHeight = activeQuality.height;
          
          if (prevHeight !== newHeight) {
            this.onQualityChange({ quality: activeQuality, track: currentTrack });
          }
        } else {
          // First quality detected - initialize
        }
        
        // Store current quality for comparison
        this.previousQuality = {
          height: activeQuality.height,
          width: activeQuality.width,
          bandwidth: activeQuality.bandwidth
        };
      }
    }
  }
  
  // Handler for track-level activequalitychanged event
  onTrackActiveQualityChange(e) {
    const quality = e.quality || e.target?.activeQuality || this.currentTrack?.activeQuality;
    if (quality) {
      this.onQualityChange({ quality: quality, track: this.currentTrack });
    }
  }
  
  // Handler for track-level updatequality event
  onTrackUpdateQuality(e) {
    const quality = e.quality || e.target?.activeQuality || this.currentTrack?.activeQuality;
    if (quality) {
      this.onQualityChange({ quality: quality, track: this.currentTrack });
    }
  }

  onDownload(e) {
    this.sendDownload({ state: e.type });
  }

  onPlay() {
    this.sendRequest();
  }

  onPlaying() {
    this.sendBufferEnd();
    this.sendResume();
    this.sendStart();
  }

  onPause() {
    this.sendPause();
  }

  onSeeking() {
    this.sendSeekStart();
  }

  onSeeked() {
    this.sendSeekEnd();
  }

  onError(e) {
    // THEOplayer error event
    const error = this.player.error || e.error || e;
    const errorCode = error.code || error.type;
    const errorMessage = error.message || `Player error ${errorCode || ''}`;    
    this.sendError({ errorCode, errorMessage});
  }

  onEnded() {
    this.sendEnd();
  }

  onWaiting() {
    // THEOplayer waiting event - indicates buffering
    const video = this.player.element?.querySelector('video');
    if (video && video.readyState < 4) { // HAVE_ENOUGH_DATA = 4
      this.sendBufferStart();
    }
  }
}
