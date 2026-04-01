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

    // Placeholder response
    return Response.json(
      {
        success: true,
        message: 'Account created successfully',
        user: { username, email },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
