const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5000';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const nextHeaders = await headers();
    const { username, email, password } = body

    const response = await fetch(`${host}/api_flask/signup`,
      {'headers':
        {'Content-Type':'application/json',
        'Cookie': nextHeaders.get('cookie') || '',
        'X-CSRF-TOKEN': nextHeaders.get('x-csrf-token') || ''},
      'method':'POST',
      
      'body': JSON.stringify({username,email,password})
    
    })
    
    if(response.status===405){
      console.log('Account already exists in DB.')
      return response
    }
    if(response.status===409){
      console.log('Account already exists in DB.')
      return response
    }
    if(response.status===200){
      return response
    }
    if(!response.ok){
      return response
    }
  } catch (error) {
    console.error('Signup error:', error)
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
