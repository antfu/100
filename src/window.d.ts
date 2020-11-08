import Matter from '@types/matter-js'
import * as THREE from 'three'

declare interface Window {
  Matter: Matter
  THREE: THREE
}
