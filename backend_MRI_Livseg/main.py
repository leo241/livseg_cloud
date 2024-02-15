import os

from uvicorn import run # 运行服务器
from fastapi.middleware.cors import CORSMiddleware # 加入中间件的目的是为了使不同用户访问我们的客户端
from fastapi.responses import FileResponse
from fastapi import FastAPI, UploadFile, BackgroundTasks
# from fastapi import staticfiles # 新添加，为了和前端连接

from inference import infer

app = FastAPI()

# app.mount("/static", staticfiles.StaticFiles(directory="dist"), name="static")
# @app.get("/")
# def read_root():
#     return staticfiles.FileResponse("dist/index.html")

# 添加CORS中间件配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],# 允许任何源，生产环境应改为具体的合法源列表
    allow_credentials=True, # 允许携带凭证（cookies）
    allow_methods=["*"],# 允许所有HTTP方法
    allow_headers=["*"],# 允许所有头部
)


@app.post("/upload")
async def create_upload_file(file: UploadFile, background_tasks: BackgroundTasks):
    image_name = file.filename.split(".")[0]

    image_dir = os.path.join("./data", image_name, 'image')
    if not os.path.exists(image_dir):
        os.makedirs(image_dir)

    seg_dir = os.path.join("./data", image_name, 'seg')
    if not os.path.exists(seg_dir):
        os.makedirs(seg_dir)

    nifti_path = os.path.join(image_dir, file.filename)
    with open(nifti_path, "wb") as f: # 将用户上传的图像存到后端数据库
        contents = await file.read()
        f.write(contents)

    # infer in background
    background_tasks.add_task(infer, image_name) # 开始使用模型分割，并将分割结果保存

    # print(nifti_path)
    # print(image_dir)


    return {"image_name": image_name}


@app.get("/download/{image_name}")
async def download_file(image_name: str):
    seg_dir = os.path.join("./data", image_name, 'seg','label.nii.gz')
    return FileResponse(
        seg_dir
        # filename=f'{image_name}_label.nii.gz',
        # background=BackgroundTask(lambda: os.remove(seg_dir)), # 这一行的作用是用户下载完将文件从数据库删除
    )




if __name__ == "__main__":
    run(app="main:app", host="0.0.0.0", reload=True, port=8001)
    # run(app="main:app", host="127.0.0.1", reload=True, port=8001) # 能打开的网页： http://127.0.0.1:8001/docs
