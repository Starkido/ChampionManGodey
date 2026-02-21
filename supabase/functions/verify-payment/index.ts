/// <reference path="../deno.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  reference: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for wallet updates
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Create user client for auth verification
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.user.id;

    // Parse request body
    const { reference }: VerifyRequest = await req.json();

    if (!reference) {
      return new Response(
        JSON.stringify({ error: "Reference is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if transaction already processed
    const { data: existingTx } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("reference", reference)
      .eq("user_id", userId)
      .single();

    if (existingTx?.status === "success") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment already verified",
          amount: existingTx.amount,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify with Paystack
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      return new Response(
        JSON.stringify({ error: "Payment configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      // Update transaction as failed
      await supabaseAdmin
        .from("transactions")
        .update({ status: "failed" })
        .eq("reference", reference);

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Payment verification failed",
          paystack_status: paystackData.data?.status 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Amount from Paystack (in pesewas)
    const amountInGHS = paystackData.data.amount / 100;

    // Update transaction status
    const { error: txUpdateError } = await supabaseAdmin
      .from("transactions")
      .update({
        status: "success",
        metadata: {
          paystack_reference: paystackData.data.reference,
          paystack_id: paystackData.data.id,
          paid_at: paystackData.data.paid_at,
          channel: paystackData.data.channel,
        },
      })
      .eq("reference", reference);

    if (txUpdateError) {
      console.error("Transaction update error:", txUpdateError);
    }

    // Credit user wallet
    const { data: wallet, error: walletFetchError } = await supabaseAdmin
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (walletFetchError) {
      console.error("Wallet fetch error:", walletFetchError);
      return new Response(
        JSON.stringify({ error: "Failed to update wallet" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newBalance = (Number(wallet.balance) || 0) + amountInGHS;

    const { error: walletUpdateError } = await supabaseAdmin
      .from("wallets")
      .update({ balance: newBalance })
      .eq("user_id", userId);

    if (walletUpdateError) {
      console.error("Wallet update error:", walletUpdateError);
      return new Response(
        JSON.stringify({ error: "Failed to update wallet" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Payment verified for user ${userId}: ${reference}, amount: ${amountInGHS} GHS`);

    // Send SMS notification
    try {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("phone")
        .eq("user_id", userId)
        .single();

      if (profile?.phone) {
        const smsMessage = `Your wallet has been credited with GHS ${amountInGHS.toFixed(2)}. New balance: GHS ${newBalance.toFixed(2)}. Thank you for using Champion Man Agency Data Services!`;
        
        await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ to: profile.phone, message: smsMessage }),
        });
        console.log("SMS notification sent to:", profile.phone);
      }
    } catch (smsError) {
      console.log("SMS notification failed (non-critical):", smsError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified and wallet credited",
        amount: amountInGHS,
        new_balance: newBalance,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
