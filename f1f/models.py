from flask_login import UserMixin
from f1f import db, login_manager


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(10), default='standard')
    username = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    image_file = db.Column(db.String(20), nullable=False,
                           default='default.jpg')
    password = db.Column(db.String(60), nullable=False)

    budget = db.Column(db.Float)

    rosters = db.relationship('Roster', backref='user', lazy=True)

    def __repr__(self):
        return f"User('{self.username}', '{self.email}', Budget: '{self.budget}')"

class Team(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    name_short = db.Column(db.String(20), nullable=False)
    country = db.Column(db.String(3), nullable=False)
    boss = db.Column(db.String(30))
    cost = db.Column(db.Float)

    drivers = db.relationship('Driver', backref='team', lazy=True)

    def __repr__(self):
        return f"Team('{self.name_short}')"

class Driver(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False)
    first_name = db.Column(db.String(20))
    country = db.Column(db.String(3))
    cost = db.Column(db.Float)

    team_id = db.Column(db.Integer, db.ForeignKey('team.id'))

    def __repr__(self):
        return f"Driver('{self.name}' number '{self.id}')"

class Roster(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    driver_one = db.Column(db.Integer, db.ForeignKey('driver.id'))
    driver_two = db.Column(db.Integer, db.ForeignKey('driver.id'))
    driver_three = db.Column(db.Integer, db.ForeignKey('driver.id'))
    driver_four = db.Column(db.Integer, db.ForeignKey('driver.id'))
    driver_five = db.Column(db.Integer, db.ForeignKey('driver.id'))
    selected_team = db.Column(db.Integer, db.ForeignKey('team.id'))
    cost = db.Column(db.Float)

    race = db.Column(db.Integer, db.ForeignKey('race.id'))

    locked = db.Column(db.Integer, default=0) # 1 or 0 for true or false respectively

class Race(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    status = db.Column(db.String(10))

    circuit_name = db.Column(db.String(50))
    country = db.Column(db.String(30))

    qualifying_start = db.Column(db.String(30)) # iso datetime string
    race_start = db.Column(db.String(30))
