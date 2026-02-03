/// <reference path="../deno.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers":
//     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
// };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};


// Agyengosoln API configuration
const AGYENGOSOLN_API_URL = "https://agyengosoln.com/api/v1";

// Network mapping from our database to Agyengosoln API
// MTN = 3, Telecel = 2, AT-Ishare (AirtelTigo) = 1
const NETWORK_ID_MAP: Record<string, number> = {
  "MTN": 3,
  "MTN_AFA": 3,
  "Telecel": 2,
  "Airtel": 1,
  "AirtelTigo": 1,
  "AT-Ishare": 1,
};

interface PurchaseRequest {
  pricing_tier_id: string;
  beneficiary_phone: string;
  quantity?: number;
}

interface CartCheckoutRequest {
  cart_items: {
    pricing_tier_id: string;
    beneficiary_phone: string;
    quantity: number;
  }[];
}

interface AgyengosDataResponse {
  success: boolean;
  message: string;
  transaction_code?: string;
}

// Parse data amount string (e.g., "1GB", "500MB") to MB
function parseDataAmountToMB(dataAmount: string): number {
  const normalized = dataAmount.toUpperCase().trim();
  
  // Match patterns like "1GB", "1.5GB", "500MB"
  const gbMatch = normalized.match(/^([\d.]+)\s*GB$/);
  if (gbMatch) {
    return Math.round(parseFloat(gbMatch[1]) * 1000);
  }
  
  const mbMatch = normalized.match(/^([\d.]+)\s*MB$/);
  if (mbMatch) {
    return Math.round(parseFloat(mbMatch[1]));
  }
  
  // Default: try to parse as GB
  const numMatch = normalized.match(/^([\d.]+)/);
  if (numMatch) {
    return Math.round(parseFloat(numMatch[1]) * 1000);
  }
  
  console.error("Could not parse data amount:", dataAmount);
  return 0;
}

// Format phone number for API (ensure 10 digits starting with 0)
function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, "");
  
  // If starts with 233 (Ghana code), replace with 0
  if (cleaned.startsWith("233") && cleaned.length === 12) {
    cleaned = "0" + cleaned.substring(3);
  }
  
  // If doesn't start with 0 and is 9 digits, prepend 0
  if (!cleaned.startsWith("0") && cleaned.length === 9) {
    cleaned = "0" + cleaned;
  }
  
  return cleaned;
}

