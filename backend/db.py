import psycopg2
import os
from dotenv import load_dotenv
from traceback import print_exc
load_dotenv()

from debug_log import DebugLogger

logger = DebugLogger(filename=__file__,disable=True)
class PostgresDB():
    def __init__(self):
        self.DATABASE_URL = os.getenv('SUPABASE_URL')
        # self.db = os.getenv('dbname')
        # self.user = os.getenv('dbuser')
        # self.password = os.getenv('password')
        # self.host = os.getenv('host')

    def get_pass_hash(self,email)->dict:
        try:
            with psycopg2.connect(self.DATABASE_URL) as conn:

                cur = conn.cursor()
                cur.execute('select uid, password_hash from users where email=%s',(email,))
                uid, fetched_password_hash = cur.fetchone()
                logger.log('INFO',f'UID: {uid}, pass_hash: {fetched_password_hash}')
                cur.close()
                
            if fetched_password_hash and uid:
                return {'success':True,'hash':fetched_password_hash, 'uid':uid}
            logger.log('INFO',f'{uid}, {fetched_password_hash}')
            return {'success':False, 'message':f'No Password Hash found for user: {email}'}
        
        except Exception as e:
            # print_exc(e)
            return {'success':False,'message':f"Failed to Login User in DB. Exception: {e}"}
    
    def check_if_email_exists(self,email:str)->bool:
        try:
            with psycopg2.connect(self.DATABASE_URL) as conn:
                cur = conn.cursor()
                cur.execute('select email from users where email=%s',(email,))
                email_fetched = cur.fetchone()
                cur.close()
            if email_fetched and email == email_fetched[0]:
                logger.log('INFO',f'Email fetched : {email_fetched[0]}')
                return True
            return False
        except Exception as e:
            # print_exc(e)
            return {'success':False,'message':f"Failed to check User email in DB. Exception: {e}"}
        
    def check_if_uid_exists(self,uid:str)->bool:
        try:
            with psycopg2.connect(self.DATABASE_URL) as conn:
                cur = conn.cursor()
                cur.execute('select uid from users where uid=%s',(uid,))
                uid_fetched = cur.fetchone()
                cur.close()
            if uid_fetched and uid == uid_fetched[0]:
                logger.log('INFO',f'uid fetched : {uid_fetched[0]}')
                return True
            return False
        except Exception as e:
            # print_exc(e)
            return {'success':False,'message':f"Failed to check User uid in DB. Exception: {e}"}
        
    def signup(self,email:str,name:str,password_hash:str) -> dict:
        try:
            # conn = psycopg2.connect(self.DATABASE_URL)
            with psycopg2.connect(self.DATABASE_URL) as conn:

                cur = conn.cursor()
                cur.execute('insert into users (email,name,password_hash) VALUES (%s,%s,%s)',(email,name,password_hash,) )
                cur.execute('select uid from users where email=%s',(email,))
                uid = cur.fetchone()[0]
                cur.close()
            logger.log('INFO',f'UID: {uid}')

            
            return {'success':True,'message':"SignUp Successful", 'uid':uid}
        except Exception as e:
            print_exc(e)
            return {'success':False,'message':f"Failed to SignUp User in DB. Exception: {e}"}
        