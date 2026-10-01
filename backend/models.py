from backend.database import db
from flask_security import UserMixin, RoleMixin
from datetime import datetime

# Many-to-Many Table for Users & Roles
roles_users = db.Table(
    'roles_users',
    db.Column('user_id', db.Integer(), db.ForeignKey('user.id')),
    db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))
)

class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255))

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer(), primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    active = db.Column(db.Boolean(), default=True) # Used for Blacklisting/Deactivating
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    roles = db.relationship('Role', secondary=roles_users, backref=db.backref('users', lazy='dynamic'))
    company_profile = db.relationship('CompanyProfile', backref='user', uselist=False, cascade="all, delete-orphan")
    student_profile = db.relationship('StudentProfile', backref='user', uselist=False, cascade="all, delete-orphan")

class StudentProfile(db.Model):
    __tablename__ = 'student_profile'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column(db.Integer(), db.ForeignKey('user.id'), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    roll_number = db.Column(db.String(50), unique=True, nullable=False)
    branch = db.Column(db.String(50), nullable=False)
    cgpa = db.Column(db.Float(), nullable=False)
    resume_path = db.Column(db.String(255), nullable=True) # <--- Matches your Database Column
    applications = db.relationship('Application', backref='student', lazy=True, cascade="all, delete-orphan")

    @property
    def resume_url(self):
        return self.resume_path

    @resume_url.setter
    def resume_url(self, value):
        self.resume_path = value

class CompanyProfile(db.Model):
    __tablename__ = 'company_profile'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column(db.Integer(), db.ForeignKey('user.id'), nullable=False)
    company_name = db.Column(db.String(100), nullable=False)
    hr_contact = db.Column(db.String(100), nullable=False)
    website = db.Column(db.String(100), nullable=True)
    approval_status = db.Column(db.String(20), default='Pending') # Pending / Approved / Rejected
    drives = db.relationship('PlacementDrive', backref='company', lazy=True, cascade="all, delete-orphan")

class PlacementDrive(db.Model):
    __tablename__ = 'placement_drive'
    id = db.Column(db.Integer(), primary_key=True)
    company_id = db.Column(db.Integer(), db.ForeignKey('company_profile.id'), nullable=False)
    job_title = db.Column(db.String(100), nullable=False)
    job_description = db.Column(db.Text, nullable=False)
    min_cgpa = db.Column(db.Float(), nullable=False, default=0.0)
    eligible_branch = db.Column(db.String(100), nullable=False, default='All')
    deadline = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='Pending') # Pending / Approved / Closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    applications = db.relationship('Application', backref='drive', lazy=True, cascade="all, delete-orphan")

class Application(db.Model):
    __tablename__ = 'application'
    id = db.Column(db.Integer(), primary_key=True)
    student_id = db.Column(db.Integer(), db.ForeignKey('student_profile.id'), nullable=False)
    drive_id = db.Column(db.Integer(), db.ForeignKey('placement_drive.id'), nullable=False)
    application_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='Applied') # Applied / Shortlisted / Selected / Rejected