import json
from flask import render_template, redirect, url_for, request, jsonify, abort
from flask_login import current_user
from f1f import app, db
from f1f.models import Driver, Roster, Team


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
    teams = Team.query.order_by(Team.cost.desc()).all()
    rosters = Roster.query.filter(current_user.id == Roster.user_id).order_by(Roster.id.desc()).all()

    return render_template('team/edit_team.html', title='My Team', drivers=drivers, teams=teams, rosters=rosters)




@app.route('/save_roster', methods=['POST'])
def save_roster():
    drivers = json.loads(request.form['drivers'])
    team = json.loads(request.form['team'])
    roster = json.loads(request.form['roster'])

    roster = Roster.query.filter(Roster.user_id == current_user.id, Roster.id == roster).first()
    if roster is None:
        abort(400)

    _save_to_db(roster, drivers, team)

    return jsonify(sucess=True)


def _save_to_db(roster, drivers, team):
    driver_list = drivers

    while len(driver_list) < 5:
        driver_list.append(None)

    # ! not a clean solution with exec
    for index, driver in enumerate(driver_list):
        exec(f'roster.driver_{index}_id = {driver}')

    roster.team_id = team

    db.session.commit()
