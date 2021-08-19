let store = Immutable.Map({
    user: Immutable.Map({
        name: "Francisco"
    }),
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
        <header></header>
        <main>
            <section>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                <h2>Choose one of the rovers below to see mission details</h2>
                <div class="buttons-wrapper">
                    ${buildRoverButtons(store.get("rovers"))}
                </div>

                    ${showRoverInfo()}
                    // !!!!!!!!!!!!!!!!!!!!!Pass max date to rover images for recent images
                    <section id="gallery">
                    ${showRoverImages()}  
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

// Function for an API call to get rover manifests
const getRoverInfo = (rover) => {
    fetch(`http://localhost:3000/rover-info?name=${rover}`)
    .then(res => res.json())
    .then(roverInfo => {
        updateStore(store, { roverInfo })
        getRoverImages(rover, roverInfo)
    })
}

// Function to get and draw the rover info on the page if roverInfo is set
const showRoverInfo = () => {
    const roverInfo = store.get("roverInfo")
    if (roverInfo) {
        // return data for draw
        return roverInfo.manifest.photo_manifest.max_date
    } 
    return '';
}


const findDateWithTonPics = (roverInfo) => {
    const lotsOfPicsMeta = roverInfo.manifest.photo_manifest.photos.filter(photoInfo => photoInfo.total_photos > 20)
    const latestEarthDay = lotsOfPicsMeta[lotsOfPicsMeta.length-1].earth_date
    return latestEarthDay

}

// Function for an API call to get rover photos
const getRoverImages = (roverName, roverInfo) => {
    // We need to filter the las
    const lastImageDate = findDateWithTonPics(roverInfo)  
    fetch(`http://localhost:3000/rover-photos?name=${roverName}&date=${lastImageDate}`)
    .then(res => res.json())
    .then(roverPhotos => updateStore(store, { roverPhotos }))
}

// Function to get and draw the rover photos gallery on the page if roverPhotos is set
const showRoverImages = () => {
    const roverPhotos = store.get("roverPhotos")
    if (roverPhotos) {
        // return data for draw
        const imgsHtml = roverPhotos.pics.photos.map(photoObj => `<div class="galpic"><img src="${photoObj.img_src}" /></div>`)
        return imgsHtml.join('')
    }
    return '';
}