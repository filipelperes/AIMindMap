import { useEffect } from 'react'
import * as THREE from 'three'
import { disposeObject } from '../utils/threeHelpers'

/* ============================================================
   useThreeJSDisposal — Hook que faz dispose automático de
   objetos Three.js ao desmontar o componente.
   Previne vazamento de memória GPU.
   ============================================================ */

/**
 * Registra cleanup que percorre o objeto e faz dispose
 * de geometrias, materiais e texturas.
 *
 * @param objectRef — Ref para o Object3D a ser limpo.
 */
export function useThreeJSDisposal(
  objectRef: React.RefObject<THREE.Object3D | null>,
): void {
  useEffect(() => {
    const obj = objectRef.current
    return () => {
      if (obj) {
        disposeObject(obj)
      }
    }
  }, [objectRef])
}

/**
 * Versão para uso com múltiplos objetos.
 * @param getObjects — Função que retorna os objetos a limpar.
 */
export function useThreeJSDisposalList(
  getObjects: () => THREE.Object3D[],
  deps: React.DependencyList = [],
): void {
  useEffect(() => {
    return () => {
      const objects = getObjects()
      objects.forEach(disposeObject)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}
