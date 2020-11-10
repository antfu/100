import { useDeviceMotion } from '@vueuse/core'
import { watch } from 'vue'

export function useShake(fn: () => void) {
  const options = {
    threshold: 10, // default velocity threshold for shake to register
    timeout: 500, // default interval between events
  }

  const { accelerationIncludingGravity } = useDeviceMotion()

  let lastX: number | null = null
  let lastY: number | null = null
  let lastZ: number | null = null
  let lastTime = new Date()

  watch(accelerationIncludingGravity, () => {
    const current = accelerationIncludingGravity.value
    if (!current)
      return

    let currentTime
    let timeDifference
    let deltaX = 0
    let deltaY = 0
    let deltaZ = 0

    if (lastX === null || lastY === null || lastZ === null) {
      lastX = current.x
      lastY = current.y
      lastZ = current.z
      return
    }

    deltaX = Math.abs(lastX - current.x!)
    deltaY = Math.abs(lastY - current.y!)
    deltaZ = Math.abs(lastZ - current.z!)

    if (((deltaX > options.threshold) && (deltaY > options.threshold)) || ((deltaX > options.threshold) && (deltaZ > options.threshold)) || ((deltaY > options.threshold) && (deltaZ > options.threshold))) {
      // calculate time in milliseconds since last shake registered
      currentTime = new Date()
      timeDifference = currentTime.getTime() - lastTime.getTime()

      if (timeDifference > options.timeout) {
        fn()
        lastTime = new Date()
      }
    }

    lastX = current.x
    lastY = current.y
    lastZ = current.z
  })
}
