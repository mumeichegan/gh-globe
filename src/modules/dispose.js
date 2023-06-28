import * as THREE from 'three'

export function disposeNode(node) {
    if (node instanceof THREE.Mesh) {
        if (node.geometry) {
            node.geometry.dispose();
        }
        if (node.material) {
            if (node.material.map) node.material.map.dispose();
            if (node.material.lightMap) node.material.lightMap.dispose();
            if (node.material.bumpMap) node.material.bumpMap.dispose();
            if (node.material.normalMap) node.material.normalMap.dispose();
            if (node.material.specularMap) node.material.specularMap.dispose();
            if (node.material.envMap) node.material.envMap.dispose();
            if (node.material.emissiveMap) node.material.emissiveMap.dispose();
            if (node.material.metalnessMap) node.material.metalnessMap.dispose();
            if (node.material.roughnessMap) node.material.roughnessMap.dispose();
            
            node.material.dispose(); // disposes any programs associated with the material
        }
    }
}