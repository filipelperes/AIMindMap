/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'd3-force-3d' {
  export interface ForceSimulation {
    stop(): ForceSimulation
    restart(): ForceSimulation
    alpha(value?: number): ForceSimulation | number
    alphaDecay(value?: number): ForceSimulation | number
    velocityDecay(value?: number): ForceSimulation | number
    force(name: string, force: any): ForceSimulation
    on(type: string, callback?: () => void): any
    nodes(): any[]
    nodes(nodes: any[]): ForceSimulation
  }

  export function forceSimulation(nodes?: any[]): ForceSimulation
  export function forceCharge(strength?: number): any
  export function forceLink(links?: any[]): any
  export function forceCenter(x?: number, y?: number, z?: number): any
  export function forceCollide(radius?: number): any
}
