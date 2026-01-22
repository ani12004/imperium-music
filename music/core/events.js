import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import emojis from "../../utils/emojis.js";
import logger from "../../utils/logger.js";

export function loadMusicEvents(client) {
    client.distube
        .on("playSong", (queue, song) => {
            const embed = new EmbedBuilder()
                .setColor("#00ff00")
                .setDescription(`${emojis.SUCCESS || "🎶"} | Playing **[${song.name}](${song.url})** - \`${song.formattedDuration}\`\nRequested by: ${song.user}`)
                .setThumbnail(song.thumbnail)
                .addFields({
                    name: '⚠️ Important Notice',
                    value: 'YouTube is currently the **most reliable playback source**. Other platforms (Spotify, SoundCloud, JioSaavn) may experience **partial support, API limits, or downtime** depending on availability and third-party restrictions.'
                });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('music_prev').setEmoji('⏮️').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('music_pause').setEmoji('⏯️').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('music_stop').setEmoji('⏹️').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId('music_skip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('music_loop').setEmoji('🔁').setStyle(ButtonStyle.Secondary)
                );

            queue.textChannel.send({ embeds: [embed], components: [row] }).catch(err => logger.error(`Distube Error: ${err}`));
        })
        .on("addSong", (queue, song) => {
            const embed = new EmbedBuilder()
                .setColor("#00ff00")
                .setDescription(`${emojis.SUCCESS || "✅"} | Added **[${song.name}](${song.url})** - \`${song.formattedDuration}\` to the queue\nRequested by: ${song.user}`)
                .setThumbnail(song.thumbnail);

            queue.textChannel.send({ embeds: [embed] }).catch(err => logger.error(`Distube Error: ${err}`));
        })
        .on("addList", (queue, playlist) => {
            const embed = new EmbedBuilder()
                .setColor("#00ff00")
                .setDescription(`${emojis.SUCCESS || "✅"} | Added **${playlist.name}** playlist (${playlist.songs.length} songs) to queue\nRequested by: ${playlist.user}`);

            queue.textChannel.send({ embeds: [embed] }).catch(err => logger.error(`Distube Error: ${err}`));
        })
        .on("error", (error, queue) => {
            logger.error(`Distube Error: ${error}`);
            if (queue && queue.textChannel) {
                // Formatting error message for user
                let errorMsg = error.toString();
                if (errorMsg.includes("NO_RESULT")) errorMsg = "No results found.";

                const embed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setDescription(`${emojis.ERROR || "❌"} | Music System Error: ${errorMsg.slice(0, 1000)}`);

                queue.textChannel.send({ embeds: [embed] }).catch(err => logger.error(`Distube Send Error: ${err}`));
            }
        })
        .on("empty", (queue) => {
            queue.textChannel.send(`${emojis.ERROR || "⚠️"} | Voice channel is empty! Leaving the channel...`).catch(err => logger.error(`Distube Error: ${err}`));
        })
        .on("searchNoResult", (message, query) => {
            message.channel.send(`${emojis.ERROR || "❌"} | No result found for \`${query}\`!`).catch(err => logger.error(`Distube Error: ${err}`));
        })
        .on("finish", (queue) => {
            queue.textChannel.send(`${emojis.SUCCESS || "🏁"} | Queue finished!`).catch(err => logger.error(`Distube Error: ${err}`));
        });

    logger.info("Music events loaded (v2.0.0.0).");
}
