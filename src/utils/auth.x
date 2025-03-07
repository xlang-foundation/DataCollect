import simple_hash

# 用户鉴权
def authentication(req):
    headers = req.all_headers
    if headers["X-Token"] == None:
        return [str({"success": False, "message": "X-Token required"}, format=True), "text/json"]

    token = req.all_headers["X-Token"]

    if not simple_hash.verify_token(token):
        return [str({"success": False, "message": "Invalid token"}, format=True), "text/json"]
    
    return None
