from xlang_sqlite import sqlite
from xlang_yaml import yaml
from '../utils' import simple_hash
from '../utils' import auth
from '../utils' import fs as utilsfs
from xlang_os import fs
import time

def write_binary(path,data):
    f = fs.File(path,"wb")
    f.write(data)
    f.close()

# Initialize database 初始化数据库
sqlite.UseDatabase("../database")

# API: User Registration 用户注册
@srv.route("/api/user/register")
def register_user():
    body = req.body
    jsonBody = yaml.loads(body)
    
    username = jsonBody["username"]
    password = jsonBody["password"]
    display_name = jsonBody["display_name"]
    pwd = simple_hash.password_hash(password)

    pushWritepad(sqlite)
    # Check if username already exists
    %check = SELECT username FROM users WHERE username = ${username};
    existing_user = check.fetch()
    
    if existing_user != None:
        popWritepad()
        return [str({"success": False, "message": "Username already exists"}, format=True), "text/json"]
    
    # Insert new user
    current_time = int(time.time())
    %INSERT INTO users (username, password, display_name, last_login) \
    VALUES (${username}, ${pwd}, ${display_name}, ${current_time});
    
    popWritepad()
    return [str({"success": True, "message": "User registered successfully"}, format=True), "text/json"]

# API: User Login
@srv.route("/api/user/login")
def login_user():
    body = req.body
    jsonBody = yaml.loads(body)
    
    username = jsonBody["username"]
    password = jsonBody["password"]

    pushWritepad(sqlite)
    
    # Verify credentials
    %check = SELECT username, display_name, password FROM users WHERE username = ${username};
    user_data = check.fetch()

    if user_data == None:
        popWritepad()
        return [str({"success": False, "message": "Invalid credentials"}, format=True), "text/json"]
    res = simple_hash.password_check(password, user_data[2])
    if not res:
        popWritepad()
        return [str({"success": False, "message": "Invalid credentials"}, format=True), "text/json"]
    
    # Update last login time
    current_time = int(time.time())
    %UPDATE users SET last_login = ${current_time} WHERE username = ${username};
    
    popWritepad()
    
    # Generate a simple session token (in a real app, use proper JWT or secure tokens)
    token = simple_hash.sign_token(username)
    
    return [str({
        "success": True, 
        "message": "Login successful", 
        "username": user_data[0],
        "display_name": user_data[1],
        "token": token
    }, format=True), "text/json"]


# API: Get User List (protected endpoint)
@srv.route("/api/user/list")
def get_users():

    verify = auth.authentication(req)
    if verify != None:
        return verify

    pushWritepad(sqlite)
    %users_query = SELECT username, display_name, last_login FROM users;
    
    users = []
    row = users_query.fetch()
    
    while row != None:
        users.append({
            "username": row[0],
            "display_name": row[1],
            "last_login": row[2]
        })
        row = users_query.fetch()
    
    popWritepad()
    
    return [str({"success": True, "users": users}, format=True), "text/json"]

# API: Delete User (admin function)
@srv.route("/api/user/delete")
def delete_user():

    verify = auth.authentication(req)
    if verify != None:
        return verify
    token_str = req.all_headers["x-token"]
    token_info = simple_hash.token_decode(token_str)
    token_username = token_info[0]

    if token_username != "admin":
        return [str({"success": False, "message": "Admin authentication failed"}, format=True), "text/json"]
    
    body = req.body
    jsonBody = yaml.loads(body)
    target_username = jsonBody["target_username"]
    # Don't allow deleting the admin account
    if target_username == "admin":
        return [str({"success": False, "message": "Cannot delete admin account"}, format=True), "text/json"]

    pushWritepad(sqlite)

    # 如果id 不存在
    %check = SELECT username FROM users WHERE username = ${target_username};
    user_data = check.fetch()
    if user_data == None:
        popWritepad()
        return [str({"success": False, "message": "This user does not exist"}, format=True), "text/json"]

    # Delete the target user
    %DELETE FROM users WHERE username = ${target_username};
    
    popWritepad()
    return [str({"success": True, "message": "User deleted successfully"}, format=True), "text/json"]





# ---------------------------------------------------zone---------------------------------------------------

