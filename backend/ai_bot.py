from openrouter import OpenRouter
import os
from dotenv import load_dotenv
from typing import Optional
import json
load_dotenv()

class AIbot():
    def __init__(self):
        self.api_key = os.getenv('OPENROUTER_API_KEY')
        self.model = "openai/gpt-5-nano"
        self.system_prompt_questions = '''You are a MCQ generator. 
        Grade - 9-12th Indian grades; subjects: Phy,Chem,Math,Bio. 
        Make sure the question is suitable for a multiple choice type question.
        Return only appropriate Question(s) (DO NOT GIVE I REPEAT DO NOT GIVE the 4 options, GIVE ONLY QUESTION) based on difficulty, subject and quantity provided in the prompt.
        IF and only IF there are multiple questions seperate them with '\n===SEP===\n' Tag. Otherwise do not use delimeter'''
        
        self.system_prompt_options = '''You are an Options generator for a given MCQ. 
        Grade: 9-12th Indian grades. Return only 4 appropriate options in JSON format.
        Format for 4 options:
            1) Correct: One of the 4 options is the correct answer.
            2) Process distractor: Wrong in terms of process  (evaluator will know if student made mistake while solving; mistake in process/approach)
            3) Factual distractor: Wrong in factual terms (student is weak in their factual information)
            4) Accuracy distractor: Inaccurate as compared to correct answer (student made mistake in maybe calculating the answer, although approach was right.) 
        See the example given below:
        Question stem: A current of 10A flows through a conductor for two minutes.
Calculate the amount of charge passed through any area of cross section of the
conductor.
        - Correct option: The amount of charge which passed through any area of cross section of
the conductor will be 1200 C.
        - Process distractor: The total number of electrons flowing will be
7.5 x 10e21 electrons.
        - Factual distractor: The current flow in the conductor is calcu-
lated for two minutes, but the area of cross-section is not known.
        - Accuracy distractor: The amount of charge which passed through
any area of cross section of the conductor will be 2400 C.

        Format for JSON to STRICTLY FOLLOW: {correctAnswer:string, "options": [{'type':'fact', 'text':'string'}, {'type':'process', 'text':'string'}, {'type':'accuracy', 'text': 'string'}]} 
        '''
    
    def getQuestions(self, subject: str, topic: str, type: str, diffi: str, grade:str, qty: int) -> str:
        '''
            ### Input
            #### Takes subject(PCMB), topic, difficulty (easy,medium,hard), Grade(9,10,11,12), type (non-numeric/numeric), and quantity (integer) 
            ### Returns
            #### Output of the AI response, string of questions seperated by \n===SEP===\n
        '''
        with OpenRouter(api_key=self.api_key) as client:
            
            response = client.chat.send(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_prompt_questions},
                    {"role": "user", "content": f'''Generate Question(s) for Subject: {subject}
                     Topic: {topic}
                     difficulty: {diffi}
                     Grade: {grade}
                     type: {type}
                     quantity: {qty}
                     '''}
                ],
                reasoning={'effort':'low'}
            )

            data = response.choices[0].message.content
            # print(data)
            return data
        
    def getOptions(self, question: str, type: str, additional_prompt: Optional[str]=None) -> dict:
        '''
            ### Input
            #### Takes Question(PCMB), type (non-numeric/numeric), and additional prompt 
            ### Returns
            #### Output of the AI response dictionary: {correctAnswer:string, options:[{type:fact,text:string},{type:process, text:string}, {type:accuracy,text:string}]}
        '''

        with OpenRouter(api_key=self.api_key) as client:
            response = client.chat.send(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_prompt_options},
                    {"role": "user", "content": f'Generate Options for Question: {question}; type: {type}; Additonal instructions: {additional_prompt}'}
                ], reasoning={'effort':'medium'}
            )
            ai_response = response.choices[0].message.content
            # print(ai_response)
            answer_and_options = json.loads(ai_response)
            answer_and_options['question'] = question
            return answer_and_options
        
if '__main__' == __name__:
    # example use:
    aibot = AIbot()
    questions = aibot.getQuestions("chemistry","equillibrium","easy", "non-numeric",1)
    print(questions)
    options = aibot.getOptions(question=questions,type="non-numeric")
    print(options)