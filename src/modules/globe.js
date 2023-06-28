import * as THREE from 'three'

export default class Globe {
    constructor(props) {
        this.props = props
        this.init()
    }
    init() {
        const {
            radius,
            segaments = 50,
            waterColor = 0x171634
            
        } = this.props
        const geometry = new THREE.SphereGeometry(radius, segaments, segaments)
        const material = new THREE.MeshStandardMaterial({         
            color: waterColor,
            metalness: 0,                                     
            roughness: 0.9,
        })
        this.mesh = new THREE.Mesh(geometry, material)
    }
}