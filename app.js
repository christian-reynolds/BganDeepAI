require('dotenv').config()
const { join } = require('path');

// Example posting a local image file (Node.js only):
const fs = require('fs');

const deepai = require('deepai'); // OR include deepai.min.js as a script tag in your HTML

deepai.setApiKey(process.env.DEEPAI);

function rreaddirSync (dir, allFiles = []) {
    const files = fs.readdirSync(dir).map(f => join(dir, f))
    allFiles.push(...files)
    files.forEach(f => {
        fs.statSync(f).isDirectory() && rreaddirSync(f, allFiles)
    })
    return allFiles
}

(async function() {
    let unknown = [];
    let known = [];
    let lowestDistanceFile;
    let lowestDistance = 100;

    // get all the unknown files
    rreaddirSync("./images-unknown", unknown);

    // create an array of the known files
    rreaddirSync("./images-known", known);

    // loop thru the known files to look for a match with the unknown file
    for (let i = 0; i < known.length; i++) {
        try {
            var resp = await deepai.callStandardApi("image-similarity", {
                image1: fs.createReadStream(known[i]),
                image2: fs.createReadStream(unknown[0]),
            });

            if (resp.output.distance < lowestDistance) {
                // set the distance to the new lowest value
                lowestDistance = resp.output.distance;
                // save the image associated with that distance
                lowestDistanceFile = known[i];
            }
        } catch (error) {
            console.log('error: ', error);
        }

        // if (i === 10250) {
        //     break;
        // }
    }

    console.log('unknown: ', unknown[0]);
    console.log('lowestDistance: ', lowestDistance);
    console.log('lowestDistanceFile: ', lowestDistanceFile);
    
    // var resp = await deepai.callStandardApi("image-similarity", {
    //         image1: fs.createReadStream("./images-known/1072.webp"),
    //         // image2: fs.createReadStream("./images-unknown/generated-02-23-2021_12-36-21-17-ema.png"),
    //         image2: fs.createReadStream("./images-unknown/generated-02-23-2021_12-36-21-18.png"),
    //         // image2: fs.createReadStream("./images-unknown/1072.png"),
    // });
    // console.log(resp);
})()