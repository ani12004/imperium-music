import BasePlatform from './base.js';
import logger from '../../utils/logger.js';

export default class SoundCloudPlatform extends BasePlatform {
    constructor(client) {
        super(client);
        this.name = "SoundCloud";
    }

    async search(query) {
        try {
            // Using DisTube search since it supports SoundCloud
            // We can specify type/source if available in search options, but DisTube usually auto-detects or searches YT by default.
            // To force SoundCloud search via DisTube is not directly exposed in .search() simple API 
            // unless we use the plugin's search method if accessible.

            // Simple fallback: Search YT with "SoundCloud" in query? No.
            // If the user selects SoundCloud, we want actual SoundCloud.
            // I will implement a basic "Not Implemented / Fallback" for now unless I see `soundcloud-plugin` usage.

            return null;
        } catch (error) {
            return null;
        }
    }

    async getStream(song) {
        return null;
    }
}
