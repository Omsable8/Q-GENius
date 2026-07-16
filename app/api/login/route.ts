const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5000';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const nextHeaders = await headers();
    const { email, password } = body
    
    const response = await fetch(`${host}/api_flask/login`,{
      'headers':
      {'Content-Type':'application/json',
        'Cookie': nextHeaders.get('cookie') || '',
        'X-CSRF-TOKEN': nextHeaders.get('x-csrf-token') || ''},
      'credentials':'include',
      'method': 'POST',
      'body': JSON.stringify({email, password})
    })

    
    if(!response.ok){
      console.log("LOGIN FAILED")
      return response
    }

    if(response.status === 401){
      return Response.json(
        {
          'success':false,
          'message': 'Incorrect Password'
        },
        {status:401}
      )
    }
    if(response.status === 409){
      return Response.json(
        {
          'success':false,
          'message': 'User Email Does not exist'
        },
        {status:409}
      )
    }
    if(response.status===200){
      return response
    }
  } catch (error) {
    console.error('Login error:', error)
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
