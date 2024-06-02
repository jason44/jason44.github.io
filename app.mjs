import http from 'http';
import fs from 'fs';
import express from 'express';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
// set '$HOME/.../src' as '/' 
// use '/' in html to refer to 'src/'
// '/' in this file also refers to 'src/'
//app.use('/src', express.static( __dirname));
app.use(express.static( __dirname));
//app.use('/pages', express.static(__dirname + '/pages'));
//app.use('/assets', express.static(__dirname + '/assets'));
//app.use(express.static(__dirname + '/pages'));
//app.use(express.static(__dirname + '/assets'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});