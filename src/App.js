import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { Canvas, extend, useFrame, useThree, useLoader } from '@react-three/fiber'
import { useCursor, MeshPortalMaterial, CameraControls, Gltf, Text } from '@react-three/drei'
import { useRoute, useLocation } from 'wouter'
import { easing, geometry } from 'maath'
import { suspend } from 'suspend-react'
import React from 'react'
import './styles.css'

extend(geometry)
const regular = import('@pmndrs/assets/fonts/inter_regular.woff')
const medium = import('@pmndrs/assets/fonts/inter_medium.woff')

const removeWatermark = () => {
  const ids = []
  const iframes = document.body.querySelectorAll('iframe')
  for (const iframe of iframes) {
    if (iframe.id.startsWith('sb__open-sandbox')) ids.push(iframe.id)
  }
  for (const id of ids) {
    const node = document.createElement('div')
    node.style.setProperty('display', 'none', 'important')
    node.id = id
    document.getElementById(id).remove()
    document.body.appendChild(node)
  }
}

setTimeout(removeWatermark, 1000)

export const App = () => {
  const backgroundImageStyle = {
    backgroundImage: 'url(./assets/nepszi.jpg)', // Correct syntax for backgroundImage
    backgroundSize: 'cover', // Cover the entire container
    backgroundPosition: 'center', // Center the image
    backgroundRepeat: 'no-repeat', // Do not repeat the image
    height: '100vh', // Full height
    width: '100%' // Full width
  }

  return (
    <div style={backgroundImageStyle}>
      <Canvas camera={{ fov: 75, position: [0, 0, 20] }} eventSource={document.getElementById('root')} eventPrefix="client">
        {/* Ambient Light */}
        <ambientLight intensity={0.5} />

        {/* Directional Light */}
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Frame id="01" name={`info`} author="utilities" bg="#e4cdac" position={[-1.2, 0, 0]} rotation={[0, 0.5, 0]}>
          <ambientLight intensity={1} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <Gltf src="./assets/roomLeft6.glb" scale={8} position={[0, -0.7, -2]} />
        </Frame>
        <Frame id="02" name="peek" author="Nepszinhaz utca 42.">
          <ambientLight intensity={1} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <Gltf src="./assets/middlePortal7.glb" position={[0, -2, -3]} />
        </Frame>
        <Frame id="03" name="map" author="recommended places" bg="#d1d1ca" position={[1.2, 0, 0]} rotation={[0, -0.5, 0]}>
          <ambientLight intensity={1} />
          <directionalLight position={[10, 10, 5]} intensity={0.5} castShadow />
          <Gltf src="./assets/roomRightInside5.glb" scale={1} position={[0, -0.8, -4]} />
        </Frame>

        <Rig />
      </Canvas>
    </div>
  )
}

function Frame({ id, name, author, bg, width = 1, height = 1.61803398875, children, ...props }) {
  const portal = useRef()
  const [, setLocation] = useLocation()
  const [, params] = useRoute('/item/:id')
  const [hovered, hover] = useState(false)
  useCursor(hovered)
  useFrame((state, dt) => easing.damp(portal.current, 'blend', params?.id === id ? 1 : 0, 0.2, dt))
  return (
    <group {...props}>
      <Text font={suspend(medium).default} fontSize={0.3} anchorY="top" anchorX="left" lineHeight={0.8} position={[-0.375, 0.715, 0.01]} material-toneMapped={false}>
        {name}
      </Text>
      <Text font={suspend(regular).default} fontSize={0.1} anchorX="right" position={[0.4, -0.659, 0.01]} material-toneMapped={false}>
        /{id}
      </Text>
      <Text font={suspend(regular).default} fontSize={0.04} anchorX="right" position={[0.0, -0.677, 0.01]} material-toneMapped={false}>
        {author}
      </Text>
      <mesh name={id} onDoubleClick={(e) => (e.stopPropagation(), setLocation('/item/' + e.object.name))} onPointerOver={(e) => hover(true)} onPointerOut={() => hover(false)}>
        <roundedPlaneGeometry args={[width, height, 0.21]} />
        <MeshPortalMaterial ref={portal} events={params?.id === id} side={THREE.DoubleSide}>
          <color attach="background" args={[bg]} />
          {children}
        </MeshPortalMaterial>
      </mesh>
    </group>
  )
}

function Rig({ position = new THREE.Vector3(0, 0, 2), focus = new THREE.Vector3(0, 0, 0) }) {
  const { controls, scene } = useThree()
  const [, params] = useRoute('/item/:id')
  useEffect(() => {
    const active = scene.getObjectByName(params?.id)
    if (active) {
      active.parent.localToWorld(position.set(0, 0.5, 0.25))
      active.parent.localToWorld(focus.set(0, 0, -2))
    }
    controls?.setLookAt(...position.toArray(), ...focus.toArray(), true)
  })
  return <CameraControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
}
