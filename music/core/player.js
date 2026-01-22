import { Collection } from 'discord.js';
import logger from '../../utils/logger.js';
import YouTubePlatform from '../platforms/youtube.js';
import JioSaavnPlatform from '../platforms/jiosaavn.js';
import SpotifyPlatform from '../platforms/spotify.js';
import SoundCloudPlatform from '../platforms/soundcloud.js';
import { QueueManager } from './queue.js';
import { loadMusicEvents } from './events.js';

export class MusicPlayer {
    constructor(client) {
        this.client = client;
        this.platforms = new Collection();
        this.queueManager = new QueueManager(client);

        // Initialize Platforms
        this.registerPlatform('youtube', new YouTubePlatform(client));
        this.registerPlatform('jiosaavn', new JioSaavnPlatform(client));
        this.registerPlatform('spotify', new SpotifyPlatform(client));
        this.registerPlatform('soundcloud', new SoundCloudPlatform(client));

        this.defaultPlatform = 'youtube';

        // Load Events
        loadMusicEvents(client);

        logger.info("[Music System] Initialized v2.0.0.0");
        logger.info("Disclaimer: YouTube is currently the most reliable playback source. Other platforms (Spotify, SoundCloud, JioSaavn) may experience partial support, API limits, or downtime.");
    }

    registerPlatform(name, platformInstance) {
        this.platforms.set(name, platformInstance);
    }

    /**
     * Main entry point to play music
     * @param {Object} message Discord message object
     * @param {string} query Song name or URL
     * @param {string} [platformName] Optional platform override
     */
    async play(message, query, platformName = null) {
        try {
            const voiceChannel = message.member.voice.channel;
            if (!voiceChannel) {
                throw new Error("You must be in a voice channel.");
            }

            // 1. Determine Platform
            let platform = this.defaultPlatform;
            if (platformName && this.platforms.has(platformName.toLowerCase())) {
                platform = platformName.toLowerCase();
            } else if (this.detectUrlPlatform(query)) {
                platform = this.detectUrlPlatform(query);
            }

            const platformHandler = this.platforms.get(platform);
            if (!platformHandler) {
                throw new Error(`Platform '${platform}' is not available.`);
            }

            // 2. Search / Resolve
            logger.info(`[Music] Searching on ${platform}: ${query}`);
            const result = await platformHandler.search(query);

            if (!result) {
                throw new Error(`No results found on ${platform} for: ${query}`);
            }

            // 3. Hand off to Queue/Player
            await this.queueManager.handlePlay(message, voiceChannel, result, platformHandler);

        } catch (error) {
            logger.error(`[MusicPlayer Error] ${error.message}`);
            throw error; // Re-throw to be handled by command
        }
    }

    detectUrlPlatform(query) {
        if (query.includes('youtube.com') || query.includes('youtu.be')) return 'youtube';
        if (query.includes('jiosaavn.com')) return 'jiosaavn';
        if (query.includes('spotify.com')) return 'spotify';
        if (query.includes('soundcloud.com')) return 'soundcloud';
        return null;
    }
}
