// // /// <reference path="../deno.d.ts" />

// // import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// // // const corsHeaders = {
// // //   "Access-Control-Allow-Origin": "*",
// // //   "Access-Control-Allow-Headers":
// // //     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
// // // };

// // const corsHeaders = {
// //   "Access-Control-Allow-Origin": "*",
// //   "Access-Control-Allow-Headers":
// //     "authorization, x-client-info, apikey, content-type",
// //   "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
// // };


// // // Agyengosoln API configuration
// // const AGYENGOSOLN_API_URL = "https://agyengosoln.com/api/v1";

// // // Network mapping from our database to Agyengosoln API
// // // MTN = 3, Telecel = 2, AT-Ishare (AirtelTigo) = 1
// // const NETWORK_ID_MAP: Record<string, number> = {
// //   "MTN": 3,
// //   "MTN_AFA": 3,
// //   "Telecel": 2,
// //   "Airtel": 1,
// //   "AirtelTigo": 1,
// //   "AT-Ishare": 1,
// // };

// // interface PurchaseRequest {
// //   pricing_tier_id: string;
// //   beneficiary_phone: string;
// //   quantity?: number;
// // }

// // interface CartCheckoutRequest {
// //   cart_items: {
// //     pricing_tier_id: string;
// //     beneficiary_phone: string;
// //     quantity: number;
// //   }[];
// // }

// // interface AgyengosDataResponse {
// //   success: boolean;
// //   message: string;
// //   transaction_code?: string;
// // }

// // // Parse data amount string (e.g., "1GB", "500MB") to MB
// // function parseDataAmountToMB(dataAmount: string): number {
// //   const normalized = dataAmount.toUpperCase().trim();
  
// //   // Match patterns like "1GB", "1.5GB", "500MB"
// //   const gbMatch = normalized.match(/^([\d.]+)\s*GB$/);
// //   if (gbMatch) {
// //     return Math.round(parseFloat(gbMatch[1]) * 1000);
// //   }
  
// //   const mbMatch = normalized.match(/^([\d.]+)\s*MB$/);
// //   if (mbMatch) {
// //     return Math.round(parseFloat(mbMatch[1]));
// //   }
  
// //   // Default: try to parse as GB
// //   const numMatch = normalized.match(/^([\d.]+)/);
// //   if (numMatch) {
// //     return Math.round(parseFloat(numMatch[1]) * 1000);
// //   }
  
// //   console.error("Could not parse data amount:", dataAmount);
// //   return 0;
// // }

// // // Format phone number for API (ensure 10 digits starting with 0)
// // function formatPhoneNumber(phone: string): string {
// //   // Remove any non-digit characters
// //   let cleaned = phone.replace(/\D/g, "");
  
// //   // If starts with 233 (Ghana code), replace with 0
// //   if (cleaned.startsWith("233") && cleaned.length === 12) {
// //     cleaned = "0" + cleaned.substring(3);
// //   }
  
// //   // If doesn't start with 0 and is 9 digits, prepend 0
// //   if (!cleaned.startsWith("0") && cleaned.length === 9) {
// //     cleaned = "0" + cleaned;
// //   }
  
// //   return cleaned;
// // }

// // // Call Agyengosoln API to purchase data
// // async function purchaseDataFromProvider(
// //   apiKey: string,
// //   recipientPhone: string,
// //   networkName: string,
// //   dataAmountMB: number,
// //   reference: string
// // ): Promise<{ success: boolean; message: string; transactionCode?: string }> {
// //   const networkId = NETWORK_ID_MAP[networkName];
// //   if (!networkId) {
// //     console.error("[PURCHASE-DATA] Unknown network mapping:", networkName);
// //     console.error("[PURCHASE-DATA] Available mappings:", Object.keys(NETWORK_ID_MAP));
// //     return { success: false, message: `Unknown network: ${networkName}` };
// //   }

// //   const formattedPhone = formatPhoneNumber(recipientPhone);
  
// //   // Detailed logging for debugging
// //   console.log("[PURCHASE-DATA] ================== API CALL START ==================");
// //   console.log("[PURCHASE-DATA] Recipient phone (raw):", recipientPhone);
// //   console.log("[PURCHASE-DATA] Recipient phone (formatted):", formattedPhone);
// //   console.log("[PURCHASE-DATA] Network name:", networkName);
// //   console.log("[PURCHASE-DATA] Network ID:", networkId);
// //   console.log("[PURCHASE-DATA] Data amount (MB):", dataAmountMB);
// //   console.log("[PURCHASE-DATA] Reference:", reference);
// //   console.log("[PURCHASE-DATA] API Key prefix:", apiKey?.substring(0, 8) + "...");

// //   const requestBody = {
// //     recipient_msisdn: formattedPhone,
// //     network_id: networkId,
// //     shared_bundle: dataAmountMB,
// //     incoming_api_ref: reference,
// //   };
  
// //   console.log("[PURCHASE-DATA] Request body:", JSON.stringify(requestBody));

// //   try {
// //     const response = await fetch(`${AGYENGOSOLN_API_URL}/buy-data-package`, {
// //       method: "POST",
// //       headers: {
// //         "x-api-key": apiKey,
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify(requestBody),
// //     });

// //     const responseText = await response.text();
// //     console.log("[PURCHASE-DATA] Raw response status:", response.status);
// //     console.log("[PURCHASE-DATA] Raw response body:", responseText);
    
// //     let data: AgyengosDataResponse;
// //     try {
// //       data = JSON.parse(responseText) as AgyengosDataResponse;
// //     } catch (parseError) {
// //       console.error("[PURCHASE-DATA] Failed to parse response as JSON:", parseError);
// //       return {
// //         success: false,
// //         message: `Invalid API response: ${responseText.substring(0, 100)}`,
// //       };
// //     }

// //     console.log("[PURCHASE-DATA] Parsed response:", JSON.stringify(data));
// //     console.log("[PURCHASE-DATA] Response OK:", response.ok);
// //     console.log("[PURCHASE-DATA] Data success field:", data.success);

// //     if (response.ok && data.success) {
// //       console.log("[PURCHASE-DATA] ✓ SUCCESS - Data should be delivered");
// //       console.log("[PURCHASE-DATA] Transaction code:", data.transaction_code);
// //       return {
// //         success: true,
// //         message: data.message || "Data delivered successfully",
// //         transactionCode: data.transaction_code,
// //       };
// //     } else {
// //       console.log("[PURCHASE-DATA] ✗ FAILED - Data NOT delivered");
// //       console.log("[PURCHASE-DATA] Failure reason:", data.message || `HTTP ${response.status}`);
// //       return {
// //         success: false,
// //         message: data.message || `API error: ${response.status}`,
// //       };
// //     }
// //   } catch (error) {
// //     console.error("[PURCHASE-DATA] ✗ EXCEPTION during API call:", error);
// //     console.error("[PURCHASE-DATA] Error type:", error instanceof Error ? error.constructor.name : typeof error);
// //     console.error("[PURCHASE-DATA] Error message:", error instanceof Error ? error.message : String(error));
// //     return {
// //       success: false,
// //       message: error instanceof Error ? error.message : "Failed to connect to data provider",
// //     };
// //   } finally {
// //     console.log("[PURCHASE-DATA] ================== API CALL END ==================");
// //   }
// // }

// // Deno.serve(async (req) => {
// //   // Handle CORS preflight
// //   // if (req.method === "OPTIONS") {
// //   //   return new Response("ok", { headers: corsHeaders });
// //   // }
// //   if (req.method === "OPTIONS") {
// //     return new Response(null, {
// //       status: 200,
// //       headers: corsHeaders,
// //     });
// //   }
  

// //   try {
// //     // const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
// //     const supabaseUrl = Deno.env.get("SUPABASE_URL");
// //       if (!supabaseUrl) {
// //         return new Response(
// //           JSON.stringify({ error: "Server misconfiguration" }),
// //           { status: 500, headers: corsHeaders }
// //         );
// //       }
// //     // const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// //     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
// //     if (!supabaseServiceKey) {
// //       return new Response(
// //         JSON.stringify({ error: "Server misconfiguration" }),
// //         { status: 500, headers: corsHeaders }
// //       );
// //     }
// //     const agyengosApiKey = Deno.env.get("AGYENGOSOLN_API_KEY");

// //     if (!agyengosApiKey) {
// //       console.error("AGYENGOSOLN_API_KEY not configured");
// //       return new Response(
// //         JSON.stringify({ error: "Data provider not configured" }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     // Get user from JWT
// //     const authHeader = req.headers.get("Authorization");
// //     if (!authHeader) {
// //       console.log("No authorization header provided");
// //       return new Response(
// //         JSON.stringify({ error: "Unauthorized" }),
// //         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     // Create client with service role for admin operations
// //     const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// //     // Create client with user token for auth
// //     // const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY"), {
// //     //   if (!supabaseAnonKey) {
// //     //     return new Response(
// //     //       JSON.stringify({ error: "Server misconfiguration" }),
// //     //       { status: 500, headers: corsHeaders }
// //     //     );
// //     //   },
// //     //   global: { headers: { Authorization: authHeader } },
// //     // });

// //     const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
// //       if (!supabaseAnonKey) {
// //         console.error("SUPABASE_ANON_KEY not configured");

// //         return new Response(
// //           JSON.stringify({ error: "Server misconfiguration" }),
// //           { status: 500, headers: corsHeaders }
// //         );
// //       }

// //       const supabaseUser = createClient(
// //         supabaseUrl,
// //         supabaseAnonKey,
// //         {
// //           global: {
// //             headers: {
// //               Authorization: authHeader,
// //             },
// //           },
// //         }
// //       );
      


// //     // Get user
// //     const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
// //     if (userError || !user) {
// //       console.log("User auth error:", userError);
// //       return new Response(
// //         JSON.stringify({ error: "Unauthorized" }),
// //         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     const userId = user.id;
// //     console.log("Processing purchase for user:", userId);

// //     const body = await req.json();
// //     const isBulkPurchase = Array.isArray(body.cart_items);

// //     let purchaseItems: { pricing_tier_id: string; beneficiary_phone: string; quantity: number }[] = [];

// //     if (isBulkPurchase) {
// //       // Cart checkout
// //       const { cart_items } = body as CartCheckoutRequest;
// //       if (!cart_items || cart_items.length === 0) {
// //         return new Response(
// //           JSON.stringify({ error: "Cart is empty" }),
// //           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //         );
// //       }
// //       purchaseItems = cart_items;
// //     } else {
// //       // Single purchase
// //       const { pricing_tier_id, beneficiary_phone, quantity = 1 } = body as PurchaseRequest;
// //       if (!pricing_tier_id || !beneficiary_phone) {
// //         return new Response(
// //           JSON.stringify({ error: "Missing required fields: pricing_tier_id, beneficiary_phone" }),
// //           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //         );
// //       }
// //       purchaseItems = [{ pricing_tier_id, beneficiary_phone, quantity }];
// //     }

// //     // Get user's role
// //     const { data: roleData, error: roleError } = await supabaseAdmin
// //       .from("user_roles")
// //       .select("role")
// //       .eq("user_id", userId)
// //       .single();

// //     if (roleError || !roleData) {
// //       console.log("Role fetch error:", roleError);
// //       return new Response(
// //         JSON.stringify({ error: "Failed to fetch user role" }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     const userRole = roleData.role;

// //     // Validate all pricing tiers and calculate total
// //     const tierIds = purchaseItems.map((item) => item.pricing_tier_id);
// //     const { data: tiers, error: tiersError } = await supabaseAdmin
// //       .from("pricing_tiers")
// //       .select("*")
// //       .in("id", tierIds)
// //       .eq("is_active", true);

// //     if (tiersError || !tiers) {
// //       console.log("Tiers fetch error:", tiersError);
// //       return new Response(
// //         JSON.stringify({ error: "Failed to fetch pricing tiers" }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     // Validate all tiers match user role
// //     const tierMap = new Map(tiers.map((t) => [t.id, t]));
// //     let totalAmount = 0;
// //     const purchaseDetails: { tier: typeof tiers[0]; phone: string; quantity: number }[] = [];

// //     for (const item of purchaseItems) {
// //       const tier = tierMap.get(item.pricing_tier_id);
// //       if (!tier) {
// //         return new Response(
// //           JSON.stringify({ error: `Invalid or inactive pricing tier: ${item.pricing_tier_id}` }),
// //           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //         );
// //       }

// //       if (tier.role !== userRole) {
// //         return new Response(
// //           JSON.stringify({ error: `Pricing tier ${tier.package_name} is not available for your role` }),
// //           { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //         );
// //       }

// //       totalAmount += Number(tier.price) * item.quantity;
// //       purchaseDetails.push({ tier, phone: item.beneficiary_phone, quantity: item.quantity });
// //     }

// //     console.log("Total purchase amount:", totalAmount);

// //     // Get user's wallet balance
// //     const { data: wallet, error: walletError } = await supabaseAdmin
// //       .from("wallets")
// //       .select("id, balance")
// //       .eq("user_id", userId)
// //       .single();

// //     if (walletError || !wallet) {
// //       console.log("Wallet fetch error:", walletError);
// //       return new Response(
// //         JSON.stringify({ error: "Failed to fetch wallet" }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     const currentBalance = Number(wallet.balance);
// //     if (currentBalance < totalAmount) {
// //       return new Response(
// //         JSON.stringify({ 
// //           error: "Insufficient wallet balance",
// //           required: totalAmount,
// //           available: currentBalance
// //         }),
// //         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     // Generate reference
// //     const reference = `PUR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

// //     // Deduct from wallet first
// //     const newBalance = currentBalance - totalAmount;
// //     const { error: updateError } = await supabaseAdmin
// //       .from("wallets")
// //       .update({ balance: newBalance, updated_at: new Date().toISOString() })
// //       .eq("id", wallet.id);

// //     if (updateError) {
// //       console.log("Wallet update error:", updateError);
// //       return new Response(
// //         JSON.stringify({ error: "Failed to deduct wallet balance" }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     console.log("Wallet updated. New balance:", newBalance);

// //     // Process each purchase item through the external API
// //     const deliveryResults: {
// //       network: string;
// //       package_name: string;
// //       data_amount: string;
// //       beneficiary_phone: string;
// //       quantity: number;
// //       status: "success" | "failed";
// //       provider_reference?: string;
// //       error?: string;
// //     }[] = [];

// //     let allSuccessful = true;
// //     let failedAmount = 0;

// //     for (const detail of purchaseDetails) {
// //       const dataAmountMB = parseDataAmountToMB(detail.tier.data_amount);
      
// //       // Process each unit in quantity
// //       for (let i = 0; i < detail.quantity; i++) {
// //         const itemRef = `${reference}-${detail.tier.network}-${i}`;
        
// //         const result = await purchaseDataFromProvider(
// //           agyengosApiKey,
// //           detail.phone,
// //           detail.tier.network,
// //           dataAmountMB,
// //           itemRef
// //         );

// //         if (result.success) {
// //           deliveryResults.push({
// //             network: detail.tier.network,
// //             package_name: detail.tier.package_name,
// //             data_amount: detail.tier.data_amount,
// //             beneficiary_phone: detail.phone,
// //             quantity: 1,
// //             status: "success",
// //             provider_reference: result.transactionCode,
// //           });
// //         } else {
// //           allSuccessful = false;
// //           failedAmount += Number(detail.tier.price);
// //           deliveryResults.push({
// //             network: detail.tier.network,
// //             package_name: detail.tier.package_name,
// //             data_amount: detail.tier.data_amount,
// //             beneficiary_phone: detail.phone,
// //             quantity: 1,
// //             status: "failed",
// //             error: result.message,
// //           });
// //         }
// //       }
// //     }

// //     // If some items failed, refund the failed amount
// //     if (failedAmount > 0) {
// //       console.log(`Refunding ${failedAmount} for failed items`);
// //       await supabaseAdmin
// //         .from("wallets")
// //         .update({ 
// //           balance: newBalance + failedAmount, 
// //           updated_at: new Date().toISOString() 
// //         })
// //         .eq("id", wallet.id);
// //     }

// //     const finalBalance = newBalance + failedAmount;
// //     const successfulAmount = totalAmount - failedAmount;

// //     // Create transaction record
// //     const { error: txError } = await supabaseAdmin
// //       .from("transactions")
// //       .insert({
// //         user_id: userId,
// //         type: "purchase",
// //         amount: successfulAmount,
// //         status: allSuccessful ? "success" : "partial",
// //         reference,
// //         metadata: {
// //           items: deliveryResults,
// //           total_requested: totalAmount,
// //           total_charged: successfulAmount,
// //           refunded: failedAmount,
// //         },
// //       });

// //     if (txError) {
// //       console.log("Transaction insert error:", txError);
// //       // Note: Continue but log the error
// //     }

// //     // Credit referrer commission only for successful purchases
// //     if (successfulAmount > 0) {
// //       try {
// //         await supabaseAdmin.rpc("credit_referrer_commission", {
// //           _user_id: userId,
// //           _purchase_amount: successfulAmount,
// //           _commission_rate: 0.02,
// //         });
// //         console.log("Referrer commission processed");
// //       } catch (commissionError) {
// //         console.log("Commission processing (non-critical):", commissionError);
// //         // Non-critical: continue even if commission fails
// //       }
// //     }

// //     console.log("Purchase completed. Reference:", reference, "All successful:", allSuccessful);

// //     // If bulk purchase, clear the cart
// //     if (isBulkPurchase) {
// //       const { data: cart } = await supabaseAdmin
// //         .from("carts")
// //         .select("id")
// //         .eq("user_id", userId)
// //         .single();

// //       if (cart) {
// //         await supabaseAdmin
// //           .from("cart_items")
// //           .delete()
// //           .eq("cart_id", cart.id);
// //         console.log("Cart cleared");
// //       }
// //     }

// //     // Send SMS notification for purchase
// //     try {
// //       const { data: profile } = await supabaseAdmin
// //         .from("profiles")
// //         .select("phone")
// //         .eq("user_id", userId)
// //         .single();

// //       if (profile?.phone) {
// //         const successItems = deliveryResults.filter(r => r.status === "success");
// //         const failedItems = deliveryResults.filter(r => r.status === "failed");
        
// //         if (successItems.length > 0) {
// //           const itemsSummary = successItems.map(i => `${i.data_amount} ${i.network} to ${i.beneficiary_phone}`).join(", ");
// //           const smsMessage = `Data purchase successful! ${itemsSummary}. Amount: GHS ${successfulAmount.toFixed(2)}. New balance: GHS ${finalBalance.toFixed(2)}`;
          
// //           await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
// //             method: "POST",
// //             headers: {
// //               "Content-Type": "application/json",
// //               "Authorization": `Bearer ${supabaseServiceKey}`,
// //             },
// //             body: JSON.stringify({ to: profile.phone, message: smsMessage }),
// //           });
// //           console.log("Purchase SMS sent to:", profile.phone);
// //         }
        
// //         if (failedItems.length > 0) {
// //           const failedSummary = failedItems.map(i => `${i.data_amount} ${i.network}`).join(", ");
// //           const failedMsg = `Some purchases failed: ${failedSummary}. GHS ${failedAmount.toFixed(2)} refunded to wallet.`;
          
// //           await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
// //             method: "POST",
// //             headers: {
// //               "Content-Type": "application/json",
// //               "Authorization": `Bearer ${supabaseServiceKey}`,
// //             },
// //             body: JSON.stringify({ to: profile.phone, message: failedMsg }),
// //           });
// //         }
// //       }
// //     } catch (smsError) {
// //       console.log("SMS notification failed (non-critical):", smsError);
// //     }

// //     return new Response(
// //       JSON.stringify({
// //         success: allSuccessful,
// //         partial: !allSuccessful && successfulAmount > 0,
// //         reference,
// //         amount_charged: successfulAmount,
// //         amount_refunded: failedAmount,
// //         new_balance: finalBalance,
// //         items: deliveryResults,
// //       }),
// //       { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //     );
// //   } catch (error) {
// //     console.error("Purchase error:", error);
// //     return new Response(
// //       JSON.stringify({ error: "Internal server error" }),
// //       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //     );
// //   }
// // });


// // /// <reference path="../deno.d.ts" />

// // import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// // // VERSION LOGGING - Update this on each deployment to verify correct version is running
// // const VERSION = "v1.0.0-lovable";
// // const DEPLOYED_AT = new Date().toISOString();

// // console.log(`[PURCHASE-DATA] ========================================`);
// // console.log(`[PURCHASE-DATA] Edge Function Starting`);
// // console.log(`[PURCHASE-DATA] Version: ${VERSION}`);
// // console.log(`[PURCHASE-DATA] Deployed at: ${DEPLOYED_AT}`);
// // console.log(`[PURCHASE-DATA] ========================================`);

// // const corsHeaders = {
// //   "Access-Control-Allow-Origin": "*",
// //   "Access-Control-Allow-Headers":
// //     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
// //   "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
// // };

// // // Agyengosoln API configuration
// // const AGYENGOSOLN_API_URL = "https://agyengosoln.com/api/v1";

// // // Network mapping from our database to Agyengosoln API
// // // MTN = 3, Telecel = 2, AT-Ishare (AirtelTigo) = 1
// // const NETWORK_ID_MAP: Record<string, number> = {
// //   "MTN": 3,
// //   "MTN_AFA": 3,
// //   "Telecel": 2,
// //   "Airtel": 1,
// //   "AirtelTigo": 1,
// //   "AT-Ishare": 1,
// // };

