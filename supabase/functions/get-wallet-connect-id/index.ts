import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  const {
    data: { user },
  } = await supabaseClient.auth.getUser()

  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  return new Response(
    JSON.stringify({
      WALLET_CONNECT_PROJECT_ID: Deno.env.get('WALLET_CONNECT_PROJECT_ID')
    }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})