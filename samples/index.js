// THEO Player License Key
const LICENSE = 'sZP7IYe6T6PzdQ4qWQgoImkeIDkqf6i6Ct4LUQj-IYPydDa6T6PzdQ4qWQgoImkeIDkqf6i6Io4pIYP1UQgqWgjeCYxgflEc3L0k0uf_0L5_3LfZFOPgswANbKXzdDjpYox1UQh6TlBt3lbc0LeZ0u5i0u5VfKxqWDXNWG3ybQXGImf9DZPeIDkqFGxEID2pWQgoImPUFOPeWok1dDrLYt3qUYPlImf9DZfJfgzVfG3edt06TgV6dwx-Wuh6Ymi6bo4pIXjNWYAZIY3LdDjpflNzbG4gFOPKIDXzUYPgbZf9DZPEIY3ifgkj';

// Sample video URLs for testing
// Educational/Sports test streams:
// - https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8 (Big Buck Bunny - Educational)
// - https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8 (Apple HLS Test)
// - https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8 (Tears of Steel)
// - https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8 (Live test stream)

let player = null;
let tracker = null;
// Get URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        channel: params.get('channel'),
        distribution: params.get('distribution'),
        video: params.get('video'), // For regular video URLs
        externalSessionId: params.get('externalSessionId')
    };
}

// Wait for THEOplayer to be available
function waitForTHEOplayer(callback) {
    if (typeof THEOplayer !== 'undefined') {
        callback();
    } else {
        setTimeout(function() {
            waitForTHEOplayer(callback);
        }, 100);
    }
}

// Initialize player
function initPlayer() {
    const params = getUrlParams();
    // Check if we're using a regular video URL or THEO Live
    const isRegularVideo = !!params.video;
    const isTHEOLive = !!(params.channel || params.distribution);
    // Default to sample educational video if none specified
    if (!isRegularVideo && !isTHEOLive) {
        // Use a sample educational video stream (HLS)
        window.location.search = '?video=https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
        return;
    }
    const playerElement = document.getElementById('player-container');
    if (!playerElement) {
        console.error('Player container not found');
        return;
    }

    // Initialize THEO Player using the global THEOplayer object from CDN
    // This works without npm - THEOplayer is available globally after the script loads
    const playerConfig = {
        license: LICENSE,
        libraryLocation: 'https://cdn.theoplayer.com/dash/theoplayer/',
        mutedAutoplay: 'all',
        ui: {
            fluid: true
        }
    };
    // Only add THEO Live config if using THEO Live (not regular video)
    if (isTHEOLive) {
        // Determine discovery URLs based on whether it's a distribution or channel
        const isDistribution = !!parms.distribution;
        const discoveryUrls = isDistribution
            ? [
                'https://discovery.theo.live/v2/distributions/',
                'https://discovery.sneezysparrow.com/v2/distributions/'
              ]
            : [
                'https://discovery.theo.live/channels/',
                'https://discovery.sneezysparrow.com/channels/'
              ];

        playerConfig.theoLive = {
            discoveryUrls: discoveryUrls,
            externalSessionId: params.externalSessionId || undefined
        };
    }

    try {
        player = new THEOplayer.Player(playerElement, playerConfig);
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        throw error; // Re-throw to be caught by outer handler
    }

    // Set autoplay and muted
    player.autoplay = true;
    player.muted = true;

    // Expose player globally for debugging
    window.player = player;

    // Add error handling
    setupErrorHandling();

    // Set the source based on type
    if (isRegularVideo) {
        // Regular video URL (HLS, DASH, MP4, etc.)
        const videoUrl = decodeURIComponent(params.video);
        const videoType = detectVideoType(videoUrl);
        player.source = {
            sources: [{
                src: videoUrl,
                type: videoType
            }]
        };
        // Extract video name from URL or use default
        const videoName = extractVideoName(videoUrl);
        document.getElementById('channel-name').textContent = videoName;
        document.title = videoName + ' - THEO Player Demo';

    } else if (isTHEOLive) {
        // THEO Live channel or distribution
        const src = params.distribution || params.channel;
        
        if (src) {
        
            // Set the source with THEO Live type (matching demo.html format)
            try {
                player.source = {
                    sources: {
                        src: src,
                        type: 'theolive'
                    }
                };
            } catch (error) {
                const channelNameEl = document.getElementById('channel-name');
                if (channelNameEl) {
                    channelNameEl.textContent = 'Error: Failed to set source';
                    channelNameEl.style.color = '#ff6b6b';
                }
            }
        }

        // Listen for publication loaded event to get channel name
        if (player.theoLive) {
            player.theoLive.addEventListener('publicationloaded', function(event) {
                const channelName = event.channelName || 'THEO Live Stream';
                document.getElementById('channel-name').textContent = channelName;
                document.title = channelName + ' - THEO Live Demo';
            });

            // Listen for publication errors
            player.theoLive.addEventListener('publicationerror', function(event) {
                const channelNameEl = document.getElementById('channel-name');
                if (channelNameEl) {
                    channelNameEl.textContent = 'Error: Failed to load publication. Channel may not be available.';
                    channelNameEl.style.color = '#ff6b6b';
                }
            });

            // Listen for discovery errors
            player.theoLive.addEventListener('error', function(event) {
                console.error('THEO Live discovery error:', event);
                const channelNameEl = document.getElementById('channel-name');
                if (channelNameEl) {
                    channelNameEl.textContent = 'Error: Failed to discover channel. Please check if the channel ID is correct.';
                    channelNameEl.style.color = '#ff6b6b';
                }
            });
        } else {
            console.warn('THEO Live API not available. Make sure theoLive config is set correctly.');
        }
    }

    // Start updating stats
    updateStats();
    const options = {
        info: {
          beacon: '',
          licenseKey: '',
          applicationID: '',
        },
      };
    try {
        tracker = new TheoTracker(player, options);
    } catch (error) {
        console.error('waitForTHEOplayer - Error initializing tracker:', error);
    }
}

