from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import StringField, PasswordField, SubmitField, BooleanField
from wtforms.validators import InputRequired, Length, Email, EqualTo, ValidationError
from f1f.models import User
from flask_login import current_user


class RegistrationForm(FlaskForm):

    username = StringField('Username', validators=[
                           InputRequired(), Length(min=2, max=20)])
    email = StringField('Email', validators=[InputRequired(), Email()])
    password = PasswordField('Password', validators=[InputRequired()])
    confirm_password = PasswordField('Confirm Password', validators=[
                                     InputRequired(), EqualTo('password')])
    submit = SubmitField('Sign up')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('Email is taken! Please choose another.')


class LoginForm(FlaskForm):

    email = StringField('Email', validators=[InputRequired(), Email()])
    password = PasswordField('Password', validators=[InputRequired()])
    remember = BooleanField('Remember me')

    submit = SubmitField('Log in')


class UpdateAccountForm(FlaskForm):

    username = StringField('Username', validators=[
                           InputRequired(), Length(min=2, max=20)])
    password = PasswordField('Password')
    confirm_password = PasswordField(
        'Confirm Password', validators=[EqualTo('password')])
    picture = FileField('Update Picture', validators=[
                        FileAllowed(['jpg', 'png', 'gif'])])
    submit = SubmitField('Save')

    def validate_email(self, email):
        if email.data != current_user.email:
            user = User.query.filter_by(email=email.data).first()
            if user:
                raise ValidationError('Email is taken! Please choose another.')
