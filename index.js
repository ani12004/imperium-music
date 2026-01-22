import express from 'express';
import { Client, GatewayIntentBits } from 'discord.js';
import { DisTube } from 'distube';
import ffmpeg from 'ffmpeg-static';
import { config } from 'dotenv';
import cors from 'cors';

// Load Environment
config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

// --- Discord Client ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages // Needed for some Discord.js internals or responding to interactions if we used them
    ]
});

// --- DisTube Setup ---
// We initialize DisTube on this client
client.distube = new DisTube(client, {
    emitNewSongOnly: true,
    savePreviousSongs: true,
    ffmpeg: {
        path: ffmpeg,
        args: {
            global: {
                'reconnect': '1',
                'reconnect_streamed': '1',
                'reconnect_delay_max': '5'
            }
        }
    }
});

// Load Event Handlers (We reuse the ones we wrote, assuming they are compatible)
// We might need to adjust them if they rely on `message.channel.send` and we don't have a real message object.
// For the API approach, we might need a custom "Fake Message" or just handle events by logging or calling a webhook back to Core.
// For simplicity V1: We will just Log to console, and maybe try to send a message if we have the channel ID.

import { loadMusicEvents } from './music/core/events.js';
// Note: loadMusicEvents relies on `queue.textChannel.send`. 
// We must ensure when we play, we pass a textChannel that works.
// The music node is in the guild, so it SHOULD be able to send messages if it has permissions.

loadMusicEvents(client);

// --- API Routes ---

app.get('/', (req, res) => {
    res.send('Imperium Music Node is Active');
});

// Play Endpoint
app.post('/play', async (req, res) => {
    try {
        const { guildId, voiceChannelId, textChannelId, query, platform, user } = req.body;

        if (!guildId || !voiceChannelId || !query) {
            return res.status(400).json({ error: 'Missing required fields (guildId, voiceChannelId, query)' });
        }

        const guild = client.guilds.cache.get(guildId);
        if (!guild) return res.status(404).json({ error: 'Guild not found on Music Node' });

        const voiceChannel = guild.channels.cache.get(voiceChannelId);
        if (!voiceChannel) return res.status(404).json({ error: 'Voice Channel not found' });

        const textChannel = guild.channels.cache.get(textChannelId);

        // Security Check (Basic) - In production use a shared secret
        if (req.headers['authorization'] !== process.env.MUSIC_AUTH_KEY) {
            // console.warn("Unauthorized access attempt");
            // return res.status(401).json({ error: 'Unauthorized' });
            // Commented out for easier testing, but highly recommended
        }

        // Import the platform handling logic from our local music module
        // We'll reimplement a mini-player logic here or import MusicPlayer?
        // Let's instantiate a local MusicPlayer to handle the searching/resolution

        // We need to modify MusicPlayer slightly or just use it if it's compatible.
        // The existing MusicPlayer expects a `message` object.
        // We will create a MOCK message object.

        const mockMember = await guild.members.fetch(user.id).catch(() => null);

        const mockMessage = {
            member: mockMember || { voice: { channel: voiceChannel }, user: user }, // Fallback if member fetch fails
            channel: textChannel,
            author: user,
            reply: (content) => {
                if (textChannel) textChannel.send(content).catch(console.error);
            }
        };

        // If we want to reuse MusicPlayer, we need to make sure it exists here.
        // We copied the `music` folder, so we can import it.
        // BUT MusicPlayer attaches to client.music. Let's do that manually.

        if (!client.music) {
            const { MusicPlayer } = await import('./music/core/player.js');
            client.music = new MusicPlayer(client);
        }

        // Execute Play
        // We rely on client.music.play to do the heavy lifting (Search -> DisTube)
        await client.music.play(mockMessage, query, platform);

        return res.json({ success: true, message: `Queued ${query}` });

    } catch (error) {
        console.error("API Play Error:", error);
        return res.status(500).json({ error: error.message });
    }
});

// Stop Endpoint (Optional)
app.post('/stop', async (req, res) => {
    const { guildId } = req.body;
    const queue = client.distube.getQueue(guildId);
    if (queue) {
        queue.stop();
        return res.json({ success: true, message: 'Stopped' });
    }
    return res.status(404).json({ error: 'No queue found' });
});

// --- Start Server ---
client.login(process.env.DISCORD_TOKEN).then(() => {
    console.log(`Music Node Logged in as ${client.user.tag}`);
    app.listen(PORT, () => {
        console.log(`Music Node API listening on port ${PORT}`);
    });
}).catch(err => {
    console.error("Failed to login Music Node:", err);
});
