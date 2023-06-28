import * as THREE from 'three'
import { model as modelConfig } from './config'
import { polarToCartesian } from './math'

export default class GlobeDots {
    constructor(props) {
        this.props = props
        this.init()
    }

    init() {
        const { 
            globeMap
        } = this.props

        const dummyDot = new THREE.Object3D
        const imageData = getImageData(globeMap)
        const dots = []
        const dotResolutionX = 2

        const rows = modelConfig.globeDotRows
        const globeRadius = modelConfig.globeRadius
        
        for (let lat = -90; lat <= 90; lat += 180 / rows) {
            const radius = Math.cos(THREE.MathUtils.degToRad(Math.abs(lat))) * globeRadius
            const circum = radius * Math.PI * 2
            const dotsForRow = circum * dotResolutionX
            for (let i = 0; i < dotsForRow; i++) {
                const lon = -180 + 360 * i / dotsForRow 
                if (!visibilityForCoordinate(lon, lat, imageData)) {
                    continue
                }
                const pos = polarToCartesian(lat, lon, globeRadius)
                dummyDot.position.set(pos.x, pos.y, pos.z)
                const lookAt = polarToCartesian(lat, lon, globeRadius + 5)
                dummyDot.lookAt(lookAt.x, lookAt.y, lookAt.z)
                dummyDot.updateMatrix()
    
                dots.push(dummyDot.matrix.clone())
            }
        }

        const dotGeometry = new THREE.CircleGeometry(modelConfig.globeDotSize, 5)
        const dotMaterial = new THREE.MeshStandardMaterial({
            color: 0x3A4494,
            metalness: 0,
            roughness: .9,
            transparent: true,
            alphaTest: .02,
            opacity: 0
        })
        dotMaterial.onBeforeCompile = function(shader) {
            const fragmentShaderBefore = '#include <dithering_fragment>'
            const fragmentShaderAfter = `
              #include <dithering_fragment>
              gl_FragColor = vec4( outgoingLight, diffuseColor.a );
              if (gl_FragCoord.z > 0.51) {
                gl_FragColor.a = 1.0 + ( 0.51 - gl_FragCoord.z ) * 17.0;
              }
            `
            shader.fragmentShader = shader.fragmentShader.replace(fragmentShaderBefore, fragmentShaderAfter)
        }

        const dotsMesh = new THREE.InstancedMesh(
            dotGeometry,
            dotMaterial,
            dots.length
        )

        for (let i = 0; i < dots.length; i++) {
            dotsMesh.setMatrixAt(i, dots[i])
        }

        this.mesh = dotsMesh
        
    }
}

function visibilityForCoordinate(lon, lat, imageData, mapAlphaThreshold = 90) {
	const dataSlots = 4
    const dataRowCount = imageData.width * dataSlots
    // calc x from lon [-180, 180] => [0, 360]
	const x = parseInt((lon + 180) / 360 * imageData.width + .5)
    // calc y from lat [-90, 90] => [0, 180]
	const y = imageData.height - parseInt((lat + 90) / 180 * imageData.height - .5)
    
	const alphaDataSlot = parseInt(dataRowCount * (y - 1) + x * dataSlots) + (dataSlots - 1)

	return imageData.data[alphaDataSlot] > mapAlphaThreshold;
}

function getImageData(image) {
	const el = document.createElement("canvas").getContext("2d")
    el.canvas.width = image.width
    el.canvas.height = image.height
    el.drawImage(image, 0, 0, image.width, image.height)
	return el.getImageData(0, 0, image.width, image.height)
}