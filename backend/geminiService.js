const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Readable } = require('stream');

// Initialize the Gemini AI model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const generativeModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

/**
 * Converts a readable stream into a single buffer.
 * @param {Readable} stream The readable stream to convert.
 * @returns {Promise<Buffer>} A promise that resolves with the complete buffer.
 */
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}


/**
 * Summarizes an audio stream using the Gemini API.
 * @param {Readable} audioStream The readable audio stream.
 * @param {string} videoTitle The title of the video for context.
 * @returns {Promise<string>} A promise that resolves with the summary text.
 */
async function summarizeAudioStream(audioStream, videoTitle) {
  try {
    const audioBuffer = await streamToBuffer(audioStream);

    const audioPart = {
      inlineData: {
        data: audioBuffer.toString('base64'),
        mimeType: 'audio/mp4', // ytdl-core often provides mp4 container with audio
      },
    };

    const prompt = `You are a financial and economic expert. The following audio is from a YouTube video titled "${videoTitle}". Please listen to the audio and provide a detailed, structured summary. Focus on the key economic insights, market analysis, investment opinions, and any specific advice given.`;

    const result = await generativeModel.generateContent([prompt, audioPart]);
    const response = result.response;
    const summary = response.text();
    
    return summary;

  } catch (error) {
    console.error('Error during Gemini API call:', error);
    // Check for specific safety-related errors
    if (error.response && error.response.promptFeedback) {
      console.error('Prompt feedback:', error.response.promptFeedback);
    }
    return `Error summarizing audio for video "${videoTitle}".`;
  }
}

module.exports = { summarizeAudioStream };
