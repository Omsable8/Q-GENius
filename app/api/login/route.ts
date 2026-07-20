const API_URL = 'http://localhost:5000'
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    const response = await fetch(API_URL+'/api/login',{
      'headers':{'Content-Type':'application/json'},
      'credentials':'include',
      'method': 'POST',
      'body': JSON.stringify({email, password})
    })

    if(response.status === 401){
      return Response.json(
        {
          'success':false,
          'message': 'Incorrect Password or Email. Please Try again!'
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
    if(!response.ok){
      console.log("LOGIN FAILED")
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
