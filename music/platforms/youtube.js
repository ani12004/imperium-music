import BasePlatform from './base.js';
import logger from '../../utils/logger.js';

export default class YouTubePlatform extends BasePlatform {
    constructor(client) {
        super(client);
        this.name = "YouTube";
    }

    async search(query) {
        try {
            // Use DisTube's internal search or just pass through unique identifier
            // DisTube .search returns an array of results
            const results = await this.client.distube.search(query, { limit: 1, type: 'video', safeSearch: false });

            if (results && results.length > 0) {
                return this.normalizeSong(results[0]);
            }
            return null;
        } catch (error) {
            // If No Result
            if (error.code === 'NO_RESULT') return null;
            logger.error(`[YouTube] Search Error: ${error.message}`);
            return null;
        }
    }

    async getStream(song) {
        // For YouTube, DisTube handles the stream generation from the URL
        return song.url;
    }

    normalizeSong(ytSong) {
        return {
            name: ytSong.name,
            url: ytSong.url,
            duration: ytSong.duration,
            formattedDuration: ytSong.formattedDuration,
            thumbnail: ytSong.thumbnail,
            artist: ytSong.uploader ? ytSong.uploader.name : "Unknown",
            platform: 'youtube',
            raw: ytSong
        };
    }
}
