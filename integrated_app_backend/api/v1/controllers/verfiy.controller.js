const ffmpeg = require('fluent-ffmpeg');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

module.exports = {

  verifyRTSPUrl: function(req,res) {
    const streamUrl = req.body.url; // Replace with your RTSP stream URL
    const randomBytes = crypto.randomBytes(3);
    const base64String = randomBytes.toString('base64');
    const uniqueString = base64String.slice(0, 6);
    const outputFilename = `${uniqueString}.jpg`; // Output filename for the first frame
    ffmpeg(streamUrl)
      .output(`public/images/${outputFilename}`)
      .seekOutput(0)
      .frames(1)
      .on('end', () => {
        const imagePath = path.join('public/images', outputFilename);
        ffmpeg.ffprobe(imagePath, (err, metadata) => {
          if (err) {
            console.error(err);
            return res.status(500).send({ isValidUrl: false, error: 'Failed to get image metadata' });
          }
          const width = metadata.streams[0].width;
          const height = metadata.streams[0].height;
         
          const imageData = fs.readFileSync(imagePath);
          const base64Img = Buffer.from(imageData).toString('base64');
          res.send({
            isValidUrl: true,
            imgUrl: base64Img,
            resolution: {
              width: width,
              height: height
            }
          });
        });
      })
      .on('error', (err) => {
        console.error(err);
        res.status(200).send({ isValidUrl: false});
      })
      .run();
  },

  verifyHTTPUrl: function(req, res){
    const videoUrl = 'http://admin:Bharat1947@122.160.201.198:8100/wmf/index.html'; // Replace with your HTTP video URL
    const outputFilename = 'http_frame.jpg'; // Output filename for the first frame
    ffmpeg(videoUrl)
      .output(outputFilename)
      .seekOutput(0)
      .frames(1)
      .on('end', () => {
        res.sendFile(outputFilename, { root: __dirname });
        res.send('True');
      })
      .on('error', (err) => {
        console.error(err);
        res.status(500).send('False');
      })
      .run();
  }
}