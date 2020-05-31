from jwt import decode
from werkzeug.security import check_password_hash
from extensions import mysql, secret_key


class User:
    def __init__(self, id, mail, username, password, admin):
        self.id = id
        self.mail = mail
        self.username = username
        self.password = password
        self.admin = admin
    def __str__(self):
        return 'User {}'.format(self.id)


def authenticate(mail, password):
    conn = mysql.get_db()
    cursor = conn.cursor()
    cmd_txt = """select p.id, p.mail, u.username, u.pass 
                from EndUser u inner join Participant p on u.id = p.id 
                where p.mail = %s"""
    args = (mail,)
    cursor.execute(cmd_txt, args)
    user_res = cursor.fetchone()
    if user_res and check_password_hash(user_res[3], password):
        cmd_txt = "select * from Administrator where id = %s"
        args = (user_res[0],)
        cursor.execute(cmd_txt, args)
        admin_res = cursor.fetchone()
        cursor.close()
        conn.close()
        return User(user_res[0], user_res[1], user_res[2], user_res[3], admin_res is not None)


def identity(payload):
    id = payload['identity']
    conn = mysql.get_db()
    cursor = conn.cursor()
    cmd_txt = """select p.id, p.mail, u.username, u.pass 
                from EndUser u inner join Participant p on u.id = p.id 
                where p.id = %s"""
    args = (id,)
    cursor.execute(cmd_txt, args)
    user_res = cursor.fetchone()
    cmd_txt = "select * from Administrator where id = %s"
    args = (id,)
    cursor.execute(cmd_txt, args)
    admin_res = cursor.fetchone()
    cursor.close()
    conn.close()
    if user_res:
        return User(user_res[0], user_res[1], user_res[2], user_res[3], admin_res is not None)
    else:
        return None