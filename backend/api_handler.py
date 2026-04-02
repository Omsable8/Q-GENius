from flask import app, Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import json
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token
from traceback import print_exc

from ai_bot import AIbot
from db import PostgresDB

load_dotenv()

############ CONFIGS ############ 
app = Flask(__name__)
bcrypt = Bcrypt(app)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_KEY')
jwt = JWTManager(app)

CORS(app,resources={r'/*': {'origins':'*'}})

AI = AIbot()
pg_obj = PostgresDB()


@app.route('/api/generate_options',methods=['POST'])
def generate_options():
    try:
        data = request.get_json()
        print(f"[INFO] Request Data: {data}")
        question = data.get('question','')
        questionType = data.get('questionType','')
        additional = data.get('additionalPrompt','')
        options = AI.getOptions(question=question,type=questionType,additional_prompt=additional)
        return {options},200
    except Exception as e:
        return {'success':False, 'message':e},400
    
@app.route('/api/generate_questions',methods=['POST'])
def generate_questions():
    try:
        data = request.get_json()
        print(f"[INFO] Request Data: {data}")
        subject = data.get('subject','')
        topic = data.get('topic','')
        type = data.get('type','')
        difficulty = data.get('difficulty','')
        grade = data.get('grade','')
        numQuestions = int(data.get('numQuestions',0))

        options = AI.getQuestions(subject, topic, type, difficulty, grade, numQuestions)
        list_options = options.split('\n===SEP===\n')

        return {list_options},200
    
    except Exception as e:
        return {'success':False, 'message':e},400
    
@app.route('/api/signup',methods=['POST'])
def signup():
    try:
          
        data = request.get_json()
        print(f"[INFO] Request Data: {data}")
        username = data.get('username','')
        email = data.get('email','')
        password = data.get('password','')
        
        if pg_obj.check_if_user_exists(email=email):
            return {'success':'false', 'message':'User Email already exists in table'},409

        pass_hash = bcrypt.generate_password_hash(password=password).decode('utf-8')

        signup_result = pg_obj.signup(email, username, pass_hash)
        if not signup_result.get("success"):
            return {'message':signup_result.get('message')},405
        
        uid = signup_result.get('uid')
        token = create_access_token(identity=uid)
        return {'token':token},200
    
    except Exception as e:
        # print(f'Exception ERROR: {e}')
        print_exc(e)
        return {'success':False, 'message':e},400
    
@app.route('/api/login',methods=['POST'])
def login():
    try:
          
        data = request.get_json()
        print(f"[INFO] Request Data: {data}")
        email = data.get('email','')
        password = data.get('password','')
        
        if not pg_obj.check_if_user_exists(email=email):
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
        if uid:
            token = create_access_token(identity=uid)
        return {'token':token}, 200
    
    except Exception as e:
        # print(f'Exception ERROR: {e}')
        print_exc(e)
        return {'success':False, 'message':e},400

if '__main__' == __name__:
    app.run(host='0.0.0.0',port=5000,debug=True)
