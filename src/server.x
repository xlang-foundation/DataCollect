from xlang_http import http
Server = http.Server()
Server.SupportStaticFiles = True
Server.StaticRoots = ["./static"]
Server.StaticIndexFile = "index.html"

 