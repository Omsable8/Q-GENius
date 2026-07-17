class DebugLogger():
    def __init__(self,disable=False,filename=''):
        self.disable = disable
        self.filename = filename
    
    def log(self,type:str,message:str):
        if not self.disable:
            print(f'{self.filename} => [{type}] {message}')
