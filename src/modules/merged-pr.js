import * as THREE from 'three'
import { polarToCartesian, hasValidCoordinates, latLonMidPoint } from './math'
import { disposeNode } from './dispose'
import { model as modelConfig } from './config'

export default class MergedPr {
    constructor(props) {
        this.props = props
        this.init()
    }
    init() {
        const {
            data
        } = this.props

        const { globeRadius } = modelConfig

        this.mesh = new THREE.Group()

        this.lineMeshes = []
        this.lineHitMeshes = []

        this.landings = []

        this.isAnimating = []
        this.isAnimatingLandingOut = []
            

        this.tubeRadius = .08
        this.tubeRadiusSegments = 3

        this.tubeHitRadius = .6
        this.tubeHitSegmentsFraction = 4

        this.minTubeSegments = 20

        this.dataIncrementSpeed = 1.5
        this.pauseLengthFactor = 2
        this.minPause = 2000
        
        this.visibleDataIndex = 0
        this.lineAnimationSpeed = 600

        let ctrl0 = new THREE.Vector3()
        let ctrl1 = new THREE.Vector3()

        this.landingDotGeometry = new THREE.CircleGeometry(0.35, 8)

        this.tubeMaterial = new THREE.MeshBasicMaterial({
            blending: THREE.AdditiveBlending,
            opacity: .95,
            transparent: true,
            color: 0xF46BBE
        })

        this.highlightMaterial = new THREE.MeshBasicMaterial({
            opacity: 1,
            transparent: false,
            color: 0xffffff
        })

        this.hiddenMaterial = new THREE.MeshBasicMaterial({
            visible: false
        })
        
        for (let i = 0; i < data.length; i++) {
            const { gop, gm } = data[i]
            // Casting longitude and latitude into numbers
            const geoOpened = { lat: +gop.lat, lon: +gop.lon }
            const geoMerged = { lat: +gm.lat, lon: +gm.lon }

            if (!hasValidCoordinates(geoOpened) || !hasValidCoordinates(geoMerged)) {
                continue
            }

            const vec0 = polarToCartesian(geoOpened.lat, geoOpened.lon, globeRadius)
            const vec1 = polarToCartesian(geoMerged.lat, geoMerged.lon, globeRadius)
            
            const distance = vec0.distanceTo(vec1)

            if (distance > 1.5) {
                let scalar
                if (distance > globeRadius * 1.85) {
                    scalar = THREE.MathUtils.mapLinear(distance, 0, globeRadius * 2, 1, 3.25)
                }
                else if (distance > globeRadius * 1.4) {
                    scalar = THREE.MathUtils.mapLinear(distance, 0, globeRadius * 2, 1, 2.3)
                }
                else {
                    scalar = THREE.MathUtils.mapLinear(distance, 0, globeRadius * 2, 1, 1.5)
                }

                const midPoint = latLonMidPoint(geoOpened.lat, geoOpened.lon , geoMerged.lat, geoMerged.lon)
                const vecMid = polarToCartesian(midPoint[0], midPoint[1], globeRadius * scalar)
                ctrl0.copy(vecMid)
                ctrl1.copy(vecMid)

                const t0 = THREE.MathUtils.mapLinear(distance, 15, 35, .2, .15)
                const t1 = THREE.MathUtils.mapLinear(distance, 15, 35, .8, .85)

                const tempCurve = new THREE.CubicBezierCurve3(vec0, ctrl0, ctrl1, vec1)
                tempCurve.getPoint(t0, ctrl0)
                tempCurve.getPoint(t1, ctrl1)

                scalar = THREE.MathUtils.mapLinear(distance, 0, globeRadius * 2, 1, 1.5)
                ctrl0.multiplyScalar(scalar)
                ctrl1.multiplyScalar(scalar)

                const curve = new THREE.CubicBezierCurve3(vec0, ctrl0, ctrl1, vec1)
                // i / 10000 to prevent z-fighting
                const landingPos = polarToCartesian(geoMerged.lat, geoMerged.lon, globeRadius + i / 10000)
                const lookAt = polarToCartesian(geoMerged.lat, geoMerged.lon, globeRadius + 5)
                this.landings.push({
                    pos: landingPos, 
                    lookAt: lookAt 
                })

                const curveSegments = this.minTubeSegments + parseInt(curve.getLength())
                
                const tubeGeometry = new THREE.TubeGeometry(curve, curveSegments, this.tubeRadius, this.tubeRadiusSegments, false)
                const tubeHitGeometry = new THREE.TubeGeometry(curve, parseInt(curveSegments / this.tubeHitSegmentsFraction), this.tubeHitRadius, this.tubeRadiusSegments, false)

                tubeGeometry.setDrawRange(0, 0)
                tubeHitGeometry.setDrawRange(0, 0)

                const lineMesh = new THREE.Mesh(tubeGeometry, this.tubeMaterial)
                const lineHitMesh = new THREE.Mesh(tubeHitGeometry, this.hiddenMaterial)
                lineHitMesh.name = 'lineHitMesh'
                lineHitMesh.userData = { dataIndex: i, lineMeshIndex: this.lineMeshes.length };
                this.lineMeshes.push(lineMesh)
                this.lineHitMeshes.push(lineHitMesh)
            }
        }


    }

