from flask import Flask, request, make_response, jsonify, send_file
from flask_cors import CORS
from flask_jwt import JWT, jwt_required, current_identity
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import mysql, secret_key, upload_folder, allowed_img_exts
from auth import authenticate, identity
from datetime import timedelta
from os import unlink


app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = upload_folder

app.config['MYSQL_DATABASE_USER'] = ''
app.config['MYSQL_DATABASE_PASSWORD'] = ''
app.config['MYSQL_DATABASE_DB'] = ''
app.config['MYSQL_DATABASE_HOST'] = ''

app.config['SECRET_KEY'] = secret_key
app.config['JWT_AUTH_URL_RULE'] = '/login'
app.config['JWT_EXPIRATION_DELTA'] = timedelta(seconds=3600)
app.config['JWT_AUTH_USERNAME_KEY'] = 'mail'

mysql.init_app(app)
conn = mysql.connect()
cursor = conn.cursor()
jwt = JWT(app, authenticate, identity)


@jwt.auth_response_handler
def response_handler(access_token, identity):
    cmd_txt = """select p.id, p.mail, u.username, u.pass 
                from EndUser u inner join Participant p on u.id = p.id 
                where p.id = %s"""
    args = (identity.id,)
    cursor.execute(cmd_txt, args)
    query_res = cursor.fetchone()
    return jsonify({
                        'token': access_token.decode('utf-8'),
                        'id': query_res[0],
                        'mail': query_res[1],
                        'username': query_res[2],
                        'password': query_res[3]
                   })


###################
# Opsti endpointi #
###################


# test
@app.route('/hello_secure')
@jwt_required()
def hello():
    # print(request.headers['Authorization'].split(' '))
    return make_response('{"content": "Hello User %s"}' % current_identity.id, 200)


# dovlacenje avatara sa servera (isto i za botove i za korisnike)
@app.route('/get_avatar', methods=['GET'])
def get_avatar():
    try:
        id = request.args['id']
        cmd_txt = "select avi_path from Participant where id = %s"
        cmd_args = (id,)
        cursor.execute(cmd_txt, cmd_args)
        avi_path = cursor.fetchone()[0]
        return send_file(avi_path)
    except:
        return make_response('{"code": 1, "message": "Invalid ID / No avatar uploaded for user"}', 400)


##########################################
# Svi endpointi koji se odnose na botove #
##########################################


# svako moze da vidi koji botovi postoje
@app.route('/list_bots', methods=['GET'])
def list_bots():
    cmd_txt = "select b.id, b.bot_name, b.bot_desc, b.rest_endpoint, p.avi_path, p.mail " \
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

# jos ako bude trebalo za azuriranje botova, slicno kao za korisnike


#####################################################
# Svi endpointi koji se odnose na korisnicke naloge #
#####################################################


