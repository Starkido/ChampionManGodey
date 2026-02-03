// SMS Templates for different notification types

export const SMS_TEMPLATES = {
  WALLET_FUNDED: (amount: number) =>
    `Your wallet has been credited with GHS ${amount.toFixed(2)}. Thank you for using ChampionGodey!`,

  DATA_PURCHASE_SUCCESS: (dataAmount: string, network: string, phone: string) =>
    `Your ${dataAmount} ${network} data bundle has been sent to ${phone}. Thank you for using ChampionGodey!`,

  DATA_PURCHASE_FAILED: (dataAmount: string, network: string) =>
    `Your ${dataAmount} ${network} data purchase failed. Amount has been refunded to your wallet. Contact support if issue persists.`,

  REFERRAL_COMMISSION: (amount: number, referredName: string) =>
    `You earned GHS ${amount.toFixed(2)} commission from ${referredName}'s purchase! Keep referring to earn more.`,

  WITHDRAWAL_APPROVED: (amount: number, phone: string) =>
    `Your withdrawal of GHS ${amount.toFixed(2)} to ${phone} has been approved and is being processed.`,

  WITHDRAWAL_REJECTED: (amount: number, reason: string) =>
    `Your withdrawal request for GHS ${amount.toFixed(2)} was rejected. Reason: ${reason}. Amount refunded to wallet.`,

  MANUAL_FUNDING_APPROVED: (amount: number) =>
    `Your manual funding request for GHS ${amount.toFixed(2)} has been approved. Your wallet has been credited.`,

  MANUAL_FUNDING_REJECTED: (amount: number, reason: string) =>
    `Your manual funding request for GHS ${amount.toFixed(2)} was rejected. Reason: ${reason}.`,

  NEW_REFERRAL: (referredName: string) =>
    `Good news! ${referredName} just signed up using your referral code. You'll earn commission on their purchases!`,
};

// Helper to send SMS via edge function
export async function sendSMS(
  supabaseUrl: string,
  supabaseServiceKey: string,
  to: string,
  message: string
): Promise<boolean> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ to, message }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return false;
  }
}
