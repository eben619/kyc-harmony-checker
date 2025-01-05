import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { createWorker } from 'https://esm.sh/tesseract.js@5.0.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { documentUrl, formData, userId, documentType } = await req.json()

    // Initialize Tesseract worker
    const worker = await createWorker()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')

    console.log('Processing document:', documentUrl)

    // Perform OCR on the document
    const { data: { text: extractedText } } = await worker.recognize(documentUrl)
    await worker.terminate()
    
    console.log('Extracted text:', extractedText)

    // Process and structure the extracted data
    const extractedData = processExtractedText(extractedText, documentType)
    
    // Calculate match score
    const matchScore = calculateMatchScore(extractedData, formData)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store verification result
    const { error: dbError } = await supabase
      .from('kyc_verifications')
      .insert({
        user_id: userId,
        document_type: documentType,
        ocr_extracted_data: extractedData,
        form_data: formData,
        verification_status: matchScore > 0.8 ? 'verified' : 'needs_review',
        match_score: matchScore,
      })

    if (dbError) {
      throw dbError
    }

    return new Response(
      JSON.stringify({
        success: true,
        matchScore,
        status: matchScore > 0.8 ? 'verified' : 'needs_review',
        extractedData,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function processExtractedText(text: string, documentType: string) {
  const lines = text.split('\n')
  const data: Record<string, string> = {}
  
  for (const line of lines) {
    // Look for common patterns in IDs
    if (/name|full name/i.test(line)) {
      const nameParts = line.replace(/name:?\s*|full name:?\s*/i, '').trim().split(' ')
      if (nameParts.length >= 2) {
        data.firstName = nameParts[0]
        data.lastName = nameParts[nameParts.length - 1]
      }
    }
    if (/dob|birth|born/i.test(line)) {
      data.dateOfBirth = line.replace(/dob:?\s*|date\s+of\s+birth:?\s*|born:?\s*/i, '').trim()
    }
    if (/address|residence/i.test(line)) {
      data.address = line.replace(/address:?\s*|residence:?\s*/i, '').trim()
    }
  }
  
  return data
}

function calculateMatchScore(extracted: Record<string, string>, submitted: Record<string, string>): number {
  let matches = 0
  let total = 0
  
  const fieldsToCompare = ['firstName', 'lastName', 'dateOfBirth', 'address']
  
  for (const field of fieldsToCompare) {
    if (extracted[field] && submitted[field]) {
      total++
      const similarity = calculateStringSimilarity(
        extracted[field].toLowerCase(),
        submitted[field].toLowerCase()
      )
      if (similarity > 0.8) {
        matches++
      }
    }
  }
  
  return total > 0 ? matches / total : 0
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        )
      }
    }
  }

  const maxLength = Math.max(m, n)
  return 1 - (dp[m][n] / maxLength)
}