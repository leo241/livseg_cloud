import os
from model.segment_anything import sam_model_registry
import warnings
from tqdm import tqdm
from skimage import transform # 用于sam的推断过程
import torch
import numpy as np
import SimpleITK as sitk
from skimage.measure import label
from PIL import Image
from collections import Counter

warnings.filterwarnings("ignore")
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")  # 使用gpu加速


def medsam_inference( medsam_model, img_embed, box_1024=np.array([[0.0, 0.0, 1024.0, 1024.0]])):  # sam的推断函数
    box_torch = torch.as_tensor(box_1024, dtype=torch.float, device=img_embed.device)
    if len(box_torch.shape) == 2:
        box_torch = box_torch[:, None, :]  # (B, 1, 4)

    sparse_embeddings, dense_embeddings = medsam_model.prompt_encoder(
        points=None,
        boxes=box_torch,
        # boxes = None,
        masks=None,
    )
    low_res_logits, _ = medsam_model.mask_decoder(
        image_embeddings=img_embed,  # (B, 256, 64, 64)
        image_pe=medsam_model.prompt_encoder.get_dense_pe(),  # (1, 256, 64, 64)
        sparse_prompt_embeddings=sparse_embeddings,  # (B, 2, 256)
        dense_prompt_embeddings=dense_embeddings,  # (B, 256, 64, 64)
        multimask_output=False,
    )
    low_res_pred = torch.sigmoid(low_res_logits)  # (1, 1, 256, 256)
    low_res_pred = low_res_pred.squeeze().cpu().detach().numpy()  # (256, 256)
    medsam_seg = (low_res_pred > 0.5).astype(np.uint8)
    return medsam_seg


def predict(net, img_np):
    '''
    给定模型和图片，以及网络预测所需要的resize，预测mask，返回mask矩阵
    :param net:
    :param target:
    :return:
    '''
    if len(img_np.shape) == 2:
        img_3c = np.repeat(img_np[:, :, None], 3, axis=-1)
    else:
        img_3c = img_np[:, :, 0:3]
    img_1024 = transform.resize(
        img_3c, (1024, 1024), order=3, preserve_range=True, anti_aliasing=True
    ).astype(np.uint8)
    img_1024 = (img_1024 - img_1024.min()) / np.clip(
        img_1024.max() - img_1024.min(), a_min=1e-8, a_max=None
    )  # normalize to [0, 1], (H, W, 3)
    # convert the shape to (3, H, W)
    img_1024_tensor = (
        torch.tensor(img_1024).float().permute(2, 0, 1).unsqueeze(0).to(device)
    )
    box_1024 = np.array([[0, 0, 1024, 1024]])
    with torch.no_grad():  # 这里在fine-tuning时也要no_grad，因为不能改变encoder的参数
        image_embedding = net.image_encoder(img_1024_tensor)  # (1, 256, 64, 64)
    medsam_seg = medsam_inference(net, image_embedding, box_1024)

    return image_embedding,medsam_seg

def top_k_connected_postprocessing(mask, k):
    '''
    单连通域后处理，只保留前k个最多的连通域
    代码参考自https://blog.csdn.net/zz2230633069/article/details/85107971
    '''
    marked_label, num = label(mask, connectivity=3, return_num=True)
    shape = marked_label.shape
    lst = marked_label.flatten().tolist()  # 三维数组平摊成一维列表
    freq = Counter(lst).most_common(k + 1)
    keys = [item[0] for item in freq]
    for id, item in enumerate(lst):
        if item == 0:
            continue
        elif item not in keys:
            lst[id] = 0
        else:
            lst[id] = 1
    return np.asarray(lst).reshape(shape)

def save_arr2nii(arr, path='tmp.nii.gz'):
    if os.path.splitext(path)[-1] in ['.jpg','.JPG','.jpeg','.JPEG']: # jpg文件无法三维写入
        arr = arr[0]
    tmp_simg = sitk.GetImageFromArray(arr)
    tmp_simg = sitk.Cast(tmp_simg, sitk.sitkUInt8) # 做完这个格式转化，就可以以png的格式存储标签了，实现了各种图像都能储存
    sitk.WriteImage(tmp_simg, path)

def dir2pre(net, item, standard=False):
    # 加载模型
    net = net.to(device)  # 加入gpu
    net.eval()

    lblb = sitk.ReadImage(item)
    # print('fig dir:',item)
    lblb = sitk.GetArrayFromImage(lblb)
    # print('处理前shape', lblb.shape)
    lblb = lblb.reshape(tuple(sorted(lblb.shape))) # 让维度按照从小到大的顺序重组,我建议训练的时候也作同样的数据增强
    if len(lblb.shape) == 2:  # 二维图片需要扩充维度
        lblb = lblb.reshape((1,lblb.shape[0],lblb.shape[1]))
    if len(lblb.shape) == 4:  # DWI高B值图像是四维，直接忽略最短的维度
        lblb = lblb[0]
    if standard:
        lblb = (lblb - np.mean(lblb)) / np.std(lblb)  # a.先对图像做标准化
    # print('处理后shape', lblb.shape)
    minimum = np.min(lblb)
    gap = np.max(lblb) - minimum
    lblb = (lblb - minimum) / gap * 255  # b.再对图像做0-255“归一化”

    resize_shape = (lblb.shape[2], lblb.shape[1])
    glist = []
    zlist = []
    for id in tqdm(range(lblb.shape[0])):
        img = lblb[id].squeeze().astype(float)
        ans = predict(net, img)[1]
        img1 = ans * 255
        img1 = Image.fromarray(img1).convert('L')
        img_resize = img1.resize(resize_shape, 0)
        img_resize = np.asarray(img_resize)
        img_resize = np.expand_dims(img_resize, 0)
        z_resize = np.expand_dims(img, 0)
        glist.append(img_resize / 255)
        zlist.append(z_resize)
    tmp = np.concatenate(glist, 0)
    img = np.concatenate(zlist, 0)
    post_pre = top_k_connected_postprocessing(tmp, k = 1) # 后处理

    # 第二次后处理——填补空洞
    post_pre2 = sitk.BinaryFillhole(sitk.GetImageFromArray(post_pre))
    post_pre2 = sitk.GetArrayFromImage(post_pre2)

    return post_pre2

def infer(image_name):
    nifti_path = os.path.join("./data", image_name, 'image', f"{image_name}.nii.gz")
    seg_dir = os.path.join("./data", image_name, 'seg','label.nii.gz')

    model_dir = 'model/sam.pth'
    net = sam_model_registry['vit_b'](checkpoint=model_dir)
    label = dir2pre(net,nifti_path)
    save_arr2nii(label,seg_dir)

if __name__ == '__main__':
    # print(os.getcwd())
    infer('1')