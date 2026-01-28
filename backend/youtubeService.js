const { google } = require('googleapis');

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

/**
 * Gets the channel ID for a given YouTube handle (e.g., @channelname).
 * @param {string} handle The YouTube handle.
 * @returns {Promise<string|null>} The channel ID or null if not found.
 */
async function getChannelIdByHandle(handle) {
  try {
    const response = await youtube.search.list({
      part: 'snippet',
      q: handle,
      type: 'channel',
      maxResults: 1,
    });

    if (response.data.items && response.data.items.length > 0) {
      // Check if the found channel title or custom URL matches the handle closely.
      // The search can be imprecise.
      const foundChannel = response.data.items[0];
      if (foundChannel.snippet.customUrl === handle || foundChannel.snippet.title.includes(handle.replace('@',''))) {
        return foundChannel.snippet.channelId;
      }
    }
    console.error(`Could not find a confident match for handle: ${handle}`);
    return null;
  } catch (error) {
    console.error(`Error fetching channel ID for handle ${handle}:`, error.message);
    return null;
  }
}

/**
 * Gets the latest video ID from a given channel ID.
 * @param {string} channelId The YouTube channel ID.
 * @returns {Promise<string|null>} The latest video ID or null if not found.
 */
async function getLatestVideoId(channelId) {
  if (!channelId) return null;
  try {
    const response = await youtube.search.list({
      part: 'id',
      channelId: channelId,
      order: 'date',
      maxResults: 1,
      type: 'video',
    });

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0].id.videoId;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching latest video for channel ${channelId}:`, error.message);
    return null;
  }
}

module.exports = { getChannelIdByHandle, getLatestVideoId };
