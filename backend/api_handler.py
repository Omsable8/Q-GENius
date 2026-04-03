from flask import app, Flask, request, jsonify, redirect, make_response
from flask_cors import CORS
import os
from dotenv import load_dotenv
import json
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, set_access_cookies,set_refresh_cookies, jwt_required, get_jwt_identity,unset_jwt_cookies, unset_access_cookies
from traceback import print_exc

from ai_bot import AIbot
from db import PostgresDB
from debug_log import DebugLogger
load_dotenv()

############ CONFIGS ############ 
app = Flask(__name__)
bcrypt = Bcrypt(app)
app.config['BASE_URL'] = 'http://localhost:5000'
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_KEY')
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_CSRF_CHECK_FORM'] = True
app.config['JWT_COOKIE_SECURE'] = False  # Set to True only in production with HTTPS
app.config['JWT_COOKIE_SAMESITE'] = 'Lax' # Or 'None' for cross-domain + HTTPS

jwt = JWTManager(app)

CORS(app,supports_credentials=True,origins=['http://localhost:3000'])

AI = AIbot()
pg_obj = PostgresDB()
logger = DebugLogger(filename=__file__,disable=True)

@app.route('/api/generate_options',methods=['POST'])
@jwt_required()
def generate_options():
    try:
        data = request.get_json()
        logger.log("INFO",f"Request Data {data}")
        question = data.get('question','')
        questionType = data.get('questionType','')
        additional = data.get('additionalPrompt','')
        options = AI.getOptions(question=question,type=questionType,additional_prompt=additional)
        return {options},200
    except Exception as e:
        return {'success':False, 'message':e},400
    
@app.route('/api/generate_questions',methods=['POST'])
@jwt_required()
def generate_questions():
    try:
        data = request.get_json()
        logger.log('INFO', f"Request Data: {data}")
        subject = data.get('subject','')
        topic = data.get('topic','')
        type = data.get('type','')
        difficulty = data.get('difficulty','')
        grade = data.get('grade','')
        numQuestions = int(data.get('numQuestions',0))

        options = AI.getQuestions(subject, topic, type, difficulty, grade, numQuestions)
        list_options = options.split('\n===SEP===\n')

        return {'questions': list_options,},200
    
    except Exception as e:
        return {'success':False, 'message':e},400
    
@app.route('/api/signup',methods=['POST'])
def signup():
    try:
          
        data = request.get_json()
        logger.log('INFO', f"Request Data: {data}")
        username = data.get('username','')
        email = data.get('email','')
        password = data.get('password','')
        
        if pg_obj.check_if_email_exists(email=email):
            return {'success':'false', 'message':'User Email already exists in table'},409

        pass_hash = bcrypt.generate_password_hash(password=password).decode('utf-8')

        signup_result = pg_obj.signup(email, username, pass_hash)
        if not signup_result.get("success"):
            return {'message':signup_result.get('message')},405
        
        uid = signup_result.get('uid')
        access_token = create_access_token(identity=uid)
        refresh_token = create_refresh_token(identity=uid)
        response = jsonify({'success':True},200)
        set_access_cookies(response=response,encoded_access_token=access_token)
        set_refresh_cookies(response=response,encoded_refresh_token=refresh_token)
        return response
    
    except Exception as e:
        # logger.log(f'Exception ERROR: {e}')
        print_exc(e)
        return {'success':False, 'message':e},400
    
@app.route('/api/login',methods=['POST'])
@jwt_required(optional=True)
def login():
    try:
        # user already has a jwt token
        user_id = get_jwt_identity()
        if user_id and pg_obj.check_if_email_exists(user_id):
            return {'success':'true'},200
        
        data = request.get_json()
        logger.log('INFO', f"Request Data: {data}")
        email = data.get('email','')
        password = data.get('password','')
        
        if not pg_obj.check_if_email_exists(email=email):
            return {'success':'false', 'message':'User Email Does not exists in table'},409

        login_result = pg_obj.get_pass_hash(email=email)

        if not login_result.get("success"):
            return {'message':login_result.get('message')},405
        
        passhash = login_result.get('hash')
        if passhash:
            is_pass_correct = bcrypt.check_password_hash(password=password,pw_hash=passhash)
            if not is_pass_correct:
                return {'success':'false','message':'Login Failed! PASSWORD INCORRECT.'},401
        
        uid = login_result.get('uid')
        
        access_token = create_access_token(identity=uid)
        refresh_token = create_refresh_token(identity=uid)
        response = jsonify({'success':True},200)
        set_access_cookies(response=response,encoded_access_token=access_token)
        set_refresh_cookies(response=response,encoded_refresh_token=refresh_token)
        # logger.disable=False
        logger.log('INFO',f'{access_token},{refresh_token}')
        return response
    
    except Exception as e:
        # logger.log(f'Exception ERROR: {e}')
        print_exc(e)
        return {'success':False, 'message':e},400
    
@app.route('/token/refresh', methods=['GET'])
@jwt_required(refresh=True)
def refresh():
    # Refreshing expired Access token
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=str(user_id))
    resp = make_response(redirect(app.config['BASE_URL'] + '/', 302))
    set_access_cookies(resp, access_token)
    return resp

@jwt.unauthorized_loader
def unauthorized_callback(callback):
    # No auth header
    return redirect(app.config['BASE_URL'] + '/api/signup', 401)

@jwt.invalid_token_loader
def invalid_token_callback(callback):
    # Invalid Fresh/Non-Fresh Access token in auth header
    resp = make_response(redirect(app.config['BASE_URL'] + '/api/signup'))
    unset_jwt_cookies(resp)
    return resp, 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header,jwt_payload):
    # Expired auth header
    resp = make_response(redirect(app.config['BASE_URL'] + '/token/refresh'))
    unset_access_cookies(resp)
    return resp, 401

if '__main__' == __name__:
    app.run(host='0.0.0.0',port=5000,debug=True)
