const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/process', upload.single('input_file'), (req, res) => {
    const inputFile = req.file.path;
    const outputFileName = req.body.output_file_name;
    const outputFormats = JSON.parse(req.body.output_formats);
    const outputDir = path.join(__dirname, 'outputs');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const processFile = (format, callback) => {
        const outputFilePath = path.join(outputDir, `${outputFileName}.${format}`);
        ffmpeg(inputFile)
            .output(outputFilePath)
            .on('end', () => {
                callback();
            })
            .on('error', (err) => {
                callback(err);
            })
            .run();
    };

    const processNextFormat = (index) => {
        if (index < outputFormats.length) {
            processFile(outputFormats[index], (err) => {
                if (err) {
                    return res.json({ success: false, error: err.message });
                }
                processNextFormat(index + 1);
            });
        } else {
            res.json({ success: true });
        }
    };

    processNextFormat(0);
});

app.get('/check-dependencies', (req, res) => {
    const dependencies = {
        ffmpeg: false,
        node: false
    };

    exec('ffmpeg -version', (err) => {
        if (!err) {
            dependencies.ffmpeg = true;
        }

        exec('node -v', (err) => {
            if (!err) {
                dependencies.node = true;
            }

            res.json(dependencies);
        });
    });
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});