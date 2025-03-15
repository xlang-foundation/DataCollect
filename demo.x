# Copyright (C) 2024 CantorAI Inc.
from xlang_http import http
from xlang_os import fs
from xlang_yaml import yaml
from xlang_webcore import WebCore
from xlang_os import utils
import kvstore
import cantor thru 'lrpc:1000'
import autopipeline

portal_server_url = "https://portal.cantorai.com"
portal_server_url_l = "http://localhost:10101"


project_filterlist_path = ".filters/.filter_list.yml"

cantor_root = cantor.GetRootPath()
cantor_root_folder = fs.Folder(cantor_root)

galaxy_studio_db_path = cantor_root_folder.BuildPath("Database/galaxystudio_store")
kvstore.create_settings_db(galaxy_studio_db_path)

cantor_kv = cantor.KV()

cantor_js_dir = cantor_root_folder.BuildPath("Javascript")

config =  yaml.load("config.yml")

port = 9719
ws_port = 9718
WebRoot ="Webpages"
FilterRoot ="Filters"
if config:
    w = config.has("WebServer")
    WebServer = config.WebServer
    WebRoot = WebServer.WebRoot
    ws_port = WebServer.ws_port

# Create a new HTTP server instance
srv = http.Server()
srv.SupportStaticFiles = True
# Set the directories from which static files will be served
srv.StaticRoots = [cantor_js_dir,WebRoot,FilterRoot]
srv.StaticIndexFile = "index.html"

def verify_token_for_cantor(req):
    all_headers = req.all_headers
    token = all_headers["Vega-Authorization"]
    result = cantor.VerifyAuthenticationToken(token)
    if result != None:
        return result.IsValid
    else:
        return False


import chat(srv=srv,verify_token_for_cantor=verify_token_for_cantor)
import pipeline(srv=srv,cantor=cantor,verify_token_for_cantor=verify_token_for_cantor)
import training(srv=srv,cantor=cantor,pipeline=pipeline,cantor=cantor,verify_token_for_cantor=verify_token_for_cantor,cantor_root=cantor_root)
import service(srv=srv,cantor=cantor,kvstore=kvstore,verify_token_for_cantor=verify_token_for_cantor)

# dict for commands
_cmdMap = dict() # key can be cmdSeqNum for RegistryCmdMessage or nodeId for QueryNodeResourceLedger
_ws_sessions = []

# get the result of the command sent to the registry server
def OnReceiveRegistryCmdMessage(cmdSeqNum,results):
    global _cmdMap
    _cmdMap.lock()
    cmdInfo = _cmdMap.get(cmdSeqNum)
    _cmdMap.remove(cmdSeqNum)
    _cmdMap.unlock()
    if  cmdInfo.cmd == "queryNodes":
        data = {"type":"Registry","id":cmdInfo.req_id,"results":results}
        cmdInfo.session.write(data)

@srv.route("/api/users/verify")
def users_verify():
    body = req.body
    http_client = http.Client(portal_server_url)
    http_client.post("/api/users/verify","application/json",body)
    resp_body = http_client.body
    return resp_body

@srv.route("/api/users/check_user_token")
def users_verify_user_token():
    all_headers = req.all_headers
    token = all_headers["Vega-Authorization"]
    http_client = http.Client(portal_server_url)
    http_client.setHeaders({'Vega-Authorization':token})
    http_client.post("/api/users/check_user_token","application/json","")
    resp_body = http_client.body
    return resp_body

@srv.route("/api/node/GetNodeTemporalPublicKey")
def GetNodeTemporalPublicKey():
    host = cantor.Host()
    tenantId = host.TenantId
    nodeId = host.NodeId
    nodeName = host.NodeName
    publicKey = cantor.GetNodeTemporalPublicKey()
    return [str({"tenantId":tenantId,"nodeId":nodeId,"nodeName":nodeName,"publicKey":publicKey},format=True),"text/json"]