// // interface PurchaseRequest {
// //   pricing_tier_id: string;
// //   beneficiary_phone: string;
// //   quantity?: number;
// // }

// // interface CartCheckoutRequest {
// //   cart_items: {
// //     pricing_tier_id: string;
// //     beneficiary_phone: string;
// //     quantity: number;
// //   }[];
// // }

// // interface AgyengosDataResponse {
// //   success: boolean;
// //   message: string;
// //   transaction_code?: string;
// // }

// // // Parse data amount string (e.g., "1GB", "500MB") to MB
// // function parseDataAmountToMB(dataAmount: string): number {
// //   const normalized = dataAmount.toUpperCase().trim();

// //   // Match patterns like "1GB", "1.5GB", "500MB"
// //   const gbMatch = normalized.match(/^([\d.]+)\s*GB$/);
// //   if (gbMatch) {
// //     return Math.round(parseFloat(gbMatch[1]) * 1000);
// //   }

// //   const mbMatch = normalized.match(/^([\d.]+)\s*MB$/);
// //   if (mbMatch) {
// //     return Math.round(parseFloat(mbMatch[1]));
// //   }

// //   // Default: try to parse as GB
// //   const numMatch = normalized.match(/^([\d.]+)/);
// //   if (numMatch) {
// //     return Math.round(parseFloat(numMatch[1]) * 1000);
// //   }

// //   console.error(`[PURCHASE-DATA][${VERSION}] Could not parse data amount:`, dataAmount);
// //   return 0;
// // }

// // // Format phone number for API (ensure 10 digits starting with 0)
// // function formatPhoneNumber(phone: string): string {
// //   // Remove any non-digit characters
// //   let cleaned = phone.replace(/\D/g, "");

// //   // If starts with 233 (Ghana code), replace with 0
// //   if (cleaned.startsWith("233") && cleaned.length === 12) {
// //     cleaned = "0" + cleaned.substring(3);
// //   }

// //   // If doesn't start with 0 and is 9 digits, prepend 0
// //   if (!cleaned.startsWith("0") && cleaned.length === 9) {
// //     cleaned = "0" + cleaned;
// //   }

// //   return cleaned;
// // }

// // // Call Agyengosoln API to purchase data
// // async function purchaseDataFromProvider(
// //   apiKey: string,
// //   recipientPhone: string,
// //   networkName: string,
// //   dataAmountMB: number,
// //   reference: string
// // ): Promise<{ success: boolean; message: string; transactionCode?: string }> {
// //   const networkId = NETWORK_ID_MAP[networkName];
// //   if (!networkId) {
// //     console.error(`[PURCHASE-DATA][${VERSION}] Unknown network mapping:`, networkName);
// //     console.error(`[PURCHASE-DATA][${VERSION}] Available mappings:`, Object.keys(NETWORK_ID_MAP));
// //     return { success: false, message: `Unknown network: ${networkName}` };
// //   }

// //   const formattedPhone = formatPhoneNumber(recipientPhone);

// //   // Detailed logging for debugging
// //   console.log(`[PURCHASE-DATA][${VERSION}] ================== API CALL START ==================`);
// //   console.log(`[PURCHASE-DATA][${VERSION}] Recipient phone (raw):`, recipientPhone);
// //   console.log(`[PURCHASE-DATA][${VERSION}] Recipient phone (formatted):`, formattedPhone);
// //   console.log(`[PURCHASE-DATA][${VERSION}] Network name:`, networkName);
// //   console.log(`[PURCHASE-DATA][${VERSION}] Network ID:`, networkId);
// //   console.log(`[PURCHASE-DATA][${VERSION}] Data amount (MB):`, dataAmountMB);
// //   console.log(`[PURCHASE-DATA][${VERSION}] Reference:`, reference);
// //   console.log(`[PURCHASE-DATA][${VERSION}] API Key present:`, !!apiKey);
// //   console.log(`[PURCHASE-DATA][${VERSION}] API Key prefix:`, apiKey?.substring(0, 8) + "...");

// //   const requestBody = {
// //     recipient_msisdn: formattedPhone,
// //     network_id: networkId,
// //     shared_bundle: dataAmountMB,
// //     incoming_api_ref: reference,
// //   };

// //   console.log(`[PURCHASE-DATA][${VERSION}] Request URL:`, `${AGYENGOSOLN_API_URL}/buy-data-package`);
// //   console.log(`[PURCHASE-DATA][${VERSION}] Request body:`, JSON.stringify(requestBody));

// //   try {
// //     const response = await fetch(`${AGYENGOSOLN_API_URL}/buy-data-package`, {
// //       method: "POST",
// //       headers: {
// //         "x-api-key": apiKey,
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify(requestBody),
// //     });

// //     const responseText = await response.text();
// //     console.log(`[PURCHASE-DATA][${VERSION}] Raw response status:`, response.status);
// //     console.log(
// //       `[PURCHASE-DATA][${VERSION}] Raw response headers:`,
// //       JSON.stringify(Object.fromEntries(response.headers as any))
// //     );
// //     console.log(`[PURCHASE-DATA][${VERSION}] Raw response body:`, responseText);

// //     let data: AgyengosDataResponse;
// //     try {
// //       data = JSON.parse(responseText) as AgyengosDataResponse;
// //     } catch (parseError) {
// //       console.error(`[PURCHASE-DATA][${VERSION}] Failed to parse response as JSON:`, parseError);
// //       return {
// //         success: false,
// //         message: `Invalid API response: ${responseText.substring(0, 200)}`,
// //       };
// //     }

// //     console.log(`[PURCHASE-DATA][${VERSION}] Parsed response:`, JSON.stringify(data));
// //     console.log(`[PURCHASE-DATA][${VERSION}] Response OK:`, response.ok);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Data success field:`, data.success);

// //     if (response.ok && data.success) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] ✓ SUCCESS - Data should be delivered`);
// //       console.log(`[PURCHASE-DATA][${VERSION}] Transaction code:`, data.transaction_code);
// //       return {
// //         success: true,
// //         message: data.message || "Data delivered successfully",
// //         transactionCode: data.transaction_code,
// //       };
// //     } else {
// //       console.log(`[PURCHASE-DATA][${VERSION}] ✗ FAILED - Data NOT delivered`);
// //       console.log(`[PURCHASE-DATA][${VERSION}] Failure reason:`, data.message || `HTTP ${response.status}`);
// //       return {
// //         success: false,
// //         message: data.message || `API error: ${response.status}`,
// //       };
// //     }
// //   } catch (error) {
// //     console.error(`[PURCHASE-DATA][${VERSION}] ✗ EXCEPTION during API call:`, error);
// //     console.error(`[PURCHASE-DATA][${VERSION}] Error type:`, error instanceof Error ? error.constructor.name : typeof error);
// //     console.error(`[PURCHASE-DATA][${VERSION}] Error message:`, error instanceof Error ? error.message : String(error));
// //     return {
// //       success: false,
// //       message: error instanceof Error ? error.message : "Failed to connect to data provider",
// //     };
// //   } finally {
// //     console.log(`[PURCHASE-DATA][${VERSION}] ================== API CALL END ==================`);
// //   }
// // }

// // Deno.serve(async (req) => {
// //   console.log(`[PURCHASE-DATA][${VERSION}] ========================================`);
// //   console.log(`[PURCHASE-DATA][${VERSION}] Request received at ${new Date().toISOString()}`);
// //   console.log(`[PURCHASE-DATA][${VERSION}] Method:`, req.method);
// //   console.log(`[PURCHASE-DATA][${VERSION}] URL:`, req.url);

// //   // Handle CORS preflight
// //   if (req.method === "OPTIONS") {
// //     console.log(`[PURCHASE-DATA][${VERSION}] Handling CORS preflight`);
// //     return new Response(null, {
// //       status: 200,
// //       headers: corsHeaders,
// //     });
// //   }

// //   try {
// //     // Check environment variables first
// //     const supabaseUrl = Deno.env.get("SUPABASE_URL");
// //     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
// //     const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
// //     const agyengosApiKey = Deno.env.get("AGYENGOSOLN_API_KEY");

// //     console.log(`[PURCHASE-DATA][${VERSION}] Environment check:`);
// //     console.log(`[PURCHASE-DATA][${VERSION}] - SUPABASE_URL: ${supabaseUrl ? "✓ SET" : "✗ MISSING"}`);
// //     console.log(`[PURCHASE-DATA][${VERSION}] - SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? "✓ SET" : "✗ MISSING"}`);
// //     console.log(`[PURCHASE-DATA][${VERSION}] - SUPABASE_ANON_KEY: ${supabaseAnonKey ? "✓ SET" : "✗ MISSING"}`);
// //     console.log(`[PURCHASE-DATA][${VERSION}] - AGYENGOSOLN_API_KEY: ${agyengosApiKey ? "✓ SET" : "✗ MISSING"}`);

// //     if (!supabaseUrl) {
// //       console.error(`[PURCHASE-DATA][${VERSION}] SUPABASE_URL not configured`);
// //       return new Response(
// //         JSON.stringify({ error: "Server misconfiguration: SUPABASE_URL missing", _version: VERSION }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     if (!supabaseServiceKey) {
// //       console.error(`[PURCHASE-DATA][${VERSION}] SUPABASE_SERVICE_ROLE_KEY not configured`);
// //       return new Response(
// //         JSON.stringify({ error: "Server misconfiguration: SERVICE_ROLE_KEY missing", _version: VERSION }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     if (!supabaseAnonKey) {
// //       console.error(`[PURCHASE-DATA][${VERSION}] SUPABASE_ANON_KEY not configured`);
// //       return new Response(
// //         JSON.stringify({ error: "Server misconfiguration: ANON_KEY missing", _version: VERSION }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     if (!agyengosApiKey) {
// //       console.error(`[PURCHASE-DATA][${VERSION}] AGYENGOSOLN_API_KEY not configured`);
// //       return new Response(
// //         JSON.stringify({ error: "Data provider not configured: AGYENGOSOLN_API_KEY missing", _version: VERSION }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     // Get user from JWT
// //     const authHeader = req.headers.get("Authorization");
// //     console.log(`[PURCHASE-DATA][${VERSION}] Auth header present:`, !!authHeader);
    
// //     if (!authHeader) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] No authorization header provided`);
// //       return new Response(
// //         JSON.stringify({ error: "Unauthorized", _version: VERSION }),
// //         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     // Create client with service role for admin operations
// //     const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// //     // Create client with user token for auth
// //     const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
// //       global: {
// //         headers: {
// //           Authorization: authHeader,
// //         },
// //       },
// //     });

// //     // Get user
// //     console.log(`[PURCHASE-DATA][${VERSION}] Getting user from token...`);
// //     const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
// //     if (userError || !user) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] User auth error:`, userError?.message || "No user");
// //       return new Response(
// //         JSON.stringify({ error: "Unauthorized", details: userError?.message, _version: VERSION }),
// //         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     const userId = user.id;
// //     console.log(`[PURCHASE-DATA][${VERSION}] Processing purchase for user:`, userId);
// //     console.log(`[PURCHASE-DATA][${VERSION}] User email:`, user.email);

// //     // Parse request body
// //     let body;
// //     try {
// //       body = await req.json();
// //       console.log(`[PURCHASE-DATA][${VERSION}] Request body:`, JSON.stringify(body));
// //     } catch (parseError) {
// //       console.error(`[PURCHASE-DATA][${VERSION}] Failed to parse request body:`, parseError);
// //       return new Response(
// //         JSON.stringify({ error: "Invalid JSON body", _version: VERSION }),
// //         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     const isBulkPurchase = Array.isArray(body.cart_items);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Is bulk purchase:`, isBulkPurchase);

// //     let purchaseItems: { pricing_tier_id: string; beneficiary_phone: string; quantity: number }[] = [];

// //     if (isBulkPurchase) {
// //       // Cart checkout
// //       const { cart_items } = body as CartCheckoutRequest;
// //       if (!cart_items || cart_items.length === 0) {
// //         console.log(`[PURCHASE-DATA][${VERSION}] Cart is empty`);
// //         return new Response(
// //           JSON.stringify({ error: "Cart is empty", _version: VERSION }),
// //           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //         );
// //       }
// //       purchaseItems = cart_items;
// //       console.log(`[PURCHASE-DATA][${VERSION}] Cart items count:`, cart_items.length);
// //     } else {
// //       // Single purchase
// //       const { pricing_tier_id, beneficiary_phone, quantity = 1 } = body as PurchaseRequest;
// //       if (!pricing_tier_id || !beneficiary_phone) {
// //         console.log(`[PURCHASE-DATA][${VERSION}] Missing required fields`);
// //         return new Response(
// //           JSON.stringify({ error: "Missing required fields: pricing_tier_id, beneficiary_phone", _version: VERSION }),
// //           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //         );
// //       }
// //       purchaseItems = [{ pricing_tier_id, beneficiary_phone, quantity }];
// //       console.log(`[PURCHASE-DATA][${VERSION}] Single purchase - tier:`, pricing_tier_id, "phone:", beneficiary_phone);
// //     }

// //     // Get user's role
// //     console.log(`[PURCHASE-DATA][${VERSION}] Fetching user role...`);
// //     const { data: roleData, error: roleError } = await supabaseAdmin
// //       .from("user_roles")
// //       .select("role")
// //       .eq("user_id", userId)
// //       .single();

// //     if (roleError || !roleData) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] Role fetch error:`, roleError?.message || "No role data");
// //       return new Response(
// //         JSON.stringify({ error: "Failed to fetch user role", details: roleError?.message, _version: VERSION }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     const userRole = roleData.role;
// //     console.log(`[PURCHASE-DATA][${VERSION}] User role:`, userRole);

// //     // Validate all pricing tiers and calculate total
// //     const tierIds = purchaseItems.map((item) => item.pricing_tier_id);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Fetching tiers:`, tierIds);
    
// //     const { data: tiers, error: tiersError } = await supabaseAdmin
// //       .from("pricing_tiers")
// //       .select("*")
// //       .in("id", tierIds)
// //       .eq("is_active", true);

// //     if (tiersError || !tiers) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] Tiers fetch error:`, tiersError?.message || "No tiers");
// //       return new Response(
// //         JSON.stringify({ error: "Failed to fetch pricing tiers", details: tiersError?.message, _version: VERSION }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     console.log(`[PURCHASE-DATA][${VERSION}] Found tiers:`, tiers.length);

// //     // Validate all tiers match user role
// //     const tierMap = new Map(tiers.map((t) => [t.id, t]));
// //     let totalAmount = 0;
// //     const purchaseDetails: { tier: typeof tiers[0]; phone: string; quantity: number }[] = [];

// //     for (const item of purchaseItems) {
// //       const tier = tierMap.get(item.pricing_tier_id);
// //       if (!tier) {
// //         console.log(`[PURCHASE-DATA][${VERSION}] Invalid tier:`, item.pricing_tier_id);
// //         return new Response(
// //           JSON.stringify({ error: `Invalid or inactive pricing tier: ${item.pricing_tier_id}`, _version: VERSION }),
// //           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //         );
// //       }

// //       if (tier.role !== userRole) {
// //         console.log(`[PURCHASE-DATA][${VERSION}] Role mismatch - tier role:`, tier.role, "user role:", userRole);
// //         return new Response(
// //           JSON.stringify({ error: `Pricing tier ${tier.package_name} is not available for your role`, _version: VERSION }),
// //           { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //         );
// //       }

// //       totalAmount += Number(tier.price) * item.quantity;
// //       purchaseDetails.push({ tier, phone: item.beneficiary_phone, quantity: item.quantity });
// //     }

// //     console.log(`[PURCHASE-DATA][${VERSION}] Total purchase amount:`, totalAmount);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Purchase details:`, JSON.stringify(purchaseDetails.map(d => ({
// //       network: d.tier.network,
// //       package: d.tier.package_name,
// //       data: d.tier.data_amount,
// //       price: d.tier.price,
// //       phone: d.phone,
// //       qty: d.quantity
// //     }))));

// //     // Get user's wallet balance
// //     console.log(`[PURCHASE-DATA][${VERSION}] Fetching wallet...`);
// //     const { data: wallet, error: walletError } = await supabaseAdmin
// //       .from("wallets")
// //       .select("id, balance")
// //       .eq("user_id", userId)
// //       .single();

// //     if (walletError || !wallet) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] Wallet fetch error:`, walletError?.message || "No wallet");
// //       return new Response(
// //         JSON.stringify({ error: "Failed to fetch wallet", details: walletError?.message, _version: VERSION }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     const currentBalance = Number(wallet.balance);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Current wallet balance:`, currentBalance);
    
// //     if (currentBalance < totalAmount) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] Insufficient balance - required:`, totalAmount, "available:", currentBalance);
// //       return new Response(
// //         JSON.stringify({
// //           error: "Insufficient wallet balance",
// //           required: totalAmount,
// //           available: currentBalance,
// //           _version: VERSION
// //         }),
// //         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     // Generate reference
// //     const reference = `PUR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
// //     console.log(`[PURCHASE-DATA][${VERSION}] Generated reference:`, reference);

// //     // Deduct from wallet first
// //     const newBalance = currentBalance - totalAmount;
// //     console.log(`[PURCHASE-DATA][${VERSION}] Deducting from wallet. New balance will be:`, newBalance);
    
// //     const { error: updateError } = await supabaseAdmin
// //       .from("wallets")
// //       .update({ balance: newBalance, updated_at: new Date().toISOString() })
// //       .eq("id", wallet.id);

// //     if (updateError) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] Wallet update error:`, updateError.message);
// //       return new Response(
// //         JSON.stringify({ error: "Failed to deduct wallet balance", details: updateError.message, _version: VERSION }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     console.log(`[PURCHASE-DATA][${VERSION}] Wallet updated successfully`);

// //     // Process each purchase item through the external API
// //     const deliveryResults: {
// //       network: string;
// //       package_name: string;
// //       data_amount: string;
// //       beneficiary_phone: string;
// //       quantity: number;
// //       status: "success" | "failed";
// //       provider_reference?: string;
// //       error?: string;
// //     }[] = [];

// //     let allSuccessful = true;
// //     let failedAmount = 0;

// //     console.log(`[PURCHASE-DATA][${VERSION}] Starting API calls to Agyengosoln...`);

// //     for (const detail of purchaseDetails) {
// //       const dataAmountMB = parseDataAmountToMB(detail.tier.data_amount);
// //       console.log(`[PURCHASE-DATA][${VERSION}] Processing: ${detail.tier.network} ${detail.tier.data_amount} (${dataAmountMB}MB) x${detail.quantity}`);

// //       // Process each unit in quantity
// //       for (let i = 0; i < detail.quantity; i++) {
// //         const itemRef = `${reference}-${detail.tier.network}-${i}`;

// //         const result = await purchaseDataFromProvider(
// //           agyengosApiKey,
// //           detail.phone,
// //           detail.tier.network,
// //           dataAmountMB,
// //           itemRef
// //         );

// //         if (result.success) {
// //           deliveryResults.push({
// //             network: detail.tier.network,
// //             package_name: detail.tier.package_name,
// //             data_amount: detail.tier.data_amount,
// //             beneficiary_phone: detail.phone,
// //             quantity: 1,
// //             status: "success",
// //             provider_reference: result.transactionCode,
// //           });
// //         } else {
// //           allSuccessful = false;
// //           failedAmount += Number(detail.tier.price);
// //           deliveryResults.push({
// //             network: detail.tier.network,
// //             package_name: detail.tier.package_name,
// //             data_amount: detail.tier.data_amount,
// //             beneficiary_phone: detail.phone,
// //             quantity: 1,
// //             status: "failed",
// //             error: result.message,
// //           });
// //         }
// //       }
// //     }

// //     console.log(`[PURCHASE-DATA][${VERSION}] All API calls complete`);
// //     console.log(`[PURCHASE-DATA][${VERSION}] All successful:`, allSuccessful);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Failed amount:`, failedAmount);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Delivery results:`, JSON.stringify(deliveryResults));

// //     // If some items failed, refund the failed amount
// //     if (failedAmount > 0) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] Refunding ${failedAmount} for failed items`);
// //       const { error: refundError } = await supabaseAdmin
// //         .from("wallets")
// //         .update({
// //           balance: newBalance + failedAmount,
// //           updated_at: new Date().toISOString()
// //         })
// //         .eq("id", wallet.id);
      
// //       if (refundError) {
// //         console.error(`[PURCHASE-DATA][${VERSION}] Refund error:`, refundError.message);
// //       } else {
// //         console.log(`[PURCHASE-DATA][${VERSION}] Refund successful`);
// //       }
// //     }

// //     const finalBalance = newBalance + failedAmount;
// //     const successfulAmount = totalAmount - failedAmount;

// //     console.log(`[PURCHASE-DATA][${VERSION}] Final balance:`, finalBalance);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Successful amount:`, successfulAmount);

