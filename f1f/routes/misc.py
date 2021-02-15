import requests
from flask import render_template, url_for, redirect, flash, request
from flask_login import current_user
from f1f import app
from f1f.forms import BugForm


@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return render_template('misc/index.html', title='Welcome')


@app.route('/bug_report', methods=['GET', 'POST'])
def bug_report():
    form = BugForm()

    # ! discord hook url will need to be hidden in env variables
    if form.validate_on_submit():
        message = f"User '{current_user.username}' sent the following report:\nSubject: '{form.subject.data}'\n>>> {form.text.data}"
        requests.post(
            "https://discord.com/api/webhooks/809373666889957387/1a3CmiXWhjRJDv8bdC6KbQUrDxDGohqay6pRraZnK6YhkKq5rfHHdJ31Q3G6XrW3gSs-",
            data={"content": message
        })

        flash('Thank you. We will look into it!', 'success')
        next_page = request.args.get('next')
        return redirect(next_page) if next_page else redirect(url_for('bug_report'))

    return render_template('misc/bug_report.html', title='Report a Bug', form=form)
