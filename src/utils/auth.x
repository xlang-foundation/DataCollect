import simple_hash

# 用户鉴权
def authentication(req):
    headers = req.all_headers
    if headers["x-token"] == None:
        return [str({"success": False, "message": "x-token required"}, format=True), "text/json"]

    token = req.all_headers["x-token"]

    if not simple_hash.verify_token(token):
        return [str({"success": False, "message": "Invalid token"}, format=True), "text/json"]
    
    return None
