require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls
const baseAPIURL = 'https://api.nasa.gov/mars-photos/api/v1/';
// example API call
app.get('/rover-info', async (req, res) => {
    try {
        const manifest= await fetch(`${baseAPIURL}manifests/${req.query.name}?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ manifest })
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/rover-photos', async (req, res) => {
    try {
        const pics = await fetch(`${baseAPIURL}rovers/${req.query.name}/photos?earth_date=${req.query.date}&api_key=${process.env.API_KEY}&page=1`)
            .then(res => res.json())
        res.send({ pics })
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/apod', async (req, res) => {
    try {
        const image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))