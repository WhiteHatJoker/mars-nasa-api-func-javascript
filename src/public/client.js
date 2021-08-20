let store = Immutable.Map({
    apod: '',
    roverInfo: '',
    roverPhotos: '',
    rovers: Immutable.List(['Spirit', 'Opportunity', 'Curiosity']),
})


const updateStore = (state, newState) => {
    store = state.merge(Immutable.Map(newState));
    render(root, store)
}

// add our markup to the page
const root = document.getElementById('root')

const render = async (root, state) => {
    root.innerHTML = App(state)
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// create content
const App = (state) => {

    return `
        <header>
            <img width="400px" src="./assets/img/mars-logo.png" />                    
            <h1>Mars Rover Dashboard</h1>
        </header>
        <main>
            <section>
                <section id ="controller">
                    <h2>Choose one of the rovers below to see the mission details and recent photos</h2>
                    <div class="buttons-wrapper">
                        ${buildRoverButtons(store.get("rovers"))}
                    </div>
                </section>
                <section id="rover-info">
                    ${showRoverInfo(buildRoverInfoTable)}
                </section>
                <section id="gallery">
                    ${showRoverImages(buildRoverGalleryHtml)}  
                </section>
                <section id="apod">
                    <h1>Astronomy Picture of the Day</h1>
                    <p>
                        One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                        the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                        This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                        applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                        explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                        but generally help with discoverability of relevant imagery.
                    </p>
                    ${ImageOfTheDay(store.get("apod"))}
                </section>       
            </section>
        </main>
        <footer></footer>
    `
}

// Function to dynamically build rover info request buttons
const reducer = (accumulator, currentValue) => accumulator + `<button class="rover-button" onclick="getRoverInfo('${currentValue.toLowerCase()}')">${currentValue}</button>`

const buildRoverButtons = (rovers) => {
    const buttonsHtml = rovers.reduce(reducer, '')
    return buttonsHtml
}

// Function for an API call to get rover information
const getRoverInfo = (rover) => {
    fetch(`http://localhost:3000/rover-info?name=${rover}`)
    .then(res => res.json())
    .then(roverInfo => {
        updateStore(store, { roverInfo })
        getRoverImages(rover, roverInfo)
    })
}

// High order function to get rover info and pass it to callback html building function
const showRoverInfo = (buildRoverInfoHtml) => {
    const roverInfo = store.get("roverInfo")
    if (roverInfo) {
        const roverMeta = roverInfo.manifest.photo_manifest
        return buildRoverInfoHtml(roverMeta)
    } 
    return '';
}

// Callback function for rover info html
const buildRoverInfoTable = (rover) => {
    const roverMetaHtml = `<h1>${rover.name} Rover Info</h1>
    <table class="rover-meta">
        <tr><td>Mission Status</td><td style="text-transform:capitalize;">${rover.status}</td></tr>
        <tr><td>Launch Date</td><td>${rover.launch_date}</td></tr>
        <tr><td>Landing Date</td><td>${rover.landing_date}</td></tr>
        <tr><td>Total Photos Taken</td><td>${rover.total_photos}</td></tr>
        <tr><td>Latest Photo Date</td><td>${rover.max_date}</td></tr>
    </table>` 
    return roverMetaHtml
}

// Function to find latest date when more than 20 photos were taken
const findDateWithTonPics = (roverInfo) => {
    const lotsOfPicsMeta = roverInfo.manifest.photo_manifest.photos.filter(photoInfo => photoInfo.total_photos > 20)
    const latestEarthDay = lotsOfPicsMeta[lotsOfPicsMeta.length-1].earth_date
    return latestEarthDay

}

// Function for an API call to get rover photos
const getRoverImages = (roverName, roverInfo) => {
    const lastImageDate = findDateWithTonPics(roverInfo)  
    fetch(`http://localhost:3000/rover-photos?name=${roverName}&date=${lastImageDate}`)
    .then(res => res.json())
    .then(roverPhotos => updateStore(store, { roverPhotos }))
}

// High order function to get rover photos and pass it to callback function for building gallery html
const showRoverImages = (buildRoverGallery) => {
    const roverPhotos = store.get("roverPhotos")
    if (roverPhotos) {
        return buildRoverGallery(roverPhotos)
    }
    return '';
}

// Callback function for rover photos html
const buildRoverGalleryHtml = (roverPhotos) => {
    const galleryHtml = roverPhotos.pics.photos.map(photoObj => `<div class="galpic"><img src="${photoObj.img_src}" /></div>`)
    return galleryHtml.join('')
}

const ImageOfTheDay = (apod) => {
    // If image does not already exist, or it is not from today -- request it again
    if (!apod) {
        getImageOfTheDay(store)
    } else {
        const today = new Date()
        const photodate = new Date(apod.date)
        if (!apod || apod.date === today.getDate() ) {
            getImageOfTheDay(store)
        }
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img class="apod-img" src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

const getImageOfTheDay = (state) => {
    const { apod } = state
    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))
}