@srv.route("/api/query/ws_port")
def query_ws_port():
    if not verify_token_for_cantor(req):
        return [str({"port":0},format=True),"text/json"]    
    return [str({"port":ws_port},format=True),"text/json"]

@srv.route("/api/edge/graph")
def edge_querygraph():
    if not verify_token_for_cantor(req):
        return [str({},format=True),"text/json"]
    graphWithNodes = cantor.QueryGraphWithNodes()
    return [graphWithNodes,"text/json"]

def OnWsAddSession(ws_session):
    _ws_sessions.lock()
    _ws_sessions.append(ws_session)
    _ws_sessions.unlock()

def OnSessionReceive(ws_session,data):
    global _cmdMap
    jsonData = yaml.loads(data)
    action = jsonData["action"]
    param = jsonData["param"]
    req_id = jsonData["id"]
    data = jsonData["data"]
    if action == "queryNodes":
        _cmdMap.lock()
        cmdId = cantor.SendCmdtoRegistryServer("QueryNodeInfo","","","")
        _cmdMap.set(cmdId,{"cmd":"queryNodes","session":ws_session,"req_id":req_id})
        _cmdMap.unlock()
    elif action == "QueryNodeResourceLedger":
        nodeId = data
        resList = cantor.QueryNodeResourceLedger(nodeId)
        if resList != "":
            retData = {"type":"NodeResource","id":req_id,"results":resList}
            ws_session.write(retData)
        else:
            _cmdMap.lock()
            _cmdMap.set(nodeId,{"cmd":"QueryNodeResourceLedger","session":ws_session,"req_id":req_id})
            _cmdMap.unlock()
    elif action == "PublishResources":
        nodeId = param
        cantor.UpdateNodeResourceLedger(nodeId,data)
    elif action == "registerChatSession":
        sessionId = param
        chat.register_chat_session(sessionId, ws_session)
        response = {"type": "ChatRegistration", "id": req_id, "status": "success"}
        ws_session.write(response)
    elif action == "unregisterChatSession":
        sessionId = param
        chat.unregister_chat_session(sessionId)
        response = {"type": "ChatUnregistration", "id": req_id, "status": "success"}
        ws_session.write(response)
    pass

def OnRemoveSession(ws_session):
    print("OnRemoveSession")
    _ws_sessions.lock()
    cnt = _ws_sessions.size()
    for i in range(cnt):
        if _ws_sessions[i] == ws_session:
            _ws_sessions.remove(i)
            break
    _ws_sessions.unlock()
    
    chat.cleanup_ws_session(ws_session)

def OnQueryNodeResourceLedgerBack(nodeId,jsonResList):
    global _cmdMap
    _cmdMap.lock()
    cmdInfo = _cmdMap.get(nodeId)
    _cmdMap.remove(nodeId)
    _cmdMap.unlock()
    if  cmdInfo.cmd == "QueryNodeResourceLedger":
        data = {"type":"NodeResource","id":cmdInfo.req_id,"results":jsonResList}
        cmdInfo.session.write(data)

@srv.route("/api/nodes/op")
def node_op(cmd,param,param2,param3):
    if not verify_token_for_cantor(req):
        return [str({"status":403},format=True),"text/json"]
    params = req.params
    print("node_op:",params)
    cmd = params["cmd"]
    param = params["param"]
    param2 = params["param2"]
    param3 = params["param3"]
    if cmd == "EdgeHubSendMessage":
        cantor.SendMessageToNode(param,param2)
    elif cmd == "MakeConnection":
        cantor.SendCmdtoRegistryServer("ConnectTo",[param],[param2],param3)
    elif cmd == "Disconnect":
        cantor.SendCmdtoRegistryServer("Disconnect",[param],[param2],param3)
    return [str({"status":200},format=True),"text/json"]


