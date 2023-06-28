import * as THREE from 'three'
import { hasValidCoordinates, polarToCartesian } from './math'
import { model as modelConfig } from './config'

export default class OpenedPr {
    constructor(props) {
        this.props = props
        this.init()
    }
    init() {
        const {
            data
        } = this.props

        const { 
            globeRadius,
            spikeRadius
        } = modelConfig

        this.mesh = new THREE.Group()

        const spikeHitGeometry = new THREE.BoxGeometry(.75, 1, .75)
        const spikeHitMaterial = new THREE.MeshBasicMaterial({
            visible: false
        })
        spikeHitGeometry.translate(0, .5, 0)
        spikeHitGeometry.rotateX(-Math.PI / 2)
        const spikeHitMeshes = new THREE.InstancedMesh(
            spikeHitGeometry, 
            spikeHitMaterial, 
            data.length
        )
        this.mesh.add(spikeHitMeshes)

        const spikeMaterial = new THREE.MeshBasicMaterial({
            color: 0x2188ff,
            transparent: true,
            opacity: .4,
            alphaTest: .05,
            blending: THREE.AdditiveBlending,
            opacity: 0
        })

        const spikeIndices = []
        const particleIndices = []
        for (let i = 0; i < data.length; i++) {
            spikeIndices.push(i)
            particleIndices.push(i)
        }

        const spikeGeometry = new THREE.CylinderGeometry(
            spikeRadius,
            spikeRadius,
            1, 
            6, 
            1,
            false
        )
        spikeGeometry.setAttribute(
            'index', 
            new THREE.InstancedBufferAttribute(new Float32Array(spikeIndices), 
            1
        )
        )
        spikeGeometry.translate(0, .5, 0)
        spikeGeometry.rotateX(-Math.PI / 2)
        const spikeMeshes = new THREE.InstancedMesh(
            spikeGeometry, 
            spikeMaterial, 
            data.length
        )
        this.mesh.add(spikeMeshes)

        const particleGeometry = new THREE.BufferGeometry()
        const particlePositions = []
        const particleColors = []
        const baseColor = new THREE.Color(0x2188ff)
        
        const dummy = new THREE.Group()
        const { 
            densities, 
            minDensity, 
            maxDensity
        } = this.getDensities()

        let densityIndex = 0
        for (let i = 0; i < data.length; i++) {
            const item = data[i]
            const { gop } = item
            const geoOpened = { lat: +gop.lat, lon: +gop.lon }
            if (!hasValidCoordinates(geoOpened)) {
                continue
            }
            polarToCartesian(geoOpened.lat, geoOpened.lon, globeRadius, dummy.position)
            const density = densities[densityIndex++]
            dummy.scale.z = THREE.MathUtils.mapLinear(
                density, 
                minDensity, 
                maxDensity, 
                globeRadius * .075,
                globeRadius * .15
            )

            dummy.scale.z += Math.random() * .875 * 2 - .875

            dummy.lookAt(0, 0, 0)
            dummy.updateMatrix()
            spikeMeshes.setMatrixAt(i, dummy.matrix)
            spikeHitMeshes.setMatrixAt(i, dummy.matrix)

            polarToCartesian(
                geoOpened.lat, 
                geoOpened.lon, 
                globeRadius + dummy.scale.z + .75, 
                dummy.position
            )

            particlePositions.push(dummy.position.x, dummy.position.y, dummy.position.z)
            particleColors.push(baseColor.r, baseColor.g, baseColor.b)

            particleGeometry.setAttribute(
                'position',
                new THREE.Float32BufferAttribute(particlePositions, 3)
                    .onUpload(cleanBufferAttributeArray)
            )

            particleGeometry.setAttribute(
                'color', 
                new THREE.Float32BufferAttribute(particleColors, 3)
                    .onUpload(cleanBufferAttributeArray)
            )

            particleGeometry.setAttribute(
                'index', 
                new THREE.Float32BufferAttribute(particleIndices, 1)
                    .onUpload(cleanBufferAttributeArray)
            );

            const particleMaterial = new THREE.PointsMaterial({
                alphaTest: .05,
                size: .8,
                depthWrite: false,
                opacity: 0
            })

            const particleMeshes = new THREE.Points(particleGeometry, particleMaterial)
            this.mesh.add(particleMeshes)

            this.spikeMeshes = spikeMeshes
            this.spikeHitMeshes = spikeHitMeshes
            this.particleMeshes = particleMeshes

        }
    }

    getDensities() {
        const { data } = this.props
        const globeRadius = modelConfig.globeRadius
        const vec = new THREE.Vector3()

        const locations = []
        const densities = []
        for (let i = 0; i < data.length; i++) {
            const item = data[i]
            const { gop } = item
            const geoOpened = { lat: +gop.lat, lon: +gop.lon }
            if (geoOpened && hasValidCoordinates(geoOpened)) {
                polarToCartesian(geoOpened.lat, geoOpened.lon, globeRadius, vec)
                locations.push(new THREE.Vector3().copy(vec))
                densities.push(0)
            }
        }
        const minDistance = 10
        locations.forEach((location0, index0) => {
            locations.forEach((location1, index1) => {
                if (index0 !== index1 && location0.distanceTo(location1) <= minDistance) {
                    densities[index0]++
                }
            })
        })
        let minDensity = 99999
        let maxDensity = -1
        densities.forEach(density => {
            if (density < minDensity) {
                minDensity = density
            }
            else if (density > maxDensity) {
                maxDensity = density
            }
        })

        return {
            densities,
            minDensity,
            maxDensity
        }       
    }

}

function cleanBufferAttributeArray() {
    this.array = null;
}