# API: Add Zone
@srv.route("/api/zone/add")
def add_zone():

    # 验证token
    verify = auth.authentication(req)
    if verify != None:
        return verify
    token_str = req.all_headers["x-token"]
    token_info = simple_hash.token_decode(token_str)
    token_username = token_info[0]
    # 验证管理员身份
    if token_username != "admin":
        return [str({"success": False, "message": "Admin authentication failed"}, format=True), "text/json"]
    
    body = req.body
    jsonBody = yaml.loads(body)
    
    name = jsonBody["name"]
    # 工作区名不能为空
    if name == "" or name == None::
        return [str({"success": False, "message": "The zone name cannot be empty"}, format=True), "text/json"]

    pushWritepad(sqlite)

    # 如果已经存在
    %check = SELECT name FROM zones WHERE name = ${name};
    zone_data = check.fetch()
    flag = str(zone_data) == ""
    if not flag: # 这里not不能直接写语句，有点反直觉
        popWritepad()
        return [str({"success": False, "message": "zone data already existed"}, format=True), "text/json"]
    
    # Insert new zone
    %INSERT INTO zones (name) \
    VALUES (${name});
    popWritepad()
    return [str({"success": True, "message": "Zone added successfully"}, format=True), "text/json"]

# API: get zones
@srv.route("/api/zone/list")
def getAllZones():

    pushWritepad(sqlite)

    %zones_query = SELECT id,name FROM zones;
    zones = []
    row = zones_query.fetch()
    while row != None:
        zones.append({
            "id": row[0],
            "name": row[1]
        })
        row = zones_query.fetch()

    popWritepad()

    return [str({"success": True, "message": "success", "data":zones}, format=True), "text/json"]


# API: Delete Zone
@srv.route("/api/zone/delete")
def delete_zone():

    # 验证token
    verify = auth.authentication(req)
    if verify != None:
        return verify
    token_str = req.all_headers["x-token"]
    token_info = simple_hash.token_decode(token_str)
    token_username = token_info[0]
    # 验证管理员身份
    if token_username != "admin":
        return [str({"success": False, "message": "Admin authentication failed"}, format=True), "text/json"]

    body = req.body
    jsonBody = yaml.loads(body)
    zone_id = jsonBody["id"]
    # zone id 必须是int且不能小于等于0
    condition1 = str(type(zone_id)) != str(type(0))
    condition2 = zone_id <= 0
    if condition1 or condition2 :
        return [str({"success": False, "message": "The zone id cannot be empty"}, format=True), "text/json"]
    pushWritepad(sqlite)

    # 如果id 不存在
    %check = SELECT id FROM zones WHERE id = ${zone_id};
    zone_data = check.fetch()
    if zone_data == None:
        popWritepad()
        return [str({"success": False, "message": "This data does not exist"}, format=True), "text/json"]
    
    # Delete the target zone
    %DELETE FROM zones WHERE id = ${zone_id};
    
    popWritepad()
    return [str({"success": True, "message": "Zone deleted successfully"}, format=True), "text/json"]


# API: Update Zone
@srv.route("/api/zone/update")
def update_zone():

    # 验证token
    verify = auth.authentication(req)
    if verify != None:
        return verify
    token_str = req.all_headers["x-token"]
    token_info = simple_hash.token_decode(token_str)
    token_username = token_info[0]
    # 验证管理员身份
    if token_username != "admin":
        return [str({"success": False, "message": "Admin authentication failed"}, format=True), "text/json"]
        
    body = req.body
    jsonBody = yaml.loads(body)
    
    zone_id = jsonBody["id"]
    name = jsonBody["name"]
    # 工作区名不能为空
    if name == "" or name == None::
        return [str({"success": False, "message": "The zone name cannot be empty"}, format=True), "text/json"]
    # zone id 必须是int且不能小于等于0
    condition1 = str(type(zone_id)) != str(type(0))
    condition2 = zone_id <= 0
    if condition1 or condition2 :
        return [str({"success": False, "message": "The zone id cannot be empty"}, format=True), "text/json"]
    pushWritepad(sqlite)

    # 如果已经存在
    %check = SELECT name FROM zones WHERE name = ${name};
    label_data = check.fetch()
    flag = str(label_data) == ""
    if not flag: # 这里not不能直接写语句，有点反直觉
        popWritepad()
        return [str({"success": False, "message": "label data already existed"}, format=True), "text/json"]

    # 如果id 不存在
    %check = SELECT id FROM zones WHERE id = ${zone_id};
    zone_data = check.fetch()
    if zone_data == None:
        popWritepad()
        return [str({"success": False, "message": "This data does not exist"}, format=True), "text/json"]

    # Update the zone
    %UPDATE zones SET name = ${name} WHERE id = ${zone_id};

    popWritepad()
    return [str({"success": True, "message": "Zone updated successfully"}, format=True), "text/json"]



# ---------------------------------------------------label---------------------------------------------------



