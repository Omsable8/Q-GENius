const API_URL = 'http://localhost:5000'
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { subject, topic, difficulty, type, grade, numQuestions, additionalPrompt } = body

    // TODO: Implement bulk MCQ generation
    // This should:
    // 1. Validate all parameters
    // 2. Check rate limits and user quota
    // 3. Call your Python Flask backend or AI model
    // 4. Generate MCQs based on parameters
    // 5. Return array of generated questions
    const response = await fetch(API_URL+'/api/generate_questions',{'headers':{'Content-Type':'application/json'},
      'method':'POST',
      'body':JSON.stringify({ subject, topic, type, difficulty, grade, numQuestions, additionalPrompt })
    })

    if (!response.ok) {
      console.log(response)
      return Response.json({ success: false, error: `HTTP ${response.status}` })
    }
    const data = await response.json()
    return Response.json(
      {success:true, questions:data, parameters: { subject, topic, difficulty, grade }},
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Question generation error:', error)
    
    if (error instanceof Error && error.message.includes('rate')) {
      return Response.json(
        { message: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    return Response.json(
      { message: 'Failed to generate questions' },
      { status: 500 }
    )
  }
}
