import * as THREE from 'three'

export function polarToCartesian(lat, lon, radius, vec) {
	vec = vec || new THREE.Vector3();
	const phi = THREE.MathUtils.degToRad(90 - lat);
	const theta = THREE.MathUtils.degToRad(lon + 180);
	vec.set(
		-radius * Math.sin(phi) * Math.cos(theta), 
		radius * Math.cos(phi), 
		radius * Math.sin(phi) * Math.sin(theta)
	)
	return vec
}

export function latLonMidPoint(lat1, lon1, lat2, lon2) {
    lat1 = THREE.MathUtils.degToRad(lat1);
    lon1 = THREE.MathUtils.degToRad(lon1);
    lat2 = THREE.MathUtils.degToRad(lat2);
    lon2 = THREE.MathUtils.degToRad(lon2);
  
    const dLon = lon2 - lon1;
    const bX = Math.cos(lat2) * Math.cos(dLon);
    const bY = Math.cos(lat2) * Math.sin(dLon);
    const lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bX) * (Math.cos(lat1) + bX) + bY * bY));
    const lon3 = lon1 + Math.atan2(bY, Math.cos(lat1) + bX);  
  
    return [THREE.MathUtils.radToDeg(lat3), THREE.MathUtils.radToDeg(lon3)];
  }

export function hasValidCoordinates({ lat, lon }) {
    const validLat = !isNaN(lat) && lat >= -90 && lat <= 90;
    const validLon = !isNaN(lon) && lon >= -180 && lon <= 180;
    return validLat && validLon;
}