// //     // Create transaction record
// //     console.log(`[PURCHASE-DATA][${VERSION}] Creating transaction record...`);
// //     const { error: txError } = await supabaseAdmin
// //       .from("transactions")
// //       .insert({
// //         user_id: userId,
// //         type: "purchase",
// //         amount: successfulAmount,
// //         status: allSuccessful ? "success" : "partial",
// //         reference,
// //         metadata: {
// //           items: deliveryResults,
// //           total_requested: totalAmount,
// //           total_charged: successfulAmount,
// //           refunded: failedAmount,
// //         },
// //       });

// //     if (txError) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] Transaction insert error:`, txError.message);
// //       // Note: Continue but log the error
// //     } else {
// //       console.log(`[PURCHASE-DATA][${VERSION}] Transaction record created`);
// //     }

// //     // Credit referrer commission only for successful purchases
// //     if (successfulAmount > 0) {
// //       try {
// //         console.log(`[PURCHASE-DATA][${VERSION}] Crediting referrer commission...`);
// //         await supabaseAdmin.rpc("credit_referrer_commission", {
// //           _user_id: userId,
// //           _amount: successfulAmount,
// //         });
// //         console.log(`[PURCHASE-DATA][${VERSION}] Referrer commission credited`);
// //       } catch (refErr) {
// //         console.log(`[PURCHASE-DATA][${VERSION}] Referrer commission error (non-fatal):`, refErr);
// //       }
// //     }

// //     // Build response
// //     const successfulItems = deliveryResults.filter((r) => r.status === "success");
// //     const failedItems = deliveryResults.filter((r) => r.status === "failed");

// //     let message = "";
// //     if (allSuccessful) {
// //       message = `Successfully purchased ${successfulItems.length} data package(s)`;
// //     } else if (successfulItems.length > 0) {
// //       message = `Partially completed: ${successfulItems.length} succeeded, ${failedItems.length} failed`;
// //     } else {
// //       message = `All purchases failed. Amount refunded to wallet.`;
// //     }

// //     const response = {
// //       success: successfulItems.length > 0,
// //       message,
// //       reference,
// //       total_charged: successfulAmount,
// //       refunded: failedAmount,
// //       new_balance: finalBalance,
// //       results: deliveryResults,
// //       _version: VERSION,
// //     };

// //     console.log(`[PURCHASE-DATA][${VERSION}] ========================================`);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Request complete`);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Response:`, JSON.stringify(response));
// //     console.log(`[PURCHASE-DATA][${VERSION}] ========================================`);

// //     return new Response(
// //       JSON.stringify(response),
// //       {
// //         status: allSuccessful ? 200 : (successfulItems.length > 0 ? 207 : 400),
// //         headers: { ...corsHeaders, "Content-Type": "application/json" }
// //       }
// //     );

// //   } catch (error) {
// //     console.error(`[PURCHASE-DATA][${VERSION}] ========================================`);
// //     console.error(`[PURCHASE-DATA][${VERSION}] UNHANDLED ERROR`);
// //     console.error(`[PURCHASE-DATA][${VERSION}] Error:`, error);
// //     console.error(`[PURCHASE-DATA][${VERSION}] Error type:`, error instanceof Error ? error.constructor.name : typeof error);
// //     console.error(`[PURCHASE-DATA][${VERSION}] Error message:`, error instanceof Error ? error.message : String(error));
// //     console.error(`[PURCHASE-DATA][${VERSION}] Error stack:`, error instanceof Error ? error.stack : "N/A");
// //     console.error(`[PURCHASE-DATA][${VERSION}] ========================================`);
    
// //     return new Response(
// //       JSON.stringify({
// //         error: "Internal server error",
// //         details: error instanceof Error ? error.message : String(error),
// //         _version: VERSION
// //       }),
// //       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //     );
// //   }
// // });



// // /// <reference path="../deno.d.ts" />

// // import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// // // VERSION LOGGING - Update this on each deployment to verify correct version is running
// // const VERSION = "idencreative-v1.0.0";
// // const DEPLOYED_AT = new Date().toISOString();

// // console.log(`[PURCHASE-DATA] ========================================`);
// // console.log(`[PURCHASE-DATA] Edge Function Starting`);
// // console.log(`[PURCHASE-DATA] Version: ${VERSION}`);
// // console.log(`[PURCHASE-DATA] Deployed at: ${DEPLOYED_AT}`);
// // console.log(`[PURCHASE-DATA] ========================================`);

// // const corsHeaders = {
// //   "Access-Control-Allow-Origin": "*",
// //   "Access-Control-Allow-Headers":
// //     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
// //   "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
// // };

// // // Agyengosoln API configuration
// // const AGYENGOSOLN_API_URL = "https://agyengosoln.com/api/v1";

// // // Network mapping from our database to Agyengosoln API
// // // MTN = 3, Telecel = 2, AT-Ishare (AirtelTigo) = 1
// // const NETWORK_ID_MAP: Record<string, number> = {
// //   "MTN": 3,
// //   "MTN_AFA": 3,
// //   "Telecel": 2,
// //   "Airtel": 1,
// //   "AirtelTigo": 1,
// //   "AT-Ishare": 1,
// // };

// // interface PurchaseRequest {
// //   pricing_tier_id: string;
// //   beneficiary_phone: string;
// //   quantity?: number;
// // }

// // interface CartCheckoutRequest {
// //   cart_items: {
// //     pricing_tier_id: string;
// //     beneficiary_phone: string;
// //     quantity: number;
// //   }[];
// // }

// // interface AgyengosDataResponse {
// //   success: boolean;
// //   message: string;
// //   transaction_code?: string;
// // }

// // // Parse data amount string (e.g., "1GB", "500MB") to MB
// // function parseDataAmountToMB(dataAmount: string): number {
// //   const normalized = dataAmount.toUpperCase().trim();

// //   // Match patterns like "1GB", "1.5GB", "500MB"
// //   const gbMatch = normalized.match(/^([\d.]+)\s*GB$/);
// //   if (gbMatch) {
// //     return Math.round(parseFloat(gbMatch[1]) * 1000);
// //   }

// //   const mbMatch = normalized.match(/^([\d.]+)\s*MB$/);
// //   if (mbMatch) {
// //     return Math.round(parseFloat(mbMatch[1]));
// //   }

// //   // Default: try to parse as GB
// //   const numMatch = normalized.match(/^([\d.]+)/);
// //   if (numMatch) {
// //     return Math.round(parseFloat(numMatch[1]) * 1000);
// //   }

// //   console.error(`[PURCHASE-DATA][${VERSION}] Could not parse data amount:`, dataAmount);
// //   return 0;
// // }

// // // Format phone number for API (ensure 10 digits starting with 0)
// // function formatPhoneNumber(phone: string): string {
// //   // Remove any non-digit characters
// //   let cleaned = phone.replace(/\D/g, "");

// //   // If starts with 233 (Ghana code), replace with 0
// //   if (cleaned.startsWith("233") && cleaned.length === 12) {
// //     cleaned = "0" + cleaned.substring(3);
// //   }

// //   // If doesn't start with 0 and is 9 digits, prepend 0
// //   if (!cleaned.startsWith("0") && cleaned.length === 9) {
// //     cleaned = "0" + cleaned;
// //   }

// //   return cleaned;
// // }

// // // Call Agyengosoln API to purchase data
// // async function purchaseDataFromProvider(
// //   apiKey: string,
// //   recipientPhone: string,
// //   networkName: string,
// //   dataAmountMB: number,
// //   reference: string
// // ): Promise<{ success: boolean; message: string; transactionCode?: string }> {
// //   const networkId = NETWORK_ID_MAP[networkName];
// //   if (!networkId) {
// //     console.error(`[PURCHASE-DATA][${VERSION}] Unknown network mapping:`, networkName);
// //     console.error(`[PURCHASE-DATA][${VERSION}] Available mappings:`, Object.keys(NETWORK_ID_MAP));
// //     return { success: false, message: `Unknown network: ${networkName}` };
// //   }

// //   const formattedPhone = formatPhoneNumber(recipientPhone);

// //   // Detailed logging for debugging
// //   console.log(`[PURCHASE-DATA][${VERSION}] ================== API CALL START ==================`);
// //   console.log(`[PURCHASE-DATA][${VERSION}] Recipient phone (raw):`, recipientPhone);
// //   console.log(`[PURCHASE-DATA][${VERSION}] Recipient phone (formatted):`, formattedPhone);
// //   console.log(`[PURCHASE-DATA][${VERSION}] Network name:`, networkName);
// //   console.log(`[PURCHASE-DATA][${VERSION}] Network ID:`, networkId);
// //   console.log(`[PURCHASE-DATA][${VERSION}] Data amount (MB):`, dataAmountMB);
// //   console.log(`[PURCHASE-DATA][${VERSION}] Reference:`, reference);
// //   console.log(`[PURCHASE-DATA][${VERSION}] API Key present:`, !!apiKey);
// //   console.log(`[PURCHASE-DATA][${VERSION}] API Key prefix:`, apiKey?.substring(0, 8) + "...");

// //   const requestBody = {
// //     recipient_msisdn: formattedPhone,
// //     network_id: networkId,
// //     shared_bundle: dataAmountMB,
// //     incoming_api_ref: reference,
// //   };

// //   console.log(`[PURCHASE-DATA][${VERSION}] Request URL:`, `${AGYENGOSOLN_API_URL}/buy-data-package`);
// //   console.log(`[PURCHASE-DATA][${VERSION}] Request body:`, JSON.stringify(requestBody));

// //   try {
// //     const response = await fetch(`${AGYENGOSOLN_API_URL}/buy-data-package`, {
// //       method: "POST",
// //       headers: {
// //         "x-api-key": apiKey,
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify(requestBody),
// //     });

// //     const responseText = await response.text();
// //     console.log(`[PURCHASE-DATA][${VERSION}] Raw response status:`, response.status);
// //     console.log(
// //       `[PURCHASE-DATA][${VERSION}] Raw response headers:`,
// //       JSON.stringify(Object.fromEntries(response.headers as any))
// //     );
// //     console.log(`[PURCHASE-DATA][${VERSION}] Raw response body:`, responseText);

// //     let data: AgyengosDataResponse;
// //     try {
// //       data = JSON.parse(responseText) as AgyengosDataResponse;
// //     } catch (parseError) {
// //       console.error(`[PURCHASE-DATA][${VERSION}] Failed to parse response as JSON:`, parseError);
// //       return {
// //         success: false,
// //         message: `Invalid API response: ${responseText.substring(0, 200)}`,
// //       };
// //     }

// //     console.log(`[PURCHASE-DATA][${VERSION}] Parsed response:`, JSON.stringify(data));
// //     console.log(`[PURCHASE-DATA][${VERSION}] Response OK:`, response.ok);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Data success field:`, data.success);

// //     if (response.ok && data.success) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] ✓ SUCCESS - Data should be delivered`);
// //       console.log(`[PURCHASE-DATA][${VERSION}] Transaction code:`, data.transaction_code);
// //       return {
// //         success: true,
// //         message: data.message || "Data delivered successfully",
// //         transactionCode: data.transaction_code,
// //       };
// //     } else {
// //       console.log(`[PURCHASE-DATA][${VERSION}] ✗ FAILED - Data NOT delivered`);
// //       console.log(`[PURCHASE-DATA][${VERSION}] Failure reason:`, data.message || `HTTP ${response.status}`);
// //       return {
// //         success: false,
// //         message: data.message || `API error: ${response.status}`,
// //       };
// //     }
// //   } catch (error) {
// //     console.error(`[PURCHASE-DATA][${VERSION}] ✗ EXCEPTION during API call:`, error);
// //     console.error(`[PURCHASE-DATA][${VERSION}] Error type:`, error instanceof Error ? error.constructor.name : typeof error);
// //     console.error(`[PURCHASE-DATA][${VERSION}] Error message:`, error instanceof Error ? error.message : String(error));
// //     return {
// //       success: false,
// //       message: error instanceof Error ? error.message : "Failed to connect to data provider",
// //     };
// //   } finally {
// //     console.log(`[PURCHASE-DATA][${VERSION}] ================== API CALL END ==================`);
// //   }
// // }

// // Deno.serve(async (req) => {
// //   console.log(`[PURCHASE-DATA][${VERSION}] ========================================`);
// //   console.log(`[PURCHASE-DATA][${VERSION}] Request received at ${new Date().toISOString()}`);
// //   console.log(`[PURCHASE-DATA][${VERSION}] Method:`, req.method);
// //   console.log(`[PURCHASE-DATA][${VERSION}] URL:`, req.url);

// //   // Handle CORS preflight
// //   if (req.method === "OPTIONS") {
// //     console.log(`[PURCHASE-DATA][${VERSION}] Handling CORS preflight`);
// //     return new Response(null, {
// //       status: 200,
// //       headers: corsHeaders,
// //     });
// //   }

// //   try {
// //     // Check environment variables first
// //     const supabaseUrl = Deno.env.get("SUPABASE_URL");
// //     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
// //     const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
// //     const agyengosApiKey = Deno.env.get("AGYENGOSOLN_API_KEY");

// //     console.log(`[PURCHASE-DATA][${VERSION}] Environment check:`);
// //     console.log(`[PURCHASE-DATA][${VERSION}] - SUPABASE_URL: ${supabaseUrl ? "✓ SET" : "✗ MISSING"}`);
// //     console.log(`[PURCHASE-DATA][${VERSION}] - SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? "✓ SET" : "✗ MISSING"}`);
// //     console.log(`[PURCHASE-DATA][${VERSION}] - SUPABASE_ANON_KEY: ${supabaseAnonKey ? "✓ SET" : "✗ MISSING"}`);
// //     console.log(`[PURCHASE-DATA][${VERSION}] - AGYENGOSOLN_API_KEY: ${agyengosApiKey ? "✓ SET" : "✗ MISSING"}`);

// //     if (!supabaseUrl) {
// //       console.error(`[PURCHASE-DATA][${VERSION}] SUPABASE_URL not configured`);
// //       return new Response(
// //         JSON.stringify({ error: "Server misconfiguration: SUPABASE_URL missing", _version: VERSION }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     if (!supabaseServiceKey) {
// //       console.error(`[PURCHASE-DATA][${VERSION}] SUPABASE_SERVICE_ROLE_KEY not configured`);
// //       return new Response(
// //         JSON.stringify({ error: "Server misconfiguration: SERVICE_ROLE_KEY missing", _version: VERSION }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     if (!supabaseAnonKey) {
// //       console.error(`[PURCHASE-DATA][${VERSION}] SUPABASE_ANON_KEY not configured`);
// //       return new Response(
// //         JSON.stringify({ error: "Server misconfiguration: ANON_KEY missing", _version: VERSION }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     if (!agyengosApiKey) {
// //       console.error(`[PURCHASE-DATA][${VERSION}] AGYENGOSOLN_API_KEY not configured`);
// //       return new Response(
// //         JSON.stringify({ error: "Data provider not configured: AGYENGOSOLN_API_KEY missing", _version: VERSION }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     // Get user from JWT
// //     const authHeader = req.headers.get("Authorization");
// //     console.log(`[PURCHASE-DATA][${VERSION}] Auth header present:`, !!authHeader);
    
// //     if (!authHeader) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] No authorization header provided`);
// //       return new Response(
// //         JSON.stringify({ error: "Unauthorized", _version: VERSION }),
// //         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     // Create client with service role for admin operations
// //     const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// //     // Create client with user token for auth
// //     const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
// //       global: {
// //         headers: {
// //           Authorization: authHeader,
// //         },
// //       },
// //     });

// //     // Get user
// //     console.log(`[PURCHASE-DATA][${VERSION}] Getting user from token...`);
// //     const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
// //     if (userError || !user) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] User auth error:`, userError?.message || "No user");
// //       return new Response(
// //         JSON.stringify({ error: "Unauthorized", details: userError?.message, _version: VERSION }),
// //         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     const userId = user.id;
// //     console.log(`[PURCHASE-DATA][${VERSION}] Processing purchase for user:`, userId);
// //     console.log(`[PURCHASE-DATA][${VERSION}] User email:`, user.email);

// //     // Parse request body
// //     let body;
// //     try {
// //       body = await req.json();
// //       console.log(`[PURCHASE-DATA][${VERSION}] Request body:`, JSON.stringify(body));
// //     } catch (parseError) {
// //       console.error(`[PURCHASE-DATA][${VERSION}] Failed to parse request body:`, parseError);
// //       return new Response(
// //         JSON.stringify({ error: "Invalid JSON body", _version: VERSION }),
// //         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     const isBulkPurchase = Array.isArray(body.cart_items);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Is bulk purchase:`, isBulkPurchase);

// //     let purchaseItems: { pricing_tier_id: string; beneficiary_phone: string; quantity: number }[] = [];

// //     if (isBulkPurchase) {
// //       // Cart checkout
// //       const { cart_items } = body as CartCheckoutRequest;
// //       if (!cart_items || cart_items.length === 0) {
// //         console.log(`[PURCHASE-DATA][${VERSION}] Cart is empty`);
// //         return new Response(
// //           JSON.stringify({ error: "Cart is empty", _version: VERSION }),
// //           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //         );
// //       }
// //       purchaseItems = cart_items;
// //       console.log(`[PURCHASE-DATA][${VERSION}] Cart items count:`, cart_items.length);
// //     } else {
// //       // Single purchase
// //       const { pricing_tier_id, beneficiary_phone, quantity = 1 } = body as PurchaseRequest;
// //       if (!pricing_tier_id || !beneficiary_phone) {
// //         console.log(`[PURCHASE-DATA][${VERSION}] Missing required fields`);
// //         return new Response(
// //           JSON.stringify({ error: "Missing required fields: pricing_tier_id, beneficiary_phone", _version: VERSION }),
// //           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //         );
// //       }
// //       purchaseItems = [{ pricing_tier_id, beneficiary_phone, quantity }];
// //       console.log(`[PURCHASE-DATA][${VERSION}] Single purchase - tier:`, pricing_tier_id, "phone:", beneficiary_phone);
// //     }

// //     // Get user's role
// //     console.log(`[PURCHASE-DATA][${VERSION}] Fetching user role...`);
// //     const { data: roleData, error: roleError } = await supabaseAdmin
// //       .from("user_roles")
// //       .select("role")
// //       .eq("user_id", userId)
// //       .single();

// //     if (roleError || !roleData) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] Role fetch error:`, roleError?.message || "No role data");
// //       return new Response(
// //         JSON.stringify({ error: "Failed to fetch user role", details: roleError?.message, _version: VERSION }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     const userRole = roleData.role;
// //     console.log(`[PURCHASE-DATA][${VERSION}] User role:`, userRole);

// //     // Validate all pricing tiers and calculate total
// //     const tierIds = purchaseItems.map((item) => item.pricing_tier_id);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Fetching tiers:`, tierIds);
    
// //     const { data: tiers, error: tiersError } = await supabaseAdmin
// //       .from("pricing_tiers")
// //       .select("*")
// //       .in("id", tierIds)
// //       .eq("is_active", true);

// //     if (tiersError || !tiers) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] Tiers fetch error:`, tiersError?.message || "No tiers");
// //       return new Response(
// //         JSON.stringify({ error: "Failed to fetch pricing tiers", details: tiersError?.message, _version: VERSION }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     console.log(`[PURCHASE-DATA][${VERSION}] Found tiers:`, tiers.length);

// //     // Validate all tiers match user role
// //     const tierMap = new Map(tiers.map((t) => [t.id, t]));
// //     let totalAmount = 0;
// //     const purchaseDetails: { tier: typeof tiers[0]; phone: string; quantity: number }[] = [];

// //     for (const item of purchaseItems) {
// //       const tier = tierMap.get(item.pricing_tier_id);
// //       if (!tier) {
// //         console.log(`[PURCHASE-DATA][${VERSION}] Invalid tier:`, item.pricing_tier_id);
// //         return new Response(
// //           JSON.stringify({ error: `Invalid or inactive pricing tier: ${item.pricing_tier_id}`, _version: VERSION }),
// //           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //         );
// //       }

// //       if (tier.role !== userRole) {
// //         console.log(`[PURCHASE-DATA][${VERSION}] Role mismatch - tier role:`, tier.role, "user role:", userRole);
// //         return new Response(
// //           JSON.stringify({ error: `Pricing tier ${tier.package_name} is not available for your role`, _version: VERSION }),
// //           { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //         );
// //       }

// //       totalAmount += Number(tier.price) * item.quantity;
// //       purchaseDetails.push({ tier, phone: item.beneficiary_phone, quantity: item.quantity });
// //     }

// //     console.log(`[PURCHASE-DATA][${VERSION}] Total purchase amount:`, totalAmount);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Purchase details:`, JSON.stringify(purchaseDetails.map(d => ({
// //       network: d.tier.network,
// //       package: d.tier.package_name,
// //       data: d.tier.data_amount,
// //       price: d.tier.price,
// //       phone: d.phone,
// //       qty: d.quantity
// //     }))));

// //     // Get user's wallet balance
// //     console.log(`[PURCHASE-DATA][${VERSION}] Fetching wallet...`);
// //     const { data: wallet, error: walletError } = await supabaseAdmin
// //       .from("wallets")
// //       .select("id, balance")
// //       .eq("user_id", userId)
// //       .single();

// //     if (walletError || !wallet) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] Wallet fetch error:`, walletError?.message || "No wallet");
// //       return new Response(
// //         JSON.stringify({ error: "Failed to fetch wallet", details: walletError?.message, _version: VERSION }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     const currentBalance = Number(wallet.balance);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Current wallet balance:`, currentBalance);
    
