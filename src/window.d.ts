import type Matter from '@types/matter-js'
import type * as THREE from 'three'

declare interface Window {
  Matter: Matter
  THREE: THREE
}
