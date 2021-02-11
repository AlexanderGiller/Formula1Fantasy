from flask_admin.contrib.sqla import ModelView
from f1f import admin, db
from f1f.models import User, Team, Driver, Roster, Race

admin.add_view(ModelView(User, db.session))
admin.add_view(ModelView(Team, db.session))
admin.add_view(ModelView(Driver, db.session))
admin.add_view(ModelView(Roster, db.session))
admin.add_view(ModelView(Race, db.session))
