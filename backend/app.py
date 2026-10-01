import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import uuid
from flask import Flask, send_from_directory
# ... baki ka app.py code
import uuid
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_security import Security
from flask_security.utils import hash_password
from backend.database import db
from backend.config import Config
from backend.security import user_datastore
from backend.models import User, Role

def create_app():
    app = Flask(__name__, static_folder='../frontend', static_url_path='')
    app.config.from_object(Config)

    db.init_app(app)
    CORS(app)

    # Initialize Flask-Security
    security = Security(app, user_datastore)

    # Serve Frontend Single Page App
    @app.route('/')
    def index():
        return send_from_directory('../frontend', 'index.html')

    # Register API Blueprints (Later added in Step 7)
    # Register API Blueprints
    from backend.api.auth import auth_bp
    from backend.api.admin import admin_bp
    from backend.api.company import company_bp
    from backend.api.student import student_bp
    from backend.api.export import export_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(company_bp, url_prefix='/api/company')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(export_bp, url_prefix='/api/export')

    # Database Initialization & Default Admin Setup
    with app.app_context():
        db.create_all()
        
        # Ensure Roles Exist
        roles = ['admin', 'company', 'student']
        for role_name in roles:
            if not user_datastore.find_role(role_name):
                user_datastore.create_role(name=role_name, description=f'{role_name.capitalize()} Role')

        # Create Default Admin if Not Exists
        admin_email = "admin@institute.edu"
        admin_user = user_datastore.find_user(email=admin_email)
        if not admin_user:
            user_datastore.create_user(
                email=admin_email,
                password=hash_password("admin123"),
                roles=['admin'],
                fs_uniquifier=str(uuid.uuid4())
            )
            print("--> Admin user created programmatically: admin@institute.edu / admin123")
        db.session.commit()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)