import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    VisualMapComponent,
} from 'echarts/components'

use([
    CanvasRenderer,
    PieChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    VisualMapComponent
])

export function plot_bullseye(bullseye_data, frames, option) {
    frames.num = bullseye_data.length
    const slice_num = bullseye_data[0].length
    const piece_num = bullseye_data[0][0].length

    const slice_percent = (80 / slice_num).toFixed(2)

    const flat_data = bullseye_data.flat().flat()
    option.visualMap[0].min = Math.min(...flat_data)
    option.visualMap[0].max = Math.max(...flat_data)

    frames.current = Math.floor(frames.num / 2)

    for (let frame_idx = 0; frame_idx < frames.num; frame_idx++) {
        // let slice_data = [{name: 'Apical', type: 'pie'}]
        let slice_data = []
        for (let slice_idx=0; slice_idx < slice_num; slice_idx++) {
            let piece_data = []
            for (let piece_idx=0; piece_idx < piece_num; piece_idx++) {
                piece_data.push({value: bullseye_data[frame_idx][slice_idx][piece_idx], name: slice_idx + 1})
            }
            slice_data.push({
                name: `Slice ${slice_idx}`,
                type: 'pie',
                radius: [`${slice_percent * slice_idx}%`, `${slice_percent * (slice_idx + 1)}%`],
                minAngle: 360,
                startAngle: 180,
                avoidLabelOverlap: false,
                label: {show: false, position: 'center'},
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '50',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {show: true},
                data: piece_data
            })
        }
        // slice_data.push({name: 'Basal', type: 'pie'})
        frames.data.push(slice_data)
    }
    option.series = frames.data[frames.current]
}
