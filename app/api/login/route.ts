const API_URL = 'http://localhost:5000'
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // TODO: Implement Supabase authentication
    // This should:
    // 1. Validate email and password
    // 2. Call Supabase auth API
    // 3. Return session token/JWT
    // 4. Set HTTP-only cookie
    const response = await fetch(API_URL+'/api/login',{
      'headers':{'Content-Type':'application/json'},
      'method': 'POST',
      'body': JSON.stringify({email, password})
    })

    
    if(!response.ok){
      console.log("LOGIN FAILED")
      return response
    }

    const data = await response.json()
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

      return Response.json(
        {
          success: true,
          message: 'Login successful',
          user: { email },
          token: data.token
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