// Detect video type from URL
function detectVideoType(url) {
    if (url.includes('.m3u8')) {
        return 'application/x-mpegurl'; // HLS
    } else if (url.includes('.mpd')) {
        return 'application/dash+xml'; // DASH
    } else if (url.includes('.mp4') || url.includes('.m4v')) {
        return 'video/mp4';
    } else if (url.includes('.webm')) {
        return 'video/webm';
    }
    // Default to HLS if uncertain
    return 'application/x-mpegurl';
}

// Extract a readable name from video URL
function extractVideoName(url) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const filename = pathname.split('/').pop() || 'Educational Video';
        return decodeURIComponent(filename.split('.')[0] || 'Educational Video');
    } catch (e) {
        return 'Educational Video';
    }
}

// Setup error handling for the player
function setupErrorHandling() {
    if (!player) return;

    // Handle general player errors
    player.addEventListener('error', function(event) {
        const error = player.error || event.error;
        let errorMessage = 'An error occurred while loading the stream.';
        let errorDetails = '';

        if (error) {
            errorMessage = error.message || errorMessage;
            errorDetails = `Error Code: ${error.code || error.type || 'Unknown'}`;
            
            // Log full error details to console for debugging
            console.error('THEO Player Error:', {
                code: error.code,
                type: error.type,
                message: error.message,
                error: error
            });
        } else {
            console.error('THEO Player Error Event:', event);
        }

        // Update UI to show error
        const channelNameEl = document.getElementById('channel-name');
        if (channelNameEl) {
            channelNameEl.textContent = 'Error: ' + errorMessage;
            channelNameEl.style.color = '#ff6b6b';
        }

        // Show error in console
        console.error('Stream Error:', errorMessage, errorDetails);
    });

    // Handle THEO Live specific errors (if not already handled in initPlayer)
    if (player.theoLive) {
        // Note: Error handlers are also set in initPlayer() for better context
        // This is a fallback for errors that occur after initialization
        player.theoLive.addEventListener('error', function(event) {
            const error = event.error || event;
            const errorMessage = error.message || 'THEO Live stream error occurred.';
            const errorCode = error.code || error.type || 'Unknown';

            console.error('THEO Live Error (fallback handler):', {
                code: errorCode,
                message: errorMessage,
                error: error,
                event: event
            });

            // Update UI to show error
            const channelNameEl = document.getElementById('channel-name');
            if (channelNameEl && !channelNameEl.textContent.includes('Error:')) {
                channelNameEl.textContent = 'THEO Live Error: ' + errorMessage;
                channelNameEl.style.color = '#ff6b6b';
            }

            // Log manifest URL if available
            if (error.url || error.source) {
                console.error('Failed URL:', error.url || error.source);
            }
        });
    }

    // Handle source change errors
    player.addEventListener('sourcechange', function(event) {
        // Reset error styling when source changes
        const channelNameEl = document.getElementById('channel-name');
        if (channelNameEl) {
            channelNameEl.style.color = '';
        }
    });
}

// Update player statistics
function updateStats() {
    const intervalId = setInterval(function() {
        if (!player) {
            clearInterval(intervalId);
            return;
        }

        const video = document.querySelector('video');
        if (!video || !player) {
            return;
        }

        // Update playback rate
        const playbackRate = video.playbackRate;
        document.getElementById('playback-rate').textContent = playbackRate.toFixed(2);

        // Update dimensions
        const dimensions = video.clientWidth + ' x ' + video.clientHeight;
        document.getElementById('dimensions').textContent = dimensions;

        // Update latency information if available
        if (player.hesp && player.hesp.latencies) {
            const latencies = player.hesp.latencies;
            
            const engineLatency = latencies.engine !== undefined 
                ? Math.round(latencies.engine * 1000) 
                : 0;
            document.getElementById('engine-latency').textContent = engineLatency + ' ms';

            const distributionLatency = latencies.distribution !== undefined 
                ? Math.round(latencies.distribution * 1000) 
                : 0;
            document.getElementById('distribution-latency').textContent = distributionLatency + ' ms';

            const playerLatency = latencies.player !== undefined 
                ? Math.round(latencies.player * 1000) 
                : 0;
            document.getElementById('player-latency').textContent = playerLatency + ' ms';
        }

        // Update target latency if available
        if (player.latency && player.latency.currentConfiguration) {
            const targetLatency = Math.round(player.latency.currentConfiguration.targetOffset * 1000);
            document.getElementById('target-latency').textContent = targetLatency + ' ms';
        }

        // Update quality if available
        if (player.videoTracks && player.videoTracks.length > 0) {
            const activeTrack = player.videoTracks[0];
            const quality = activeTrack.activeQuality ? activeTrack.activeQuality.id : 'N/A';
            document.getElementById('quality').textContent = quality;
        }
    }, 100);
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (player) {
        player.destroy();
        player = null;
    }
});

// Wait for THEOplayer to load, then initialize
waitForTHEOplayer(function() {
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlayer);
    } else {
        try {
            initPlayer();
        } catch (error) {
            console.error('waitForTHEOplayer - Error in initPlayer:', error);
            console.error('Error stack:', error.stack);
            throw error; // Re-throw to see it in console
        }
    }
});

