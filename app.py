from flask import Flask, escape, request, Response, make_response, jsonify
from flaskext.mysql import MySQL

import hashlib

app = Flask(__name__)

mysql = MySQL()

app.config['MYSQL_DATABASE_USER'] = ''
app.config['MYSQL_DATABASE_PASSWORD'] = ''
app.config['MYSQL_DATABASE_DB'] = ''
app.config['MYSQL_DATABASE_HOST'] = ''

mysql.init_app(app)

conn = mysql.connect()
cursor = conn.cursor()

# test
@app.route('/')
def hello():
    #for i in range(100_000):
    #    print(i)
    name = request.args.get("name", "World")
    return f'Hello, {escape(name)}!'

@app.route('/create_user', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        cmd_txt = "insert into Participant(mail) values (%s)"
        args = (data['mail'])
        cursor.execute(cmd_txt, args)

        id = cursor.lastrowid
        cmd_txt = "insert into EndUser(id, username, pass) values (%s, %s, %s)"
        args = (id, data['username'], hashlib.sha512(data['pass'].encode('utf-8')).hexdigest())
        cursor.execute(cmd_txt, args)

        conn.commit()
        return make_response('{"code": 0, "message": "User created successfully"}', 201)
    except:
        return make_response('{"code": 1, "message": "Mail address already in use"}', 400)

@app.route('/save_chat', methods=['POST'])
def save_chat():
    data = request.get_json()
    cmd_txt = "insert into Chat(title, chat_date, user_id) values (%s, %s, %s)"
    args = (data['title'], data['chat_date'], data['user_id'])
    cursor.execute(cmd_txt, args)

    chat_num = cursor.lastrowid
    for message in data['messages']:
        cmd_txt = "insert into Message(content, msg_time, part_id, chat_num) values (%s, %s, %s, %s)"
        args = (message['content'], message['msg_time'], message['part_id'], chat_num)
        cursor.execute(cmd_txt, args)
    conn.commit()

    return Response('{"code": 0, "message": "Chat saved successfully"}', status=201, mimetype='aplication/json')

@app.route('/list_bots', methods=['GET'])
def list_bots():
    cmd_txt = "select b.id, b.bot_name, b.bot_desc, b.rest_endpoint, b.avi_path, p.mail " \
              "from bot b inner join participant p on b.id = p.id"
    cursor.execute(cmd_txt)
    query_res = cursor.fetchall()
    # ((12, 'bot', 'some bot description', '/some_rest_endpoint', None, 'bot@mail.com'),...)
    data = {'bots':
                [{
                    'id': row[0],
                    'bot_name': row[1],
                    'bot_desc': row[2],
                    'rest_endpoint': row[3],
                    'avi_path': row[4],
                    'mail': row[5]
                } for row in query_res]}
    return make_response(jsonify(data), 200)

@app.route('/search_chats', methods=['GET'])
def search_chats():
    cmd_txt = "select * from chat c "
    cmd_args = ()

    if 'date_from' in request.args:
        cmd_txt += 'where c.chat_date >= %s '
        cmd_args += (request.args['date_from'],)

    if 'date_to' in request.args:
        if len(cmd_args) == 0:
            cmd_txt += 'where c.chat_date <= %s '
        else:
            cmd_txt += 'and c.chat_date <= %s '
        cmd_args += (request.args['date_to'],)

    if 'title_str' in request.args:
        if len(cmd_args) == 0:
            cmd_txt += 'where c.title like %s '
        else:
            cmd_txt += 'and c.title like %s '
        cmd_args += ('%' + request.args['title_str'] + '%',)

    cursor.execute(cmd_txt, cmd_args)
    query_res = cursor.fetchall()
    # ((3, 'test chat', datetime.date(2020, 3, 25), 9),)
    data = {'chats':
                [{
                    'chat_num': row[0],
                    'title': row[1],
                    'chat_date': '{}-{}-{}'.format(row[2].day, row[2].month, row[2].year),
                    #'user_id': row[3]
                } for row in query_res]}

    return make_response(jsonify(data), 200)

@app.route('/delete_user', methods=['DELETE'])
def delete_user():
    data = request.get_json()
    cmd_txt = "select * from EndUser where id = %s"
    cmd_args = (data['id'],)
    cursor.execute(cmd_txt, cmd_args)

    id, username, pass_hash, avi_path = cursor.fetchone()
    # (9, 'TestUser', '78ddc855...', None)
    if pass_hash != hashlib.sha512(data['pass'].encode('utf-8')).hexdigest():
        return make_response('{"code": 1, "message": "Unauthorized"}', 401)

    cmd_txt = "select chat_num from Chat where user_id = %s"
    cmd_args = (id,)
    cursor.execute(cmd_txt, cmd_args)
    rows = cursor.fetchall()
    if len(rows) > 0:
        chat_nums = '(' + ','.join([str(row[0]) for row in rows]) + ')'
        cmd_txt = "delete from Message where chat_num in " + chat_nums
        cursor.execute(cmd_txt)

    cmd_txt = "delete from Chat where user_id = %s"
    cmd_args = (id,)
    cursor.execute(cmd_txt, cmd_args)

    cmd_txt = "delete from EndUser where id = %s"
    cmd_args = (id,)
    cursor.execute(cmd_txt, cmd_args)

    cmd_txt = "delete from Participant where id = %s"
    cmd_args = (id,)
    cursor.execute(cmd_txt, cmd_args)

    if avi_path is not None:
        cmd_txt = "delete from Avatar where img_path = %s"
        cmd_args = (avi_path,)
        cursor.execute(cmd_txt, cmd_args)
        # jos da se brise iz fajl sistema ...

    conn.commit()
    return make_response('{"code": 0, "message": "Account deleted successfully"}', 200)

@app.route('/delete_chat', methods=['DELETE'])
def delete_chat():
    data = request.get_json()

    # ...
    # fali autorizacija
    # ...

    cmd_txt = "delete from Message where chat_num = %s"
    cmd_args = (data['chat_num'],)
    cursor.execute(cmd_txt, cmd_args)

    cmd_txt = "delete from Chat where chat_num = %s"
    cmd_args = (data['chat_num'],)
    cursor.execute(cmd_txt, cmd_args)
    conn.commit()

    return make_response('{"code": 0, "message": "Chat deleted successfully"}', 200)

# uploadovanje i postavljanje avatara
@app.route('/set_avatar', methods=['POST'])
def set_avatar():
    return f'Not implemented'