import logger from '../../utils/logger.js';
import emojis from '../../utils/emojis.js';

export class QueueManager {
    constructor(client) {
        this.client = client;
    }

    /**
     * Handle adding a track to the queue and playing it
     * @param {Object} message 
     * @param {Object} voiceChannel 
     * @param {Object} trackData Normalized track object
     * @param {Object} platformHandler 
     */
    async handlePlay(message, voiceChannel, trackData, platformHandler) {
        try {
            // DisTube can handle:
            // 1. URL (YouTube, SoundCloud if plugin enabled, or direct wrapper)
            // 2. Song Object (if constructed manually, but easier to pass URL)

            // If the platform returned a custom stream URL (e.g. JioSaavn direct link)
            // We pass that to DisTube.

            // If platform is YouTube, trackData.url is the video URL.
            // If platform is JioSaavn, trackData.streamUrl might be the direct audio file.

            let playArg;
            let options = {
                member: message.member,
                textChannel: message.channel,
                message: message,
                metadata: {
                    ...trackData,
                    platform: platformHandler.name,
                    requestedBy: message.author
                }
            };

            if (trackData.streamUrl) {
                // Direct stream (JioSaavn)
                playArg = trackData.streamUrl;
            } else if (trackData.url) {
                // Public URL (YouTube)
                playArg = trackData.url;
            } else {
                throw new Error("Invalid track data: No URL or Stream found.");
            }

            logger.info(`[Queue] Adding to queue: ${trackData.name} (${playArg})`);

            await this.client.distube.play(voiceChannel, playArg, options);

        } catch (error) {
            logger.error(`[QueueManager] Play Error: ${error.message}`);
            throw error;
        }
    }
}
