import os
import secrets
import requests
# from PIL import Image
from flask import render_template, url_for, redirect, flash, request
from flask_login import login_required, login_user, logout_user, current_user
from f1f import app, bcrypt, db
from f1f.models import User
from f1f.forms import LoginForm, RegistrationForm, UpdateAccountForm, BugForm


@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return render_template('index.html', title='Welcome')


@app.route('/dashboard')
def dashboard():
    if not current_user.is_authenticated:
        return redirect(url_for('login'))

    image_file = url_for(
        'static', filename=f"profile_pics/{current_user.image_file}")
    return render_template('dashboard.html', title='Dashboard', image_file=image_file)


@app.route('/myteam')
def myteam():
    if not current_user.is_authenticated:
        return redirect(url_for('login'))

    return render_template('myteam.html', title='My Team')


# ! -------- USER MANAGEMENT ROUTES --------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))

    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user, remember=form.remember.data)
            flash('You have been logged in!', 'success')
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('dashboard'))
        else:
            flash('Login unsuccesful. Please check data!', 'danger')

    return render_template('login.html', title='Login', form=form)


@app.route('/logout')
@login_required
def logout():
    logout_user()

    flash('Logout successful. Please come again soon!', 'success')
    return redirect(url_for('dashboard'))


@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))

    form = RegistrationForm()
    if form.validate_on_submit():
        hashed_pw = bcrypt.generate_password_hash(form.password.data)
        user = User(username=form.username.data,
                    email=form.email.data, password=hashed_pw)
        db.session.add(user)
        db.session.commit()
        flash('Account created. You can now log in.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html', title='Register', form=form)


@app.route('/account', methods=['GET', 'POST'])
def account():
    if not current_user.is_authenticated:
        return redirect(url_for('login'))

    form = UpdateAccountForm()
    if form.validate_on_submit():
        if form.picture.data:
            picture_file = _save_picture(
                form.picture.data, current_user.image_file)
            current_user.image_file = picture_file
        if form.password.data:
            current_user.password = bcrypt.generate_password_hash(
                form.password.data)
        current_user.username = form.username.data
        db.session.commit()

        flash('Your account has been updated!', 'success')
        return redirect(url_for('account'))

    elif request.method == 'GET':
        form.username.data = current_user.username
        form.password.data = current_user.password

    image_file = url_for(
        'static', filename=f"profile_pics/{current_user.image_file}")

    return render_template('account.html', title='Account', image_file=image_file, form=form)


def _save_picture(form_picture, old_pic):
    random_hex = secrets.token_hex(8)
    _, f_extension = os.path.splitext(form_picture.filename)
    picture_fn = random_hex + f_extension
    picture_path = os.path.join(
        app.root_path, 'static/profile_pics', picture_fn)

    form_picture.save(picture_path)
    # output_size = (250, 250)
    # i = Image.open(form_picture)
    # i.thumbnail(output_size)
    # i.save(picture_path)
    # ? if the file is downsized, gifs are lost to a single frame

    old_pic_path = os.path.join(app.root_path, 'static/profile_pics', old_pic)
    if os.path.exists(old_pic_path):
        os.remove(old_pic_path)

    return picture_fn


# ! -------- MISC ROUTES --------
@app.route('/bug_report', methods=['GET', 'POST'])
def bug_report():
    form = BugForm()

    if form.validate_on_submit():
        message = f"User {form.name.data} sent the following report:\n>>> {form.text.data}"
        requests.post(
            "https://discord.com/api/webhooks/809373666889957387/1a3CmiXWhjRJDv8bdC6KbQUrDxDGohqay6pRraZnK6YhkKq5rfHHdJ31Q3G6XrW3gSs-", 
            data={"content": message
        })

        flash('Thank you. We will look into it!', 'success')
        next_page = request.args.get('next')
        return redirect(next_page) if next_page else redirect(url_for('bug_report'))

    return render_template('bug_report.html', title='Report a Bug', form=form)
