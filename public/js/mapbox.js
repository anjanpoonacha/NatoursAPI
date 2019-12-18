/* eslint-disable */

export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYW5qYW5wb29uYWNoYSIsImEiOiJjazQ5dWR3MGgwN2FrM21teHB4bnFuYnVkIn0.C6QTqo19RJcxnDCn0e5J0A';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/anjanpoonacha/ck49wyccj0uhz1dphnkhbn0gs',
    // center: [-118.2437, 34.0522],
    scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });

  // map.addControl(
  //   new MapboxDirections({
  //     accessToken: mapboxgl.accessToken
  //   }),
  //   'top-right'
  // );
};

//

// map.addControl(
//   new mapboxgl.GeolocateControl({
//     positionOptions: {
//       enableHighAccuracy: true
//     },
//     trackUserLocation: true,
//     showUserLocation: true
//   })
// );

// console.log(locations, ip);
