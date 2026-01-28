require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const { getChannelIdByHandle, getLatestVideoId } = require('./youtubeService');
const { summarizeAudioStream } = require('./geminiService');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Hardcoded list of channel handles
const CHANNEL_HANDLES = [
    '@moneymoneycomics',
    '@%EA%B9%80%EB%8B%A8%ED%85%8C', // 김단테
    '@syukaworld',
    '@sosumonkey',
    '@kpunch', // 박종훈의 지식한방
    '@lucky_tv' // 김작가 tv
];

// A simple test route
app.get('/', (req, res) => {
  res.send('Hello from the YouTube analysis backend!');
});

// The main analysis endpoint
app.get('/api/analyze', async (req, res) => {
    console.log('Analysis request received.');
    res.setHeader('Content-Type', 'application/json');

    try {
        // Step 1: Get latest video ID for each channel handle
        const videoInfos = [];
        for (const handle of CHANNEL_HANDLES) {
            const decodedHandle = decodeURIComponent(handle);
            console.log(`Processing channel: ${decodedHandle}`);
            const channelId = await getChannelIdByHandle(handle);
            if (channelId) {
                const videoId = await getLatestVideoId(channelId);
                if (videoId) {
                    // Fetch video info to get the title
                    const info = await ytdl.getInfo(videoId);
                    videoInfos.push({
                        videoId: videoId,
                        videoTitle: info.videoDetails.title,
                        channelTitle: info.videoDetails.author.name
                    });
                    console.log(`Found latest video: ${info.videoDetails.title}`);
                }
            }
        }

        if (videoInfos.length === 0) {
            return res.status(500).json({ error: 'Could not find any videos from the specified channels.' });
        }

        // Step 2: Summarize each video's audio
        const summaries = await Promise.all(
            videoInfos.map(async (info) => {
                console.log(`Summarizing: ${info.videoTitle}`);
                const audioStream = ytdl(info.videoId, { 
                    filter: 'audioonly',
                    quality: 'lowestaudio' // Use lowest quality for faster processing
                });
                
                const summary = await summarizeAudioStream(audioStream, info.videoTitle);
                
                console.log(`Finished summary for: ${info.videoTitle}`);
                return {
                    videoTitle: info.videoTitle,
                    channelTitle: info.channelTitle,
                    videoId: info.videoId,
                    summary: summary,
                };
            })
        );
        
        // For now, we return the individual summaries.
        // The meta-analysis will be the next step.
        console.log('All summaries completed.');
        res.status(200).json({ summaries });

    } catch (error) {
        console.error('An error occurred during the analysis process:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
