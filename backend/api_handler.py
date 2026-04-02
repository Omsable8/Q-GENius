from flask import app, Flask, request, jsonify
from flask_cors import CORS
import json

from ai_bot import AIbot

app = Flask(__name__)
CORS(app,resources={r'/*': {'origins':'*'}})

AI = AIbot()
@app.route('/api/generate_options',methods=['POST'])
def generate_options():
    try:
        data = request.get_json()
        print(f"[INFO] Request Data: {data}")
        question = data.get('question','')
        questionType = data.get('questionType','')
        additional = data.get('additionalPrompt','')
        options = AI.getOptions(question=question,type=questionType,additional_prompt=additional)
        return jsonify(options)
    except Exception as e:
        return {'status':400, 'error':e}
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

        return jsonify(list_options)
    
    except Exception as e:
        return {'status':400, 'error':e}

if '__main__' == __name__:
    app.run(host='0.0.0.0',port=5000,debug=True)
