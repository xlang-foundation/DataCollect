import time
from '.' import random
# -----------------------------------密码规则---------------------------------
# 密码的哈希示例如下 816615&17197393981645110028816615
# 由 & 字符分割 ，前面的数字是 salt ，后面是 password 的哈希 加 salt 拼接后的哈希

def password_hash(password,salt):
    if salt == None:
        salt = random.random_string() 
    pwd = str(password).md5()
    pwd_salt_str = (pwd + salt).md5()
    pwd_hash = salt + "&" + pwd_salt_str
    return pwd_hash

def password_check(password, hash_value):
    arr = hash_value.split("&")
    # 检查哈希值是否匹配
    if password_hash(password,arr[0]) == hash_value:
        return True
    else:
        return False

# ------------------------------------token 规则---------------------------------
# 用户名|过期时间|签名

token_secret = "1quvUnJV5QM59k26bfs6Cj9M6xFvj7mz"

# token decode
def token_decode(token):
    token = token.split("|")
    if len(token) != 3:
        return False
    return token

# 验证token
def verify_token(token):
    code = token_decode(token)
    # 时间戳验证
    if int(code[1]) < int(time.time()):
        return False
    sign_str = code[0]+"|"+code[1]+"|"+token_secret
    signature = str(sign_str).md5()

    if signature == code[2]:
        return True
    else:
        return False



# 签发token 有效期 7天
def sign_token(username):
    current_time = time.time()
    expiration = int(current_time) + 3600 * 24 * 7
    sign_str = username + "|" + expiration + "|" + token_secret
    signature = str(sign_str).md5()
    token = username + "|" + expiration+"|" + signature
    return token

# 获取token中的用户名
def get_username_from_token(token):
    token_decode = token.split("|")
    if len(token_decode) != 3:
        return None
    return token_decode[0]


# --------------------------------对名称进行签名和验签-----------------------------------

name_secret = "7K9mPx2vL4nQ8sR1wY3jA5hC6tB0uD9fE2gN"

# token decode
def name_decode(token):
    token = token.split("-")
    if len(token) != 3:
        return False
    return token

# 验证名称（验证名称的时候不需要验证时间）
def verify_name(token):
    code = name_decode(token)
    
    sign_str = code[0]+"-"+code[1]+"-"+name_secret
    signature = str(sign_str).md5()

    if signature == code[2]:
        return True
    else:
        return False

# 签发token 有效期 7天
def sign_name(username):
    current_time = time.time()
    expiration = int(current_time) + 3600 * 24 * 7
    sign_str = str(username) + "-" + str(expiration) + "-" + str(name_secret)
    signature = sign_str.md5()
    token = str(username) + "-" + str(expiration)+"-" + str(signature)
    return token