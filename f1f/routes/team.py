from flask import render_template, redirect, url_for
from flask_login import current_user
from f1f import app
from f1f.models import Driver


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

    drivers = Driver.query.order_by(Driver.cost.desc()).all()

    return render_template('team/edit_team.html', title='My Team', drivers=drivers)
