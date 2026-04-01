from spacy.cli import download
download('en_core_web_md')

import os
import openai
import spacy
import en_core_web_md
import re
from io import StringIO
from contextlib import redirect_stdout
from spacy import displacy
import gradio as gr
from types import MappingProxyType
import random
from dotenv import load_dotenv
load_dotenv()
# Load the small English pipeline
nlp = spacy.load("en_core_web_md")

openai.api_key = os.getenv("OpenAI_API_Key")

    
def findcode(p1):
  system_prompt = '''You are a python coder. 
  Write a function with no additional text and explanation and print its output in the same cell. 
  Import necessary libraries for execution."
'''
  return openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[
          {"role": "system", "content": system_prompt},
          {"role": "user", "content": "Write a python program for,"+p1},
      ]
  ).choices[0]['message']['content']

def final_output(text):
  #Remove the lines in final output if characters repeat

  #remove whitespaces before and after endline
  text = re.sub('^ +| +$', '', text)
  # Remove extra spaces using the regular expression
  text = re.sub(' +', ' ', text)
  # Remove newline characters and other whitespaces using the regular expression
  text = re.sub('[\r\t\f\v]*', '', text)
  text = re.sub('[\n]+', ' ', text)
  return text

def swap_signs(string):
    # Split the string into separate lines
    lines = string.split('\n')
    
    # Iterate through each line and replace + and - , * and /, > and <, % and //
    for i in range(len(lines)):
        if "while" in lines[i] or "for" in lines[i] or "#" in lines[i] or '"""' in lines[i]:
            continue
        else:
            # Replace + and - only if they don't occur consecutively and followed by =
            if "++" not in lines[i] and "--" not in lines[i] and "-=" not in lines[i] and "+=" not in lines[i]:
                lines[i] = lines[i].replace('+', '$', 1).replace('-', '+', 1).replace('$', '-', 1)
            
            # Replace * and / only if they don't occur consecutively and followed by =
            if "**" not in lines[i] and "//" not in lines[i] and "/=" not in lines[i] and "*=" not in lines[i]:
                lines[i] = lines[i].replace('*', '$', 1).replace('/', '*', 1).replace('$', '/', 1)
                
            if "//"  in lines[i] or "%" in lines[i]:
                lines[i] = lines[i].replace('%', '$', 1).replace('//', '%', 1).replace('$', '//', 1)
                
            if "**"  in lines[i]:
                lines[i] = lines[i].replace('**', '*', 1)
                
            if "<"  in lines[i] or ">" in lines[i]:
                lines[i] = lines[i].replace('<', '$', 1).replace('>', '<', 1).replace('$', '>', 1)
                

    # Join the modified lines back together into a single string
    modified_string = '\n'.join(lines)
    
    return modified_string

def get_output_for_code(code):
  #Extract the '''code'''
  regex = re.compile(r'```([\s\S]*?)```')
  matches = regex.findall(code)

  if matches:
      code=matches[0]
  else:
      code=code
  
  code=re.sub('python','',code)

  # Create a StringIO object to redirect output
  output =StringIO()

  with redirect_stdout(output):
      exec(code)

  return output.getvalue()

#Loop for Finding the main part of the answer
def main_words_in_answer(text):
    doc = nlp(text)

    units = ""
    # Define the regular expression for matching numbers
    number_regex = r"[-+]?\d*\.\d+|\d+"

    # Iterate over the tokens in reverse order
    for token in reversed(doc):
        # Check if the token matches the regular expression for a number
        if re.match(number_regex, token.text):
            # Get the numerical value
            numerical_value = token.text
            # Check if the next token is a unit
            # if token.i < len(doc) - 1 and doc[token.i + 1].is_alpha:
            #     units = doc[token.i + 1].text
            return numerical_value + units
    return ""

def find_inaccurate_distractor(p1,model="text-davinci-002"):
  response = openai.Completion.create(
  model=model,
  prompt="In Minimum Words and Correctly,"+p1,
  temperature=0,
  max_tokens=256,
  top_p=1,
  frequency_penalty=0.2,
  presence_penalty=0.2
)
  
  if 'choices' in response:
    x=response['choices']
    y=x[0]['text']
    
    if len(x)>0:
      return y
    else:
      return ''
  else:
    return ''


def average_or_middle_value(A, B, C):
  a = 0.0
  b = 0.0
  c = 0.0
  try:
    a = float(A)
  except:
    pass
  try:
    b = float(B)
  except:
    pass
  try:
    c = float(C)
  except:
    pass

  if a == b and b == c:
    return 0

  # Check if all three options are integers
  if a.is_integer() and b.is_integer() and c.is_integer():
      # Compute the range of values for the fourth option
      range_min = min(a, b, c) - (max(a, b, c) - min(a, b, c) + 1)//2 
      range_max = max(a, b, c) + (max(a, b, c) - min(a, b, c) + 1)//2
      
      # Create an integer as the fourth option
      # This code will generate an integer within the computed range
      
      random_int = random.randint(range_min, range_max)
      while random_int in [a, b, c]:
          random_int = random.randint(range_min, range_max)
      # Now you can use this integer as a fourth option
      return random_int

  else:
      # If at least one of the options is not an integer, create a floating-point number as the fourth option
      # This code is similar to the previous example
      range_min = min(a, b, c) - (max(a, b, c) - min(a, b, c))/2
      range_max = max(a, b, c) + (max(a, b, c) - min(a, b, c))/2
      random_float = round(random.uniform(range_min, range_max), 2)
      while random_float in [a, b, c]:
          random_float = round(random.uniform(range_min, range_max), 2)
      return random_float

