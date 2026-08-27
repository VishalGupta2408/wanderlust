mapboxgl.accessToken = mapToken;

const hasCoordinates = Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    coordinates[0] !== 0 &&
    coordinates[1] !== 0;

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: coordinates,
    zoom: 9, // zoom out if we don't have a real location
});

const marker = new mapboxgl.Marker({ color: "red" })
.setLngLat(coordinates) //Listing.geometry.coordinates
.setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML("<h1>Hello World!</h1>"))
.addTo(map);