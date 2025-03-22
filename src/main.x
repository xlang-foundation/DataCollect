import db
import server
srv = server.Server
from api import user(srv = srv)

print("Starting server...","http://localhost:18080")
srv.listen("::", 18080)


