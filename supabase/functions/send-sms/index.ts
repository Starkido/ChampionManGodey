/// <reference path="../deno.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  to: string;
  message: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const arkeselApiKey = Deno.env.get("ARKESEL_API_KEY");
    if (!arkeselApiKey) {
      console.error("ARKESEL_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "SMS service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { to, message }: SMSRequest = await req.json();

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: "Phone number and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format phone number for Ghana (remove leading 0, add 233)
    let formattedPhone = to.replace(/\s+/g, "").replace(/^0/, "");
    if (!formattedPhone.startsWith("233")) {
      formattedPhone = "233" + formattedPhone;
    }

    console.log(`Sending SMS to ${formattedPhone}: ${message.substring(0, 50)}...`);

    // Arkesel SMS API v2
    const response = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
      method: "POST",
      headers: {
        "api-key": arkeselApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: "Champion", // Your sender ID (max 11 chars)
        message: message,
        recipients: [formattedPhone],
      }),
    });

    const responseText = await response.text();
    console.log(`Arkesel response status: ${response.status}`);
    console.log(`Arkesel response: ${responseText}`);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { raw: responseText };
    }

    if (!response.ok) {
      console.error("Arkesel SMS failed:", data);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to send SMS",
          details: data 
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("SMS sent successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "SMS sent successfully",
        data,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("SMS error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Failed to send SMS", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
