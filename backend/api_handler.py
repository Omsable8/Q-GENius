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
logger = DebugLogger(filename=__file__,disable=False)

@app.route('/api/generate_options',methods=['POST'])
@jwt_required()
def generate_options():
    try:
        
        data = request.get_json()
        question = data.get('question','')
        questionType = data.get('questionType','')
        additional = data.get('additionalPrompt','')
        # fetch options from AI
        options = AI.getOptions(question=question,type=questionType,additional_prompt=additional)
        
        # Log data into DB 
        uid = get_jwt_identity()
        options_dict = {'correctAnswer': options['correctAnswer']}
        for distractors in options['options']:
            options_dict[distractors['type']] = distractors['text']
        
        resp = pg_obj.log_options(uid,question=question,type=questionType,add_prompt=additional, options=options_dict)
        if not resp['success']:
            logger.log('ERROR',resp['message'])
        return jsonify(options),200
    except Exception as e:
        return jsonify({'success':False, 'message':str(e)}),400
    
@app.route('/api/generate_questions',methods=['POST'])
@jwt_required()
def generate_questions():
    try:
        data = request.get_json()
        subject = data.get('subject','')
        topic = data.get('topic','')
        type = data.get('type','')
        difficulty = data.get('difficulty','')
        grade = data.get('grade','')
        numQuestions = int(data.get('numQuestions',0))

        questions = AI.getQuestions(subject, topic, type, difficulty, grade, numQuestions)
        questions_list = questions.split('\n===SEP===\n')

        uid = get_jwt_identity()
        resp = pg_obj.log_questions(uid, questions_list, type, subject, topic, difficulty, grade, numQuestions)
        if not resp['success']:
            logger.log('ERROR',resp['message'])

        return jsonify({'questions': questions_list}),200
    
    except Exception as e:
        return jsonify({'success':False, 'message':str(e)}),400

################ Dashboard and USER HISTORY endpoints ################
@app.route('/api/get_stats',methods=['GET'])
@jwt_required()
def get_stats():
    try:
        uid = get_jwt_identity()
        user_stats = pg_obj.get_user_stats(uid=uid)
        if not user_stats.get('success'):
            logger.log('[ERROR]', user_stats.get('message'))
            return jsonify(user_stats),500
        return jsonify(user_stats),200
    
    except Exception as e:
        return jsonify({'success':False, 'message':str(e)}),400

@app.route('/api/get_history',methods=['GET'])
@jwt_required()
def get_history():
    try:
        uid = get_jwt_identity()
        hist = pg_obj.get_user_history(uid=uid)
        if not hist.get('success'):
            return jsonify(hist),500
        
        return jsonify(hist),200
    
    except Exception as e:
        return jsonify({'success':False, 'message':str(e)}),400

@app.route('/api/get_entire_history',methods=['GET'])
@jwt_required()
def get_entire_history():
    try:
        uid = get_jwt_identity()
        user_hist = pg_obj.get_entire_history(uid=uid)
        if not user_hist.get('success'):
            return jsonify(user_hist),500
        
        return jsonify(user_hist),200

    
    except Exception as e:
        return jsonify({'success':False, 'message':str(e)}),400

@app.route('/api/get_full_view',methods=['POST'])
@jwt_required()
def get_full_view():
    try:
        data = request.get_json()
        view_type = data.get('type','')
        view_id = data.get('id','')

        if view_type == 'options':
            RespOptions = pg_obj.get_user_options(id=view_id)

            if not RespOptions.get('success'):
                return jsonify({'success':False, 'message':RespOptions.get('message')}),500
            
            RowData = RespOptions.get('distr',()) # question, q_type, created_at, correct_answer, fact, process, accuracy
            full_view = {'question': RowData[0], 'question_type':RowData[1], 'created_at': RowData[2], 'correct':RowData[3], 'fact': RowData[4], 'process':RowData[5], 'accuracy':RowData[6]}
            return jsonify(full_view),200

        elif view_type == 'questions':
            RespQues = pg_obj.get_user_questions(id=view_id)
            if not RespQues.get('success'):
                logger.log('ERROR',RespQues.get('message'))
                return jsonify({'success':False, 'message':RespQues.get('message')}),500
            
            RowData = RespQues.get('ques',()) # subject, topic, type, difficulty, grade, created_at, questions
            full_view = {'subject': RowData[0], 'topic':RowData[1], 'type': RowData[2], 'difficulty':RowData[3], 'grade': RowData[4], 'created_at':RowData[5], 'questions':RowData[6]}
            return jsonify(full_view),200
    
    except Exception as e:
        return jsonify({'success':False, 'message':str(e)}),400

################ USER PROFILE ################
@app.route('/api/get_profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        uid = get_jwt_identity()
        resp_user_data = pg_obj.get_user_profile(uid)
        if not resp_user_data.get('success'):
            return jsonify({'success':False, 'message': resp_user_data.get('message')}),500
        
        user_data = resp_user_data.get('user_data')[0]
        logger.log('INFO',f'userdata: {user_data}')
        user_dict = {'name':user_data[0], 'email':user_data[1]}
        return jsonify(user_dict),200
     
    except Exception as e:
        return jsonify({'success':False, 'message':str(e)}),400

@app.route('/api/change_pass', methods=['POST'])
@jwt_required()
def change_pass():
    try:
        data = request.get_json()
        uid = get_jwt_identity()
        password = data.get('password')
        pass_hash = bcrypt.generate_password_hash(password=password).decode('utf-8')
        resp = pg_obj.change_password(uid,pass_hash)
        if not resp.get('success'):
            return jsonify({'success':False, 'message': resp.get('message')}),500
        return jsonify( resp.get("message") ),200

    except Exception as e:
        return jsonify({'success':False, 'message':str(e)}),400
    
################ AUTH ENDPOINTS ################ 
@app.route('/api/signup',methods=['POST'])
def signup():
    try:
          
        data = request.get_json()
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
        # logger.log('INFO',f'{access_token},{refresh_token}')
        return response
    
    except Exception as e:
        # logger.log(f'Exception ERROR: {e}')
        print_exc(e)
        return {'success':False, 'message':e},400
    
@app.route('/api/logout', methods=['POST'])
def logout():
    """
    Clears all JWT cookies to log the user out.
    """
    response = jsonify({'success': True})
    unset_jwt_cookies(response)
    return response, 200

@app.route('/token/refresh', methods=['GET','POST'])
@jwt_required(refresh=True)
def refresh():
    # Refreshing expired Access token
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=str(user_id))
    resp = jsonify({'refresh':True})
    set_access_cookies(resp, access_token)
    return resp, 200

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
    resp = {'message':'token expired'}
    return resp, 401

if '__main__' == __name__:
    app.run(host='0.0.0.0',port=5000,debug=True)
