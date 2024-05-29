const express = require("express");
const router = express.Router();
const YoutubeData = require("../models/youtubedata.js");
const axios = require("axios");


// Define a route to render the EJS template
router.get("/", async (req, res) => {
    try {
        
        // Retrieve video IDs from MongoDB
        const videoIds1 = await YoutubeData.find({});
        // console.log(videoIds1)
        const videoIds = await YoutubeData.find({}, { videoId: 1, _id: 0 });
        const videoIdsArray = videoIds.map(item => item.videoId);
        let allVideos = await YoutubeData.find({});
        // allVideos.forEach(video => console.log(video._id));
        // Log video IDs to console
        // console.log("Video IDs:", videoIdsArray);

        // Render the EJS template with videoIdsArray
        res.render("videos", { videoIds: videoIdsArray ,allVideos});
    } catch (error) {
        console.error("Failed to fetch video IDs:", error);
        res.status(500).send("Failed to retrieve data");
    }
});

router.get("/:id", async (req, res) => {
    try {
        let { id } = req.params;
        // console.log(id);
        let sourceId = await YoutubeData.findById(id).populate("comments");
        let videoSourceId = sourceId.videoId;
        let videoTitle = sourceId.title;
// console.log(sourceId)
        // Define summarydata outside the function
        let summarydata;

        // gemini part
        async function generateContent(videoTitle) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCY8FJ08zy8LarhILNMg_Wn3E_nBFCbpws`;
                const response = await axios.post(url, {
                    contents: [{ parts: [{ text: `Summary for video with title in 150 words ${videoTitle}` }] }],
                });

                summarydata = response.data.candidates[0].content.parts[0].text;
            } catch (error) {
                console.error('Error:', error.message);
                // Handle errors here
                summarydata = 'Summary not available';
            }
        }

        // Example usage:
        await generateContent(videoTitle); // Wait for the function to complete

        //Dashboard
        let promise = fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails%2Cstatistics%2Csnippet%2Cstatus&id=${videoSourceId}&key=AIzaSyB-_y-FEBaFBrdzBQb6XShBWsBtbK0LsaE`);

        promise.then((response) => {
            return response.json();
        }).then((data) => {
            let viewCount = data.items[0].statistics.viewCount;
            let likeCount = data.items[0].statistics.likeCount;
            let favoriteCount = data.items[0].statistics.favoriteCount;
            let commentCount = data.items[0].statistics.commentCount;

            res.render("new.ejs", { videoSourceId, sourceId, summarydata, viewCount, likeCount, favoriteCount, commentCount });
        }).catch((error) => {
            console.error('Error:', error.message);
            res.status(500).send('Internal Server Error');
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;