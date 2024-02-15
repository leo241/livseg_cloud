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

    async function download_seg() {
      try{
        const response = await axios.get(`http://127.0.0.1:8001/download/${image.name}`, {responseType: 'blob'})
        if (response.status === 200) {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const linkElement = document.createElement('a');
          linkElement.href = url;
          linkElement.download = `${image.name}_label.nii.gz`;
          document.body.appendChild(linkElement);
          linkElement.click();
          setTimeout(() => {
            document.body.removeChild(linkElement);
            window.URL.revokeObjectURL(url);
          }, 0);
        }
      }catch (error) {
        console.error("Error downloading file:", error);
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
            <n-upload action="http://127.0.0.1:8001" :custom-request="upload_image">
                <n-button>Upload Image and Seg in MRI SAM</n-button>
            </n-upload>
            <n-button @click="download_seg()" :disabled="!image.load_flag">Download Prediction Mask</n-button>
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
