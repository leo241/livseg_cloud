import { load_volume } from "../load_volume"

export async function show_image(image) {
    const viewportIds = ['axial', 'coronal', 'sagittal']
    const volumeId = 'image'
    const tool_group =  cornerstoneTools.ToolGroupManager.getToolGroup('tool_group')
    viewportIds.forEach((viewportId) => tool_group.addViewport(viewportId))

    await load_volume({volumeId, target_files: image})
    cornerstone.setVolumesForViewports(cornerstone.getRenderingEngine('engine'), [{volumeId}], viewportIds)
    image.show_flag = true
}

export async function show_segmentation(seg) {
    const segmentationId = 'seg'
    await load_volume({volumeId: segmentationId, target_files: seg})
    cornerstoneTools.segmentation.addSegmentations([
        {
            segmentationId,
            representation: {
                type: cornerstoneTools.Enums.SegmentationRepresentations.Labelmap,
                data: {volumeId: segmentationId}
            }
        }
    ])
    await cornerstoneTools.segmentation.addSegmentationRepresentations('tool_group', [
        {
            segmentationId,
            type: cornerstoneTools.Enums.SegmentationRepresentations.Labelmap,
        },
    ])
}

export function change_ref(orientation_ref) {
    const tool_group = cornerstoneTools.ToolGroupManager.getToolGroup('tool_group')
    tool_group.setToolConfiguration(cornerstoneTools.ReferenceLinesTool.toolName,
        {
            sourceViewportId: orientation_ref.value,
        },
        true // overwrite
    )
    tool_group.setToolEnabled(cornerstoneTools.ReferenceLinesTool.toolName)
}