# API: Add Label
@srv.route("/api/label/add")
def add_label():

    # 验证token
    verify = auth.authentication(req)
    if verify != None:
        return verify
    token_str = req.all_headers["x-token"]
    token_info = simple_hash.token_decode(token_str)
    token_username = token_info[0]
    # 验证管理员身份
    if token_username != "admin":
        return [str({"success": False, "message": "Admin authentication failed"}, format=True), "text/json"]

    body = req.body
    jsonBody = yaml.loads(body)
    
    label = jsonBody["label"]
    # label名不能为空
    if label == "" or label == None:
        return [str({"success": False, "message": "The label name cannot be empty"}, format=True), "text/json"]
    pushWritepad(sqlite)
 
     # 如果已经存在
    %check = SELECT label FROM labels WHERE label = ${label};
    label_data = check.fetch()
    flag = str(label_data) == ""
    if not flag: # 这里not不能直接写语句，有点反直觉
        popWritepad()
        return [str({"success": False, "message": "label data already existed"}, format=True), "text/json"]
    
    # Insert new label
    %INSERT INTO labels (label) VALUES (${label});
    
    popWritepad()
    return [str({"success": True, "message": "Label added successfully"}, format=True), "text/json"]


# API: Delete Label
@srv.route("/api/label/delete")
def delete_label():

    # 验证token
    verify = auth.authentication(req)
    if verify != None:
        return verify
    token_str = req.all_headers["x-token"]
    token_info = simple_hash.token_decode(token_str)
    token_username = token_info[0]
    # 验证管理员身份
    if token_username != "admin":
        return [str({"success": False, "message": "Admin authentication failed"}, format=True), "text/json"]

    body = req.body
    jsonBody = yaml.loads(body)
    
    label_id = jsonBody["id"]
    # label id 必须是int且不能小于等于0
    condition1 = str(type(label_id)) != str(type(0))
    condition2 = label_id <= 0
    if condition1 or condition2 :
        return [str({"success": False, "message": "The label id cannot be empty"}, format=True), "text/json"]
    pushWritepad(sqlite)

    # 如果id项不存在
    %check = SELECT id FROM labels WHERE id = ${label_id};
    label_data = check.fetch()
    if label_data == None:
        popWritepad()
        return [str({"success": False, "message": "This data does not exist"}, format=True), "text/json"]
    
    # Delete the target label
    %DELETE FROM labels WHERE id = ${label_id};
    
    popWritepad()
    return [str({"success": False, "message": "Label deleted successfully"}, format=True), "text/json"]


# API: Update Label
@srv.route("/api/label/update")
def update_label():

    # 验证token
    verify = auth.authentication(req)
    if verify != None:
        return verify
    token_str = req.all_headers["x-token"]
    token_info = simple_hash.token_decode(token_str)
    token_username = token_info[0]
    # 验证管理员身份
    if token_username != "admin":
        return [str({"success": False, "message": "Admin authentication failed"}, format=True), "text/json"]

    body = req.body
    jsonBody = yaml.loads(body)
    
    label_id = jsonBody["id"]
    label = jsonBody["label"]
    # label id 必须是int且不能小于等于0
    condition1 = str(type(label_id)) != str(type(0))
    condition2 = label_id <= 0
    if condition1 or condition2 :
        return [str({"success": False, "message": "The label id cannot be empty"}, format=True), "text/json"]
        # 工作区名不能为空
    if label == "" or label == None::
        return [str({"success": False, "message": "The label name cannot be empty"}, format=True), "text/json"]
    
    pushWritepad(sqlite)

     # 如果已经存在
    %check = SELECT label FROM labels WHERE label = ${label};
    label_data = check.fetch()
    flag = str(label_data) == ""
    if not flag: # 这里not不能直接写语句，有点反直觉
        popWritepad()
        return [str({"success": False, "message": "label data already existed"}, format=True), "text/json"]
        
    # 如果id项不存在
    %check = SELECT id FROM labels WHERE id = ${label_id};
    label_data = check.fetch()
    if label_data == None:
        popWritepad()
        return [str({"success": False, "message": "This data does not exist"}, format=True), "text/json"]

    # Update the label
    %UPDATE labels SET label = ${label} WHERE id = ${label_id};
    
    popWritepad()
    return [str({"success": True, "message": "Label updated successfully"}, format=True), "text/json"]

# API: get labels
@srv.route("/api/label/list")
def getAllLabels():

    pushWritepad(sqlite)

    %labels_query = SELECT id,label FROM labels;
    labels = []
    row = labels_query.fetch()
    while row != None:
        labels.append({
            "id": row[0],
            "label": row[1]
        })
        row = labels_query.fetch()

    popWritepad()

    return [str({"success": True, "message": "success", "data":labels}, format=True), "text/json"]



