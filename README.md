# DataCollect

1. API 端点

路径：/api/file/upload
方法：POST
Content-Type: multipart/form-data
2. 参数要求

name_token: 用户名称令牌
zone_id: 区域ID（整数）
file: 要上传的文件


storage/
└── files/
    └── {zone_id}/
        └── {timestamp}/
            ├── {timestamp}.{original_extension}  # 原始文件
            └── {timestamp}.json                 # 元数据文件

{
    "original_filename": "原始文件名",
    "timestamp": 上传时间戳,
    "zone_id": 区域ID,
    "name_token": "用户名称令牌",
    "file_path": "文件存储路径"
}


{
    "success": true,
    "message": "File uploaded successfully",
    "data": {
        "file_path": "存储路径",
        "metadata": {
            // 元数据信息
        }
    }
}

{
    "success": false,
    "message": "错误信息"
}
