import BasePlatform from './base.js';
import fetch from 'node-fetch';
import logger from '../../utils/logger.js';

const BASE_URL = process.env.JIOSAAVN_API_URL || 'https://saavn.sumit.co';

export default class JioSaavnPlatform extends BasePlatform {
    constructor(client) {
        super(client);
        this.name = "JioSaavn";
    }

    async search(query) {
        try {
            // Check if query is already a URL
            if (query.includes('jiosaavn.com')) {
                // TODO: Handle direct link resolution if needed, or search ID
                // For now, treat as search or implement resolving logic
            }

            const response = await fetch(`${BASE_URL}/search/songs?query=${encodeURIComponent(query)}&limit=1`);
            const data = await response.json();

            if (data.success && data.data.results.length > 0) {
                const song = data.data.results[0];
                return this.normalizeSong(song);
            }
            return null;
        } catch (error) {
            logger.error(`[JioSaavn] Search Error: ${error.message}`);
            return null;
        }
    }

    async getStream(song) {
        // song is the normalized object we returned from search
        const streamUrl = this.getHighestQualityUrl(song.raw); // We stored raw data in normalize
        return streamUrl;
    }

    normalizeSong(saavnSong) {
        return {
            name: saavnSong.name,
            url: saavnSong.url, // Page URL
            streamUrl: null, // To be fetched/computed
            duration: saavnSong.duration, // Check if seconds or formatted
            formattedDuration: this.formatDuration(saavnSong.duration),
            thumbnail: saavnSong.image[saavnSong.image.length - 1]?.url,
            artist: saavnSong.artists.primary ? saavnSong.artists.primary.map(a => a.name).join(", ") : "Unknown",
            platform: 'jiosaavn',
            raw: saavnSong
        };
    }

    getHighestQualityUrl(songData) {
        if (!songData || !songData.downloadUrl) return null;
        const sorted = songData.downloadUrl.sort((a, b) => {
            const qualA = parseInt(a.quality);
            const qualB = parseInt(b.quality);
            return qualB - qualA;
        });
        return sorted[0]?.url || null;
    }

    formatDuration(seconds) {
        // Simple formatter
        if (!seconds) return "00:00";
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }
}
