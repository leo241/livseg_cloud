import initProviders from './initProviders'
import initCornerstoneDICOMImageLoader from './initCornerstoneDICOMImageLoader'
import initVolumeLoader from './initVolumeLoader'
import { init as csRenderInit } from '@cornerstonejs/core'
import { init as csToolsInit } from '@cornerstonejs/tools'

export async function prime_init() {
    initProviders()
    initCornerstoneDICOMImageLoader()
    initVolumeLoader()
    await csRenderInit()
    csToolsInit()
}
