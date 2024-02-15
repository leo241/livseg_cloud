import axios from 'axios'


export async function upload_files({file, action, onProgress, onFinish, target_files}) {
    const formData = new FormData()
    formData.append('file', file.file)
    const response = await axios.post(`${action}/upload`, formData)
    const { image_name, num_slice, num_frame } = response.data
    target_files.name = image_name

    target_files.files = []
    for (let slice_idx = 0; slice_idx < num_slice; slice_idx++) {
        for (let frame_idx = 0; frame_idx < num_frame; frame_idx++){
            console.log(`slice_idx: ${slice_idx}, frame_idx: ${frame_idx}`)
            const file_response = await axios.get(`${action}/download/${image_name}/image/${slice_idx}/${frame_idx}`, {responseType: 'blob'})
            const new_file = new File([file_response.data], `file${slice_idx}_${frame_idx}.dcm`)
            target_files.files.push(new_file)
            onProgress({ percent: Math.ceil(100 * ((slice_idx * num_frame) + frame_idx) / (num_frame * num_slice))})
        }
    }
    onFinish()
}
