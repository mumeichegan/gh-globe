import * as THREE from 'three'

import { model as modelConfig } from './config'

const { globeRotationOffset } = modelConfig

export default class Controls {
    constructor(props) {
        this.props = props
        this.handleMouseDown = this.handleMouseDown.bind(this)
        this.handleMouseMove = this.handleMouseMove.bind(this)
        this.handleMouseUp = this.handleMouseUp.bind(this)
        this.handleMouseOut = this.handleMouseOut.bind(this)
        this.handleTouchStart = this.handleTouchStart.bind(this)
        this.handleTouchMove = this.handleTouchMove.bind(this)
        this.handleTouchEnd = this.handleTouchEnd.bind(this)        

        this.init()
    }
    init() {
        this.isDragging = false
        this.mouseNDC = new THREE.Vector2(0, 0)
        this.lastMouseNDC = new THREE.Vector2(0, 0)
        this.mouseScreen = new THREE.Vector2(0, 0)
        this.target = new THREE.Vector3(0, 0, 0)
        this.matrix = new THREE.Matrix4()
        this.velocity = new THREE.Vector2()
        this.autoRotationSpeedScalar = 1
        this.autoRotationSpeedScalarTarget = 1
        this.addListeners()

    }
    addListeners() {
        const { domElement } = this.props
        this.removeListeners()
        domElement.addEventListener('mousedown', this.handleMouseDown)
        domElement.addEventListener('mousemove', this.handleMouseMove)
        domElement.addEventListener('mouseup', this.handleMouseUp)
        domElement.addEventListener('mouseout', this.handleMouseOut)
        domElement.addEventListener('mouseleave', this.handleMouseOut)
        domElement.addEventListener('touchstart', this.handleTouchStart, { passive: true })
        domElement.addEventListener('touchmove', this.handleTouchMove, { passive: true })
        domElement.addEventListener('touchend', this.handleTouchEnd, { passive: true })
        domElement.addEventListener('touchcancel', this.handleTouchEnd, { passive: true })
    }
    removeListeners() {
        const { domElement } = this.props
        domElement.removeEventListener('mousedown', this.handleMouseDown)
        domElement.removeEventListener('mousemove', this.handleMouseMove)
        domElement.removeEventListener('mouseup', this.handleMouseUp)
        domElement.removeEventListener('mouseout', this.handleMouseOut)
        domElement.removeEventListener('mouseleave', this.handleMouseOut)
        domElement.removeEventListener('touchstart', this.handleTouchStart)
        domElement.removeEventListener('touchmove', this.handleTouchMove)
        domElement.removeEventListener('touchend', this.handleTouchEnd)
        domElement.removeEventListener('touchcancel', this.handleTouchEnd)
    }
    setMouse(event) {
        const { width, height } = this.props.domElement.getBoundingClientRect()
        this.mouseNDC.x = (event.clientX / width) * 2 - 1 
        this.mouseNDC.y = -((event.clientY / height) * 2 - 1)
        this.mouseScreen.set(event.clientX, event.clientY)
    }
    setIsDragging(isDragging) {
        this.isDragging = isDragging
    }
    handleMouseDown(event) {
        this.setMouse(event);
        this.setIsDragging(true);
    }
    handleMouseMove(event) {
        this.setMouse(event)
    }
    handleMouseUp(event) {
        this.setMouse(event);
        this.setIsDragging(false);
    }
    handleMouseOut() {
        this.setIsDragging(false);
    }
    handleTouchStart(event) {
        this.setMouse(event.changedTouches[0])
        this.lastMouseNDC.copy(this.mouseNDC)
        this.setIsDragging(true)
    }
    handleTouchMove(event) {
        this.setMouse(event.changedTouches[0])
    }
    handleTouchEnd(event) {
        this.setMouse(event.changedTouches[0])
        this.setIsDragging(false)
    }
    update(delta) {
        let deltaX = 0
        let deltaY = 0

        const { 
            innerGlobeContainer, 
            globeContainer, 
            rotationSpeed, 
            autoRotationSpeed, 
            easing,
            maxRotationX,
            domElement
        } = this.props
        
        if (this.isDragging) {
            deltaY = this.mouseNDC.y - this.lastMouseNDC.y
            this.target.y = THREE.MathUtils.clamp(this.target.y + -deltaY, -maxRotationX, maxRotationX)
            deltaX = this.mouseNDC.x - this.lastMouseNDC.x
            domElement.style.cursor = 'grabbing'
        }

        globeContainer.rotation.x += (this.target.y + globeRotationOffset.x - globeContainer.rotation.x) * easing
        
        this.target.x = this.target.x + (0 - (this.target.x + -deltaX)) * easing
        rotateY(innerGlobeContainer, this.target.x * rotationSpeed, this.matrix)

        if (!this.isDragging) {
            rotateY(innerGlobeContainer, delta * autoRotationSpeed * this.autoRotationSpeedScalar, this.matrix);
            domElement.style.cursor = 'grab'
        }
        
        this.autoRotationSpeedScalar += (this.autoRotationSpeedScalarTarget - this.autoRotationSpeedScalar) * .05

        this.lastMouseNDC.copy(this.mouseNDC)
        this.velocity.set(deltaX, deltaY)
    }
}

export function rotateY(innerGlobeContainer, radians, matrix) {
    const rotationMatrix = matrix || new THREE.Matrix4()
    rotationMatrix.identity()
    rotationMatrix.makeRotationY(radians)
    rotationMatrix.multiply(innerGlobeContainer.matrix)
    innerGlobeContainer.matrix.copy(rotationMatrix)
    innerGlobeContainer.rotation.setFromRotationMatrix(innerGlobeContainer.matrix)
}