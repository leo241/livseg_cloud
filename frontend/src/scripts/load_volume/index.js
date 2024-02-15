import * as cornerstone from '@cornerstonejs/core'
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader'
import { convertMultiframeImageIds, prefetchMetadataInformation } from './convertMultiframeImageIds'


export async function load_volume({volumeId, target_files}) {

    const images = []
    for (const file of target_files.files) {
        const imageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(file)
        images.push(imageId)
    }
    
    await prefetchMetadataInformation(images)
    const imageIds = convertMultiframeImageIds(images)

    const volume = await cornerstone.volumeLoader.createAndCacheVolume(volumeId, {imageIds})
    volume.load()
}
