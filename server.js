const express = require('express');
const path = require('path')
const app = express();
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const mainDir = path.join(__dirname, '/')
app.use(express.static(mainDir));
app.use(express.static(path.join(__dirname, './css')));
app.use(express.static(path.join(__dirname, './js')));
app.get('/', (req, res) => res.sendFile(path.join(mainDir, 'index.html')))

app.listen(process.env.PORT || 3001)