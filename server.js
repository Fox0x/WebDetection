'use strict';

const express = require('express');
const path = require('path')
const app = express();
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const mainDir = join(__dirname, '/')
app.use(static(mainDir));
app.use(static(join(__dirname, './css')));
app.use(static(join(__dirname, './js')));
app.get('/', (req, res) => res.sendFile(path.join(mainDir, 'index.html')));

app.listen(process.env.PORT || 3001)
