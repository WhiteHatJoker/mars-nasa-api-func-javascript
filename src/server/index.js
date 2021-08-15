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
        let roverInfo= await fetch(`${baseAPIURL}manifests/${req.query.name}?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ roverInfo })
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/rover-photos', async (req, res) => {
    try {
        let roverPhotos = await fetch(`${baseAPIURL}rovers/${req.query.name}?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ roverPhotos })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))