from flaskext.mysql import MySQL

mysql = MySQL()

secret_key = "***REMOVED***"
upload_folder = './avatars/users'
allowed_img_exts = {'png', 'jpg', 'jpeg', 'bmp'}