import { prime_init } from './prime_init'

const { ViewportType, OrientationAxis } = cornerstone.Enums
const { MouseBindings, KeyboardBindings } = cornerstoneTools.Enums

const {
    WindowLevelTool,
    StackScrollMouseWheelTool,
    ZoomTool,
    ToolGroupManager,
    StackScrollTool,
    SegmentationDisplayTool,
    ReferenceLinesTool
} = cornerstoneTools


export async function init(displays) {
    await prime_init()

    const viewportIds = ['axial', 'coronal', 'sagittal']

    const engine = new cornerstone.RenderingEngine('engine')

    cornerstoneTools.addTool(StackScrollMouseWheelTool)
    cornerstoneTools.addTool(StackScrollTool)
    cornerstoneTools.addTool(WindowLevelTool)
    cornerstoneTools.addTool(ZoomTool)
    cornerstoneTools.addTool(SegmentationDisplayTool)
    cornerstoneTools.addTool(ReferenceLinesTool)

    const toolGroup = ToolGroupManager.createToolGroup('tool_group')

    toolGroup.addTool(StackScrollMouseWheelTool.toolName)
    toolGroup.addTool(StackScrollTool.toolName)
    toolGroup.addTool(WindowLevelTool.toolName)
    toolGroup.addTool(ZoomTool.toolName)
    toolGroup.addTool(SegmentationDisplayTool.toolName)
    toolGroup.addTool(ReferenceLinesTool.toolName, {
        sourceViewportId: viewportIds[0]
    })

    // activate tools
    toolGroup.setToolActive(StackScrollMouseWheelTool.toolName)
    toolGroup.setToolActive(StackScrollTool.toolName, {
        bindings: [
            {
                mouseButton: MouseBindings.Primary,
            },
        ]
    })
    toolGroup.setToolActive(WindowLevelTool.toolName, {
        bindings: [
            {
                mouseButton: MouseBindings.Primary,
                modifierKey: KeyboardBindings.Alt,
            },
            {
                mouseButton: MouseBindings.Secondary,
            },
        ]
    })
    toolGroup.setToolActive(ZoomTool.toolName, {
        bindings: [
            {
                mouseButton: MouseBindings.Primary,
                modifierKey: KeyboardBindings.Shift,
            },
        ]
    })
    toolGroup.setToolActive(SegmentationDisplayTool.toolName)
    toolGroup.setToolActive(ReferenceLinesTool.toolName)

    const viewportInputArray = [
        {
            viewportId: viewportIds[0],
            type: ViewportType.ORTHOGRAPHIC,
            element: displays[0],
            defaultOptions: {orientation: OrientationAxis.AXIAL}
        },
        {
            viewportId: viewportIds[1],
            type: ViewportType.ORTHOGRAPHIC,
            element: displays[1],
            defaultOptions: {orientation: OrientationAxis.CORONAL}
        },
        {
            viewportId: viewportIds[2],
            type: ViewportType.ORTHOGRAPHIC,
            element: displays[2],
            defaultOptions: {orientation: OrientationAxis.SAGITTAL}
        }
    ]

    engine.setViewports(viewportInputArray)
    // viewportIds.forEach((viewportId) => toolGroup.addViewport(viewportId))
}