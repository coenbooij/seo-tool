import { NextRequest } from 'next/server'

// In a real application, this would connect to a keyword research API
// For now, we'll simulate some results based on the seed keyword
function generateKeywordSuggestions(seed: string): string[] {
  const prefixes = ['how to', 'best', 'top', 'why', 'what is']
  const suffixes = ['guide', 'tutorial', 'tips', 'examples', 'comparison']
  const relatedTerms = ['online', 'free', 'professional', 'advanced', 'beginner']

  const suggestions = new Set<string>()

  // Add variations with prefixes
  prefixes.forEach(prefix => {
    suggestions.add(`${prefix} ${seed}`)
  })

  // Add variations with suffixes
  suffixes.forEach(suffix => {
    suggestions.add(`${seed} ${suffix}`)
  })

  // Add variations with related terms
  relatedTerms.forEach(term => {
    suggestions.add(`${seed} ${term}`)
    suggestions.add(`${term} ${seed}`)
  })

  // Add some combinations
  suggestions.add(`how to ${seed} for beginners`)
  suggestions.add(`best ${seed} guide ${new Date().getFullYear()}`)
  suggestions.add(`${seed} tips and tricks`)
  suggestions.add(`learn ${seed} online`)
  suggestions.add(`${seed} course`)

  return Array.from(suggestions)
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const term = searchParams.get('term')

    if (!term) {
      return Response.json(
        { error: 'Search term is required' },
        { status: 400 }
      )
    }

    // In production, this would call an actual keyword research API
    const suggestions = generateKeywordSuggestions(term.toLowerCase())

    return Response.json({
      suggestions,
      total: suggestions.length
    })
  } catch (error) {
    console.error('Error in keyword research:', error)
    return Response.json(
      { error: 'Failed to research keywords' },
      { status: 500 }
    )
  }
}