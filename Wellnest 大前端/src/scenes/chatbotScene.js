import React, { Suspense,useState,useControls } from 'react';
import { View, Text } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import  Eva  from '../components/Eva';
import Chick from '../components/Chick';
import Loader from '../components/Loader';
import Trigger from '../components/Trigger';
import { Image, OrbitControls } from '@react-three/drei/native';
import { Audio } from 'three';


export default function ChatbotScene() {
  const [loading, setLoading] = useState(false);
  

  return (
    
    <View style={{ 
      flex:0.5,
      backgroundColor: 'rgba(0, 0, 0, 0)',
    }}
    >
        {loading && <Loader/>}
        <Canvas 
          gl={{ physicallyCorrectLights: true }} 
          camera={{ position: [0, 10, 16], fov: 36 }}  
          onCreated={(state) => { 
            const _gl = state.gl.getContext();
            const pixelStorei = _gl.pixelStorei.bind(_gl);
            _gl.pixelStorei = function(...args) {
              const [parameter] = args;
              switch(parameter) {
                case _gl.UNPACK_FLIP_Y_WEBGL:
                  return pixelStorei(...args);
                default:
                  return;
              }
            };
          }}
        >
          <directionalLight position={[1, 0, 0]} args={["white", 2]} />
          <directionalLight position={[-1, 0, 0]} args={["white", 2.4]} />
          <directionalLight position={[0, 0, 1]} args={["white", 1.2]} />
          <directionalLight position={[0, 0, -1]} args={["white", 1]} />
          <directionalLight position={[0, 1, 0]} args={["white", 4]} />
          <directionalLight position={[0, -1, 0]} args={["white", 0]} />
          <Suspense fallback={<Trigger setLoading={setLoading} />}>
              <Chick rotation={[0,4.70, 0]} /> 
          </Suspense>
        </Canvas>
      </View>

  );
}
