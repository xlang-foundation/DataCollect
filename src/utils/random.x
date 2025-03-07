import time

def random_string():
    current_time = str(time.time())
    result = current_time.split(".")
    return str(result[1])