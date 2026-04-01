from openrouter import OpenRouter
import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

class AIbot():
    def __init__(self):
        self.api_key = os.getenv('OPENROUTER_API_KEY')
        self.model = "openai/gpt-5-nano"
        self.system_prompt_questions = '''You are a MCQ generator. 
        Grade - 9-12th Indian grades; subjects: Phy,Chem,Math,Bio. 
        Make sure the question is suitable for a multiple choice type question.
        Return only appropriate Question(s) (no options, those will be generated seperately) based on difficulty, subject and quantity provided in the prompt.
        If there are multiple questions seperate them with '\n===SEP===\n' Tag.'''
        
        self.system_prompt_options = '''You are an Options generator for a given MCQ. 
        Grade: 9-12th Indian grades. Return only 4 appropriate options in JSON format (with keys: correct, [factual,process, accuracy]). 
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

        '''
    
    def getQuestions(self, subject: str, topic: str, diffi: str, type: str, qty: int) -> str:

        with OpenRouter(api_key=self.api_key) as client:
            
            response = client.chat.send(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_prompt_questions},
                    {"role": "user", "content": f'''Generate Question(s) for Subject: {subject}
                     Topic: {topic}
                     difficulty: {diffi}
                     type: {type}
                     quantity: {qty}
                     '''}
                ],
                reasoning={'effort':'minimal'}
            )

            return response.choices[0].message.content
        
    def getOptions(self, question: str, type: str, additional_prompt: Optional[str]=None) -> str:

        with OpenRouter(api_key=self.api_key) as client:
            response = client.chat.send(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_prompt_options},
                    {"role": "user", "content": f'Generate Options for Question: {question}; type: {type}; Additonal instructions: {additional_prompt}'}
                ]
                # ,
                # response_format={'type':'json_schema', 'json_schema':{
                #         "name":"options", "strict":"true",
                #         'properties':{'correctAnswer':{'type':'string'}}, 
                #         'schema':{
                #             'type':'object',
                #             "properties":{
                #                 'fact':{'type':'string'},
                #                 'process':{'type':'string'},
                #                 'accuracy':{'type':'string'},
                #             }
                #         },
                #         'required':['correctAnswer','process','fact','accuracy']
                        
                #     }

                # }       
            )

            return response.choices[0].message.content
        
# example use:
aibot = AIbot()
questions = aibot.getQuestions("chemistry","equillibrium","easy", "non-numeric",1)
print(questions)
options = aibot.getOptions(question=questions,type="non-numeric")
print(options)