# API: Sign Name Token
@srv.route("/api/user/sign-name") 
def sign_name_token():
    # 验证用户token
    verify = auth.authentication(req)
    if verify != None:
        return verify

    body = req.body
    jsonBody = yaml.loads(body)
    
    name = jsonBody["name"]
    # 名称不能为空
    if name == "" or name == None:
        return [str({"success": False, "message": "The name cannot be empty"}, format=True), "text/json"]

    # 生成名称token
    name_token = simple_hash.sign_name(str(name))
    
    return [str({
        "success": True,
        "message": "Name token generated successfully", 
        "token": name_token
    }, format=True), "text/json"]

# ---------------------------------------------------FileUpdate---------------------------------------------------

# API: Upload File
@srv.route("/api/file/upload")
def upload_file():
    # 验证name_token
    body_items = req.body  # List of dicts: [{name, content, filename, content_type}]
    
    # 获取参数
    name_token = None
    zone_id = None
    file_item = None
    labels = []
    
    for item in body_items:
        if item["name"] == "name_token":
            name_token = item["content"].convert_to_str()
        elif item["name"] == "zone_id":
            zone_id = int(item["content"].convert_to_str())
        elif item["name"] == "file":
            file_item = item
        elif item["name"] == "labels":
            labels = item["content"].convert_to_str().split(",")
    
    # 验证参数
    if name_token == None or zone_id == None or file_item == None:
        return [str({"success": False, "message": "Missing required parameters"}, format=True), "text/json"]
    
    # 验证zone_id是否存在
    pushWritepad(sqlite)
    %check = SELECT id,name FROM zones WHERE id = ${zone_id};
    zone_data = check.fetch()
    if zone_data == None:
        popWritepad()
        return [str({"success": False, "message": "Invalid zone_id"}, format=True), "text/json"]
    popWritepad()
    zone_name = zone_data[1]
    # 验证name_token是否正确
    verify = simple_hash.verify_name(name_token)
    if verify != True:
        return [str({"success": False, "message": "Invalid name_token"}, format=True), "text/json"]
    
    # 从数据库获取所有有效的标签
    pushWritepad(sqlite)
    %labels_query = SELECT label FROM labels;
    labels_data = []
    row = labels_query.fetch()
    while row != None:
        labels_data.append(row[0])
        row = labels_query.fetch()
    popWritepad()
    
    # 过滤labels，只保留有效的标签
    valid_labels = []
    for label in labels:
        if label in labels_data:
            valid_labels.append(label)
    
    # 更新labels为已验证的标签列表
    labels = valid_labels
    
    # 创建存储目录
    # timestamp = int(time.time())
    timestamp= str(time.time()).replace(".", "")
    storage_dir = "storage/files/${timestamp}"

    
    # 保存文件
    original_filename = file_item["filename"]
    file_extension = original_filename.split(".")
    # 如果长度小于2，说明没有后缀名
    if len(file_extension) < 2:
        file_extension = ""
    else:
        file_extension = "." + file_extension[len(file_extension)-1]

    file_path = "${timestamp}${file_extension}"
    binary = file_item["content"]
    write_binary(file_path,binary)

    # 从name_token解析上传者名称
    uploader_name = simple_hash.name_decode(name_token)
    
    # 准备元信息
    metadata = {
        "original_filename": original_filename,
        "timestamp": timestamp,
        "labels": labels,  # 初始为空数组，可以后续添加标签
        "zone_id": zone_id,
        "zone_name": zone_name,
        "name_token": name_token,
        "uploader_name": uploader_name[0],
        "file_path": file_path
    }
    
    # 创建并写入元信息JSON文件
    json_path = "${timestamp}.json"
    json_content = str(metadata, format=True)
    write_binary(json_path, json_content)
    
    # 返回成功响应
    return [str({
        "success": True,
        "message": "File uploaded successfully",
        "file_info": metadata
    }, format=True), "text/json"]

@srv.route("/api/error/report")
def report_error():
    body = req.body
    jsonBody = yaml.loads(body)
    
    error_message = jsonBody["error"]
    error_stack = jsonBody["stack"]
    
    # 生成时间戳作为文件名
    timestamp = str(time.time()).replace(".", "")
    error_path = "errors-${timestamp}.json"
    
    # 准备错误信息
    error_info = {
        "timestamp": timestamp,
        "error": error_message,
        "stack": error_stack
    }
    
    # 写入错误信息到文件
    error_content = str(error_info, format=True)
    f = fs.File(error_path,"w")
    f.write(error_content)
    f.close()
    return [str({
        "success": True,
        "message": "Error reported successfully"
    }, format=True), "text/json"]