@app.route('/create_user', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        cmd_txt = "insert into Participant(mail) values (%s)"
        args = (data['mail'])
        cursor.execute(cmd_txt, args)

        id = cursor.lastrowid
        cmd_txt = "insert into EndUser(id, username, pass) values (%s, %s, %s)"
        args = (id, data['username'], generate_password_hash(data['password']))
        cursor.execute(cmd_txt, args)

        conn.commit()
        return make_response('{"code": 0, "message": "User created successfully"}', 201)
    except:
        return make_response('{"code": 1, "message": "Mail address already in use"}', 409)


# korisnik moze da obrise iskljucivo svoj profil
@app.route('/delete_user', methods=['DELETE'])
@jwt_required()
def delete_user():
    try:
        id = current_identity.id
        data = request.get_json()
        cmd_txt = """select u.id, u.pass, p.avi_path
                    from EndUser u inner join Participant p on u.id = p.id where u.id = %s"""
        cmd_args = (id,)
        cursor.execute(cmd_txt, cmd_args)

        id, pass_hash, avi_path = cursor.fetchone()
        # (9, 'TestUser', '78ddc855...', None)
        if not check_password_hash(pass_hash, data['password']):
            return make_response('{"code": 1, "message": "Unauthorized: wrong password"}', 401)

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
            unlink(avi_path)

        conn.commit()
        return make_response('{"code": 0, "message": "Account deleted successfully"}', 200)
    except:
        return make_response('{"code": 2, "message": "Missing fields in request body"}', 400)


# uploadovanje i postavljanje korisnickih avatara
@app.route('/set_user_avatar', methods=['POST', 'PUT'])
@jwt_required()
def set_avatar():
    if 'file' not in request.files:
        return make_response('{"code": 1, "message": "No file part in request"}', 400)
    
    file = request.files['file']
    if file.filename == '':
        return make_response('{"code": 2, "message": "No file selected"}', 400)
    
    if '.' not in file.filename:
        return make_response('{"code": 3, "message": "Files with no extension are not allowed"}', 400)
    
    img_ext = file.filename.rsplit('.', 1)[1].lower()
    if file and img_ext in allowed_img_exts:
        id = current_identity.id
        cmd_txt = "select avi_path from Participant where id = %s"
        cmd_args = (id,)
        cursor.execute(cmd_txt, cmd_args)
        old_path = cursor.fetchone()[0]
        new_path = f'{upload_folder}/{id}.{img_ext}'

        if old_path is not None:
            unlink(old_path)

        cmd_txt = "update Participant set avi_path = %s where id = %s"
        cmd_args = (new_path, id)
        cursor.execute(cmd_txt, cmd_args)

        file.save(new_path)
        conn.commit()

        return make_response('{"code": 0, "message": "Avatar uploaded and set successfully"}', 201)

    else:
        return make_response('{"code": 4, "message": "File extension not allowed"}', 400)


# uklanjanje postojeceg avatara / vracanje na default avatar
@app.route('/remove_user_avatar', methods=['DELETE'])
@jwt_required()
def remove_avatar():
    id = current_identity.id
    cmd_txt = "select avi_path from Participant where id = %s"
    cmd_args = (id,)
    cursor.execute(cmd_txt, cmd_args)
    avi_path = cursor.fetchone()[0]
    if avi_path is not None:
        unlink(avi_path)

        cmd_txt = "update Participant set avi_path = NULL where id = %s"
        cmd_args = (id,)
        cursor.execute(cmd_txt, cmd_args)

        conn.commit()
        return make_response('{"code": 0, "message": "Avatar removed successfully"}', 200)
    else:
        return make_response('{"code": 0, "message": "No avatar to remove"}', 200)


@app.route('/change_username', methods=['PUT'])
@jwt_required()
def change_username():
    try:
        id = current_identity.id
        cmd_txt = "update EndUser set username = %s where id = %s"
        cmd_args = (request.json['username'], id)
        cursor.execute(cmd_txt, cmd_args)
        conn.commit()
        return make_response('{"code": 0, "message": "Username changed successfully"}', 200)
    except:
        return make_response('{"code": 1, "message": "Missing fields in request body"}', 400)


@app.route('/change_password', methods=['PUT'])
@jwt_required()
def change_password():
    try:
        id = current_identity.id
        cmd_txt = "select pass from EndUser where id = %s"
        cmd_args = (id,)
        cursor.execute(cmd_txt, cmd_args)

        pass_hash = cursor.fetchone()[0]
        if not check_password_hash(pass_hash, request.json['old_password']):
            return make_response('{"code": 1, "message": "Unauthorized: wrong password"}', 401)
        
        cmd_txt = "update EndUser set pass = %s where id = %s"
        cmd_args = (generate_password_hash(request.json['new_password']), id)
        cursor.execute(cmd_txt, cmd_args)
        conn.commit()
        return make_response('{"code": 0, "message": "Password changed successfully"}', 200)
    except:
        return make_response('{"code": 2, "message": "Missing fields in request body"}', 400)


###########################################
# Svi endpointi koji se odnose na chatove #
###########################################


# korisnik ne moze da sacuva chat pod tudjim ID-em
@app.route('/save_chat', methods=['POST'])
@jwt_required()
def save_chat():
    try:
        id = current_identity.id
        data = request.get_json()
        cmd_txt = "insert into Chat(title, chat_date, user_id) values (%s, %s, %s)"
        args = (data['title'], data['chat_date'], id)
        cursor.execute(cmd_txt, args)

        chat_num = cursor.lastrowid
        for message in data['messages']:
            cmd_txt = "insert into Message(content, msg_time, part_id, chat_num) values (%s, %s, %s, %s)"
            args = (message['content'], message['msg_time'], message['part_id'], chat_num)
            cursor.execute(cmd_txt, args)
        
        conn.commit()
        return make_response('{"code": 0, "message": "Chat saved successfully"}', 201)
    except:
        return make_response('{"code": 1, "message": "Missing fields in request body"}', 400)


# bilo koji korisnik moze da pretrazuje iskljucivo svoje chatove
@app.route('/search_chats', methods=['GET'])
@jwt_required()
def search_chats():
    id = current_identity.id
    
    cmd_txt = "select * from chat c where c.user_id = %s "
    cmd_args = (id,)

    if 'date_from' in request.args:
        cmd_txt += 'and c.chat_date >= %s '
        cmd_args += (request.args['date_from'],)

    if 'date_to' in request.args:
        cmd_txt += 'and c.chat_date <= %s '
        cmd_args += (request.args['date_to'],)

    if 'title_str' in request.args:
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


# korisnik moze da brise iskljucivo svoje chatove
@app.route('/delete_chat', methods=['DELETE'])
@jwt_required()
def delete_chat():
    try:
        id = current_identity.id
        data = request.get_json()

        cmd_txt = "select user_id from Chat where chat_num = %s"
        cmd_args = (data['chat_num'],)
        cursor.execute(cmd_txt, cmd_args)

        query_res = cursor.fetchone()
        if query_res:
            if id != query_res[0]:
                return make_response('{"code": 1, "message": "Unauthorized"}', 401)
        else:
            return make_response('{"code": 2, "message": "No chat with given number"}', 400)

        cmd_txt = "delete from Message where chat_num = %s"
        cmd_args = (data['chat_num'],)
        cursor.execute(cmd_txt, cmd_args)

        cmd_txt = "delete from Chat where chat_num = %s"
        cmd_args = (data['chat_num'],)
        cursor.execute(cmd_txt, cmd_args)
        conn.commit()

        return make_response('{"code": 0, "message": "Chat deleted successfully"}', 200)
    except:
        return make_response('{"code": 3, "message": "Missing fields in request body"}', 400)


@app.route('/get_chat', methods=['GET'])
@jwt_required()
def get_chat():
    try:
        id = current_identity.id
        cmd_txt = "select * from Chat where chat_num = %s"
        cmd_args = (int(request.args['chat_num']),)
        cursor.execute(cmd_txt, cmd_args)
        query_res = cursor.fetchone()

        if id != query_res[3]:
            return make_response('{"code": 1, "message": "Unauthorized"}', 401)
        
        response = {'chat_num': query_res[0],
                    'title': query_res[1],
                    'chat_date': '{}-{}-{}'.format(query_res[2].day, query_res[2].month, query_res[2].year),
                    'user_id': query_res[3]}

        cmd_txt = "select * from Message where chat_num = %s"
        cmd_args = (request.args['chat_num'])
        cursor.execute(cmd_txt, cmd_args)
        query_res = cursor.fetchall()

        response['messages'] = [{'msg_num': message[0],
                                'content': message[1],
                                'msg_time': str(message[2]),
                                'part_id': message[3]}
                                for message in query_res]
        return make_response(jsonify(response), 200)
    except:
        return make_response('{"code": 3, "message": "Missing parameters in request"}', 400)