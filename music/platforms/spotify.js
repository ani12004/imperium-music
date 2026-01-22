import BasePlatform from './base.js';
import logger from '../../utils/logger.js';

export default class SpotifyPlatform extends BasePlatform {
    constructor(client) {
        super(client);
        this.name = "Spotify";
    }

    async search(query) {
        try {
            // DisTube has a Spotify plugin, but we want to avoid direct playback issues.
            // However, we can use it to resolve the URL to metadata if the plugin is loaded,
            // or we might need to rely on a different search if the plugin isn't active.
            // Assuming we configured DisTube with SpotifyPlugin in index.js (we need to uncomment it or re-add it)

            // If the query is a URL, DisTube's plugin might handle it.
            // But here we want to return our normalized object.

            // Since we cautioned against direct Spotify playback, we will treat this 
            // strictly as a metadata source.

            // NOTE: Without a standalone Spotify library, using DisTube's plugin for *search* is tricky 
            // if we don't want it to auto-play.

            // Fallback: If it's a spotify URL, we try to get metadata.
            // If it's a text search "song name spotify", we might just search YouTube for that text.

            // For now, let's implement a 'search on YouTube using query' as a safe default
            // effectively making "Spotify" just a label if we don't have a real spotify client here.

            // BUT, the user asked for "User-Selectable Music Source".
            // If they modify `index.js` to enable SpotifyPlugin, DisTube handles it.
            // The instructions say: "Spotify should be used for Search, Metadata / Track matching (fallback to YouTube/JioSaavn)".

            // For this implementation, I will simulate a "Search" by assuming the user might provide a URL,
            // or if a text search, we append "audio" to it and search YouTube, but label it Spotify? No that's misleading.

            // Better approach: Search YouTube for "Query + Audio" and return that, 
            // flagging that we are using a fallback.

            // If we strictly obey "Spotify Platform", we need to fetch from Spotify.
            // I'll assume for now we don't have a spotify client unless I add `spotify-web-api-node`.
            // I'll check package.json in the next step. If it's missing, I'll rely on DisTube or warn.

            // Temporary Placeholder Implementation that falls back to YouTube with a note
            // because currently we don't have a direct Spotify searcher without the plugin fully active/exposed.

            const results = await this.client.distube.search(query, { limit: 1 });
            if (results && results.length > 0) {
                const song = results[0];
                return {
                    ...this.normalizeSong(song),
                    platform: 'spotify-fallback' // Indicate this isn't native spotify
                };
            }
            return null;

        } catch (error) {
            logger.error(`[Spotify] Search Error: ${error.message}`);
            return null;
        }
    }

    async getStream(song) {
        return song.url;
    }

    normalizeSong(song) {
        return {
            name: song.name,
            url: song.url,
            duration: song.duration,
            formattedDuration: song.formattedDuration,
            thumbnail: song.thumbnail,
            artist: song.uploader.name,
            platform: 'spotify',
            raw: song
        };
    }
}