def correct_answer(correct):
  answer2=get_output_for_code(correct)
  answer3=final_output(answer2)
  return answer3

def process(correct,answer3): #main_answer also parameter
  
  try:
    process_distractor=swap_signs(correct)
    process_distractor2=get_output_for_code(process_distractor)
    process_distractor2=final_output(process_distractor2)
    
    if process_distractor2 is None or not any(char.isdigit() for char in process_distractor2) or process_distractor2==answer3:
      return "None of the Above"
    
    else:
      return process_distractor2 

  except Exception as e:
    return "None of the Above"

def accuracy(text,answer3):
  inaccurate_distractor=find_inaccurate_distractor(text)
  inaccurate_distractor2=final_output(inaccurate_distractor)
  main_accuracy=main_words_in_answer(inaccurate_distractor)
  main_answer=main_words_in_answer(answer3)
  if main_answer==main_accuracy:
      inaccurate_distractor2=answer3.replace(main_answer,str(int(main_accuracy)+random.choice([-1, 1]))) #random.randint(1,3)
  else:
    inaccurate_distractor2=answer3.replace(main_answer,main_accuracy+" ")
  return inaccurate_distractor2

def fact(answer3,main_answer,main_process,main_accuracy):
  fact=average_or_middle_value(main_answer,main_process,main_accuracy)
  fact_distractor=answer3.replace(main_answer,str(fact)+" ")
  return fact_distractor

def numerical_distractors(text,additional_info=""):
  
  try:
    correct=findcode(text+"\n"+additional_info) # generates code for the question and additional info
    answer3=correct_answer("import math\n"+correct) # executes the code and gives the final answer
    main_answer=main_words_in_answer(answer3)
    

    process_distractor=process(correct,answer3) # swaps signs in the code and gives output
    main_process=main_words_in_answer(process_distractor) # extracts the main part of the answer from the process distractor

    inaccurate_distractor=accuracy(text,answer3) #runs with an inaccurate model and gives an inaccurate answer or adds/subtracts a small value to the main answer
    main_accuracy=main_words_in_answer(inaccurate_distractor)


    if main_process==main_accuracy:
      inaccurate_distractor=answer3.replace(main_answer,str(int(main_accuracy)+random.randint(1,3))+" ")

    fact_distractor=fact(answer3,main_answer,main_process,main_accuracy)

    return [answer3,fact_distractor,process_distractor,inaccurate_distractor]
  
  except:
    return[non_numerical_distractors(text,additional_info)]

def find_options(p1):
  return openai.ChatCompletion.create(
    model="gpt-3.5-turbo-0301",
    messages=[
          {"role": "system", "content": "You are a subject matter expert. Generate 4 MCQ options for the question such that there's (A) a correct answer, (B) an error in factual information, (C) a mistake in the process of reaching the solution, and (D)an inaccurate answer close to the correct answer."},
          {"role": "user", "content": p1},
      ]
  ).choices[0]['message']['content']

def non_numerical_distractors(text,additional_info=""):
  
  if additional_info!="":
    options=find_options(text+"\n(Hint:"+additional_info+")")
  options=find_options(text)
  
  #Cleaning string of HTML marks
  options = re.sub('<[^<]+?>', '', options)
  
  #Removing anything within parentheses
  options = re.sub(r'\([^)]*\)', '', options)

  # Regular expression to match the options
  pattern = r'[A-D][\)\.]? (.*)'
  

  # Extract the options using regex
  option_list= re.findall(pattern,options)
  
  [c,f,p,a]=option_list[0:4]

  return [c,f,p,a]

def QGenius(Mail_ID,text,additional_info,Question_Type,Subjects):
  if Question_Type=="Numericals":
    return numerical_distractors(text,additional_info)
  else:
    return non_numerical_distractors(text,additional_info)

input_text0 = gr.inputs.Textbox(label="User ID:")
input_text1 = gr.inputs.Textbox(label="Question:")
input_text2 = gr.inputs.Textbox(label="Keywords/Prompt:")
input_text3 = gr.Dropdown(['Non-Numericals','Numericals'],label="Question Type:")
input_text4 = gr.Dropdown(['Mathematics','Physics','Chemistry','Biology'],label="Subjects (If Any)")


output_text1 = gr.outputs.Textbox(label="Correct Answer:")  
output_text2 = gr.outputs.Textbox(label="Fact Distractor:")  
output_text3 = gr.outputs.Textbox(label="Process Distractor:")  
output_text4 = gr.outputs.Textbox(label="Accuracy Distractor:")

hf_writer = gr.HuggingFaceDatasetSaver(os.getenv('hf'), "User0")

gr.Interface(fn=QGenius, 
             inputs=[input_text0, input_text1, input_text2, input_text3, input_text4], 
             outputs=[output_text1, output_text2,output_text3,output_text4], 
             title="Q-GENius",
             description="Welcome to Q-GENius! An easy-to-use <b> Modified MCQ Generator for Identifying Learner Deficiency</b>. Enter any <i>question</i> of your interest with some <i>additional prompt</i> (optional) to generate modified distractors.",
             allow_flagging="manual",
             flagging_callback=hf_writer,
             flagging_options=["Highly Satisfied (2)", "Satisfied (1)", "Neutral (0)", "Unsatisfied (-1)", "Highly Unsatisfied (-2)"]).launch(debug=True,share=True)
