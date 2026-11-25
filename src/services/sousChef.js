// US-28: asks the GenAI API (Google Gemini) for an original recipe.
// Configure the key in `.env.local` (not committed):
//   VITE_GENAI_API_KEY=<key from https://aistudio.google.com/apikey>
//   VITE_GENAI_MODEL=gemini-2.5-flash   (optional)
// Without a key the built-in generator (src/utils/localChef.js) answers instead.

import { createLocalRecipe } from '@/utils/localChef'
import { violatesProfile } from '@/utils/recipes'
import { buildPrompt, normalizeRecipe } from '@/utils/sousChef'

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const DEFAULT_MODEL = 'gemini-2.5-flash'
const TIMEOUT_MS = 30000

export class SousChefError extends Error {}

const apiKey = () => import.meta.env.VITE_GENAI_API_KEY ?? ''
const model = () => import.meta.env.VITE_GENAI_MODEL || DEFAULT_MODEL

export const usesGenAiApi = () => Boolean(apiKey())

// The model sometimes wraps the JSON in a ```json block.
const stripCodeFence = (value) =>
  value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/, '')

async function askGenAi(request, signal) {
  const timeout = AbortSignal.timeout(TIMEOUT_MS)
  let response
  try {
    response = await fetch(`${BASE_URL}/${model()}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey() },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: buildPrompt(request) }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.8 },
      }),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new SousChefError(
      "The AI service didn't respond. Check your internet connection and try again.",
    )
  }
  if (!response.ok) {
    throw new SousChefError('The AI service is not available right now. Try again in a moment.')
  }
  const data = await response.json().catch(() => null)
  const answer = (data?.candidates?.[0]?.content?.parts ?? []).map((part) => part.text ?? '')
  try {
    return JSON.parse(stripCodeFence(answer.join('')))
  } catch {
    throw new SousChefError('The Sous-Chef returned an incomplete recipe. Try again.')
  }
}

/**
 * Returns a structured recipe for the request, or throws a SousChefError. The recipe is
 * checked against the profile too, because the GenAI API may ignore a constraint.
 */
export async function generateRecipe(request, { signal } = {}) {
  const online = usesGenAiApi()
  const raw = online ? await askGenAi(request, signal) : createLocalRecipe(request)
  let recipe
  try {
    recipe = normalizeRecipe(raw, request, online ? 'genai' : 'local')
  } catch {
    throw new SousChefError('The Sous-Chef returned an incomplete recipe. Try again.')
  }
  if (violatesProfile(recipe, request.profile)) {
    throw new SousChefError(
      `The Sous-Chef suggested an ingredient that does not fit the ${request.profile.name} profile. Try again.`,
    )
  }
  return recipe
}