// //     if (currentBalance < totalAmount) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] Insufficient balance - required:`, totalAmount, "available:", currentBalance);
// //       return new Response(
// //         JSON.stringify({
// //           error: "Insufficient wallet balance",
// //           required: totalAmount,
// //           available: currentBalance,
// //           _version: VERSION
// //         }),
// //         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     // Generate reference
// //     const reference = `PUR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
// //     console.log(`[PURCHASE-DATA][${VERSION}] Generated reference:`, reference);

// //     // Deduct from wallet first
// //     const newBalance = currentBalance - totalAmount;
// //     console.log(`[PURCHASE-DATA][${VERSION}] Deducting from wallet. New balance will be:`, newBalance);
    
// //     const { error: updateError } = await supabaseAdmin
// //       .from("wallets")
// //       .update({ balance: newBalance, updated_at: new Date().toISOString() })
// //       .eq("id", wallet.id);

// //     if (updateError) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] Wallet update error:`, updateError.message);
// //       return new Response(
// //         JSON.stringify({ error: "Failed to deduct wallet balance", details: updateError.message, _version: VERSION }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       );
// //     }

// //     console.log(`[PURCHASE-DATA][${VERSION}] Wallet updated successfully`);

// //     // Process each purchase item through the external API
// //     const deliveryResults: {
// //       network: string;
// //       package_name: string;
// //       data_amount: string;
// //       beneficiary_phone: string;
// //       quantity: number;
// //       status: "success" | "failed";
// //       provider_reference?: string;
// //       error?: string;
// //     }[] = [];

// //     let allSuccessful = true;
// //     let failedAmount = 0;

// //     console.log(`[PURCHASE-DATA][${VERSION}] Starting API calls to Agyengosoln...`);

// //     for (const detail of purchaseDetails) {
// //       const dataAmountMB = parseDataAmountToMB(detail.tier.data_amount);
// //       console.log(`[PURCHASE-DATA][${VERSION}] Processing: ${detail.tier.network} ${detail.tier.data_amount} (${dataAmountMB}MB) x${detail.quantity}`);

// //       // Process each unit in quantity
// //       for (let i = 0; i < detail.quantity; i++) {
// //         const itemRef = `${reference}-${detail.tier.network}-${i}`;

// //         const result = await purchaseDataFromProvider(
// //           agyengosApiKey,
// //           detail.phone,
// //           detail.tier.network,
// //           dataAmountMB,
// //           itemRef
// //         );

// //         if (result.success) {
// //           deliveryResults.push({
// //             network: detail.tier.network,
// //             package_name: detail.tier.package_name,
// //             data_amount: detail.tier.data_amount,
// //             beneficiary_phone: detail.phone,
// //             quantity: 1,
// //             status: "success",
// //             provider_reference: result.transactionCode,
// //           });
// //         } else {
// //           allSuccessful = false;
// //           failedAmount += Number(detail.tier.price);
// //           deliveryResults.push({
// //             network: detail.tier.network,
// //             package_name: detail.tier.package_name,
// //             data_amount: detail.tier.data_amount,
// //             beneficiary_phone: detail.phone,
// //             quantity: 1,
// //             status: "failed",
// //             error: result.message,
// //           });
// //         }
// //       }
// //     }

// //     console.log(`[PURCHASE-DATA][${VERSION}] All API calls complete`);
// //     console.log(`[PURCHASE-DATA][${VERSION}] All successful:`, allSuccessful);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Failed amount:`, failedAmount);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Delivery results:`, JSON.stringify(deliveryResults));

// //     // If some items failed, refund the failed amount
// //     if (failedAmount > 0) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] Refunding ${failedAmount} for failed items`);
// //       const { error: refundError } = await supabaseAdmin
// //         .from("wallets")
// //         .update({
// //           balance: newBalance + failedAmount,
// //           updated_at: new Date().toISOString()
// //         })
// //         .eq("id", wallet.id);
      
// //       if (refundError) {
// //         console.error(`[PURCHASE-DATA][${VERSION}] Refund error:`, refundError.message);
// //       } else {
// //         console.log(`[PURCHASE-DATA][${VERSION}] Refund successful`);
// //       }
// //     }

// //     const finalBalance = newBalance + failedAmount;
// //     const successfulAmount = totalAmount - failedAmount;

// //     console.log(`[PURCHASE-DATA][${VERSION}] Final balance:`, finalBalance);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Successful amount:`, successfulAmount);

// //     // Create transaction record
// //     // Status must be: 'pending', 'success', 'failed' (based on transactions_status_check constraint)
// //     // Calculate successful items first for status determination
// //     const successfulItemsForTx = deliveryResults.filter((r) => r.status === "success");
// //     const transactionStatus = successfulItemsForTx.length > 0 ? "success" : "failed";
    
// //     console.log(`[PURCHASE-DATA][${VERSION}] Creating transaction record with status: ${transactionStatus}`);
// //     const { error: txError } = await supabaseAdmin
// //       .from("transactions")
// //       .insert({
// //         user_id: userId,
// //         type: "purchase",
// //         amount: successfulAmount,
// //         status: transactionStatus,
// //         reference,
// //         metadata: {
// //           items: deliveryResults,
// //           total_requested: totalAmount,
// //           total_charged: successfulAmount,
// //           refunded: failedAmount,
// //           partial_success: successfulItemsForTx.length > 0 && successfulItemsForTx.length < deliveryResults.length,
// //         },
// //       });

// //     if (txError) {
// //       console.log(`[PURCHASE-DATA][${VERSION}] Transaction insert error:`, txError.message);
// //       // Note: Continue but log the error
// //     } else {
// //       console.log(`[PURCHASE-DATA][${VERSION}] Transaction record created`);
// //     }

// //     // Credit referrer commission only for successful purchases
// //     if (successfulAmount > 0) {
// //       try {
// //         console.log(`[PURCHASE-DATA][${VERSION}] Crediting referrer commission...`);
// //         await supabaseAdmin.rpc("credit_referrer_commission", {
// //           _user_id: userId,
// //           _amount: successfulAmount,
// //         });
// //         console.log(`[PURCHASE-DATA][${VERSION}] Referrer commission credited`);
// //       } catch (refErr) {
// //         console.log(`[PURCHASE-DATA][${VERSION}] Referrer commission error (non-fatal):`, refErr);
// //       }
// //     }

// //     // Build response
// //     const successfulItems = deliveryResults.filter((r) => r.status === "success");
// //     const failedItems = deliveryResults.filter((r) => r.status === "failed");

// //     let message = "";
// //     if (allSuccessful) {
// //       message = `Successfully purchased ${successfulItems.length} data package(s)`;
// //     } else if (successfulItems.length > 0) {
// //       message = `Partially completed: ${successfulItems.length} succeeded, ${failedItems.length} failed`;
// //     } else {
// //       message = `All purchases failed. Amount refunded to wallet.`;
// //     }

// //     const response = {
// //       success: successfulItems.length > 0,
// //       message,
// //       reference,
// //       total_charged: successfulAmount,
// //       refunded: failedAmount,
// //       new_balance: finalBalance,
// //       results: deliveryResults,
// //       _version: VERSION,
// //     };

// //     console.log(`[PURCHASE-DATA][${VERSION}] ========================================`);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Request complete`);
// //     console.log(`[PURCHASE-DATA][${VERSION}] Response:`, JSON.stringify(response));
// //     console.log(`[PURCHASE-DATA][${VERSION}] ========================================`);

// //     return new Response(
// //       JSON.stringify(response),
// //       {
// //         status: allSuccessful ? 200 : (successfulItems.length > 0 ? 207 : 400),
// //         headers: { ...corsHeaders, "Content-Type": "application/json" }
// //       }
// //     );

// //   } catch (error) {
// //     console.error(`[PURCHASE-DATA][${VERSION}] ========================================`);
// //     console.error(`[PURCHASE-DATA][${VERSION}] UNHANDLED ERROR`);
// //     console.error(`[PURCHASE-DATA][${VERSION}] Error:`, error);
// //     console.error(`[PURCHASE-DATA][${VERSION}] Error type:`, error instanceof Error ? error.constructor.name : typeof error);
// //     console.error(`[PURCHASE-DATA][${VERSION}] Error message:`, error instanceof Error ? error.message : String(error));
// //     console.error(`[PURCHASE-DATA][${VERSION}] Error stack:`, error instanceof Error ? error.stack : "N/A");
// //     console.error(`[PURCHASE-DATA][${VERSION}] ========================================`);
    
// //     return new Response(
// //       JSON.stringify({
// //         error: "Internal server error",
// //         details: error instanceof Error ? error.message : String(error),
// //         _version: VERSION
// //       }),
// //       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //     );
// //   }
// // });


// /// <reference path="../deno.d.ts" />

// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// // VERSION LOGGING - Update this on each deployment to verify correct version is running
// const VERSION = "idencreative-v1.1.0";
// const DEPLOYED_AT = new Date().toISOString();

// console.log(`[PURCHASE-DATA] ========================================`);
// console.log(`[PURCHASE-DATA] Edge Function Starting`);
// console.log(`[PURCHASE-DATA] Version: ${VERSION}`);
// console.log(`[PURCHASE-DATA] Deployed at: ${DEPLOYED_AT}`);
// console.log(`[PURCHASE-DATA] ========================================`);

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers":
//     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
//   "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
// };

// // Agyengosoln API configuration
// const AGYENGOSOLN_API_URL = "https://agyengosoln.com/api/v1";

// // AUTHORITATIVE Network ID Mapping from Agyengosoln API
// // Ishare (AirtelTigo) = 1, Telecel = 2, MTN = 3, BigTime = 4
// const NETWORK_ID_MAP: Record<string, number> = {
//   "ISHARE": 1,
//   "AIRTELTIGO": 1,
//   "AIRTEL": 1,       // Alias for AirtelTigo/Ishare
//   "ATISHARE": 1,     // Alias for AT-Ishare
//   "TELECEL": 2,
//   "MTN": 3,
//   "MTNAFA": 3,       // MTN_AFA maps to MTN at provider level
//   "BIGTIME": 4,
// };

// // Normalize network name for consistent lookup
// function normalizeNetwork(network: string): string {
//   // Remove spaces, underscores, hyphens and convert to uppercase
//   return network.replace(/[\s_-]/g, "").toUpperCase();
// }

// interface PurchaseRequest {
//   pricing_tier_id: string;
//   beneficiary_phone: string;
//   quantity?: number;
// }

// interface CartCheckoutRequest {
//   cart_items: {
//     pricing_tier_id: string;
//     beneficiary_phone: string;
//     quantity: number;
//   }[];
// }

// interface AgyengosDataResponse {
//   success: boolean;
//   message: string;
//   transaction_code?: string;
// }

// // Parse data amount string (e.g., "1GB", "500MB") to MB
// function parseDataAmountToMB(dataAmount: string): number {
//   const normalized = dataAmount.toUpperCase().trim();

//   // Match patterns like "1GB", "1.5GB", "500MB"
//   const gbMatch = normalized.match(/^([\d.]+)\s*GB$/);
//   if (gbMatch) {
//     return Math.round(parseFloat(gbMatch[1]) * 1000);
//   }

//   const mbMatch = normalized.match(/^([\d.]+)\s*MB$/);
//   if (mbMatch) {
//     return Math.round(parseFloat(mbMatch[1]));
//   }

//   // Default: try to parse as GB
//   const numMatch = normalized.match(/^([\d.]+)/);
//   if (numMatch) {
//     return Math.round(parseFloat(numMatch[1]) * 1000);
//   }

//   console.error(`[PURCHASE-DATA][${VERSION}] Could not parse data amount:`, dataAmount);
//   return 0;
// }

// // Validate MB value is valid for the provider
// function validateMBAmount(dataAmountMB: number): { valid: boolean; message?: string } {
//   if (dataAmountMB <= 0) {
//     return { valid: false, message: `Invalid data amount: ${dataAmountMB}MB (must be positive)` };
//   }
//   // Provider typically expects values in 100MB increments
//   if (dataAmountMB % 100 !== 0) {
//     console.warn(`[PURCHASE-DATA][${VERSION}] Warning: ${dataAmountMB}MB may not be a standard bundle size`);
//     // Allow non-standard but warn (don't hard fail as provider may accept it)
//   }
//   return { valid: true };
// }

// // Format phone number for API (ensure 10 digits starting with 0)
// function formatPhoneNumber(phone: string): string {
//   // Remove any non-digit characters
//   let cleaned = phone.replace(/\D/g, "");

//   // If starts with 233 (Ghana code), replace with 0
//   if (cleaned.startsWith("233") && cleaned.length === 12) {
//     cleaned = "0" + cleaned.substring(3);
//   }

//   // If doesn't start with 0 and is 9 digits, prepend 0
//   if (!cleaned.startsWith("0") && cleaned.length === 9) {
//     cleaned = "0" + cleaned;
//   }

//   return cleaned;
// }

// // Call Agyengosoln API to purchase data
// async function purchaseDataFromProvider(
//   apiKey: string,
//   recipientPhone: string,
//   networkName: string,
//   dataAmountMB: number,
//   reference: string
// ): Promise<{ success: boolean; message: string; transactionCode?: string }> {
//   // Normalize network name for consistent mapping
//   const normalizedNetwork = normalizeNetwork(networkName);
//   const networkId = NETWORK_ID_MAP[normalizedNetwork];
  
//   if (!networkId) {
//     console.error(`[PURCHASE-DATA][${VERSION}] Unknown network mapping:`, networkName);
//     console.error(`[PURCHASE-DATA][${VERSION}] Normalized to:`, normalizedNetwork);
//     console.error(`[PURCHASE-DATA][${VERSION}] Available mappings:`, Object.keys(NETWORK_ID_MAP));
//     return { success: false, message: `Unknown network: ${networkName}` };
//   }

//   // Validate MB amount
//   const mbValidation = validateMBAmount(dataAmountMB);
//   if (!mbValidation.valid) {
//     console.error(`[PURCHASE-DATA][${VERSION}] Invalid MB amount:`, dataAmountMB);
//     return { success: false, message: mbValidation.message || "Invalid data amount" };
//   }

//   const formattedPhone = formatPhoneNumber(recipientPhone);

//   // Detailed logging for debugging
//   console.log(`[PURCHASE-DATA][${VERSION}] ================== API CALL START ==================`);
//   console.log(`[PURCHASE-DATA][${VERSION}] Recipient phone (raw):`, recipientPhone);
//   console.log(`[PURCHASE-DATA][${VERSION}] Recipient phone (formatted):`, formattedPhone);
//   console.log(`[PURCHASE-DATA][${VERSION}] Network name (raw):`, networkName);
//   console.log(`[PURCHASE-DATA][${VERSION}] Network name (normalized):`, normalizedNetwork);
//   console.log(`[PURCHASE-DATA][${VERSION}] Network ID (provider):`, networkId);
//   console.log(`[PURCHASE-DATA][${VERSION}] Data amount (MB):`, dataAmountMB);
//   console.log(`[PURCHASE-DATA][${VERSION}] Reference:`, reference);
//   console.log(`[PURCHASE-DATA][${VERSION}] API Key present:`, !!apiKey);
//   console.log(`[PURCHASE-DATA][${VERSION}] API Key prefix:`, apiKey?.substring(0, 8) + "...");

//   const requestBody = {
//     recipient_msisdn: formattedPhone,
//     network_id: networkId,
//     shared_bundle: dataAmountMB,
//     incoming_api_ref: reference,
//   };

//   console.log(`[PURCHASE-DATA][${VERSION}] Request URL:`, `${AGYENGOSOLN_API_URL}/buy-data-package`);
//   console.log(`[PURCHASE-DATA][${VERSION}] Request body:`, JSON.stringify(requestBody));

//   try {
//     const response = await fetch(`${AGYENGOSOLN_API_URL}/buy-data-package`, {
//       method: "POST",
//       headers: {
//         "x-api-key": apiKey,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(requestBody),
//     });

//     const responseText = await response.text();
//     console.log(`[PURCHASE-DATA][${VERSION}] Raw response status:`, response.status);
//     console.log(
//       `[PURCHASE-DATA][${VERSION}] Raw response headers:`,
//       JSON.stringify(Object.fromEntries(response.headers as any))
//     );
//     console.log(`[PURCHASE-DATA][${VERSION}] Raw response body:`, responseText);

//     let data: AgyengosDataResponse;
//     try {
//       data = JSON.parse(responseText) as AgyengosDataResponse;
//     } catch (parseError) {
//       console.error(`[PURCHASE-DATA][${VERSION}] Failed to parse response as JSON:`, parseError);
//       return {
//         success: false,
//         message: `Invalid API response: ${responseText.substring(0, 200)}`,
//       };
//     }

//     console.log(`[PURCHASE-DATA][${VERSION}] Parsed response:`, JSON.stringify(data));
//     console.log(`[PURCHASE-DATA][${VERSION}] Response OK:`, response.ok);
//     console.log(`[PURCHASE-DATA][${VERSION}] Data success field:`, data.success);

//     if (response.ok && data.success) {
//       console.log(`[PURCHASE-DATA][${VERSION}] ✓ SUCCESS - Data should be delivered`);
//       console.log(`[PURCHASE-DATA][${VERSION}] Transaction code:`, data.transaction_code);
//       return {
//         success: true,
//         message: data.message || "Data delivered successfully",
//         transactionCode: data.transaction_code,
//       };
//     } else {
//       console.log(`[PURCHASE-DATA][${VERSION}] ✗ FAILED - Data NOT delivered`);
//       console.log(`[PURCHASE-DATA][${VERSION}] Failure reason:`, data.message || `HTTP ${response.status}`);
//       return {
//         success: false,
//         message: data.message || `API error: ${response.status}`,
//       };
//     }
//   } catch (error) {
//     console.error(`[PURCHASE-DATA][${VERSION}] ✗ EXCEPTION during API call:`, error);
//     console.error(`[PURCHASE-DATA][${VERSION}] Error type:`, error instanceof Error ? error.constructor.name : typeof error);
//     console.error(`[PURCHASE-DATA][${VERSION}] Error message:`, error instanceof Error ? error.message : String(error));
//     return {
//       success: false,
//       message: error instanceof Error ? error.message : "Failed to connect to data provider",
//     };
//   } finally {
//     console.log(`[PURCHASE-DATA][${VERSION}] ================== API CALL END ==================`);
//   }
// }

// Deno.serve(async (req) => {
//   console.log(`[PURCHASE-DATA][${VERSION}] ========================================`);
//   console.log(`[PURCHASE-DATA][${VERSION}] Request received at ${new Date().toISOString()}`);
//   console.log(`[PURCHASE-DATA][${VERSION}] Method:`, req.method);
//   console.log(`[PURCHASE-DATA][${VERSION}] URL:`, req.url);

//   // Handle CORS preflight
//   if (req.method === "OPTIONS") {
//     console.log(`[PURCHASE-DATA][${VERSION}] Handling CORS preflight`);
//     return new Response(null, {
//       status: 200,
//       headers: corsHeaders,
//     });
//   }

//   try {
//     // Check environment variables first
//     const supabaseUrl = Deno.env.get("SUPABASE_URL");
//     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
//     const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
//     const agyengosApiKey = Deno.env.get("AGYENGOSOLN_API_KEY");

//     console.log(`[PURCHASE-DATA][${VERSION}] Environment check:`);
//     console.log(`[PURCHASE-DATA][${VERSION}] - SUPABASE_URL: ${supabaseUrl ? "✓ SET" : "✗ MISSING"}`);
//     console.log(`[PURCHASE-DATA][${VERSION}] - SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? "✓ SET" : "✗ MISSING"}`);
//     console.log(`[PURCHASE-DATA][${VERSION}] - SUPABASE_ANON_KEY: ${supabaseAnonKey ? "✓ SET" : "✗ MISSING"}`);
//     console.log(`[PURCHASE-DATA][${VERSION}] - AGYENGOSOLN_API_KEY: ${agyengosApiKey ? "✓ SET" : "✗ MISSING"}`);

//     if (!supabaseUrl) {
//       console.error(`[PURCHASE-DATA][${VERSION}] SUPABASE_URL not configured`);
//       return new Response(
//         JSON.stringify({ error: "Server misconfiguration: SUPABASE_URL missing", _version: VERSION }),
//         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     if (!supabaseServiceKey) {
//       console.error(`[PURCHASE-DATA][${VERSION}] SUPABASE_SERVICE_ROLE_KEY not configured`);
//       return new Response(
//         JSON.stringify({ error: "Server misconfiguration: SERVICE_ROLE_KEY missing", _version: VERSION }),
//         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     if (!supabaseAnonKey) {
//       console.error(`[PURCHASE-DATA][${VERSION}] SUPABASE_ANON_KEY not configured`);
//       return new Response(
//         JSON.stringify({ error: "Server misconfiguration: ANON_KEY missing", _version: VERSION }),
//         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     if (!agyengosApiKey) {
//       console.error(`[PURCHASE-DATA][${VERSION}] AGYENGOSOLN_API_KEY not configured`);
//       return new Response(
//         JSON.stringify({ error: "Data provider not configured: AGYENGOSOLN_API_KEY missing", _version: VERSION }),
//         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     // Get user from JWT
//     const authHeader = req.headers.get("Authorization");
//     console.log(`[PURCHASE-DATA][${VERSION}] Auth header present:`, !!authHeader);
    
