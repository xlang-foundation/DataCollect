import time
from '.' import random

# 密码的哈希示例如下 816615&17197393981645110028816615
# 由 & 字符分割 ，前面的数字是 salt ，后面是 password 的哈希 加 salt 拼接后的哈希

def password_hash(password,salt):
    if salt == None:
        salt = random.random_string() 
    pwd = str(password.hash())
    pwd_salt_str = ( pwd + salt)
    pwd_hash = salt + "&" + pwd_salt_str
    return pwd_hash

def password_check(password, hash_value):
    arr = hash_value.split("&")
    # 检查哈希值是否匹配
    if password_hash(password,arr[0]) == hash_value:
        return True
    else:
        return False

# token 规则
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
    signature = str(sign_str.hash())

    if signature == code[2]:
        return True
    else:
        return False


# 签发token 有效期 7天
def sign_token(username):
    current_time = time.time()
    expiration = int(current_time) + 3600 * 24 * 7
    sign_str = username + "|" + expiration + "|" + token_secret
    signature = sign_str.hash()
    token = username + "|" + expiration+"|" + signature
    return token

# 获取token中的用户名
def get_username_from_token(token):
    token_decode = token.split("|")
    if len(token_decode) != 3:
        return None
    return token_decode[0]