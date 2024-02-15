<script setup>
    import axios from 'axios'
    import { reactive, ref, watch } from 'vue';
    import { NButton, NUpload, NSpace, NSlider, NProgress } from 'naive-ui'
    import VChart from 'vue-echarts'

    import {init, upload_files} from '../scripts'
    import {plot_bullseye, show_image, show_segmentation, change_ref} from '../scripts/cardiac_workflow'

    const displays = reactive([])
    const image = reactive({files: [], load_flag: false, show_flag: false, name: null})
    const seg = reactive({files: [], load_flag: false, name: null, percent: 0})
    const orientation_ref = ref('axial')

    const frames = reactive({data: [], current: null, num: null})
    const marks = ref({})
    const option = reactive({
        title: {
            text: "Bull's Eye Plot",
            left: 'center',
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            top: '5%',
            left: 'left',
            orient: 'vertical'
        },
        visualMap: [
            {
                type: 'continuous',
                min: null,
                max: null,
                calculable: true,
                inRange: {
                    color: ['#FFFFFF', '#002FA7'],
                },
                right: 'right'
            }
        ],
        series: []
    })


    init(displays).then(() => {
        console.log('init done')
    })

    async function upload_image({file, action, onProgress, onFinish}) {
        await upload_files({file, action, onProgress, onFinish, target_files: image})
        image.load_flag = true
    }

    async function get_motion() {
        const bullseye_data = await axios.get(`http://10.12.203.60:8001/get_motion/${image.name}`, {responseType: 'json'})
        plot_bullseye(bullseye_data.data, frames, option)
    }

    async function get_seg() {
        const response = await axios.post(`http://10.12.203.60:8001/get_seg/${image.name}`)
        const { image_name, num_slice, num_frame } = response.data
        for (let slice_idx = 0; slice_idx < num_slice; slice_idx++) {
            for (let frame_idx = 0; frame_idx < num_frame; frame_idx++){
                const file_response = await axios.get(`http://10.12.203.60:8001/download/${image_name}/seg/${slice_idx}/${frame_idx}`, {responseType: 'blob'})
                const new_file = new File([file_response.data], `file${slice_idx}_${frame_idx}.dcm`)
                seg.files.push(new_file)
                seg.percent = Math.ceil(100 * ((slice_idx * num_frame) + frame_idx) / (num_frame * num_slice))
            }
        }
        seg.load_flag = true
    }

    watch(frames, () => {
        option.series = frames.data[frames.current]

        if (Object.keys(marks.value).length === 0) {
            for (let i = 0; i < frames.num; i++) {
                marks.value[i] = i
            }
        }
    })

    watch(orientation_ref, () => {
        change_ref(orientation_ref)
    })

</script>


<template>
    <n-space justify="space-between">
        <n-space vertical>
            <n-upload action="http://10.12.203.60:8001" :custom-request="upload_image">
                <n-button>Upload Image</n-button>
            </n-upload>
            <n-button @click="show_image(image)" :disabled="!image.load_flag">Show Image</n-button>
        </n-space>

        <n-space vertical>
            <n-button @click="get_seg()" :disabled="!image.load_flag">Segment</n-button>
            <n-progress type="line" :percentage="seg.percent" v-show="seg.percent != 0"/>
            <n-button @click="show_segmentation(seg)" :disabled="!seg.load_flag">Show segmentation</n-button>
            <n-button @click="get_motion()" :disabled="!seg.load_flag">Plot Bull's eye</n-button>
        </n-space>

        <n-space vertical>
            <n-button @click="orientation_ref = 'axial'" :disabled="!image.show_flag || orientation_ref=='axial'">Axial</n-button>
            <n-button @click="orientation_ref = 'coronal'" :disabled="!image.show_flag || orientation_ref=='coronal'">Coronal</n-button>
            <n-button @click="orientation_ref = 'sagittal'" :disabled="!image.show_flag || orientation_ref=='sagittal'">Sagittal</n-button>
        </n-space>
    </n-space>

    <div id="display_container">
        <div class="display" v-for="item in 3" ref="displays"></div>
    </div>

    <div>
        <v-chart class="chart" :option="option" autoresize v-if="option.series.length != 0" />
        <n-slider v-model:value="frames.current" :max="frames.num-1" :marks="marks" :tooltip="false" v-if="option.series.length != 0"/>
    </div>

</template>

<style scoped>
    .display {
        flex: 1;
        width: 30%;
        height: 30vh;
        margin: 10px
    }
    #display_container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center; /* 居中对齐 */
        align-items: center; /* 居中对齐 */
    }
    .chart {
        height: 30vh;
    }
</style>