    update(delta) {
        let computedVisibleDataIndex = parseInt(this.visibleDataIndex + delta * this.dataIncrementSpeed);
        
        // reset data index
        if (computedVisibleDataIndex >= this.lineMeshes.length) {
            computedVisibleDataIndex = 0
            this.visibleDataIndex = 0
        }

        // every certain amount of time there would be a new animating object
        // visibleDataIndex is decimal yet updated at the end
        // meaning every 1 / delta frame we hit a condition where
        // computedVisibleDataIndex which gets delta added exceeds visibleDataIndex
        
        if (computedVisibleDataIndex > this.visibleDataIndex) {
            this.isAnimating.push(this.createAnimationObject(computedVisibleDataIndex))
        }

        let continueAnimating = []
        let continueAnimatingLandingOut = []

        for (const animationObject of this.isAnimating) {
            const max = animationObject.line.geometry.index.count

            const count = animationObject.line.geometry.drawRange.count + delta * this.lineAnimationSpeed
            let start = animationObject.line.geometry.drawRange.start + delta * this.lineAnimationSpeed

            // landing in
            if (count >= max && start < max) {
                this.animateLandingIn(animationObject)
            }

            if (count >= max * this.pauseLengthFactor + this.minPause && start < max) {
                start = this.tubeRadiusSegments * Math.ceil(start / this.tubeRadiusSegments)
                const startHit = this.tubeRadiusSegments * Math.ceil(start / this.tubeHitSegmentsFraction / this.tubeRadiusSegments)
                animationObject.line.geometry.setDrawRange(start, count)
                animationObject.lineHit.geometry.setDrawRange(startHit, count / this.tubeHitSegmentsFraction)
                continueAnimating.push(animationObject)
            }
            else if (start < max) {
                animationObject.line.geometry.setDrawRange(0, count)
                animationObject.lineHit.geometry.setDrawRange(0, count / this.tubeHitSegmentsFraction)
                continueAnimating.push(animationObject)
            }
            else {
                this.endAnimation(animationObject)
            }

        }

        for (let i = 0; i < this.isAnimatingLandingOut.length; i++) {
            if (this.animateLandingOut(this.isAnimatingLandingOut[i])) {
                continueAnimatingLandingOut.push(this.isAnimatingLandingOut[i])
            }
        }
        
        this.isAnimating = continueAnimating
        this.isAnimatingLandingOut = continueAnimatingLandingOut

        this.visibleDataIndex = this.visibleDataIndex + delta * this.dataIncrementSpeed

    }

    endAnimation(animationObject) {
        animationObject.line.geometry.setDrawRange(0, 0)
        animationObject.lineHit.geometry.setDrawRange(0, 0)
        this.mesh.remove(animationObject.line)
        this.mesh.remove(animationObject.lineHit)
        animationObject.line = null
        animationObject.lineHit = null
        this.isAnimatingLandingOut.push(animationObject)
    }

    animateLandingIn(animationObject) {
        if (animationObject.landingDot.scale.x > .99) {
            if (animationObject.landingRing == null) {
                return
            }
            animationObject.landingRing.material.opacity = 0
            this.mesh.remove(animationObject.landingRing)
            disposeNode(animationObject.landingRing)
            animationObject.landingRing = null
            return
        }
        const scale0 = animationObject.landingDot.scale.x + (1 - animationObject.landingDot.scale.x) * .06
        animationObject.landingDot.scale.set(scale0, scale0, 1);
    
        const scale1 = animationObject.landingRing.scale.x + (1 - animationObject.landingRing.scale.x) * .06
        animationObject.landingRing.scale.set(scale1, scale1, 1)
        animationObject.landingRing.material.opacity = 1 - scale1
    }

    animateLandingOut(animationObject) {
        if (animationObject.landingDot.scale.x < .01) {
            this.mesh.remove(animationObject.landingDot)
            animationObject.landingDot = null
            disposeNode(animationObject.landingDot)

            if (animationObject.landingRing != null) {
                this.mesh.remove(animationObject.landingRing)
                disposeNode(animationObject.landingRing)
                animationObject.landingRing = null
            }

            return false
        }

        const scale = animationObject.landingDot.scale.x - animationObject.landingDot.scale.x * .15
        animationObject.landingDot.scale.set(scale, scale, 1)

        return true
    }

    createAnimationObject(index) {
        const line = this.lineMeshes[index]
        this.mesh.add(line)
    
        const lineHit = this.lineHitMeshes[index]
        this.mesh.add(lineHit)
    
        const landingDot = this.createLandingDotMesh(this.landings[index])
        this.mesh.add(landingDot)
    
        const landingRing = this.createLandingRingMesh(landingDot)
        this.mesh.add(landingRing)
    
        return {
          line: line,
          lineHit: lineHit,
          landingDot: landingDot,
          landingRing: landingRing
        }
      }


    createLandingDotMesh(data) {
        const landingDotMesh = new THREE.Mesh(this.landingDotGeometry, this.tubeMaterial)
        landingDotMesh.position.set(data.pos.x, data.pos.y, data.pos.z)
        landingDotMesh.lookAt(data.lookAt.x, data.lookAt.y, data.lookAt.z)
        landingDotMesh.scale.set(0, 0, 1)
        return landingDotMesh
    }

    createLandingRingMesh(mesh) {
        const landingRingMesh = mesh.clone()
        landingRingMesh.geometry = new THREE.RingGeometry(1.55, 1.8, 16)
        landingRingMesh.material = new THREE.MeshBasicMaterial({
            color: 0xF46BBE,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0,
            alphaTest: .02,
            visible: true
        });
        landingRingMesh.scale.set(0, 0, 1)
        return landingRingMesh
    }

    resetHighlight() {
        if (this.highlightedMesh == null) {
            return
        }
        this.highlightedMesh.material = this.tubeMaterial
        this.highlightedMesh = null
    }

    setHighlightObject(object) {
        const index = parseInt(object.userData.lineMeshIndex)
        const lineMesh = this.lineMeshes[index]
        if (lineMesh == this.highlightedMesh) {
            return
        }
        lineMesh.material = this.highlightMaterial
        this.resetHighlight()
        this.highlightedMesh = lineMesh
    }
}