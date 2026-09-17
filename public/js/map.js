if (typeof mapToken !== 'undefined' && mapToken) {
    mapboxgl.accessToken = mapToken;
}

const hasCoordinates = typeof coordinates !== 'undefined' &&
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    coordinates[0] !== 0 &&
    coordinates[1] !== 0;

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: hasCoordinates ? coordinates : [77.2090, 28.6139],
    zoom: hasCoordinates ? 9 : 2,
});

if (hasCoordinates) {
    const marker = new mapboxgl.Marker({ color: "red" })
        .setLngLat(coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML("<h4>Exact Location provided after booking</h4>"))
        .addTo(map);
}