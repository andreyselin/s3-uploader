import express from 'express';
import multer from 'multer';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { env } from "./env";

const app = express();
const s3 = new AWS.S3(env.s3Config);

const storage = multer.memoryStorage({
    destination: (req, file, callback) => callback(null, '')
});

const uploadMiddleware = multer({ storage }).single('image');

const getExtension = filename => filename.split('.').pop();

app.post('/upload', uploadMiddleware, (req, res) => {

    console.log('req.file', req.file);

    const params = {
        Bucket: env.uploadBucket.bucket,
        Key: `${uuid()}.${getExtension(req.file.originalname)}`,
        Body: req.file.buffer
    };

    s3.upload(params, (error, data) => {
        if (error) {
            console.log('-error-2-', error);
            res.status(500).json({ ok: false });
        } else {
            console.log('-ok-2-');
            res.status(200).json({ ok: true });
        }
    });

});


app.listen(env.http.port, () => {
    console.log('-=- App runs on port -=-', env.http.port);
});
