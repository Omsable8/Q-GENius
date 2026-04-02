const API_URL = 'http://localhost:5000'
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    // TODO: Implement Supabase user registration
    // This should:
    // 1. Validate input
    // 2. Check if user already exists
    // 3. Hash password with bcrypt (if not using Supabase auth)
    // 4. Create user in Supabase
    // 5. Return success or error

    const response = await fetch(API_URL+'/api/signup',
      {'headers':{'Content-Type':'application/json'},
      'method':'POST',
      'body': JSON.stringify({username,email,password})
    
    })
    if(!response.ok){
      return response
    }
    
    const data = await response.json()

    if(response.status===405){
      console.log('Account already exists in DB.')
      return response
    }
    if(response.status===409){
      console.log('Account already exists in DB.')
      return response
    }
    if(response.status===200){

      return Response.json(
        {
          success: true,
          message: 'Account created successfully',
          token:  data.token,
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Signup error:', error)
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
