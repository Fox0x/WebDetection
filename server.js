'use strict';

import express, { json, urlencoded, static } from 'express';
import { join } from 'path';
const app = express();
app.use(json())
app.use(urlencoded({extended: true}))

const mainDir = join(__dirname, '/')
app.use(static(mainDir));
app.use(static(join(__dirname, './css')));
app.use(static(join(__dirname, './js')));
app.get('/', (req, res) => res.sendFile(join(mainDir, 'index.html')))

app.listen(process.env.PORT || 3001)
