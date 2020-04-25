from jwt import decode
from werkzeug.security import check_password_hash
from extensions import mysql, secret_key


class User:
    def __init__(self, id, mail, username, password):
        self.id = id
        self.mail = mail
        self.username = username
        self.password = password
    def __str__(self):
        return 'User {}'.format(self.id)


def authenticate(mail, password):
    cursor = mysql.get_db().cursor()
    cmd_txt = """select p.id, p.mail, u.username, u.pass 
                from EndUser u inner join Participant p on u.id = p.id 
                where p.mail = %s"""
    args = (mail,)
    cursor.execute(cmd_txt, args)
    query_res = cursor.fetchone()
    cursor.close()
    if query_res and check_password_hash(query_res[3], password):
        return User(query_res[0], query_res[1], query_res[2], query_res[3])


def identity(payload):
    id = payload['identity']
    cursor = mysql.get_db().cursor()
    cmd_txt = """select p.id, p.mail, u.username, u.pass 
                from EndUser u inner join Participant p on u.id = p.id 
                where p.id = %s"""
    args = (id,)
    cursor.execute(cmd_txt, args)
    query_res = cursor.fetchone()
    cursor.close()
    if query_res:
        return User(query_res[0], query_res[1], query_res[2], query_res[3])
    else:
        return None