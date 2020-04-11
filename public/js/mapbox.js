/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiY3JoaXMzNSIsImEiOiJjazhzd2VoYmYwODRwM3Bwa2NyZmZ4bms1In0.OgTcVDLx3HVHh_YwZxabpQ';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/crhis35/ck8swq1ew0jxe1ipoxjd694dn',
    scrollZoom: false,
    //   center: [latitud,longitud],
    //   zoom: 10,
    //   interactive: false,
  });
  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    //Create marker
    const el = document.createElement('div');
    el.className = 'marker';
    //Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom', //centrar la punta en las cordenadas
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popud
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    //extend map bound to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    paddding: {
      //   abjust zoom
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