//     if (!authHeader) {
//       console.log(`[PURCHASE-DATA][${VERSION}] No authorization header provided`);
//       return new Response(
//         JSON.stringify({ error: "Unauthorized", _version: VERSION }),
//         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     // Create client with service role for admin operations
//     const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

//     // Create client with user token for auth
//     const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
//       global: {
//         headers: {
//           Authorization: authHeader,
//         },
//       },
//     });

//     // Get user
//     console.log(`[PURCHASE-DATA][${VERSION}] Getting user from token...`);
//     const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
//     if (userError || !user) {
//       console.log(`[PURCHASE-DATA][${VERSION}] User auth error:`, userError?.message || "No user");
//       return new Response(
//         JSON.stringify({ error: "Unauthorized", details: userError?.message, _version: VERSION }),
//         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     const userId = user.id;
//     console.log(`[PURCHASE-DATA][${VERSION}] Processing purchase for user:`, userId);
//     console.log(`[PURCHASE-DATA][${VERSION}] User email:`, user.email);

//     // Parse request body
//     let body;
//     let reference: string;
//     try {
//       body = await req.json();
//       console.log(`[PURCHASE-DATA][${VERSION}] Request body:`, JSON.stringify(body));

//       // Support both 'idempotency_key' and 'reference' for backward compatibility
//       reference = body.idempotency_key || body.reference;

//       if (!reference) {
//         console.log(`[PURCHASE-DATA][${VERSION}] Missing idempotency reference`);
//         return new Response(
//           JSON.stringify({
//             error: "Missing reference (idempotency key)",
//             _version: VERSION,
//           }),
//           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }

//       console.log(`[PURCHASE-DATA][${VERSION}] Idempotency reference:`, reference);
//     } catch (parseError) {
//       console.error(`[PURCHASE-DATA][${VERSION}] Failed to parse request body:`, parseError);
//       return new Response(
//         JSON.stringify({ error: "Invalid JSON body", _version: VERSION }),
//         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     const isBulkPurchase = Array.isArray(body.cart_items);
//     console.log(`[PURCHASE-DATA][${VERSION}] Is bulk purchase:`, isBulkPurchase);

//     let purchaseItems: { pricing_tier_id: string; beneficiary_phone: string; quantity: number }[] = [];

//     if (isBulkPurchase) {
//       // Cart checkout
//       const { cart_items } = body as CartCheckoutRequest;
//       if (!cart_items || cart_items.length === 0) {
//         console.log(`[PURCHASE-DATA][${VERSION}] Cart is empty`);
//         return new Response(
//           JSON.stringify({ error: "Cart is empty", _version: VERSION }),
//           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }
//       purchaseItems = cart_items;
//       console.log(`[PURCHASE-DATA][${VERSION}] Cart items count:`, cart_items.length);
//     } else {
//       // Single purchase
//       const { pricing_tier_id, beneficiary_phone, quantity = 1 } = body as PurchaseRequest;
//       if (!pricing_tier_id || !beneficiary_phone) {
//         console.log(`[PURCHASE-DATA][${VERSION}] Missing required fields`);
//         return new Response(
//           JSON.stringify({ error: "Missing required fields: pricing_tier_id, beneficiary_phone", _version: VERSION }),
//           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }
//       purchaseItems = [{ pricing_tier_id, beneficiary_phone, quantity }];
//       console.log(`[PURCHASE-DATA][${VERSION}] Single purchase - tier:`, pricing_tier_id, "phone:", beneficiary_phone);
//     }

//     // Get user's role
//     console.log(`[PURCHASE-DATA][${VERSION}] Fetching user role...`);
//     const { data: roleData, error: roleError } = await supabaseAdmin
//       .from("user_roles")
//       .select("role")
//       .eq("user_id", userId)
//       .single();

//     if (roleError || !roleData) {
//       console.log(`[PURCHASE-DATA][${VERSION}] Role fetch error:`, roleError?.message || "No role data");
//       return new Response(
//         JSON.stringify({ error: "Failed to fetch user role", details: roleError?.message, _version: VERSION }),
//         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     const userRole = roleData.role;
//     console.log(`[PURCHASE-DATA][${VERSION}] User role:`, userRole);

//     // Validate all pricing tiers and calculate total
//     const tierIds = purchaseItems.map((item) => item.pricing_tier_id);
//     console.log(`[PURCHASE-DATA][${VERSION}] Fetching tiers:`, tierIds);
    
//     const { data: tiers, error: tiersError } = await supabaseAdmin
//       .from("pricing_tiers")
//       .select("*")
//       .in("id", tierIds)
//       .eq("is_active", true);

//     if (tiersError || !tiers) {
//       console.log(`[PURCHASE-DATA][${VERSION}] Tiers fetch error:`, tiersError?.message || "No tiers");
//       return new Response(
//         JSON.stringify({ error: "Failed to fetch pricing tiers", details: tiersError?.message, _version: VERSION }),
//         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     console.log(`[PURCHASE-DATA][${VERSION}] Found tiers:`, tiers.length);

//     // Validate all tiers match user role
//     const tierMap = new Map(tiers.map((t) => [t.id, t]));
//     let totalAmount = 0;
//     const purchaseDetails: { tier: typeof tiers[0]; phone: string; quantity: number }[] = [];

//     for (const item of purchaseItems) {
//       const tier = tierMap.get(item.pricing_tier_id);
//       if (!tier) {
//         console.log(`[PURCHASE-DATA][${VERSION}] Invalid tier:`, item.pricing_tier_id);
//         return new Response(
//           JSON.stringify({ error: `Invalid or inactive pricing tier: ${item.pricing_tier_id}`, _version: VERSION }),
//           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }

//       if (tier.role !== userRole) {
//         console.log(`[PURCHASE-DATA][${VERSION}] Role mismatch - tier role:`, tier.role, "user role:", userRole);
//         return new Response(
//           JSON.stringify({ error: `Pricing tier ${tier.package_name} is not available for your role`, _version: VERSION }),
//           { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }

//       totalAmount += Number(tier.price) * item.quantity;
//       purchaseDetails.push({ tier, phone: item.beneficiary_phone, quantity: item.quantity });
//     }

//     console.log(`[PURCHASE-DATA][${VERSION}] Total purchase amount:`, totalAmount);

//     // --------------------
//     // Idempotency check
//     // --------------------
//     // console.log(`[PURCHASE-DATA][${VERSION}] Checking for existing transaction...`);

//     // const { data: existingTx, error: existingTxError } = await supabaseAdmin
//     //   .from("transactions")
//     //   .select("*")
//     //   .eq("reference", reference)
//     //   .maybeSingle();

//     // if (existingTxError) {
//     //   console.error(
//     //     `[PURCHASE-DATA][${VERSION}] Failed to check existing transaction:`,
//     //     existingTxError.message
//     //   );
//     //   throw existingTxError;
//     // }

//     // if (existingTx) {
//     //   console.log(`[PURCHASE-DATA][${VERSION}] Duplicate request detected`);
//     //   console.log(`[PURCHASE-DATA][${VERSION}] Returning previous result`);

//     //   return new Response(
//     //     JSON.stringify({
//     //       success: true,
//     //       message: "Already processed",
//     //       reference,
//     //       previous_result: existingTx,
//     //       _version: VERSION,
//     //     }),
//     //     { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//     //   );
//     // }

//     // --------------------
//     // IDEMPOTENCY LOCK (CORRECT PATTERN)
//     // --------------------
//     console.log(`[PURCHASE-DATA][${VERSION}] Creating processing transaction (idempotency lock)...`);

//     const { data: txInsert, error: txInsertError } = await supabaseAdmin
//       .from("transactions")
//       .insert({
//         user_id: userId,
//         type: "purchase",
//         amount: totalAmount,
//         status: "pending",
//         reference,
//       })
//       .select()
//       .single();

//     if (txInsertError) {
//       if (txInsertError.code === "23505") {
//         console.log(`[PURCHASE-DATA][${VERSION}] Duplicate reference detected (unique constraint)`);

//         return new Response(
//           JSON.stringify({
//             success: true,
//             message: "Already processed",
//             reference,
//             _version: VERSION,
//           }),
//           { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }

//       throw txInsertError;
//     }

// console.log(`[PURCHASE-DATA][${VERSION}] Transaction lock created successfully`);




//     console.log(`[PURCHASE-DATA][${VERSION}] Purchase details:`, JSON.stringify(purchaseDetails.map(d => ({
//       network: d.tier.network,
//       package: d.tier.package_name,
//       data: d.tier.data_amount,
//       price: d.tier.price,
//       phone: d.phone,
//       qty: d.quantity
//     }))));

//     // Get user's wallet balance
//     console.log(`[PURCHASE-DATA][${VERSION}] Fetching wallet...`);
//     const { data: wallet, error: walletError } = await supabaseAdmin
//       .from("wallets")
//       .select("id, balance")
//       .eq("user_id", userId)
//       .single();

//     if (walletError || !wallet) {
//       console.log(`[PURCHASE-DATA][${VERSION}] Wallet fetch error:`, walletError?.message || "No wallet");
//       return new Response(
//         JSON.stringify({ error: "Failed to fetch wallet", details: walletError?.message, _version: VERSION }),
//         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     const currentBalance = Number(wallet.balance);
//     console.log(`[PURCHASE-DATA][${VERSION}] Current wallet balance:`, currentBalance);
    
//     if (currentBalance < totalAmount) {
//       console.log(`[PURCHASE-DATA][${VERSION}] Insufficient balance - required:`, totalAmount, "available:", currentBalance);
//       return new Response(
//         JSON.stringify({
//           error: "Insufficient wallet balance",
//           required: totalAmount,
//           available: currentBalance,
//           _version: VERSION
//         }),
//         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     // Generate reference
//     // const reference = `PUR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
//     // console.log(`[PURCHASE-DATA][${VERSION}] Generated reference:`, reference);

//     // Deduct from wallet first
//     // const newBalance = currentBalance - totalAmount;
//     // console.log(`[PURCHASE-DATA][${VERSION}] Deducting from wallet. New balance will be:`, newBalance);
    
//     // const { error: updateError } = await supabaseAdmin
//     //   .from("wallets")
//     //   .update({ balance: newBalance, updated_at: new Date().toISOString() })
//     //   .eq("id", wallet.id);

//     //     if (updateError) {
//     //   console.log(`[PURCHASE-DATA][${VERSION}] Wallet update error:`, updateError.message);
//     //   return new Response(
//     //     JSON.stringify({ error: "Failed to deduct wallet balance", details: updateError.message, _version: VERSION }),
//     //     { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//     //   );
//     // }

//     // console.log(`[PURCHASE-DATA][${VERSION}] Wallet updated successfully`);

//     let newBalance: number;

//     console.log(`[PURCHASE-DATA][${VERSION}] ========================================`);
//     console.log(`[PURCHASE-DATA][${VERSION}] Initiating atomic wallet debit via DB RPC`);
//     console.log(`[PURCHASE-DATA][${VERSION}] User ID:`, userId);
//     console.log(`[PURCHASE-DATA][${VERSION}] Debit amount:`, totalAmount);
    
//     try {
//       const { data, error } = await supabaseAdmin.rpc("debit_wallet", {
//         _user_id: userId,
//         _amount: totalAmount,
//       });
    
//       if (error) {
//         console.error(`[PURCHASE-DATA][${VERSION}] Wallet debit RPC error:`, error.message);
//         throw error;
//       }
    
//       newBalance = data;
    
//       console.log(`[PURCHASE-DATA][${VERSION}] ✓ Wallet debit successful`);
//       console.log(`[PURCHASE-DATA][${VERSION}] New wallet balance:`, newBalance);
    
//     } catch (err) {
//       const errMsg = err instanceof Error ? err.message : String(err);
    
//       console.error(`[PURCHASE-DATA][${VERSION}] ✗ Wallet debit failed`);
//       console.error(`[PURCHASE-DATA][${VERSION}] Error message:`, errMsg);
    
//       if (errMsg.includes("INSUFFICIENT_FUNDS")) {
//         console.warn(`[PURCHASE-DATA][${VERSION}] Insufficient wallet balance detected`);
    
//         return new Response(
//           JSON.stringify({
//             error: "Insufficient wallet balance",
//             required: totalAmount,
//             _version: VERSION,
//           }),
//           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }
    
//       console.error(`[PURCHASE-DATA][${VERSION}] Unexpected wallet debit error — rethrowing`);
//       throw err;
//     }
    
//     console.log(`[PURCHASE-DATA][${VERSION}] ========================================`);



//     // Process each purchase item through the external API
//     const deliveryResults: {
//       network: string;
//       package_name: string;
//       data_amount: string;
//       beneficiary_phone: string;
//       quantity: number;
//       status: "success" | "failed";
//       provider_reference?: string;
//       error?: string;
//     }[] = [];

//     let allSuccessful = true;
//     let failedAmount = 0;

//     console.log(`[PURCHASE-DATA][${VERSION}] Starting API calls to Agyengosoln...`);

//     for (const detail of purchaseDetails) {
//       const dataAmountMB = parseDataAmountToMB(detail.tier.data_amount);
//       console.log(`[PURCHASE-DATA][${VERSION}] Processing: ${detail.tier.network} ${detail.tier.data_amount} (${dataAmountMB}MB) x${detail.quantity}`);

//       // Process each unit in quantity
//       for (let i = 0; i < detail.quantity; i++) {
//         const itemRef = `${reference}-${detail.tier.network}-${i}`;

//         // Check for recent successful transaction with same phone + network + amount
//         // This prevents provider duplicate detection errors
//         const { data: recentTx } = await supabaseAdmin
//           .from("transactions")
//           .select("id, metadata, created_at")
//           .eq("user_id", userId)
//           .eq("type", "purchase")
//           .eq("status", "success")
//           // .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
//           .order("created_at", { ascending: false })
//           .limit(10);

//         let isRecentDuplicate = false;
//         if (recentTx && recentTx.length > 0) {
//           // Check if any recent transaction has the same phone + network + data amount
//           for (const tx of recentTx) {
//             const metadata = tx.metadata as any;
//             if (metadata?.items && Array.isArray(metadata.items)) {
//               for (const item of metadata.items) {
//                 if (
//                   item.beneficiary_phone === detail.phone &&
//                   item.network === detail.tier.network &&
//                   item.data_amount === detail.tier.data_amount &&
//                   item.status === "success"
//                 ) {
//                   isRecentDuplicate = true;
//                   console.log(`[PURCHASE-DATA][${VERSION}] Recent duplicate detected: Same phone (${detail.phone}), network (${detail.tier.network}), and data amount (${detail.tier.data_amount}) was successfully purchased recently`);
//                   break;
//                 }
//               }
//             }
//             if (isRecentDuplicate) break;
//           }
//         }

//         let result;
//         if (isRecentDuplicate) {
//           // Skip API call and mark as failed to avoid provider duplicate error
//           result = {
//             success: false,
//             message: "Recent duplicate purchase detected. Please wait a few minutes before purchasing the same package again.",
//           };
//           console.log(`[PURCHASE-DATA][${VERSION}] Skipping API call due to recent duplicate`);
//         } else {
//           result = await purchaseDataFromProvider(
//             agyengosApiKey,
//             detail.phone,
//             detail.tier.network,
//             dataAmountMB,
//             itemRef
//           );
//         }

//         if (result.success) {
//           deliveryResults.push({
//             network: detail.tier.network,
//             package_name: detail.tier.package_name,
//             data_amount: detail.tier.data_amount,
//             beneficiary_phone: detail.phone,
//             quantity: 1,
//             status: "success",
//             provider_reference: result.transactionCode,
//           });
//         } else {
//           // Special handling for provider duplicate detection
//           if (result.message?.toLowerCase().includes("duplicate")) {
//             // Check if there was a recent successful transaction - might mean data was already delivered
//             const { data: recentSuccessTx } = await supabaseAdmin
//               .from("transactions")
//               .select("id, metadata, created_at")
//               .eq("user_id", userId)
//               .eq("type", "purchase")
//               .eq("status", "success")
//               .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString()) // Last 10 minutes
//               .order("created_at", { ascending: false })
//               .limit(5);

//             let wasRecentlyDelivered = false;
//             if (recentSuccessTx && recentSuccessTx.length > 0) {
//               for (const tx of recentSuccessTx) {
//                 const metadata = tx.metadata as any;
//                 if (metadata?.items && Array.isArray(metadata.items)) {
//                   for (const item of metadata.items) {
//                     if (
//                       item.beneficiary_phone === detail.phone &&
//                       item.network === detail.tier.network &&
//                       item.data_amount === detail.tier.data_amount &&
//                       item.status === "success"
//                     ) {
//                       wasRecentlyDelivered = true;
//                       console.log(`[PURCHASE-DATA][${VERSION}] Provider duplicate detected, but data was recently delivered successfully`);
//                       break;
//                     }
//                   }
//                 }
//                 if (wasRecentlyDelivered) break;
//               }
//             }

//             if (wasRecentlyDelivered) {
//               // Treat as success since data was likely already delivered
//               console.log(`[PURCHASE-DATA][${VERSION}] Treating provider duplicate as success (recent delivery found)`);
//               deliveryResults.push({
//                 network: detail.tier.network,
//                 package_name: detail.tier.package_name,
//                 data_amount: detail.tier.data_amount,
//                 beneficiary_phone: detail.phone,
//                 quantity: 1,
//                 status: "success",
//                 provider_reference: "duplicate-detected-but-delivered",
//               });
//             } else {
//               allSuccessful = false;
//               failedAmount += Number(detail.tier.price);
//               deliveryResults.push({
//                 network: detail.tier.network,
//                 package_name: detail.tier.package_name,
//                 data_amount: detail.tier.data_amount,
//                 beneficiary_phone: detail.phone,
//                 quantity: 1,
//                 status: "failed",
//                 error: result.message || "Duplicate order detected by provider",
//               });
//             }
//           } else {
//             allSuccessful = false;
//             failedAmount += Number(detail.tier.price);
//             deliveryResults.push({
//               network: detail.tier.network,
//               package_name: detail.tier.package_name,
//               data_amount: detail.tier.data_amount,
//               beneficiary_phone: detail.phone,
//               quantity: 1,
//               status: "failed",
//               error: result.message,
//             });
//           }
//         }
//       }
//     }

//     console.log(`[PURCHASE-DATA][${VERSION}] All API calls complete`);
//     console.log(`[PURCHASE-DATA][${VERSION}] All successful:`, allSuccessful);
//     console.log(`[PURCHASE-DATA][${VERSION}] Failed amount:`, failedAmount);
//     console.log(`[PURCHASE-DATA][${VERSION}] Delivery results:`, JSON.stringify(deliveryResults));

//     // If some items failed, refund the failed amount
//     // if (failedAmount > 0) {
//     //   console.log(`[PURCHASE-DATA][${VERSION}] Refunding ${failedAmount} for failed items`);
//     //   const { error: refundError } = await supabaseAdmin
//     //     .from("wallets")
//     //     .update({
//     //       balance: newBalance + failedAmount,
//     //       updated_at: new Date().toISOString()
//     //     })
//     //     .eq("id", wallet.id);
      
//     //   if (refundError) {
//     //     console.error(`[PURCHASE-DATA][${VERSION}] Refund error:`, refundError.message);
//     //   } else {
//     //     console.log(`[PURCHASE-DATA][${VERSION}] Refund successful`);
//     //   }
//     // }

//     if (failedAmount > 0) {
//       console.log(`[PURCHASE-DATA][${VERSION}] Refunding ${failedAmount} via atomic RPC`);
    
//       const { error: refundError } = await supabaseAdmin.rpc("credit_wallet", {
//         _user_id: userId,
//         _amount: failedAmount,
//       });
    
//       if (refundError) {
//         console.error(`[PURCHASE-DATA][${VERSION}] Refund RPC failed:`, refundError.message);
//       } else {
//         console.log(`[PURCHASE-DATA][${VERSION}] Refund successful`);
//       }
//     }

//     const finalBalance = newBalance + failedAmount;
//     const successfulAmount = totalAmount - failedAmount;

//     console.log(`[PURCHASE-DATA][${VERSION}] Final balance:`, finalBalance);
//     console.log(`[PURCHASE-DATA][${VERSION}] Successful amount:`, successfulAmount);

//     // Create transaction record
//     const successfulItemsForTx = deliveryResults.filter((r) => r.status === "success");
//     const transactionStatus = successfulItemsForTx.length > 0 ? "success" : "failed";
    
//     console.log(`[PURCHASE-DATA][${VERSION}] Creating transaction record with status: ${transactionStatus}`);
//     // const { error: txError } = await supabaseAdmin
//     //   .from("transactions")
//     //   .insert({
//     //     user_id: userId,
//     //     type: "purchase",
//     //     amount: successfulAmount,
//     //     status: transactionStatus,
//     //     reference,
//     //     metadata: {
//     //       items: deliveryResults,
//     //       total_requested: totalAmount,
//     //       total_charged: successfulAmount,
//     //       refunded: failedAmount,
//     //       partial_success: successfulItemsForTx.length > 0 && successfulItemsForTx.length < deliveryResults.length,
//     //     },
//     //   });

