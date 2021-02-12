from flask import render_template, redirect, url_for
from flask_login import current_user
from f1f import app


@app.route('/dashboard')
def dashboard():
    if not current_user.is_authenticated:
        return redirect(url_for('login'))

    image_file = url_for(
        'static', filename=f"profile_pics/{current_user.image_file}")
    return render_template('team/dashboard.html', title='Dashboard', image_file=image_file)


@app.route('/myteam')
def myteam():
    if not current_user.is_authenticated:
        return redirect(url_for('login'))

    return render_template('team/myteam.html', title='My Team')
