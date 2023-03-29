import '../styles/style-exam.css';
import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import Point from 'ol/geom/Point.js';
import View from 'ol/View.js';
import { Circle as CircleStyle, Stroke, Style } from 'ol/style.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { easeOut } from 'ol/easing.js';
import { fromLonLat } from 'ol/proj.js';
import { getVectorContext } from 'ol/render.js';
import { unByKey } from 'ol/Observable.js';

const name = document.getElementById('name')
const IPaltitud = document.getElementById('altitud')
const IPlongitud = document.getElementById('longitud')
const btn = document.getElementById('btn')
const latitud = parseFloat(IPaltitud.value);
const longitud = parseFloat(IPlongitud.value);

const tileLayer = new TileLayer({
  source: new OSM({
      wrapX: false,
  }),
});

const source = new VectorSource({
  wrapX: false,
});
const vector = new VectorLayer({
  source: source,
});

const API_URL = "http://localhost:4000/cities";
const xhr = new XMLHttpRequest();

async function onRequestHandler(){
    if(this.readyState == 4 && this.status == 200){
      console.log(this.response);
      const data = JSON.parse(this.response);
      while(true){
        console.log('calling json map');
        data.map(city => addCityFeature(city.logintude,city.latitude));
        await sleep(4000);
      }
    }
  }

xhr.addEventListener("load", onRequestHandler);
xhr.open("GET",API_URL);
xhr.send();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

btn.addEventListener('click',() => {
  if (name.value === '' || name.value == null || IPaltitud.value === '' || IPaltitud.value == null || IPlongitud.value === '' || IPlongitud.value == null){
    alert("Inserte todos los datos correctamente");
}
else if( 
  
  latitud.value > 19.613127 || 
  latitud.value < 19.187145 || 
  longitud.value > -99.365783 || 
  longitud.value < -99.115311 ){

alert("Fuera del rango del mapa");

}else{
  alert("Nos vemos pronto " + name.value);
  const latitud = parseFloat(IPaltitud.value);
  const longitud = parseFloat(IPlongitud.value);
  addFromLonLatFeature(latitud,longitud)
  addFromLonLatFeature(-99.131504,19.432526)
  const map = new Map({
    target: 'map',
    layers: [tileLayer,vector],
    view: new View({
      center: fromLonLat([-99.143460,19.412212]),
      zoom: 11,
      multiworld: true
    })
  });

  const duration = 3000;
function flash(feature) {
    const start = Date.now();
    const flashGeom = feature.getGeometry().clone();
    const listenerKey = tileLayer.on('postrender', animate);

    function animate(event) {
        const frameState = event.frameState;
        const elapsed = frameState.time - start;
        if (elapsed >= duration) {
            unByKey(listenerKey);
            return;
        }
        const vectorContext = getVectorContext(event);
        const elapsedRatio = elapsed / duration;
        // radius will be 5 at start and 30 at end.
        const radius = easeOut(elapsedRatio) * 25 + 5;
        const opacity = easeOut(1 - elapsedRatio);
        const style = new Style({
            image: new CircleStyle({
                radius: radius,
                stroke: new Stroke({
                    color: 'rgba(255, 0, 0, ' + opacity + ')',
                    width: 0.25 + opacity,
                }),
            }),
        });

        vectorContext.setStyle(style);
        vectorContext.drawGeometry(flashGeom);
        // tell OpenLayers to continue postrender animation
        map.render();
    }
}

source.on('addfeature', function (e) {
    flash(e.feature);
});
}
})

function addCityFeature(longitude, latitude) {
  addFromLonLatFeature(longitude, latitude);
  window.setInterval(addFromLonLatFeature, 5000);
}

function addFromLonLatFeature(longitude, latitude) {
  const x = longitude;
  const y = latitude;
  const geom = new Point(fromLonLat([x, y]));
  const feature = new Feature(geom);
  source.addFeature(feature);
}