@srv.route("/api/filters/load")
def load_filters():
    if not verify_token_for_cantor(req):
        return [str([],format=True),"text/json"]

    params = req.params
    projectDir = params["projectDir"]
    filters =  yaml.load("Filters/filters.yml")
    ary = [filters]
    #in projectDir, if has subfolder .fitlers, and with file .filter_list.yml
    if projectDir != "":
        projectDirPath = fs.Folder(projectDir)
        project_filters_file_path = projectDirPath.BuildPath(project_filterlist_path)
        project_filters =  yaml.load(project_filters_file_path)
        if not is_error(project_filters):
            ary.append(project_filters)
    return [str(ary,format=True),"text/json"]


@srv.route("/api/autopipeline/endpoint")
def autopipeline_get_endpoint():
    if not verify_token_for_cantor(req):
        return [str({"ok":False},format=True),"text/json"]    
    params = req.params
    engName = params["engName"]
    endpoints = autopipeline.get_output_pinInfo(engName)
    return [str({"result":endpoints},format=True),"text/json"]


@srv.route("/api/autopipeline/stopall")
def autopipeline_stopall():
    if not verify_token_for_cantor(req):
        return [str({"result":"Denied"},format=True),"text/json"]    
    autopipeline.stop_allpipelines()
    return [str({"result":"Ok"},format=True),"text/json"]

@srv.route("/api/autopipeline/detect_request")
def autopipeline_detect_request():
    if not verify_token_for_cantor(req):
        return [str({"result":"Denied"},format=True),"text/json"]   
    params = req.params
    engName = params["engName"]
    img_file_path = params["img_file_path"]
    autopipeline.detect_request(engName,img_file_path)
    return [str({"result":'Ok'},format=True),"text/json"]


@srv.route("/api/queryGraphWithNodes")
def QueryGraphWithNodes():
    if not verify_token_for_cantor(req):
        return [str({"ok":False},format=True),"text/json"]    
    graphWithNodes_str = cantor.QueryGraphWithNodes()
    return [graphWithNodes_str,"text/json"]
    
@srv.route("/api/nodeFolderEnum")
def NodeFolderEnum():
    if not verify_token_for_cantor(req):
        return [str({"ok":False},format=True),"text/json"]
    params = req.params
    nodeId = params["nodeId"]
    folderPath = params["folderPath"]
    items =  cantor.FolderEnum(nodeId,folderPath,True,1000)
    return [str(items,format=True),"text/json"]

@srv.route("/api/fs/enum")
def fs_enum():
    if not verify_token_for_cantor(req):
        return [str(False,format=True),"text/json"]
    params = req.params
    path = params["path"]
    folder = fs.Folder(path)
    all = folder.Scan()
    return [str(all,format=True),"text/json"]

@srv.route("/api/fs/read_file")
def fs_read_file():
    if not verify_token_for_cantor(req):
        return ""
    params = req.params
    fileName = params["fileName"]
    fileObj = fs.File(fileName,"rb")
    content = fileObj.read(fileObj.size())
    fileObj.close()
    res.set_content(content,"image/jpeg")
    return ""

@srv.route("/api/project/fetchfile")
def project_fetch_file():
    if not verify_token_for_cantor(req):
        return
    params = req.params
    fileName = params["fileName"]
    pos = fileName.rfind(".")
    mimeType =""
    isBin = True
    if pos >0:
        ext =fileName.slice(pos+1,fileName.size())
        l = srv.getMimeType(ext)
        mimeType =l[0]
        isBin = l[1]
    readType = "r"
    if isBin:
        readType ="rb"
    fileObj = fs.File(fileName,readType)
    content = fileObj.read(fileObj.size())
    fileObj.close()
    res.set_content(content,mimeType)


@srv.route("/api/fs/write_file")
def fs_write_file():
    if not verify_token_for_cantor(req):
        return [str("ok":False,format=True),"text/json"]
    params = req.params
    fileName = params["fileName"]
    body = req.body
    fileObj = fs.File(fileName,"w")
    isOk = fileObj.write(body)
    fileObj.close()
    return [str({"ok":isOk},format=True),"text/json"]

