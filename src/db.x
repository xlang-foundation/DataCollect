from xlang_sqlite import sqlite
import time

sqlite.UseDatabase("database")

# Create users table if it doesn't exist
def create_users_table():
    pushWritepad(sqlite)
    
    # Check if the 'users' table already exists
    %users_table_if = SELECT name FROM sqlite_master WHERE type='table' AND name='users';
    table_exists = users_table_if.fetch()
    
    # Create the table if it doesn't exist
    if table_exists == None:
        %CREATE TABLE users (\
            username TEXT PRIMARY KEY,\
            password TEXT,\
            display_name TEXT,\
            last_login TEXT\
        );
        
        # Create a default admin user
        %INSERT INTO users (username, password, display_name, last_login) \
        VALUES ('admin', '255332&17197393981645110028255332', 'Administrator', '');
    
    popWritepad()

def create_zones_table():
    pushWritepad(sqlite)

    # Check if the 'zones' table already exists
    %zones_table_if = SELECT name FROM sqlite_master WHERE type='table' AND name='zones';
    table_exists = zones_table_if.fetch()

    if table_exists == None:
        %CREATE TABLE 'zones' (\
            id INTEGER PRIMARY KEY,\
            name TEXT\
        );
        
        %INSERT INTO 'zones' (id, name) \
        VALUES (1, '云南丽江');

    popWritepad()

def create_labels_table():
    pushWritepad(sqlite)

    # Check if the 'labels' table already exists
    %labels_table_if = SELECT name FROM sqlite_master WHERE type='table' AND name='labels';
    table_exists = labels_table_if.fetch()

    if table_exists == None:
        %CREATE TABLE 'labels' (\
            id INTEGER PRIMARY KEY,\
            label TEXT\
        );
        

        %INSERT INTO 'labels' (id, label) \
        VALUES (1, '人'), (2, '工程机械'), (3, '小汽车');

    popWritepad()

# Initialize database
create_users_table()
create_zones_table()
create_labels_table()