//   const { error: txError }  = await supabaseAdmin
//     .from("transactions")
//     .update({
//       amount: successfulAmount,
//       status: transactionStatus,
//       metadata: {
//         items: deliveryResults,
//         total_requested: totalAmount,
//         total_charged: successfulAmount,
//         refunded: failedAmount,
//         partial_success:
//           successfulItemsForTx.length > 0 &&
//           successfulItemsForTx.length < deliveryResults.length,
//       },
//     })
//     .eq("reference", reference);


//     if (txError) {
//       console.log(`[PURCHASE-DATA][${VERSION}] Transaction insert error:`, txError.message);
//     } else {
//       console.log(`[PURCHASE-DATA][${VERSION}] Transaction record created`);
//     }

//     // Credit referrer commission only for successful purchases
//     if (successfulAmount > 0) {
//       try {
//         console.log(`[PURCHASE-DATA][${VERSION}] Crediting referrer commission...`);
//         await supabaseAdmin.rpc("credit_referrer_commission", {
//           _user_id: userId,
//           _amount: successfulAmount,
//         });
//         console.log(`[PURCHASE-DATA][${VERSION}] Referrer commission credited`);
//       } catch (refErr) {
//         console.log(`[PURCHASE-DATA][${VERSION}] Referrer commission error (non-fatal):`, refErr);
//       }
//     }

//     // Build response
//     const successfulItems = deliveryResults.filter((r) => r.status === "success");
//     const failedItems = deliveryResults.filter((r) => r.status === "failed");

//     let message = "";
//     if (allSuccessful) {
//       message = `Successfully purchased ${successfulItems.length} data package(s)`;
//     } else if (successfulItems.length > 0) {
//       message = `Partially completed: ${successfulItems.length} succeeded, ${failedItems.length} failed`;
//     } else {
//       message = `All purchases failed. Amount refunded to wallet.`;
//     }

//     const response = {
//       success: successfulItems.length > 0,
//       message,
//       // reference,
//       total_charged: successfulAmount,
//       refunded: failedAmount,
//       new_balance: finalBalance,
//       results: deliveryResults,
//       _version: VERSION,
//     };

//     console.log(`[PURCHASE-DATA][${VERSION}] ========================================`);
//     console.log(`[PURCHASE-DATA][${VERSION}] Request complete`);
//     console.log(`[PURCHASE-DATA][${VERSION}] Response:`, JSON.stringify(response));
//     console.log(`[PURCHASE-DATA][${VERSION}] ========================================`);

//     return new Response(
//       JSON.stringify(response),
//       {
//         status: allSuccessful ? 200 : (successfulItems.length > 0 ? 207 : 400),
//         headers: { ...corsHeaders, "Content-Type": "application/json" }
//       }
//     );

//   } catch (error) {
//     console.error(`[PURCHASE-DATA][${VERSION}] ========================================`);
//     console.error(`[PURCHASE-DATA][${VERSION}] UNHANDLED ERROR`);
//     console.error(`[PURCHASE-DATA][${VERSION}] Error:`, error);
//     console.error(`[PURCHASE-DATA][${VERSION}] Error type:`, error instanceof Error ? error.constructor.name : typeof error);
//     console.error(`[PURCHASE-DATA][${VERSION}] Error message:`, error instanceof Error ? error.message : String(error));
//     console.error(`[PURCHASE-DATA][${VERSION}] Error stack:`, error instanceof Error ? error.stack : "N/A");
//     console.error(`[PURCHASE-DATA][${VERSION}] ========================================`);
    
//     return new Response(
//       JSON.stringify({
//         error: "Internal server error",
//         details: error instanceof Error ? error.message : String(error),
//         _version: VERSION
//       }),
//       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//     );
//   }
// });



// /// <reference path="../deno.d.ts" />

// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// // VERSION LOGGING - Update this on each deployment to verify correct version is running
// const VERSION = "idencreative-v1.2.0";
// const DEPLOYED_AT = new Date().toISOString();

// console.log(`[PURCHASE-DATA] ========================================`);
// console.log(`[PURCHASE-DATA] Edge Function Starting`);
// console.log(`[PURCHASE-DATA] Version: ${VERSION}`);
// console.log(`[PURCHASE-DATA] Deployed at: ${DEPLOYED_AT}`);
// console.log(`[PURCHASE-DATA] ========================================`);

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers":
//     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
//   "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
// };

// // Agyengosoln API configuration
// const AGYENGOSOLN_API_URL = "https://agyengosoln.com/api/v1";

// // How long (in minutes) to block re-purchase of the same phone + network + data_amount.
// // This matches the provider's own idempotency window. After this window expires,
// // the same combo can be purchased again freely.
// const DUPLICATE_WINDOW_MINUTES = 5;

// // AUTHORITATIVE Network ID Mapping from Agyengosoln API
// // Ishare (AirtelTigo) = 1, Telecel = 2, MTN = 3, BigTime = 4
// // const NETWORK_ID_MAP: Record<string, number> = {
// //   "ISHARE": 1,
// //   "AIRTELTIGO": 1,
// //   "AIRTEL": 1,       // Alias for AirtelTigo/Ishare
// //   "ATISHARE": 1,     // Alias for AT-Ishare
// //   "TELECEL": 2,
// //   "MTN": 3,
// //   "MTNAFA": 3,       // MTN_AFA maps to MTN at provider level
// //   "BIGTIME": 4,
// // };


// const NETWORK_ID_MAP: Record<string, number> = {
//   // MTN variants
//   "MTN": 3,
//   "MTNAFA": 3,       // MTN_AFA normalises to MTNAFA

//   // AirtelTigo / iShare variants (60-day expiry) → provider ID 1
//   "ATISHARE": 1,     // AT_iShare normalises to ATISHARE
//   "ISHARE": 1,       // legacy alias
//   "AIRTELTIGO": 1,   // legacy alias

//   // AirtelTigo BigTime (non-expiry) → provider ID 4
//   "ATBIGTIME": 4,    // AT_BigTime normalises to ATBIGTIME
//   "BIGTIME": 4,      // legacy alias

//   // Telecel
//   "TELECEL": 2,
// };

// // Normalize network name for consistent lookup
// function normalizeNetwork(network: string): string {
//   // Remove spaces, underscores, hyphens and convert to uppercase
//   return network.replace(/[\s_-]/g, "").toUpperCase();
// }

// interface PurchaseRequest {
//   pricing_tier_id: string;
//   beneficiary_phone: string;
//   quantity?: number;
// }

// interface CartCheckoutRequest {
//   cart_items: {
//     pricing_tier_id: string;
//     beneficiary_phone: string;
//     quantity: number;
//   }[];
// }

// interface AgyengosDataResponse {
//   success: boolean;
//   message: string;
//   transaction_code?: string;
// }

// // Parse data amount string (e.g., "1GB", "500MB") to MB
// function parseDataAmountToMB(dataAmount: string): number {
//   const normalized = dataAmount.toUpperCase().trim();

//   // Match patterns like "1GB", "1.5GB", "500MB"
//   const gbMatch = normalized.match(/^([\d.]+)\s*GB$/);
//   if (gbMatch) {
//     return Math.round(parseFloat(gbMatch[1]) * 1000);
//   }

//   const mbMatch = normalized.match(/^([\d.]+)\s*MB$/);
//   if (mbMatch) {
//     return Math.round(parseFloat(mbMatch[1]));
//   }

//   // Default: try to parse as GB
//   const numMatch = normalized.match(/^([\d.]+)/);
//   if (numMatch) {
//     return Math.round(parseFloat(numMatch[1]) * 1000);
//   }

//   console.error(`[PURCHASE-DATA][${VERSION}] Could not parse data amount:`, dataAmount);
//   return 0;
// }

// // Validate MB value is valid for the provider
// function validateMBAmount(dataAmountMB: number): { valid: boolean; message?: string } {
//   if (dataAmountMB <= 0) {
//     return { valid: false, message: `Invalid data amount: ${dataAmountMB}MB (must be positive)` };
//   }
//   // Provider typically expects values in 100MB increments
//   if (dataAmountMB % 100 !== 0) {
//     console.warn(`[PURCHASE-DATA][${VERSION}] Warning: ${dataAmountMB}MB may not be a standard bundle size`);
//     // Allow non-standard but warn (don't hard fail as provider may accept it)
//   }
//   return { valid: true };
// }

// // Format phone number for API (ensure 10 digits starting with 0)
// function formatPhoneNumber(phone: string): string {
//   // Remove any non-digit characters
//   let cleaned = phone.replace(/\D/g, "");

//   // If starts with 233 (Ghana code), replace with 0
//   if (cleaned.startsWith("233") && cleaned.length === 12) {
//     cleaned = "0" + cleaned.substring(3);
//   }

//   // If doesn't start with 0 and is 9 digits, prepend 0
//   if (!cleaned.startsWith("0") && cleaned.length === 9) {
//     cleaned = "0" + cleaned;
//   }

//   return cleaned;
// }

// // Call Agyengosoln API to purchase data
// async function purchaseDataFromProvider(
//   apiKey: string,
//   recipientPhone: string,
//   networkName: string,
//   dataAmountMB: number,
//   reference: string
// ): Promise<{ success: boolean; message: string; transactionCode?: string }> {
//   // Normalize network name for consistent mapping
//   const normalizedNetwork = normalizeNetwork(networkName);
//   const networkId = NETWORK_ID_MAP[normalizedNetwork];

//   if (!networkId) {
//     console.error(`[PURCHASE-DATA][${VERSION}] Unknown network mapping:`, networkName);
//     console.error(`[PURCHASE-DATA][${VERSION}] Normalized to:`, normalizedNetwork);
//     console.error(`[PURCHASE-DATA][${VERSION}] Available mappings:`, Object.keys(NETWORK_ID_MAP));
//     return { success: false, message: `Unknown network: ${networkName}` };
//   }

//   // Validate MB amount
//   const mbValidation = validateMBAmount(dataAmountMB);
//   if (!mbValidation.valid) {
//     console.error(`[PURCHASE-DATA][${VERSION}] Invalid MB amount:`, dataAmountMB);
//     return { success: false, message: mbValidation.message || "Invalid data amount" };
//   }

//   const formattedPhone = formatPhoneNumber(recipientPhone);

//   // Detailed logging for debugging
//   console.log(`[PURCHASE-DATA][${VERSION}] ================== API CALL START ==================`);
//   console.log(`[PURCHASE-DATA][${VERSION}] Recipient phone (raw):`, recipientPhone);
//   console.log(`[PURCHASE-DATA][${VERSION}] Recipient phone (formatted):`, formattedPhone);
//   console.log(`[PURCHASE-DATA][${VERSION}] Network name (raw):`, networkName);
//   console.log(`[PURCHASE-DATA][${VERSION}] Network name (normalized):`, normalizedNetwork);
//   console.log(`[PURCHASE-DATA][${VERSION}] Network ID (provider):`, networkId);
//   console.log(`[PURCHASE-DATA][${VERSION}] Data amount (MB):`, dataAmountMB);
//   console.log(`[PURCHASE-DATA][${VERSION}] Reference:`, reference);
//   console.log(`[PURCHASE-DATA][${VERSION}] API Key present:`, !!apiKey);
//   console.log(`[PURCHASE-DATA][${VERSION}] API Key prefix:`, apiKey?.substring(0, 8) + "...");

//   const requestBody = {
//     recipient_msisdn: formattedPhone,
//     network_id: networkId,
//     shared_bundle: dataAmountMB,
//     incoming_api_ref: reference,
//   };

//   console.log(`[PURCHASE-DATA][${VERSION}] Request URL:`, `${AGYENGOSOLN_API_URL}/buy-data-package`);
//   console.log(`[PURCHASE-DATA][${VERSION}] Request body:`, JSON.stringify(requestBody));

//   try {
//     const response = await fetch(`${AGYENGOSOLN_API_URL}/buy-data-package`, {
//       method: "POST",
//       headers: {
//         "x-api-key": apiKey,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(requestBody),
//     });

//     const responseText = await response.text();
//     console.log(`[PURCHASE-DATA][${VERSION}] Raw response status:`, response.status);
//     console.log(
//       `[PURCHASE-DATA][${VERSION}] Raw response headers:`,
//       JSON.stringify(Object.fromEntries(response.headers as any))
//     );
//     console.log(`[PURCHASE-DATA][${VERSION}] Raw response body:`, responseText);

//     let data: AgyengosDataResponse;
//     try {
//       data = JSON.parse(responseText) as AgyengosDataResponse;
//     } catch (parseError) {
//       console.error(`[PURCHASE-DATA][${VERSION}] Failed to parse response as JSON:`, parseError);
//       return {
//         success: false,
//         message: `Invalid API response: ${responseText.substring(0, 200)}`,
//       };
//     }

//     console.log(`[PURCHASE-DATA][${VERSION}] Parsed response:`, JSON.stringify(data));
//     console.log(`[PURCHASE-DATA][${VERSION}] Response OK:`, response.ok);
//     console.log(`[PURCHASE-DATA][${VERSION}] Data success field:`, data.success);

//     if (response.ok && data.success) {
//       console.log(`[PURCHASE-DATA][${VERSION}] ✓ SUCCESS - Data should be delivered`);
//       console.log(`[PURCHASE-DATA][${VERSION}] Transaction code:`, data.transaction_code);
//       return {
//         success: true,
//         message: data.message || "Data delivered successfully",
//         transactionCode: data.transaction_code,
//       };
//     } else {
//       console.log(`[PURCHASE-DATA][${VERSION}] ✗ FAILED - Data NOT delivered`);
//       console.log(`[PURCHASE-DATA][${VERSION}] Failure reason:`, data.message || `HTTP ${response.status}`);
//       return {
//         success: false,
//         message: data.message || `API error: ${response.status}`,
//       };
//     }
//   } catch (error) {
//     console.error(`[PURCHASE-DATA][${VERSION}] ✗ EXCEPTION during API call:`, error);
//     console.error(`[PURCHASE-DATA][${VERSION}] Error type:`, error instanceof Error ? error.constructor.name : typeof error);
//     console.error(`[PURCHASE-DATA][${VERSION}] Error message:`, error instanceof Error ? error.message : String(error));
//     return {
//       success: false,
//       message: error instanceof Error ? error.message : "Failed to connect to data provider",
//     };
//   } finally {
//     console.log(`[PURCHASE-DATA][${VERSION}] ================== API CALL END ==================`);
//   }
// }

// /**
//  * Check whether the same phone + network + data_amount was successfully
//  * delivered within the last `windowMinutes` minutes.
//  *
//  * KEY FIX: The old code had the .gte() time-filter commented out, which caused
//  * it to scan ALL historical transactions — permanently blocking any re-purchase
//  * of the same combo ever again. This function always enforces a strict window.
//  */
// async function wasRecentlyDelivered(
//   // supabaseAdmin: ReturnType<typeof createClient>,
//   supabaseAdmin: any,
//   userId: string,
//   phone: string,
//   network: string,
//   dataAmount: string,
//   windowMinutes = DUPLICATE_WINDOW_MINUTES
// ): Promise<boolean> {
//   const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

//   const { data: recentTx } = await supabaseAdmin
//     .from("transactions")
//     .select("id, metadata, created_at")
//     .eq("user_id", userId)
//     .eq("type", "purchase")
//     .eq("status", "success")
//     .gte("created_at", windowStart)   // ← ALWAYS enforced — never commented out
//     .order("created_at", { ascending: false })
//     .limit(20);

//   if (!recentTx || recentTx.length === 0) return false;

//   for (const tx of recentTx) {
//     const metadata = tx.metadata as any;
//     if (metadata?.items && Array.isArray(metadata.items)) {
//       for (const item of metadata.items) {
//         if (
//           item.beneficiary_phone === phone &&
//           item.network === network &&
//           item.data_amount === dataAmount &&
//           item.status === "success"
//         ) {
//           console.log(
//             `[PURCHASE-DATA][${VERSION}] Duplicate within ${windowMinutes}min window:`,
//             `phone=${phone} network=${network} data=${dataAmount}`
//           );
//           return true;
//         }
//       }
//     }
//   }
//   return false;
// }

// Deno.serve(async (req) => {
//   console.log(`[PURCHASE-DATA][${VERSION}] ========================================`);
//   console.log(`[PURCHASE-DATA][${VERSION}] Request received at ${new Date().toISOString()}`);
//   console.log(`[PURCHASE-DATA][${VERSION}] Method:`, req.method);
//   console.log(`[PURCHASE-DATA][${VERSION}] URL:`, req.url);

//   // Handle CORS preflight
//   if (req.method === "OPTIONS") {
//     console.log(`[PURCHASE-DATA][${VERSION}] Handling CORS preflight`);
//     return new Response(null, {
//       status: 200,
//       headers: corsHeaders,
//     });
//   }

//   // Track reference and lock state so we can clean up on any unexpected failure
//   let reference: string | null = null;
//   let lockCreated = false;

//   try {
//     // ── Environment variables ────────────────────────────────────────────
//     const supabaseUrl = Deno.env.get("SUPABASE_URL");
//     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
//     const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
//     const agyengosApiKey = Deno.env.get("AGYENGOSOLN_API_KEY");

//     console.log(`[PURCHASE-DATA][${VERSION}] Environment check:`);
//     console.log(`[PURCHASE-DATA][${VERSION}] - SUPABASE_URL: ${supabaseUrl ? "✓ SET" : "✗ MISSING"}`);
//     console.log(`[PURCHASE-DATA][${VERSION}] - SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? "✓ SET" : "✗ MISSING"}`);
//     console.log(`[PURCHASE-DATA][${VERSION}] - SUPABASE_ANON_KEY: ${supabaseAnonKey ? "✓ SET" : "✗ MISSING"}`);
//     console.log(`[PURCHASE-DATA][${VERSION}] - AGYENGOSOLN_API_KEY: ${agyengosApiKey ? "✓ SET" : "✗ MISSING"}`);

//     if (!supabaseUrl) {
//       console.error(`[PURCHASE-DATA][${VERSION}] SUPABASE_URL not configured`);
//       return new Response(
//         JSON.stringify({ error: "Server misconfiguration: SUPABASE_URL missing", _version: VERSION }),
//         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }
//     if (!supabaseServiceKey) {
//       console.error(`[PURCHASE-DATA][${VERSION}] SUPABASE_SERVICE_ROLE_KEY not configured`);
//       return new Response(
//         JSON.stringify({ error: "Server misconfiguration: SERVICE_ROLE_KEY missing", _version: VERSION }),
//         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }
//     if (!supabaseAnonKey) {
//       console.error(`[PURCHASE-DATA][${VERSION}] SUPABASE_ANON_KEY not configured`);
//       return new Response(
//         JSON.stringify({ error: "Server misconfiguration: ANON_KEY missing", _version: VERSION }),
//         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }
//     if (!agyengosApiKey) {
//       console.error(`[PURCHASE-DATA][${VERSION}] AGYENGOSOLN_API_KEY not configured`);
//       return new Response(
//         JSON.stringify({ error: "Data provider not configured: AGYENGOSOLN_API_KEY missing", _version: VERSION }),
//         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     // ── Auth ─────────────────────────────────────────────────────────────
//     const authHeader = req.headers.get("Authorization");
//     console.log(`[PURCHASE-DATA][${VERSION}] Auth header present:`, !!authHeader);

//     if (!authHeader) {
//       console.log(`[PURCHASE-DATA][${VERSION}] No authorization header provided`);
//       return new Response(
//         JSON.stringify({ error: "Unauthorized", _version: VERSION }),
//         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     // Create client with service role for admin operations
//     const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

//     // Create client with user token for auth
//     const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
//       global: { headers: { Authorization: authHeader } },
//     });

//     console.log(`[PURCHASE-DATA][${VERSION}] Getting user from token...`);
//     const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

//     if (userError || !user) {
//       console.log(`[PURCHASE-DATA][${VERSION}] User auth error:`, userError?.message || "No user");
//       return new Response(
//         JSON.stringify({ error: "Unauthorized", details: userError?.message, _version: VERSION }),
//         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     const userId = user.id;
//     console.log(`[PURCHASE-DATA][${VERSION}] Processing purchase for user:`, userId);
//     console.log(`[PURCHASE-DATA][${VERSION}] User email:`, user.email);

//     // ── Parse request body ───────────────────────────────────────────────
//     let body: any;
//     try {
//       body = await req.json();
//       console.log(`[PURCHASE-DATA][${VERSION}] Request body:`, JSON.stringify(body));
//     } catch (parseError) {
//       console.error(`[PURCHASE-DATA][${VERSION}] Failed to parse request body:`, parseError);
//       return new Response(
//         JSON.stringify({ error: "Invalid JSON body", _version: VERSION }),
//         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     // Support both 'idempotency_key' and 'reference' for backward compatibility
//     reference = body.idempotency_key || body.reference;

//     if (!reference) {
//       console.log(`[PURCHASE-DATA][${VERSION}] Missing idempotency reference`);
//       return new Response(
//         JSON.stringify({ error: "Missing reference (idempotency key)", _version: VERSION }),
//         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     console.log(`[PURCHASE-DATA][${VERSION}] Idempotency reference:`, reference);