@srv.route("/api/fs/filter_enum")
def fs_enum_with_filter():
    if not verify_token_for_cantor(req):
        return None
    params = req.params
    path = params["path"]
    filter = params["filter"]

    def scan_folder_recursive(folder_path, regex_patterns):
        folder = fs.Folder(folder_path)
        all_files = folder.Scan()
        result = []

        for file in all_files:
            fileName = file["Name"]
            if file["IsDirectory"] == "true":
                # Recursively scan subfolders
                result.extend(scan_folder_recursive(folder_path + "/" + fileName, regex_patterns))
            elif matches_filter(fileName, regex_patterns):
                result.append(folder_path + "/"+fileName)

        return result

    def matches_filter(file_name, regex_patterns):
        for regex in regex_patterns:
            match = file_name.regex_match(regex)
            if match:
                return True
        return False

    regex_patterns = filter.split(";")

    all_files = scan_folder_recursive(path, regex_patterns)

    return [str(all_files, format=True), "text/json"]


@srv.route("/api/fs/createFolder")
def fs_createfolder():
    if not verify_token_for_cantor(req):
        return [str({"ok":False},format=True),"text/json"]
    body = req.body
    jsonBody = yaml.loads(body)
    path = jsonBody["path"]
    folder = fs.Folder("")
    isOk = folder.CreateFolder(path)
    return [str({"ok":isOk},format=True),"text/json"]

@srv.route("/api/fs/delete")
def fs_removefolder():
    if not verify_token_for_cantor(req):
        return [str({"ok":False},format=True),"text/json"]
    body = req.body
    jsonBody = yaml.loads(body)
    path = jsonBody["path"]
    folder = fs.Folder("")
    isOk = folder.RemoveFolder(path)
    return [str({"ok":isOk},format=True),"text/json"]

@srv.route("/api/fs/rename")
def fs_rename():
    if not verify_token_for_cantor(req):
        return [str({"ok":False},format=True),"text/json"]    
    body = req.body
    jsonBody = yaml.loads(body)
    oldPath = jsonBody["oldPath"]
    newPath = jsonBody["newPath"]
    folder = fs.Folder(oldPath)
    isOk = folder.MoveFolder(newPath)
    return [str({"ok":isOk},format=True),"text/json"]

@srv.route("/api/kvstore/get")
def kvstore_get():
    if not verify_token_for_cantor(req):
        return [str({"value":""},format=True),"text/json"]

    params = req.params
    key = params["key"]
    val = kvstore.get(key)
    return [str({"value":val},format=True),"text/json"]

@srv.route("/api/kvstore/set")
def kvstore_set():
    if not verify_token_for_cantor(req):
        return [str({"ok":False},format=True),"text/json"]    

    body = req.body
    jsonBody = yaml.loads(body)
    key = jsonBody["key"]
    val = jsonBody["value"]
    kvstore.set(key,val)
    return [str({"ok":isOk},format=True),"text/json"]

@srv.route("/api/cantor_kvstore/get")
def cantor_kvstore_get():
    if not verify_token_for_cantor(req):
        return [str({"value":""},format=True),"text/json"]

    params = req.params
    key = params["key"]
    val = cantor_kv.get(key)
    return [str({"value":val},format=True),"text/json"]

@srv.route("/api/cantor_kvstore/list")
def cantor_kvstore_list():
    if not verify_token_for_cantor(req):
        return [str({"value":""},format=True),"text/json"]

    params = req.params
    val = cantor_kv.List()
    return [str({"value":val},format=True),"text/json"]

@srv.route("/api/cantor_kvstore/set")
def cantor_kvstore_set():
    if not verify_token_for_cantor(req):
        return [str({"ok":False},format=True),"text/json"]    

    body = req.body
    jsonBody = yaml.loads(body)
    key = jsonBody["key"]
    val = jsonBody["value"]
    isOk = cantor_kv.Set(key,val)
    return [str({"ok":isOk},format=True),"text/json"]

