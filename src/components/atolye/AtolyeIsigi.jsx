import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Atölye ışığı: ağ isteği atmadan, ışık panellerinden üretilen ortam haritası.
// Harita bütün sahneler için YALNIZCA BİR KEZ üretilir ve paylaşılır; her <View>
// kendi haritasını üretseydi sayfa açılışında yedi kez hesaplanırdı.
let ortakHarita = null

function ortamHaritasi(gl) {
    if (ortakHarita) return ortakHarita
    const sahne = new THREE.Scene()
    sahne.background = new THREE.Color('#05050A')
    const panel = (renk, guc, konum, olcek) => {
        const m = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            new THREE.MeshBasicMaterial({ color: new THREE.Color(renk).multiplyScalar(guc), side: THREE.DoubleSide })
        )
        m.position.set(...konum)
        m.scale.set(...olcek)
        m.lookAt(0, 0, 0)
        sahne.add(m)
    }
    // Uzay stüdyosu: beyaz anahtar ışık, yanlardan ve alttan kürenin mor kenar ışığı
    panel('#FFFFFF', 4.5, [4, 2.5, 2], [3, 5, 1])
    panel('#8B5CF6', 4, [-5, 1.5, -1], [2, 6, 1])
    panel('#EDE9FF', 3, [0, 6, 0], [4, 4, 1])
    panel('#6D4AFF', 1.6, [0, -4, 3], [8, 1, 1])
    // Alçak ön dolgu: metal gövdeler karanlıkta kaybolmasın
    panel('#FFFFFF', 2.2, [0.5, -0.6, 5], [7, 2.2, 1])

    const pmrem = new THREE.PMREMGenerator(gl)
    ortakHarita = pmrem.fromScene(sahne, 0.02).texture
    pmrem.dispose()
    sahne.traverse((o) => {
        if (o.isMesh) {
            o.geometry.dispose()
            o.material.dispose()
        }
    })
    return ortakHarita
}

export default function AtolyeIsigi() {
    const gl = useThree((s) => s.gl)
    const sahne = useThree((s) => s.scene)

    useLayoutEffect(() => {
        sahne.environment = ortamHaritasi(gl)
        return () => {
            sahne.environment = null
        }
    }, [gl, sahne])

    return (
        <>
            <ambientLight intensity={0.15} />
            <directionalLight position={[3, 5, 2]} intensity={1.6} color="#F3EEFF" />
        </>
    )
}