//     const isBulkPurchase = Array.isArray(body.cart_items);
//     console.log(`[PURCHASE-DATA][${VERSION}] Is bulk purchase:`, isBulkPurchase);

//     let purchaseItems: { pricing_tier_id: string; beneficiary_phone: string; quantity: number }[] = [];

//     if (isBulkPurchase) {
//       const { cart_items } = body as CartCheckoutRequest;
//       if (!cart_items || cart_items.length === 0) {
//         console.log(`[PURCHASE-DATA][${VERSION}] Cart is empty`);
//         return new Response(
//           JSON.stringify({ error: "Cart is empty", _version: VERSION }),
//           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }
//       purchaseItems = cart_items;
//       console.log(`[PURCHASE-DATA][${VERSION}] Cart items count:`, cart_items.length);
//     } else {
//       const { pricing_tier_id, beneficiary_phone, quantity = 1 } = body as PurchaseRequest;
//       if (!pricing_tier_id || !beneficiary_phone) {
//         console.log(`[PURCHASE-DATA][${VERSION}] Missing required fields`);
//         return new Response(
//           JSON.stringify({ error: "Missing required fields: pricing_tier_id, beneficiary_phone", _version: VERSION }),
//           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }
//       purchaseItems = [{ pricing_tier_id, beneficiary_phone, quantity }];
//       console.log(`[PURCHASE-DATA][${VERSION}] Single purchase - tier:`, pricing_tier_id, "phone:", beneficiary_phone);
//     }

//     // ── User role ─────────────────────────────────────────────────────────
//     console.log(`[PURCHASE-DATA][${VERSION}] Fetching user role...`);
//     const { data: roleData, error: roleError } = await supabaseAdmin
//       .from("user_roles")
//       .select("role")
//       .eq("user_id", userId)
//       .single();

//     if (roleError || !roleData) {
//       console.log(`[PURCHASE-DATA][${VERSION}] Role fetch error:`, roleError?.message || "No role data");
//       return new Response(
//         JSON.stringify({ error: "Failed to fetch user role", details: roleError?.message, _version: VERSION }),
//         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     const userRole = roleData.role;
//     console.log(`[PURCHASE-DATA][${VERSION}] User role:`, userRole);

//     // ── Pricing tiers ─────────────────────────────────────────────────────
//     const tierIds = purchaseItems.map((item) => item.pricing_tier_id);
//     console.log(`[PURCHASE-DATA][${VERSION}] Fetching tiers:`, tierIds);

//     const { data: tiers, error: tiersError } = await supabaseAdmin
//       .from("pricing_tiers")
//       .select("*")
//       .in("id", tierIds)
//       .eq("is_active", true);

//     if (tiersError || !tiers) {
//       console.log(`[PURCHASE-DATA][${VERSION}] Tiers fetch error:`, tiersError?.message || "No tiers");
//       return new Response(
//         JSON.stringify({ error: "Failed to fetch pricing tiers", details: tiersError?.message, _version: VERSION }),
//         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     console.log(`[PURCHASE-DATA][${VERSION}] Found tiers:`, tiers.length);

//     const tierMap = new Map(tiers.map((t) => [t.id, t]));
//     let totalAmount = 0;
//     const purchaseDetails: { tier: typeof tiers[0]; phone: string; quantity: number }[] = [];

//     for (const item of purchaseItems) {
//       const tier = tierMap.get(item.pricing_tier_id);
//       if (!tier) {
//         console.log(`[PURCHASE-DATA][${VERSION}] Invalid tier:`, item.pricing_tier_id);
//         return new Response(
//           JSON.stringify({ error: `Invalid or inactive pricing tier: ${item.pricing_tier_id}`, _version: VERSION }),
//           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }
//       if (tier.role !== userRole) {
//         console.log(`[PURCHASE-DATA][${VERSION}] Role mismatch - tier role:`, tier.role, "user role:", userRole);
//         return new Response(
//           JSON.stringify({ error: `Pricing tier ${tier.package_name} is not available for your role`, _version: VERSION }),
//           { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }
//       totalAmount += Number(tier.price) * item.quantity;
//       purchaseDetails.push({ tier, phone: item.beneficiary_phone, quantity: item.quantity });
//     }

//     console.log(`[PURCHASE-DATA][${VERSION}] Total purchase amount:`, totalAmount);

//     // ── Idempotency lock ──────────────────────────────────────────────────
//     // Insert a "pending" transaction to act as a distributed lock.
//     // The unique constraint on `reference` prevents duplicate processing.
//     //
//     // Behaviour by existing record state:
//     //   "pending"  → another request is in-flight → 409
//     //   "success"  → already completed → return cached result (200)
//     //   "failed"   → was cleaned up after failure; this branch fires only if
//     //                cleanup somehow didn't run — we delete and re-insert.
//     console.log(`[PURCHASE-DATA][${VERSION}] Creating processing transaction (idempotency lock)...`);

//     const { error: txInsertError } = await supabaseAdmin
//       .from("transactions")
//       .insert({
//         user_id: userId,
//         type: "purchase",
//         amount: totalAmount,
//         status: "pending",
//         reference,
//       })
//       .select()
//       .single();

//     if (txInsertError) {
//       if (txInsertError.code === "23505") {
//         // Unique constraint fired — check current state of the existing record
//         // const { data: existingTx } = await supabaseAdmin
//         //   .from("transactions")
//         //   .select("status, metadata, amount")
//         //   .eq("reference", reference)
//         //   .single();

//         const { data: existingTx } = await supabaseAdmin
//           .from("transactions")
//           .select("status, metadata, amount")
//           .eq("reference", reference)
//           .single() as { data: { status: string; metadata: any; amount: number } | null; error: any };

//         if (existingTx?.status === "success") {
//           console.log(`[PURCHASE-DATA][${VERSION}] Idempotent replay — already succeeded, returning cached result`);
//           return new Response(
//             JSON.stringify({
//               success: true,
//               message: "Already processed",
//               reference,
//               previous_result: existingTx.metadata,
//               _version: VERSION,
//             }),
//             { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//           );
//         }

//         if (existingTx?.status === "pending") {
//           console.log(`[PURCHASE-DATA][${VERSION}] Concurrent request in-flight — returning 409`);
//           return new Response(
//             JSON.stringify({
//               error: "Purchase already in progress. Please wait and try again.",
//               _version: VERSION,
//             }),
//             { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//           );
//         }

//         // Stale "failed" lock (cleanup didn't run) — remove it and retry insert
//         console.log(`[PURCHASE-DATA][${VERSION}] Stale failed lock found — clearing and retrying`);
//         await supabaseAdmin.from("transactions").delete().eq("reference", reference);

//         const { error: retryError } = await supabaseAdmin
//           .from("transactions")
//           .insert({ user_id: userId, type: "purchase", amount: totalAmount, status: "pending", reference });

//         if (retryError) throw retryError;
//       } else {
//         throw txInsertError;
//       }
//     }

//     lockCreated = true;
//     console.log(`[PURCHASE-DATA][${VERSION}] Transaction lock created successfully`);

//     console.log(`[PURCHASE-DATA][${VERSION}] Purchase details:`, JSON.stringify(purchaseDetails.map(d => ({
//       network: d.tier.network,
//       package: d.tier.package_name,
//       data: d.tier.data_amount,
//       price: d.tier.price,
//       phone: d.phone,
//       qty: d.quantity,
//     }))));

//     // ── Wallet balance pre-check ──────────────────────────────────────────
//     console.log(`[PURCHASE-DATA][${VERSION}] Fetching wallet...`);
//     const { data: wallet, error: walletError } = await supabaseAdmin
//       .from("wallets")
//       .select("id, balance")
//       .eq("user_id", userId)
//       .single();

//     if (walletError || !wallet) {
//       console.log(`[PURCHASE-DATA][${VERSION}] Wallet fetch error:`, walletError?.message || "No wallet");
//       // Release lock so user can retry
//       await supabaseAdmin.from("transactions").delete().eq("reference", reference);
//       lockCreated = false;
//       return new Response(
//         JSON.stringify({ error: "Failed to fetch wallet", details: walletError?.message, _version: VERSION }),
//         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     const currentBalance = Number(wallet.balance);
//     console.log(`[PURCHASE-DATA][${VERSION}] Current wallet balance:`, currentBalance);

//     if (currentBalance < totalAmount) {
//       console.log(`[PURCHASE-DATA][${VERSION}] Insufficient balance - required:`, totalAmount, "available:", currentBalance);
//       // Release lock so user can retry after topping up
//       await supabaseAdmin.from("transactions").delete().eq("reference", reference);
//       lockCreated = false;
//       return new Response(
//         JSON.stringify({
//           error: "Insufficient wallet balance",
//           required: totalAmount,
//           available: currentBalance,
//           _version: VERSION,
//         }),
//         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     // ── Atomic wallet debit ───────────────────────────────────────────────
//     let newBalance: number;

//     console.log(`[PURCHASE-DATA][${VERSION}] ========================================`);
//     console.log(`[PURCHASE-DATA][${VERSION}] Initiating atomic wallet debit via DB RPC`);
//     console.log(`[PURCHASE-DATA][${VERSION}] User ID:`, userId);
//     console.log(`[PURCHASE-DATA][${VERSION}] Debit amount:`, totalAmount);

//     try {
//       const { data, error } = await supabaseAdmin.rpc("debit_wallet", {
//         _user_id: userId,
//         _amount: totalAmount,
//       });

//       if (error) {
//         console.error(`[PURCHASE-DATA][${VERSION}] Wallet debit RPC error:`, error.message);
//         throw error;
//       }

//       newBalance = data;
//       console.log(`[PURCHASE-DATA][${VERSION}] ✓ Wallet debit successful`);
//       console.log(`[PURCHASE-DATA][${VERSION}] New wallet balance:`, newBalance);
//     } catch (err) {
//       const errMsg = err instanceof Error ? err.message : String(err);

//       console.error(`[PURCHASE-DATA][${VERSION}] ✗ Wallet debit failed`);
//       console.error(`[PURCHASE-DATA][${VERSION}] Error message:`, errMsg);

//       // Release idempotency lock so user can retry
//       await supabaseAdmin.from("transactions").delete().eq("reference", reference);
//       lockCreated = false;

//       if (errMsg.includes("INSUFFICIENT_FUNDS")) {
//         console.warn(`[PURCHASE-DATA][${VERSION}] Insufficient wallet balance detected`);
//         return new Response(
//           JSON.stringify({
//             error: "Insufficient wallet balance",
//             required: totalAmount,
//             _version: VERSION,
//           }),
//           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }

//       console.error(`[PURCHASE-DATA][${VERSION}] Unexpected wallet debit error — rethrowing`);
//       throw err;
//     }

//     console.log(`[PURCHASE-DATA][${VERSION}] ========================================`);

//     // ── Process each purchase item through the external API ───────────────
//     const deliveryResults: {
//       network: string;
//       package_name: string;
//       data_amount: string;
//       beneficiary_phone: string;
//       quantity: number;
//       status: "success" | "failed";
//       provider_reference?: string;
//       error?: string;
//     }[] = [];

//     let allSuccessful = true;
//     let failedAmount = 0;

//     console.log(`[PURCHASE-DATA][${VERSION}] Starting API calls to Agyengosoln...`);

//     for (const detail of purchaseDetails) {
//       const dataAmountMB = parseDataAmountToMB(detail.tier.data_amount);
//       console.log(`[PURCHASE-DATA][${VERSION}] Processing: ${detail.tier.network} ${detail.tier.data_amount} (${dataAmountMB}MB) x${detail.quantity}`);

//       for (let i = 0; i < detail.quantity; i++) {
//         const itemRef = `${reference}-${detail.tier.network}-${i}`;

//         // ── Duplicate detection (SCOPED to last DUPLICATE_WINDOW_MINUTES) ──
//         // FIX: wasRecentlyDelivered() always applies the time window filter.
//         // The old code had .gte() commented out, which scanned ALL history and
//         // permanently blocked re-purchase of the same phone+network+data combo.
//         const isDuplicate = await wasRecentlyDelivered(
//           supabaseAdmin,
//           userId,
//           detail.phone,
//           detail.tier.network,
//           detail.tier.data_amount
//         );

//         let result: { success: boolean; message: string; transactionCode?: string };

//         if (isDuplicate) {
//           result = {
//             success: false,
//             message: `This package was already sent to ${detail.phone} within the last ${DUPLICATE_WINDOW_MINUTES} minutes. Please wait before re-purchasing.`,
//           };
//           console.log(`[PURCHASE-DATA][${VERSION}] Skipping API call due to recent duplicate`);
//         } else {
//           result = await purchaseDataFromProvider(
//             agyengosApiKey,
//             detail.phone,
//             detail.tier.network,
//             dataAmountMB,
//             itemRef
//           );
//         }

//         if (result.success) {
//           deliveryResults.push({
//             network: detail.tier.network,
//             package_name: detail.tier.package_name,
//             data_amount: detail.tier.data_amount,
//             beneficiary_phone: detail.phone,
//             quantity: 1,
//             status: "success",
//             provider_reference: result.transactionCode,
//           });
//         } else {
//           // Special handling for provider-side duplicate detection
//           if (result.message?.toLowerCase().includes("duplicate")) {
//             // Check with a slightly wider window (10 min) to see if data was
//             // actually delivered by a previous request we may not have recorded yet
//             const alreadyDelivered = await wasRecentlyDelivered(
//               supabaseAdmin,
//               userId,
//               detail.phone,
//               detail.tier.network,
//               detail.tier.data_amount,
//               10 // 10-minute window for provider duplicate cross-check
//             );

//             if (alreadyDelivered) {
//               // Treat as success since data was likely already delivered
//               console.log(`[PURCHASE-DATA][${VERSION}] Provider duplicate confirmed as already-delivered — treating as success`);
//               deliveryResults.push({
//                 network: detail.tier.network,
//                 package_name: detail.tier.package_name,
//                 data_amount: detail.tier.data_amount,
//                 beneficiary_phone: detail.phone,
//                 quantity: 1,
//                 status: "success",
//                 provider_reference: "duplicate-detected-but-delivered",
//               });
//             } else {
//               allSuccessful = false;
//               failedAmount += Number(detail.tier.price);
//               deliveryResults.push({
//                 network: detail.tier.network,
//                 package_name: detail.tier.package_name,
//                 data_amount: detail.tier.data_amount,
//                 beneficiary_phone: detail.phone,
//                 quantity: 1,
//                 status: "failed",
//                 error: result.message || "Duplicate order detected by provider",
//               });
//             }
//           } else {
//             allSuccessful = false;
//             failedAmount += Number(detail.tier.price);
//             deliveryResults.push({
//               network: detail.tier.network,
//               package_name: detail.tier.package_name,
//               data_amount: detail.tier.data_amount,
//               beneficiary_phone: detail.phone,
//               quantity: 1,
//               status: "failed",
//               error: result.message,
//             });
//           }
//         }
//       }
//     }

//     console.log(`[PURCHASE-DATA][${VERSION}] All API calls complete`);
//     console.log(`[PURCHASE-DATA][${VERSION}] All successful:`, allSuccessful);
//     console.log(`[PURCHASE-DATA][${VERSION}] Failed amount:`, failedAmount);
//     console.log(`[PURCHASE-DATA][${VERSION}] Delivery results:`, JSON.stringify(deliveryResults));

//     // ── Refund failed items ───────────────────────────────────────────────
//     if (failedAmount > 0) {
//       console.log(`[PURCHASE-DATA][${VERSION}] Refunding ${failedAmount} via atomic RPC`);

//       const { error: refundError } = await supabaseAdmin.rpc("credit_wallet", {
//         _user_id: userId,
//         _amount: failedAmount,
//       });

//       if (refundError) {
//         console.error(`[PURCHASE-DATA][${VERSION}] Refund RPC failed:`, refundError.message);
//       } else {
//         console.log(`[PURCHASE-DATA][${VERSION}] Refund successful`);
//       }
//     }

//     const finalBalance = newBalance + failedAmount;
//     const successfulAmount = totalAmount - failedAmount;
//     const successfulItemsForTx = deliveryResults.filter((r) => r.status === "success");
//     const failedItems = deliveryResults.filter((r) => r.status === "failed");
//     const transactionStatus = successfulItemsForTx.length > 0 ? "success" : "failed";

//     console.log(`[PURCHASE-DATA][${VERSION}] Final balance:`, finalBalance);
//     console.log(`[PURCHASE-DATA][${VERSION}] Successful amount:`, successfulAmount);
//     console.log(`[PURCHASE-DATA][${VERSION}] Updating transaction record with status: ${transactionStatus}`);

//     if (transactionStatus === "failed") {
//       // ── KEY FIX: Delete the lock on total failure ──────────────────────
//       // If every item failed, remove the transaction row entirely so the user
//       // is NOT permanently blocked. The frontend generates a fresh UUID per
//       // attempt, so deleting here means the next click works cleanly.
//       // Without this, a failed attempt leaves a row with the old UUID that
//       // would forever return "Already processed" on any retry using that key.
//       console.log(`[PURCHASE-DATA][${VERSION}] All items failed — deleting idempotency lock so user can retry freely`);
//       await supabaseAdmin.from("transactions").delete().eq("reference", reference);
//       lockCreated = false;
//     } else {
//       // Partial or full success — update the pending record with final result
//       const { error: txError } = await supabaseAdmin
//         .from("transactions")
//         .update({
//           amount: successfulAmount,
//           status: transactionStatus,
//           metadata: {
//             items: deliveryResults,
//             total_requested: totalAmount,
//             total_charged: successfulAmount,
//             refunded: failedAmount,
//             partial_success:
//               successfulItemsForTx.length > 0 &&
//               successfulItemsForTx.length < deliveryResults.length,
//           },
//         })
//         .eq("reference", reference);

//       if (txError) {
//         console.log(`[PURCHASE-DATA][${VERSION}] Transaction update error:`, txError.message);
//       } else {
//         console.log(`[PURCHASE-DATA][${VERSION}] Transaction record updated`);
//       }
//     }

//     // ── Referrer commission (only on successful amounts) ──────────────────
//     if (successfulAmount > 0) {
//       try {
//         console.log(`[PURCHASE-DATA][${VERSION}] Crediting referrer commission...`);
//         await supabaseAdmin.rpc("credit_referrer_commission", {
//           _user_id: userId,
//           _amount: successfulAmount,
//         });
//         console.log(`[PURCHASE-DATA][${VERSION}] Referrer commission credited`);
//       } catch (refErr) {
//         console.log(`[PURCHASE-DATA][${VERSION}] Referrer commission error (non-fatal):`, refErr);
//       }
//     }

//     // ── Build response ────────────────────────────────────────────────────
//     const successfulItems = deliveryResults.filter((r) => r.status === "success");

//     let message = "";
//     if (allSuccessful) {
//       message = `Successfully purchased ${successfulItems.length} data package(s)`;
//     } else if (successfulItems.length > 0) {
//       message = `Partially completed: ${successfulItems.length} succeeded, ${failedItems.length} failed`;
//     } else {
//       message = `All purchases failed. Amount refunded to wallet.`;
//     }

//     const response = {
//       success: successfulItems.length > 0,
//       message,
//       total_charged: successfulAmount,
//       refunded: failedAmount,
//       new_balance: finalBalance,
//       results: deliveryResults,
//       _version: VERSION,
//     };

//     console.log(`[PURCHASE-DATA][${VERSION}] ========================================`);
//     console.log(`[PURCHASE-DATA][${VERSION}] Request complete`);
//     console.log(`[PURCHASE-DATA][${VERSION}] Response:`, JSON.stringify(response));
//     console.log(`[PURCHASE-DATA][${VERSION}] ========================================`);

//     return new Response(
//       JSON.stringify(response),
//       {
//         status: allSuccessful ? 200 : (successfulItems.length > 0 ? 207 : 400),
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       }
//     );

//   } catch (error) {
//     console.error(`[PURCHASE-DATA][${VERSION}] ========================================`);
//     console.error(`[PURCHASE-DATA][${VERSION}] UNHANDLED ERROR`);
//     console.error(`[PURCHASE-DATA][${VERSION}] Error:`, error);
//     console.error(`[PURCHASE-DATA][${VERSION}] Error type:`, error instanceof Error ? error.constructor.name : typeof error);
//     console.error(`[PURCHASE-DATA][${VERSION}] Error message:`, error instanceof Error ? error.message : String(error));
//     console.error(`[PURCHASE-DATA][${VERSION}] Error stack:`, error instanceof Error ? error.stack : "N/A");
//     console.error(`[PURCHASE-DATA][${VERSION}] ========================================`);

//     // ── Cleanup: release the pending lock so the user is never permanently stuck ──
//     if (reference && lockCreated) {
//       try {
//         await createClient(
//           Deno.env.get("SUPABASE_URL")!,
//           Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
//         )
//           .from("transactions")
//           .delete()
//           .eq("reference", reference)
//           .eq("status", "pending");
//         console.log(`[PURCHASE-DATA][${VERSION}] Idempotency lock released after unhandled error`);
//       } catch (cleanupErr) {
//         console.error(`[PURCHASE-DATA][${VERSION}] Failed to release lock during error cleanup:`, cleanupErr);
//       }
//     }

