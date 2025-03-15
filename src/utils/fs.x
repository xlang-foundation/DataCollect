from xlang_os import fs

def read(path):
    f = fs.File(path,"r")
    data = f.read(f.size())
    f.close()
    return data
def read_binary(path):
    f = fs.File(path,"rb")
    data = f.read(f.size())
    f.close()
    return data
# read("test.txt")

def write(path,data):
    f = fs.File(path,"w")
    f.write(data)
    f.close()

def write_binary(path,data):
    f = fs.File(path,"wb")
    f.write(data)
    f.close()
