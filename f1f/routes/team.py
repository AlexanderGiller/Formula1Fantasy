import json
from flask import render_template, redirect, url_for, request, jsonify
from flask_login import current_user
from f1f import app, db
from f1f.models import Driver, Roster


@app.route('/dashboard')
def dashboard():
    if not current_user.is_authenticated:
        return redirect(url_for('login'))

    image_file = url_for(
        'static', filename=f"profile_pics/{current_user.image_file}")
    return render_template('team/dashboard.html', title='Dashboard', image_file=image_file)


@app.route('/edit_team', methods=['GET', 'POST'])
def edit_team():
    if not current_user.is_authenticated:
        return redirect(url_for('login'))

    # all drivers, ordered by cost descending
    drivers = Driver.query.order_by(Driver.cost.desc()).all()

    return render_template('team/edit_team.html', title='My Team', drivers=drivers)


@app.route('/save_roster', methods=['POST'])
def save_roster():
    drivers = json.loads(request.form['drivers'])
    roster = json.loads(request.form['roster'])

    current_roster = Roster.query.filter(Roster.user_id == current_user.id, Roster.id == roster).first()
    if current_roster is None:
        current_roster = Roster(user_id=current_user)

    # print(drivers, file=sys.stderr)

    for index, driver in enumerate(drivers):
        # temp_dict[f"driver_{index}"] = driver
        exec(f"current_roster.driver_{index} = {driver}")

    db.session.commit()


    return jsonify(success=True)
