
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration for SelfBackendVerifier
const CELO_RPC_URL = "https://celo-mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"; // Using public Infura endpoint
const SELF_SCOPE = "identity:basic";
const SERVER_URL = "https://prxsatafqwmkujdvdqqk.supabase.co";

class SelfBackendVerifier {
  constructor(rpcUrl, scope, serverUrl) {
    this.rpcUrl = rpcUrl;
    this.scope = scope;
    this.serverUrl = serverUrl;
    console.log(`SelfBackendVerifier initialized with scope: ${scope}`);
  }

  async verify(proofData) {
    try {
      console.log("Verifying proof data with SelfBackendVerifier");
      
      // In a production environment, this would make RPC calls to verify the proof
      // For now, we're implementing a simplified verification that checks required fields
      
      if (!proofData || typeof proofData !== 'object') {
        console.log("Invalid proof data format");
        return { valid: false, error: "Invalid proof data" };
      }
      
      // Verification steps that would normally happen through SelfCircuitLibrary
      const hasRequiredFields = proofData.id && 
                              proofData.type && 
                              proofData.issuer &&
                              proofData.attributes;
      
      // For the simulation, we'll validate specific attributes based on proof type
      const validAttributes = this.validateAttributes(proofData);
      
      // We would normally use CircuitAttributeHandler to extract and verify attributes
      const isValidProof = hasRequiredFields && validAttributes;
      
      if (isValidProof) {
        console.log("Proof verified successfully");
        return { 
          valid: true, 
          details: {
            verificationTime: new Date().toISOString(),
            attestationId: `attest-${Math.random().toString(36).substring(2, 12)}`,
            attributes: proofData.attributes
          }
        };
      } else {
        console.log("Proof verification failed");
        return { valid: false, error: "Invalid proof structure or attributes" };
      }
    } catch (error) {
      console.error("Error in SelfBackendVerifier.verify:", error);
      return { valid: false, error: error.message };
    }
  }
  
  validateAttributes(proofData) {
    // This simulates the CircuitAttributeHandler library's attribute validation
    try {
      const { type, attributes } = proofData;
      
      if (!attributes || typeof attributes !== 'object') {
        return false;
      }
      
      // Different validation rules depending on proof type
      switch (type) {
        case 'age':
          return attributes.hasOwnProperty('age') || attributes.hasOwnProperty('birthYear');
          
        case 'identity':
          return attributes.hasOwnProperty('documentType') || 
                attributes.hasOwnProperty('name') || 
                attributes.hasOwnProperty('nationality');
                
        case 'address':
          return attributes.hasOwnProperty('country') || 
                attributes.hasOwnProperty('city') || 
                attributes.hasOwnProperty('postalCode');
                
        case 'custom':
          return Object.keys(attributes).length > 0;
          
        default:
          return false;
      }
    } catch (error) {
      console.error("Error validating attributes:", error);
      return false;
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      // Parse the request body
      const body = await req.json();
      
      // Extract proof data
      const { proofData } = body;
      
      if (!proofData) {
        return new Response(
          JSON.stringify({ error: 'Missing proof data' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Create an instance of SelfBackendVerifier
      const verifier = new SelfBackendVerifier(CELO_RPC_URL, SELF_SCOPE, SERVER_URL);
      
      console.log("Received proof for verification:", JSON.stringify(proofData, null, 2));
      
      // Verify the proof
      const result = await verifier.verify(proofData);
      
      // Return verification result
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );
    
  } catch (error) {
    console.error("Error verifying Self proof:", error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
