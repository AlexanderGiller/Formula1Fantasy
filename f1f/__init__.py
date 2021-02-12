from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from flask_admin import Admin

app = Flask(__name__)

app.config['SECRET_KEY'] = b'\xef\xec=\x17\x10\xab|h\xadZ\xd1\t\xf8\x13\xec\xe5'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'

db = SQLAlchemy(app)

login_manager = LoginManager(app)
bcrypt = Bcrypt(app)

admin = Admin(app, name='FEINS Admin Panel')

from f1f.routes.account import *
from f1f.routes.misc import *
from f1f.routes.team import *
from f1f import admin_panel
