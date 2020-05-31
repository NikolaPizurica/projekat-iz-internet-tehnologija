from flaskext.mysql import MySQL

mysql = MySQL()

secret_key = "***REMOVED***"
user_upload = './avatars/users'
bot_upload = './avatars/bots'
allowed_img_exts = {'png', 'jpg', 'jpeg', 'bmp'}