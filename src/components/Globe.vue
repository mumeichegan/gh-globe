<script setup>
import { ref, onMounted, render } from 'vue'
import { 
    model as modelConfig, 
    scene as sceneConfig,
    animation as animationConfig
 } from '../modules/config'
import imageGlobeMap from '../assets/map.png'

import * as THREE from 'three'

import prData from '../assets/data.json'

import Globe from '../modules/globe'
import GlobeDots from '../modules/globe-dots'
import Controls from '../modules/controls'
import OpenedPr from '../modules/opened-pr'
import MergedPr from '../modules/merged-pr'
import DataInfo from '../modules/data-info'

import { merge, shuffle } from 'lodash-es'

const canvasContainer = ref(null)
const canvas = ref(null)

onMounted(function() {

    const globeMap = new Image()
    globeMap.onload = function() {

        const scene = new THREE.Scene()
        const { camera: cameraConfig } = sceneConfig
        const baseFov = cameraConfig.fov
        const baseHeight = sceneConfig.height
        const camera = new THREE.PerspectiveCamera(
            getCameraFov(baseFov, baseHeight),
            window.innerWidth / window.innerHeight,
            cameraConfig.near,
            cameraConfig.far
        )
        scene.add(camera)
        camera.position.set(0, 0, 220)

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            canvas: canvas.value
        })
        THREE.ColorManagement.enabled = false
        renderer.outputColorSpace = THREE.LinearSRGBColorSpace
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(window.innerWidth, window.innerHeight)

        const globeContainer = new THREE.Group()
        const { globeRotationOffset } = modelConfig
        const date = new Date()
        const timeZoneOffset = date.getTimezoneOffset() || 0
        const timeZoneMaxOffset = 60 * 12
        globeRotationOffset.y += Math.PI * (timeZoneOffset / timeZoneMaxOffset)
        globeContainer.rotation.copy(globeRotationOffset)
        scene.add(globeContainer)

        const haloContainer = new THREE.Group()
        scene.add(haloContainer)

        const innerGlobeContainer = new THREE.Group()
        globeContainer.add(innerGlobeContainer)
        
        // light
        const { globeRadius } = modelConfig
        const ambientLight = new THREE.AmbientLight(0xffffff, .8)
        const spotLight0 = new THREE.SpotLight(0x2188ff, 12, 120, .3, 0, 1.1)
        const spotLight1 = new THREE.SpotLight(0xF46BBE, 5, 75, .5, 0, 1.25)
        const directionalLight = new THREE.DirectionalLight(0xA9BFFF, 3)
        spotLight0.target = globeContainer
        spotLight1.target = globeContainer
        directionalLight.target = globeContainer
        scene.add(spotLight0, spotLight1, directionalLight, ambientLight)
        spotLight0.position.set(globeContainer.position.x - globeRadius * 2.5, 80, -40)
        spotLight0.distance = 120
        spotLight1.position.set(globeContainer.position.x + globeRadius, globeRadius, globeRadius * 2)
        spotLight1.distance = 75
        directionalLight.position.set(globeContainer.position.x - 50, globeContainer.position.y + 30, 10)
        setContainerPosition(globeContainer, haloContainer)

        let isTransitionInEnd = false
        let transitionInScalar = null
        if (window.innerWidth < getBreakPoint()) {
            transitionInScalar = .6
        } 
        else {
            transitionInScalar = .75
        }
        globeContainer.scale.setScalar(transitionInScalar)
        haloContainer.scale.setScalar(transitionInScalar)
            

        // globe
        const globe = new Globe({ radius: globeRadius })
        innerGlobeContainer.add(globe.mesh)

        // halo
        const haloGeometry = new THREE.SphereGeometry(globeRadius, 45, 45)
        const haloMaterial = new THREE.ShaderMaterial({
            uniforms: {
                c: { type: "f", value: .7 },
                p: { type: "f", value: 15 },
                glowColor: { type: "c", value: new THREE.Color(0x1C2462) },
                viewVector: { type: "v3", value: new THREE.Vector3(0, 0, cameraConfig.position.z) }
            },
            vertexShader: `
                uniform vec3 viewVector;
                uniform float c;
                uniform float p;
                varying float intensity0;
                varying float intensity1;
                void main() {
                    vec3 vNormal0 = normalize(normalMatrix * normal);
                    vec3 vNormal1 = normalize(normalMatrix * viewVector);
                    intensity0 = pow(c - dot(vNormal0, vNormal1), p);
                    intensity1 = pow(0.63 - dot(vNormal0, vNormal1), p);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity0;
                varying float intensity1;
                void main(){
                    gl_FragColor = vec4(glowColor * intensity0, 1.0 * intensity1);
                    #include <encodings_fragment>
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            dithering: true
        })
        const halo = new THREE.Mesh(haloGeometry, haloMaterial)
        halo.scale.multiplyScalar(1.15)
        halo.rotateX(Math.PI * .03)
        halo.rotateY(Math.PI * .03)
        halo.renderOrder = 1
        haloContainer.add(halo)

        // globeDots
        const globeDots = new GlobeDots({
            globeMap
        })
        innerGlobeContainer.add(globeDots.mesh)

        // controls
        const { 
            globe: { 
                autoRotationSpeed, 
                easing, 
                maxRotationX
            }
        } = animationConfig
        const controls = new Controls({
            innerGlobeContainer,
            globeContainer,
            domElement: renderer.domElement,
            rotationSpeed: 3,
            autoRotationSpeed: autoRotationSpeed,
            maxRotationX: maxRotationX,
            easing
        })

        const prDataShuffled = shuffle(prData)
        // opened pr
        const openedPr = new OpenedPr({
            data: prDataShuffled
        })
        innerGlobeContainer.add(openedPr.mesh)

        // merged pr
        // const mergedPr = new MergedPr({
        //     data: prDataShuffled
        // })
        // innerGlobeContainer.add(mergedPr.mesh)
        let mergedPr = undefined

        // data info
        const dataInfo = new DataInfo({
            domElement: renderer.domElement,
            controls
        })

        // raycaster
        let raycastIndex = 0
        let raycaster = new THREE.Raycaster()
        const raycastTrigger = 10
        const intersectTests = []
        
        intersectTests.push(openedPr.spikeHitMeshes)
        // if (typeof mergedPr != 'undefined') {
        //     intersectTests.push(...mergedPr.lineHitMeshes)
        // }
        
        const intersects = []

        function testForDataIntersection() {
            intersects.length = 0
            getMouseIntersection(
                controls.mouseNDC, 
                camera,
                intersectTests,
                raycaster,
                intersects
            )
        }

        // resize
        window.addEventListener('resize', function() {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.fov = getCameraFov(baseFov, baseHeight)
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
            setContainerPosition(globeContainer, haloContainer)
        })

        // tick
        const clock = new THREE.Clock()
        function tick() {

            const delta = clock.getDelta()
            controls.update(delta)

            if (!isTransitionInEnd) {
                transitionInScalar += (1 - transitionInScalar) * .05
                globeDots.mesh.material.opacity += (1 - globeDots.mesh.material.opacity) * .05
                openedPr.mesh.children[1].material.opacity += (1 - openedPr.mesh.children[1].material.opacity) * .05
                
                globeContainer.scale.setScalar(transitionInScalar)
                haloContainer.scale.setScalar(transitionInScalar)
                if (transitionInScalar > .99) {
                    isTransitionInEnd = true
                    // merged pr
                    mergedPr = new MergedPr({
                        data: prDataShuffled
                    })
                    innerGlobeContainer.add(mergedPr.mesh)
                    intersectTests.push(...mergedPr.lineHitMeshes)
                }
                renderer.render(scene, camera)
                requestAnimationFrame(tick)
                return
            }

            if (typeof mergedPr != 'undefined') {
                mergedPr.update(delta)
            }
            
            const isFrameValid = raycastIndex % raycastTrigger === 0
            let found = false
            let dataItem

            if (
                isFrameValid
                && typeof mergedPr != 'undefined'
                && typeof openedPr != 'undefined'
            ) {
                testForDataIntersection()
                if (intersects.length) {
                    for (let i = 0; i < intersects.length && !found; i++) {
                        const { instanceId, object } = intersects[i]
                        if (object.name === 'lineHitMesh') {
                            dataItem = setMergedPrEntityDataItem(object, mergedPr)
                            found = true
                            break
                        } else if (object === openedPr.spikeHitMeshes) {
                            dataItem = setOpenPrEntityDataItem(instanceId, openedPr)
                            found = true
                            break
                        } else {
                            dataItem = null
                            found = false
                        }
                    }
                }

                if (found && dataItem) {
                    setDataInfo(dataItem, dataInfo)
                    dataInfo.show()
                } else {
                    dataInfo.hide()
                    mergedPr.resetHighlight()
                    dataItem = null
                }
            }

            if (controls.isDragging) {
                dataInfo.hide()
                mergedPr.resetHighlight()
            }

            if (dataInfo.isVisible) {
                dataInfo.update(controls.mouseScreen, { x: 0, y: 0 })
            }

            raycastIndex++
            if (raycastIndex >= raycastTrigger) {
                raycastIndex = 0
            }

            renderer.render(scene, camera)
            requestAnimationFrame(tick)
        }

        renderer.render(scene, camera)
        setTimeout(tick, 500)
    }
    globeMap.src = imageGlobeMap
})

function getBreakPoint() {
    return 825
}

function getCameraFov(baseFov, baseHeight) {
    let fov = null

    if (
        window.innerWidth > 912 - 50
        && window.innerWidth < 912 + 50
        && window.innerHeight > 1368 - 50
        && window.innerHeight < 1368 + 50
    ) {
        return 17.825
    }

    if (window.innerWidth < getBreakPoint()) {
        fov = baseFov * window.innerHeight / baseHeight
    } 
    else {
        fov = baseFov
    }
    return fov
}

function setContainerPosition(globeContainer, haloContainer) {
    if (window.innerWidth < getBreakPoint()) {
        globeContainer.position.set(0, -30, 0)
        haloContainer.position.set(0, -32.5, -10)
    } else {
        globeContainer.position.set(0, 0, 0)
        haloContainer.position.set(0, 0, -10)
    }
}

function getMouseIntersection(mouseNDC, camera, objects, raycaster, arrayTarget, recursive = false) {
    raycaster = raycaster || new THREE.Raycaster();
    raycaster.setFromCamera(mouseNDC, camera);
    // const intersections = raycaster.intersectObjects(objects, recursive, arrayTarget)
    raycaster.intersectObjects(objects, recursive, arrayTarget)
    // return intersections.length > 0 ? intersections[0] : null;
}

function setOpenPrEntityDataItem(instanceId, openedPr) {
    const dataItem = openedPr.props.data[instanceId]
    dataItem.type = 'PR_OPENED';
    return dataItem;
}

function setMergedPrEntityDataItem(object, mergedPr) {
    mergedPr.setHighlightObject(object)
    const dataItem = mergedPr.props.data[parseInt(object.userData.dataIndex)];
    dataItem.type = 'PR_MERGED'
    return dataItem;
}

function setDataInfo(dataItem, dataInfo) {
    const { uol, uml, l, type, nwo, pr } = dataItem
    dataInfo.setInfo({
        user_opened_location: uol,
        user_merged_location: uml,
        language: l,
        name_with_owner: nwo,
        pr_id: pr,
        type
    })
}
</script>

<template>
    <div 
        :class="$style.p0"
        ref="canvasContainer">
        <canvas ref="canvas"></canvas>
    </div>
</template>

<style module>
.p0 {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    overflow: hidden;
}
</style>