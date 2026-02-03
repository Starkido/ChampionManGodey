/// <reference path="../deno.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to get their ID
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { amount, phoneNumber, network } = await req.json();

    // Validate input
    if (!amount || !phoneNumber || !network) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (amount < 5) {
      return new Response(
        JSON.stringify({ success: false, error: "Minimum withdrawal is GHS 5" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client for wallet operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check wallet balance
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      console.error("Wallet error:", walletError);
      return new Response(
        JSON.stringify({ success: false, error: "Wallet not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (wallet.balance < amount) {
      return new Response(
        JSON.stringify({ success: false, error: "Insufficient balance" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate reference
    const reference = `WD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Deduct from wallet
    const { error: deductError } = await supabaseAdmin
      .from("wallets")
      .update({ balance: wallet.balance - amount })
      .eq("user_id", user.id);

    if (deductError) {
      console.error("Deduct error:", deductError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to process withdrawal" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabaseAdmin
      .from("withdrawals")
      .insert({
        user_id: user.id,
        amount,
        phone_number: phoneNumber,
        network,
        status: "pending",
        reference,
      })
      .select()
      .single();

    if (withdrawalError) {
      console.error("Withdrawal insert error:", withdrawalError);
      // Refund the wallet if withdrawal record fails
      await supabaseAdmin
        .from("wallets")
        .update({ balance: wallet.balance })
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ success: false, error: "Failed to create withdrawal request" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create transaction record
    await supabaseAdmin.from("transactions").insert({
      user_id: user.id,
      type: "withdrawal",
      amount: -amount,
      status: "pending",
      reference,
      metadata: {
        phone_number: phoneNumber,
        network,
        withdrawal_id: withdrawal.id,
      },
    });

    console.log(`Withdrawal request created: ${reference} for user ${user.id}, amount: ${amount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Withdrawal request submitted",
        reference,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Withdrawal error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
