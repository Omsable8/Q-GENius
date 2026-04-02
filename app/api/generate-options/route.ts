const API_URL = 'http://localhost:5000'
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { question, questionType, additionalPrompt } = body

    // TODO: Implement MCQ distractor generation
    // This should:
    // 1. Validate request data
    // 2. Check rate limits
    // 3. Call your Python Flask backend or AI model
    // 4. Parse response and format distractors
    // 5. Return three types: correct, fact, process, accuracy

    const response = await fetch(API_URL+'/api/generate_options', {
        method:'POST',
        headers: { "Content-Type": "application/json" },
        body:JSON.stringify({ question, questionType, additionalPrompt })
      })
    
    if (!response.ok) {
      console.log(response)
      return Response.json({ success: false, error: `HTTP ${response.status}` })
    }
    
    const data = await response.json()
    return Response.json(data, { status: 200 })
    
    

  } catch (error) {
    console.error('Generation error:', error)
    
    // Check if it's a rate limit error
    if (error instanceof Error && error.message.includes('rate')) {
      return Response.json(
        { message: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    return Response.json(
      { message: 'Failed to generate options' },
      { status: 500 }
    )
  }
}