@srv.route("/api/cantor_kvstore/delete")
def cantor_kvstore_delete():
    if not verify_token_for_cantor(req):
        return [str({"value":""},format=True),"text/json"]

    params = req.params
    key = params["key"]
    isOK = cantor_kv.Delete(key)
    return [str({"ok":isOk},format=True),"text/json"]

@srv.route("/api/fs/upload")
def handle_file_upload():
    """
    Handle the upload of multiple files and folders to a selected directory.
    """
    if not verify_token_for_cantor(req):
        return [str({"status":403},format=True),"text/json"]

    # Parse the request body (list of dictionaries)
    body_items = req.body  # List of dicts: [{name, content, filename, content_type}]
    
    # Extract the target folder from the body
    target_folder = None
    for item in body_items:
        if item["name"] == "targetFolder":
            target_folder = item["content"].convert_to_str()
            break

    if target_folder == None:
        return [str({"status": 400, "message": "Target folder not specified."}, format=True), "text/json"]

    # Ensure the target folder exists
    upload_dir = fs.Folder(target_folder)
    if not upload_dir.Exists():
        return [str({"status": 400, "message": f"Target folder '{target_folder}' does not exist."}, format=True), "text/json"]

    uploaded_count = 0
    failed_files = []

    # Process each file in the body
    for item in body_items:
        if item["name"] == "files":
            # Retrieve file details
            relative_path = item.get("filename")
            content_type = item.get("content_type")
            file_data = item.get("content")

            # Ensure relative_path exists
            if relative_path == None:
                failed_files.append("Unnamed file")
                continue

            # Determine the save path
            s_save_path = upload_dir.BuildPath(relative_path)
            save_path = fs.Folder(s_save_path)
            # Create directories if they don't exist
            s_dir_path = save_path.ParentPath()
            dir_path = fs.Folder(s_dir_path)
            if not dir_path.Exists():
                dir_path.CreateFolder(s_dir_path)

            # Save the file (binary or text)
            file_obj = fs.File(s_save_path, "wb")
            is_ok = file_obj.write(file_data)
            file_obj.close()

            if is_ok:
                uploaded_count += 1
            else:
                failed_files.append(relative_path)

    # Create a response
    response = {
        "status": 200 if len(failed_files) == 0 else 207,
        "message": "Uploaded ${uploaded_count} files successfully.",
        "failed": failed_files
    }

    return [str(response, format=True), "text/json"]



# Start Web Socket Server
ws_srv = WebCore.WebSocketServer(ws_port)
ws_srv.OnAddSession += OnWsAddSession
ws_srv.OnSessionReceive += OnSessionReceive
ws_srv.OnRemoveSession += OnRemoveSession

def OnReceiveSendingMessage(nodeId,message):
    cantor.logV("OnReceiveSendingMessage,from:",nodeId,"Msg:",message)
    for session in _ws_sessions:
        data = {"type":"ReceiveMsg","results":message}
        session.write(data)
def OnEdgeStatusChanged():
    cantor.logV("OnEdgeStatusChanged called")
    for session in _ws_sessions:
        data = {"type":"EdgeStatusChanged"}
        session.write(data)

cantor.OnReceiveRegistryCmdMessage += OnReceiveRegistryCmdMessage
cantor.OnQueryNodeResourceLedgerBack += OnQueryNodeResourceLedgerBack
cantor.OnReceiveSendingMessage += OnReceiveSendingMessage
cantor.OnEdgeStatusChanged += OnEdgeStatusChanged

# Start the server
cantor.logV(cantor.LOG_YELLOW,"Cantor Design Studio Started ",cantor.LOG_GREEN,"http://localhost:", port,cantor.LOG_RESET)
srv.listen("::", port)
