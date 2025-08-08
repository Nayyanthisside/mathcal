import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DATABASE_PATH = os.path.join(os.getcwd(), 'instance', 'database.db')
    JWT_EXPIRATION_HOURS = 24