// Call Agyengosoln API to purchase data
async function purchaseDataFromProvider(
  apiKey: string,
  recipientPhone: string,
  networkName: string,
  dataAmountMB: number,
  reference: string
): Promise<{ success: boolean; message: string; transactionCode?: string }> {
  const networkId = NETWORK_ID_MAP[networkName];
  if (!networkId) {
    console.error("[PURCHASE-DATA] Unknown network mapping:", networkName);
    console.error("[PURCHASE-DATA] Available mappings:", Object.keys(NETWORK_ID_MAP));
    return { success: false, message: `Unknown network: ${networkName}` };
  }

  const formattedPhone = formatPhoneNumber(recipientPhone);
  
  // Detailed logging for debugging
  console.log("[PURCHASE-DATA] ================== API CALL START ==================");
  console.log("[PURCHASE-DATA] Recipient phone (raw):", recipientPhone);
  console.log("[PURCHASE-DATA] Recipient phone (formatted):", formattedPhone);
  console.log("[PURCHASE-DATA] Network name:", networkName);
  console.log("[PURCHASE-DATA] Network ID:", networkId);
  console.log("[PURCHASE-DATA] Data amount (MB):", dataAmountMB);
  console.log("[PURCHASE-DATA] Reference:", reference);
  console.log("[PURCHASE-DATA] API Key prefix:", apiKey?.substring(0, 8) + "...");

  const requestBody = {
    recipient_msisdn: formattedPhone,
    network_id: networkId,
    shared_bundle: dataAmountMB,
    incoming_api_ref: reference,
  };
  
  console.log("[PURCHASE-DATA] Request body:", JSON.stringify(requestBody));

  try {
    const response = await fetch(`${AGYENGOSOLN_API_URL}/buy-data-package`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log("[PURCHASE-DATA] Raw response status:", response.status);
    console.log("[PURCHASE-DATA] Raw response body:", responseText);
    
    let data: AgyengosDataResponse;
    try {
      data = JSON.parse(responseText) as AgyengosDataResponse;
    } catch (parseError) {
      console.error("[PURCHASE-DATA] Failed to parse response as JSON:", parseError);
      return {
        success: false,
        message: `Invalid API response: ${responseText.substring(0, 100)}`,
      };
    }

    console.log("[PURCHASE-DATA] Parsed response:", JSON.stringify(data));
    console.log("[PURCHASE-DATA] Response OK:", response.ok);
    console.log("[PURCHASE-DATA] Data success field:", data.success);

    if (response.ok && data.success) {
      console.log("[PURCHASE-DATA] ✓ SUCCESS - Data should be delivered");
      console.log("[PURCHASE-DATA] Transaction code:", data.transaction_code);
      return {
        success: true,
        message: data.message || "Data delivered successfully",
        transactionCode: data.transaction_code,
      };
    } else {
      console.log("[PURCHASE-DATA] ✗ FAILED - Data NOT delivered");
      console.log("[PURCHASE-DATA] Failure reason:", data.message || `HTTP ${response.status}`);
      return {
        success: false,
        message: data.message || `API error: ${response.status}`,
      };
    }
  } catch (error) {
    console.error("[PURCHASE-DATA] ✗ EXCEPTION during API call:", error);
    console.error("[PURCHASE-DATA] Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("[PURCHASE-DATA] Error message:", error instanceof Error ? error.message : String(error));
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to connect to data provider",
    };
  } finally {
    console.log("[PURCHASE-DATA] ================== API CALL END ==================");
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  // if (req.method === "OPTIONS") {
  //   return new Response("ok", { headers: corsHeaders });
  // }
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }
  

  try {
    // const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
      if (!supabaseUrl) {
        return new Response(
          JSON.stringify({ error: "Server misconfiguration" }),
          { status: 500, headers: corsHeaders }
        );
      }
    // const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Server misconfiguration" }),
        { status: 500, headers: corsHeaders }
      );
    }
    const agyengosApiKey = Deno.env.get("AGYENGOSOLN_API_KEY");

    if (!agyengosApiKey) {
      console.error("AGYENGOSOLN_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Data provider not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with service role for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Create client with user token for auth
    // const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY"), {
    //   if (!supabaseAnonKey) {
    //     return new Response(
    //       JSON.stringify({ error: "Server misconfiguration" }),
    //       { status: 500, headers: corsHeaders }
    //     );
    //   },
    //   global: { headers: { Authorization: authHeader } },
    // });

    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
      if (!supabaseAnonKey) {
        console.error("SUPABASE_ANON_KEY not configured");

        return new Response(
          JSON.stringify({ error: "Server misconfiguration" }),
          { status: 500, headers: corsHeaders }
        );
      }

      const supabaseUser = createClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          global: {
            headers: {
              Authorization: authHeader,
            },
          },
        }
      );
      


    // Get user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.log("User auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    console.log("Processing purchase for user:", userId);

    const body = await req.json();
    const isBulkPurchase = Array.isArray(body.cart_items);

    let purchaseItems: { pricing_tier_id: string; beneficiary_phone: string; quantity: number }[] = [];

    if (isBulkPurchase) {
      // Cart checkout
      const { cart_items } = body as CartCheckoutRequest;
      if (!cart_items || cart_items.length === 0) {
        return new Response(
          JSON.stringify({ error: "Cart is empty" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      purchaseItems = cart_items;
    } else {
      // Single purchase
      const { pricing_tier_id, beneficiary_phone, quantity = 1 } = body as PurchaseRequest;
      if (!pricing_tier_id || !beneficiary_phone) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: pricing_tier_id, beneficiary_phone" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      purchaseItems = [{ pricing_tier_id, beneficiary_phone, quantity }];
    }

    // Get user's role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (roleError || !roleData) {
      console.log("Role fetch error:", roleError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch user role" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userRole = roleData.role;

    // Validate all pricing tiers and calculate total
    const tierIds = purchaseItems.map((item) => item.pricing_tier_id);
    const { data: tiers, error: tiersError } = await supabaseAdmin
      .from("pricing_tiers")
      .select("*")
      .in("id", tierIds)
      .eq("is_active", true);

    if (tiersError || !tiers) {
      console.log("Tiers fetch error:", tiersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch pricing tiers" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate all tiers match user role
    const tierMap = new Map(tiers.map((t) => [t.id, t]));
    let totalAmount = 0;
    const purchaseDetails: { tier: typeof tiers[0]; phone: string; quantity: number }[] = [];

    for (const item of purchaseItems) {
      const tier = tierMap.get(item.pricing_tier_id);
      if (!tier) {
        return new Response(
          JSON.stringify({ error: `Invalid or inactive pricing tier: ${item.pricing_tier_id}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (tier.role !== userRole) {
        return new Response(
          JSON.stringify({ error: `Pricing tier ${tier.package_name} is not available for your role` }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      totalAmount += Number(tier.price) * item.quantity;
      purchaseDetails.push({ tier, phone: item.beneficiary_phone, quantity: item.quantity });
    }

    console.log("Total purchase amount:", totalAmount);

    // Get user's wallet balance
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("id, balance")
      .eq("user_id", userId)
      .single();

    if (walletError || !wallet) {
      console.log("Wallet fetch error:", walletError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch wallet" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currentBalance = Number(wallet.balance);
    if (currentBalance < totalAmount) {
      return new Response(
        JSON.stringify({ 
          error: "Insufficient wallet balance",
          required: totalAmount,
          available: currentBalance
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate reference
    const reference = `PUR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Deduct from wallet first
    const newBalance = currentBalance - totalAmount;
    const { error: updateError } = await supabaseAdmin
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);

    if (updateError) {
      console.log("Wallet update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to deduct wallet balance" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Wallet updated. New balance:", newBalance);

    // Process each purchase item through the external API
    const deliveryResults: {
      network: string;
      package_name: string;
      data_amount: string;
      beneficiary_phone: string;
      quantity: number;
      status: "success" | "failed";
      provider_reference?: string;
      error?: string;
    }[] = [];

    let allSuccessful = true;
    let failedAmount = 0;

    for (const detail of purchaseDetails) {
      const dataAmountMB = parseDataAmountToMB(detail.tier.data_amount);
      
      // Process each unit in quantity
      for (let i = 0; i < detail.quantity; i++) {
        const itemRef = `${reference}-${detail.tier.network}-${i}`;
        
        const result = await purchaseDataFromProvider(
          agyengosApiKey,
          detail.phone,
          detail.tier.network,
          dataAmountMB,
          itemRef
        );

        if (result.success) {
          deliveryResults.push({
            network: detail.tier.network,
            package_name: detail.tier.package_name,
            data_amount: detail.tier.data_amount,
            beneficiary_phone: detail.phone,
            quantity: 1,
            status: "success",
            provider_reference: result.transactionCode,
          });
        } else {
          allSuccessful = false;
          failedAmount += Number(detail.tier.price);
          deliveryResults.push({
            network: detail.tier.network,
            package_name: detail.tier.package_name,
            data_amount: detail.tier.data_amount,
            beneficiary_phone: detail.phone,
            quantity: 1,
            status: "failed",
            error: result.message,
          });
        }
      }
    }

    // If some items failed, refund the failed amount
    if (failedAmount > 0) {
      console.log(`Refunding ${failedAmount} for failed items`);
      await supabaseAdmin
        .from("wallets")
        .update({ 
          balance: newBalance + failedAmount, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", wallet.id);
    }

    const finalBalance = newBalance + failedAmount;
    const successfulAmount = totalAmount - failedAmount;

    // Create transaction record
    const { error: txError } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: userId,
        type: "purchase",
        amount: successfulAmount,
        status: allSuccessful ? "success" : "partial",
        reference,
        metadata: {
          items: deliveryResults,
          total_requested: totalAmount,
          total_charged: successfulAmount,
          refunded: failedAmount,
        },
      });

    if (txError) {
      console.log("Transaction insert error:", txError);
      // Note: Continue but log the error
    }

    // Credit referrer commission only for successful purchases
    if (successfulAmount > 0) {
      try {
        await supabaseAdmin.rpc("credit_referrer_commission", {
          _user_id: userId,
          _purchase_amount: successfulAmount,
          _commission_rate: 0.02,
        });
        console.log("Referrer commission processed");
      } catch (commissionError) {
        console.log("Commission processing (non-critical):", commissionError);
        // Non-critical: continue even if commission fails
      }
    }

    console.log("Purchase completed. Reference:", reference, "All successful:", allSuccessful);

    // If bulk purchase, clear the cart
    if (isBulkPurchase) {
      const { data: cart } = await supabaseAdmin
        .from("carts")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (cart) {
        await supabaseAdmin
          .from("cart_items")
          .delete()
          .eq("cart_id", cart.id);
        console.log("Cart cleared");
      }
    }

    // Send SMS notification for purchase
    try {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("phone")
        .eq("user_id", userId)
        .single();

      if (profile?.phone) {
        const successItems = deliveryResults.filter(r => r.status === "success");
        const failedItems = deliveryResults.filter(r => r.status === "failed");
        
        if (successItems.length > 0) {
          const itemsSummary = successItems.map(i => `${i.data_amount} ${i.network} to ${i.beneficiary_phone}`).join(", ");
          const smsMessage = `Data purchase successful! ${itemsSummary}. Amount: GHS ${successfulAmount.toFixed(2)}. New balance: GHS ${finalBalance.toFixed(2)}`;
          
          await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ to: profile.phone, message: smsMessage }),
          });
          console.log("Purchase SMS sent to:", profile.phone);
        }
        
        if (failedItems.length > 0) {
          const failedSummary = failedItems.map(i => `${i.data_amount} ${i.network}`).join(", ");
          const failedMsg = `Some purchases failed: ${failedSummary}. GHS ${failedAmount.toFixed(2)} refunded to wallet.`;
          
          await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ to: profile.phone, message: failedMsg }),
          });
        }
      }
    } catch (smsError) {
      console.log("SMS notification failed (non-critical):", smsError);
    }

    return new Response(
      JSON.stringify({
        success: allSuccessful,
        partial: !allSuccessful && successfulAmount > 0,
        reference,
        amount_charged: successfulAmount,
        amount_refunded: failedAmount,
        new_balance: finalBalance,
        items: deliveryResults,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Purchase error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
