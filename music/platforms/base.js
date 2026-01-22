/**
 * Base Platform Class
 * All music platforms must extend this class and implement its methods.
 */
export default class BasePlatform {
    constructor(client) {
        this.client = client;
        this.name = "Abstract";
    }

    /**
     * Search for a song or return metadata
     * @param {string} query
     * @returns {Promise<Object>} { name, url, duration, artist, thumbnail, platform }
     */
    async search(query) {
        throw new Error("Method 'search' must be implemented.");
    }

    /**
     * Get a playable stream or url
     * @param {Object} song
     * @returns {Promise<string>} Stream URL or Direct string
     */
    async getStream(song) {
        throw new Error("Method 'getStream' must be implemented.");
    }

    /**
     * Get track metadata from a URL (if supported)
     * @param {string} url
     * @returns {Promise<Object|null>}
     */
    async resolveUrl(url) {
        return null; // Default: let search handle it or return null
    }

    getPlatformName() {
        return this.name;
    }
}
