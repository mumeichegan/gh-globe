import * as THREE from 'three'

export const model = {
    globeRadius: 25,
    globeRotationOffset: new THREE.Euler(.3, 4.6, .05),
    globeDotRows: 200,
    globeDotSize: .095,
    spikeRadius: .065
}

export const scene = {
    height: 850,
    camera: {
        fov: 20,
        near: 170,
        far: 260,
        position: {
            z: 220
        }
    }
}


export const visibleData = {
    index: 60,
    increment: 15
}

export const animation = {
    globe: {
        autoRotationSpeed: .05,
        maxRotationX: .5,
        easing: .175
    }
}