from xlang_os import fs

def read(path):
    f = fs.File(path,"r")
    data = f.read(f.size())
    f.close()
    return data

# read("test.txt")

def write(path,data):
    f = fs.File(path,"w")
    f.write(data)
    f.close()

write("test.txt","aaaaaaaaaaaaaaaaaaa")