//     return new Response(
//       JSON.stringify({
//         error: "Internal server error",
//         details: error instanceof Error ? error.message : String(error),
//         _version: VERSION,
//       }),
//       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//     );
//   }
// });





/// <reference path="../deno.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// VERSION LOGGING - Update this on each deployment to verify correct version is running
const VERSION = "idencreative-v2.0.0";
const DEPLOYED_AT = new Date().toISOString();

console.log(`[PURCHASE-DATA] ========================================`);
console.log(`[PURCHASE-DATA] Edge Function Starting`);
console.log(`[PURCHASE-DATA] Version: ${VERSION}`);
console.log(`[PURCHASE-DATA] Deployed at: ${DEPLOYED_AT}`);
console.log(`[PURCHASE-DATA] ========================================`);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Agyengosoln API configuration
const AGYENGOSOLN_API_URL = "https://agyengosoln.com/api/v1";

// AUTHORITATIVE Network ID Mapping from Agyengosoln API
// Ishare (AirtelTigo) = 1, Telecel = 2, MTN = 3, BigTime = 4
const NETWORK_ID_MAP: Record<string, number> = {
  // MTN variants
  "MTN": 3,
  "MTNAFA": 3,       // MTN_AFA normalises to MTNAFA

  // AirtelTigo / iShare variants (60-day expiry) → provider ID 1
  "ATISHARE": 1,     // AT_iShare normalises to ATISHARE
  "ISHARE": 1,       // legacy alias
  "AIRTELTIGO": 1,   // legacy alias

  // AirtelTigo BigTime (non-expiry) → provider ID 4
  "ATBIGTIME": 4,    // AT_BigTime normalises to ATBIGTIME
  "BIGTIME": 4,      // legacy alias

  // Telecel
  "TELECEL": 2,
};

// Normalize network name for consistent lookup
function normalizeNetwork(network: string): string {
  return network.replace(/[\s_-]/g, "").toUpperCase();
}

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

  console.error(`[PURCHASE-DATA][${VERSION}] Could not parse data amount:`, dataAmount);
  return 0;
}

// Validate MB value is valid for the provider
function validateMBAmount(dataAmountMB: number): { valid: boolean; message?: string } {
  if (dataAmountMB <= 0) {
    return { valid: false, message: `Invalid data amount: ${dataAmountMB}MB (must be positive)` };
  }
  if (dataAmountMB % 100 !== 0) {
    console.warn(`[PURCHASE-DATA][${VERSION}] Warning: ${dataAmountMB}MB may not be a standard bundle size`);
  }
  return { valid: true };
}

// Format phone number for API (ensure 10 digits starting with 0)
function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("233") && cleaned.length === 12) {
    cleaned = "0" + cleaned.substring(3);
  }

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
  const normalizedNetwork = normalizeNetwork(networkName);
  const networkId = NETWORK_ID_MAP[normalizedNetwork];

  if (!networkId) {
    console.error(`[PURCHASE-DATA][${VERSION}] Unknown network mapping:`, networkName);
    console.error(`[PURCHASE-DATA][${VERSION}] Normalized to:`, normalizedNetwork);
    console.error(`[PURCHASE-DATA][${VERSION}] Available mappings:`, Object.keys(NETWORK_ID_MAP));
    return { success: false, message: `Unknown network: ${networkName}` };
  }

  const mbValidation = validateMBAmount(dataAmountMB);
  if (!mbValidation.valid) {
    console.error(`[PURCHASE-DATA][${VERSION}] Invalid MB amount:`, dataAmountMB);
    return { success: false, message: mbValidation.message || "Invalid data amount" };
  }

  const formattedPhone = formatPhoneNumber(recipientPhone);

  console.log(`[PURCHASE-DATA][${VERSION}] ================== API CALL START ==================`);
  console.log(`[PURCHASE-DATA][${VERSION}] Recipient phone (raw):`, recipientPhone);
  console.log(`[PURCHASE-DATA][${VERSION}] Recipient phone (formatted):`, formattedPhone);
  console.log(`[PURCHASE-DATA][${VERSION}] Network name (raw):`, networkName);
  console.log(`[PURCHASE-DATA][${VERSION}] Network name (normalized):`, normalizedNetwork);
  console.log(`[PURCHASE-DATA][${VERSION}] Network ID (provider):`, networkId);
  console.log(`[PURCHASE-DATA][${VERSION}] Data amount (MB):`, dataAmountMB);
  console.log(`[PURCHASE-DATA][${VERSION}] Reference:`, reference);

  const requestBody = {
    recipient_msisdn: formattedPhone,
    network_id: networkId,
    shared_bundle: dataAmountMB,
    incoming_api_ref: reference,
  };

  console.log(`[PURCHASE-DATA][${VERSION}] Request body:`, JSON.stringify(requestBody));

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
    console.log(`[PURCHASE-DATA][${VERSION}] Raw response status:`, response.status);
    console.log(`[PURCHASE-DATA][${VERSION}] Raw response body:`, responseText);

    let data: AgyengosDataResponse;
    try {
      data = JSON.parse(responseText) as AgyengosDataResponse;
    } catch (parseError) {
      console.error(`[PURCHASE-DATA][${VERSION}] Failed to parse response as JSON:`, parseError);
      return {
        success: false,
        message: `Invalid API response: ${responseText.substring(0, 200)}`,
      };
    }

    console.log(`[PURCHASE-DATA][${VERSION}] Parsed response:`, JSON.stringify(data));

    if (response.ok && data.success) {
      console.log(`[PURCHASE-DATA][${VERSION}] ✓ SUCCESS - Data delivered`);
      return {
        success: true,
        message: data.message || "Data delivered successfully",
        transactionCode: data.transaction_code,
      };
    } else {
      console.log(`[PURCHASE-DATA][${VERSION}] ✗ FAILED:`, data.message || `HTTP ${response.status}`);
      return {
        success: false,
        message: data.message || `API error: ${response.status}`,
      };
    }
  } catch (error) {
    console.error(`[PURCHASE-DATA][${VERSION}] ✗ EXCEPTION during API call:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to connect to data provider",
    };
  } finally {
    console.log(`[PURCHASE-DATA][${VERSION}] ================== API CALL END ==================`);
  }
}

Deno.serve(async (req) => {
  console.log(`[PURCHASE-DATA][${VERSION}] ========================================`);
  console.log(`[PURCHASE-DATA][${VERSION}] Request received at ${new Date().toISOString()}`);
  console.log(`[PURCHASE-DATA][${VERSION}] Method:`, req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Track reference and lock state for cleanup on unexpected failure
  let reference: string | null = null;
  let lockCreated = false;
  let walletDebited = false;
  let totalAmountDebited = 0;
  let userId: string | null = null;
  let supabaseAdmin: any = null;

  try {
    // ── Environment variables ────────────────────────────────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const agyengosApiKey = Deno.env.get("AGYENGOSOLN_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey || !agyengosApiKey) {
      const missing = [
        !supabaseUrl && "SUPABASE_URL",
        !supabaseServiceKey && "SUPABASE_SERVICE_ROLE_KEY",
        !supabaseAnonKey && "SUPABASE_ANON_KEY",
        !agyengosApiKey && "AGYENGOSOLN_API_KEY",
      ].filter(Boolean).join(", ");
      console.error(`[PURCHASE-DATA][${VERSION}] Missing env vars: ${missing}`);
      return new Response(
        JSON.stringify({ error: `Server misconfiguration: ${missing} missing`, _version: VERSION }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Auth ─────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", _version: VERSION }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: userError?.message, _version: VERSION }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    userId = user.id;
    console.log(`[PURCHASE-DATA][${VERSION}] Processing purchase for user:`, userId);

    // ── Parse request body ───────────────────────────────────────────────
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body", _version: VERSION }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    reference = body.idempotency_key || body.reference;
    if (!reference) {
      return new Response(
        JSON.stringify({ error: "Missing reference (idempotency key)", _version: VERSION }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[PURCHASE-DATA][${VERSION}] Idempotency reference:`, reference);

    const isBulkPurchase = Array.isArray(body.cart_items);
    let purchaseItems: { pricing_tier_id: string; beneficiary_phone: string; quantity: number }[] = [];

    if (isBulkPurchase) {
      const { cart_items } = body as CartCheckoutRequest;
      if (!cart_items || cart_items.length === 0) {
        return new Response(
          JSON.stringify({ error: "Cart is empty", _version: VERSION }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      purchaseItems = cart_items;
    } else {
      const { pricing_tier_id, beneficiary_phone, quantity = 1 } = body as PurchaseRequest;
      if (!pricing_tier_id || !beneficiary_phone) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: pricing_tier_id, beneficiary_phone", _version: VERSION }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      purchaseItems = [{ pricing_tier_id, beneficiary_phone, quantity }];
    }

    // ── User role ─────────────────────────────────────────────────────────
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch user role", _version: VERSION }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userRole = roleData.role;

    // ── Pricing tiers ─────────────────────────────────────────────────────
    const tierIds = purchaseItems.map((item) => item.pricing_tier_id);
    const { data: tiers, error: tiersError } = await supabaseAdmin
      .from("pricing_tiers")
      .select("*")
      .in("id", tierIds)
      .eq("is_active", true);

    if (tiersError || !tiers) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch pricing tiers", _version: VERSION }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    interface PricingTierRow {
      id: string;
      role: string;
      network: string;
      package_name: string;
      data_amount: string;
      price: number | string;
      is_active: boolean;
      [key: string]: unknown;
    }

    const tierMap = new Map<string, PricingTierRow>(
      (tiers as PricingTierRow[]).map((t) => [t.id, t])
    );
    let totalAmount = 0;
    const purchaseDetails: { tier: PricingTierRow; phone: string; quantity: number }[] = [];

    for (const item of purchaseItems) {
      const tier = tierMap.get(item.pricing_tier_id);
      if (!tier) {
        return new Response(
          JSON.stringify({ error: `Invalid or inactive pricing tier: ${item.pricing_tier_id}`, _version: VERSION }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (tier.role !== userRole) {
        return new Response(
          JSON.stringify({ error: `Pricing tier ${tier.package_name} is not available for your role`, _version: VERSION }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      totalAmount += Number(tier.price) * item.quantity;
      purchaseDetails.push({ tier, phone: item.beneficiary_phone, quantity: item.quantity });
    }

    totalAmountDebited = totalAmount;
    console.log(`[PURCHASE-DATA][${VERSION}] Total purchase amount:`, totalAmount);

    // ── Idempotency lock ──────────────────────────────────────────────────
    // Insert a "pending" transaction as a distributed lock.
    // On unique constraint violation, check state of existing record.
    const { error: txInsertError } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: userId,
        type: "purchase",
        amount: totalAmount,
        status: "pending",
        reference,
      })
      .select()
      .single();

    if (txInsertError) {
      if (txInsertError.code === "23505") {
        const { data: existingTx } = await supabaseAdmin
          .from("transactions")
          .select("status, metadata, amount")
          .eq("reference", reference)
          .single() as { data: { status: string; metadata: any; amount: number } | null; error: any };

        if (existingTx?.status === "success") {
          console.log(`[PURCHASE-DATA][${VERSION}] Idempotent replay — already succeeded`);
          return new Response(
            JSON.stringify({
              success: true,
              message: "Already processed",
              reference,
              previous_result: existingTx.metadata,
              _version: VERSION,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (existingTx?.status === "pending") {
          console.log(`[PURCHASE-DATA][${VERSION}] Concurrent request in-flight — returning 409`);
          return new Response(
            JSON.stringify({ error: "Purchase already in progress. Please wait and try again.", _version: VERSION }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Stale "failed" lock — clear and retry
        console.log(`[PURCHASE-DATA][${VERSION}] Stale failed lock — clearing and retrying`);
        await supabaseAdmin.from("transactions").delete().eq("reference", reference);
        const { error: retryError } = await supabaseAdmin
          .from("transactions")
          .insert({ user_id: userId, type: "purchase", amount: totalAmount, status: "pending", reference });
        if (retryError) throw retryError;
      } else {
        throw txInsertError;
      }
    }

    lockCreated = true;
    console.log(`[PURCHASE-DATA][${VERSION}] Transaction lock created`);

    // ── Wallet balance pre-check ──────────────────────────────────────────
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("id, balance")
      .eq("user_id", userId)
      .single();

    if (walletError || !wallet) {
      await supabaseAdmin.from("transactions").delete().eq("reference", reference);
      lockCreated = false;
      return new Response(
        JSON.stringify({ error: "Failed to fetch wallet", _version: VERSION }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currentBalance = Number(wallet.balance);
    if (currentBalance < totalAmount) {
      await supabaseAdmin.from("transactions").delete().eq("reference", reference);
      lockCreated = false;
      return new Response(
        JSON.stringify({
          error: "Insufficient wallet balance",
          required: totalAmount,
          available: currentBalance,
          _version: VERSION,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Atomic wallet debit ───────────────────────────────────────────────
    let newBalance: number;
    try {
      const { data: debitData, error: debitError } = await supabaseAdmin.rpc("debit_wallet", {
        _user_id: userId,
        _amount: totalAmount,
      });

      if (debitError) throw debitError;

      newBalance = debitData;
      walletDebited = true;
      console.log(`[PURCHASE-DATA][${VERSION}] ✓ Wallet debited. New balance:`, newBalance);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      await supabaseAdmin.from("transactions").delete().eq("reference", reference);
      lockCreated = false;

      if (errMsg.includes("INSUFFICIENT_FUNDS")) {
        return new Response(
          JSON.stringify({ error: "Insufficient wallet balance", required: totalAmount, _version: VERSION }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw err;
    }

    // ── Process each purchase item ────────────────────────────────────────
    // FIX #2: itemRef is now globally unique per item using a global counter
    // that spans across all purchaseDetails entries and all quantities.
    // This prevents itemRef collisions when multiple cart items share the same network.
    // Format: {reference}-{itemIndex}-{network}-{phone_last4}-{dataMB}
    // This makes each ref human-readable in provider logs AND collision-proof.

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
    let globalItemIndex = 0; // FIX #2: single counter across ALL items and quantities

    for (const detail of purchaseDetails) {
      const dataAmountMB = parseDataAmountToMB(detail.tier.data_amount);
      const phoneLast4 = detail.phone.slice(-4);

      for (let q = 0; q < detail.quantity; q++) {
        globalItemIndex++;

        // FIX #2: Each item gets a fully unique ref that includes index, network,
        // phone suffix, and MB — guaranteed no collisions even across same-network items.
        const itemRef = `${reference}-${globalItemIndex}-${normalizeNetwork(detail.tier.network)}-${phoneLast4}-${dataAmountMB}`;

        console.log(`[PURCHASE-DATA][${VERSION}] Processing item ${globalItemIndex}: ${detail.tier.network} ${detail.tier.data_amount} → ${detail.phone} | ref: ${itemRef}`);

        // FIX #3 + FIX #4: Remove wasRecentlyDelivered() pre-check entirely.
        // Rationale:
        //   - Our own 5-min window was blocking legitimate reseller re-purchases.
        //   - The provider has its own idempotency via incoming_api_ref.
        //   - Since every itemRef is now globally unique (includes globalItemIndex),
        //     the provider will NEVER see our ref as a duplicate — so provider-side
        //     duplicate errors from our refs are eliminated.
        //   - If the provider returns a duplicate error for any other reason,
        //     we surface it clearly to the user without guessing.
        //   - The only real duplicate protection needed is the idempotency lock
        //     on the transaction record (already in place above), which prevents
        //     the same frontend request UUID from being processed twice.

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
          console.log(`[PURCHASE-DATA][${VERSION}] Item ${globalItemIndex} failed:`, result.message);
        }
      }
    }

    console.log(`[PURCHASE-DATA][${VERSION}] All API calls complete. allSuccessful:`, allSuccessful, "failedAmount:", failedAmount);

    // ── Refund failed items ───────────────────────────────────────────────
    if (failedAmount > 0) {
      console.log(`[PURCHASE-DATA][${VERSION}] Refunding ${failedAmount} for failed items`);
      const { error: refundError } = await supabaseAdmin.rpc("credit_wallet", {
        _user_id: userId,
        _amount: failedAmount,
      });
      if (refundError) {
        console.error(`[PURCHASE-DATA][${VERSION}] Refund failed! Manual intervention required. userId:`, userId, "amount:", failedAmount);
      } else {
        console.log(`[PURCHASE-DATA][${VERSION}] Refund successful`);
      }
    }

    const finalBalance = newBalance + failedAmount;
    const successfulAmount = totalAmount - failedAmount;
    const successfulItems = deliveryResults.filter((r) => r.status === "success");
    const failedItems = deliveryResults.filter((r) => r.status === "failed");
    const transactionStatus = successfulItems.length > 0 ? "success" : "failed";

    // FIX #6: Always keep a transaction record — even for fully failed purchases.
    // Instead of deleting on total failure, mark it as "failed" with metadata.
    // This preserves the audit trail for admins while still allowing retry
    // (the frontend generates a fresh UUID on every click, so the next attempt
    // will create a new transaction row — not hit this old "failed" one).
    const { error: txUpdateError } = await supabaseAdmin
      .from("transactions")
      .update({
        amount: successfulAmount,
        status: transactionStatus,
        metadata: {
          items: deliveryResults,
          total_requested: totalAmount,
          total_charged: successfulAmount,
          refunded: failedAmount,
          partial_success: successfulItems.length > 0 && failedItems.length > 0,
        },
      })
      .eq("reference", reference);

    if (txUpdateError) {
      console.error(`[PURCHASE-DATA][${VERSION}] Transaction update error:`, txUpdateError.message);
    } else {
      console.log(`[PURCHASE-DATA][${VERSION}] Transaction record updated with status: ${transactionStatus}`);
    }

    lockCreated = false; // Lock is now settled (success or failed), not "pending"

    // ── Referrer commission (only on successful amounts) ──────────────────
    if (successfulAmount > 0) {
      try {
        await supabaseAdmin.rpc("credit_referrer_commission", {
          _user_id: userId,
          _amount: successfulAmount,
        });
        console.log(`[PURCHASE-DATA][${VERSION}] Referrer commission credited`);
      } catch (refErr) {
        console.log(`[PURCHASE-DATA][${VERSION}] Referrer commission error (non-fatal):`, refErr);
      }
    }

    // ── Build response ────────────────────────────────────────────────────
    let message = "";
    if (allSuccessful) {
      message = `Successfully purchased ${successfulItems.length} data package(s)`;
    } else if (successfulItems.length > 0) {
      message = `Partially completed: ${successfulItems.length} succeeded, ${failedItems.length} failed`;
    } else {
      message = `All purchases failed. Amount refunded to wallet.`;
    }

    // FIX #5: Include `reference` in the response so the frontend can display it in toasts
    const response = {
      success: successfulItems.length > 0,
      message,
      reference,                      // ← FIX #5: was missing, toasts always showed no ref
      total_charged: successfulAmount,
      refunded: failedAmount,
      new_balance: finalBalance,
      results: deliveryResults,
      _version: VERSION,
    };

    console.log(`[PURCHASE-DATA][${VERSION}] Request complete. Response:`, JSON.stringify(response));

    return new Response(
      JSON.stringify(response),
      {
        status: allSuccessful ? 200 : (successfulItems.length > 0 ? 207 : 400),
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error(`[PURCHASE-DATA][${VERSION}] UNHANDLED ERROR:`, error);
    console.error(`[PURCHASE-DATA][${VERSION}] Error message:`, error instanceof Error ? error.message : String(error));
    console.error(`[PURCHASE-DATA][${VERSION}] Stack:`, error instanceof Error ? error.stack : "N/A");

    // ── FIX #7: Crash-safe cleanup ────────────────────────────────────────
    // If the wallet was debited but we crashed before completing the API calls
    // or updating the transaction, we must refund the full amount so the user
    // is never left with a debited wallet and no data delivered.
    if (supabaseAdmin && userId) {
      // Step 1: Attempt full refund if wallet was debited but we never finished
      if (walletDebited && totalAmountDebited > 0) {
        try {
          await supabaseAdmin.rpc("credit_wallet", {
            _user_id: userId,
            _amount: totalAmountDebited,
          });
          console.log(`[PURCHASE-DATA][${VERSION}] ✓ Crash-safe refund issued for ${totalAmountDebited}`);
        } catch (refundErr) {
          console.error(`[PURCHASE-DATA][${VERSION}] ✗ CRITICAL: Crash-safe refund FAILED. Manual action required for user ${userId}, amount ${totalAmountDebited}`, refundErr);
        }
      }

      // Step 2: Mark the idempotency lock as "failed" (not deleted) for audit trail,
      // but only if the lock was still in "pending" state (i.e. never settled).
      if (reference && lockCreated) {
        try {
          await supabaseAdmin
            .from("transactions")
            .update({
              status: "failed",
              metadata: {
                error: error instanceof Error ? error.message : String(error),
                crash_refund_issued: walletDebited,
                crash_refund_amount: walletDebited ? totalAmountDebited : 0,
              },
            })
            .eq("reference", reference)
            .eq("status", "pending");
          console.log(`[PURCHASE-DATA][${VERSION}] Idempotency lock marked as failed after crash`);
        } catch (cleanupErr) {
          console.error(`[PURCHASE-DATA][${VERSION}] Failed to update lock after crash:`, cleanupErr);
        }
      }
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
        _version: VERSION,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});