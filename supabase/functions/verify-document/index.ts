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

    const worker = await createWorker()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')

    console.log('Processing document:', documentUrl)

    const { data: { text: extractedText } } = await worker.recognize(documentUrl)
    await worker.terminate()
    
    console.log('Extracted text:', extractedText)

    // Process and match the extracted data
    const extractedData = processExtractedText(extractedText)
    const matchScore = calculateMatchScore(extractedData, formData)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: dbError } = await supabase
      .from('kyc_verifications')
      .insert({
        user_id: userId,
        document_type: documentType,
        ocr_extracted_data: extractedData,
        form_data: formData,
        verification_status: matchScore > 0.7 ? 'verified' : 'needs_review',
        match_score: matchScore,
      })

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({
        success: true,
        matchScore,
        status: matchScore > 0.7 ? 'verified' : 'needs_review',
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

function processExtractedText(text: string) {
  const lines = text.toLowerCase().split('\n')
  const data: Record<string, string> = {}
  
  for (const line of lines) {
    // Extract first name
    if (line.includes('first name') || line.includes('given name')) {
      const name = line.replace(/first name:|given name:/i, '').trim()
      data.firstName = name
    }
    
    // Extract country
    if (line.includes('country') || line.includes('nationality')) {
      const country = line.replace(/country:|nationality:/i, '').trim()
      data.country = country
    }
  }
  
  return data
}

function calculateMatchScore(extracted: Record<string, string>, submitted: Record<string, string>): number {
  let matches = 0
  let total = 0
  
  // Check first name match
  if (extracted.firstName && submitted.firstName) {
    total++
    if (extracted.firstName.toLowerCase().includes(submitted.firstName.toLowerCase()) ||
        submitted.firstName.toLowerCase().includes(extracted.firstName.toLowerCase())) {
      matches++
    }
  }
  
  // Check country match
  if (extracted.country && submitted.country) {
    total++
    if (extracted.country.toLowerCase().includes(submitted.country.toLowerCase()) ||
        submitted.country.toLowerCase().includes(extracted.country.toLowerCase())) {
      matches++
    }
  }
  
  return total > 0 ? matches / total : 0
}