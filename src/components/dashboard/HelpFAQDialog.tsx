import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface HelpFAQDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const faqItems = [
  {
    question: "How do I buy data?",
    answer:
      "Navigate to 'Buy Data' from the sidebar, select your network, choose a data package, enter the recipient phone number, and confirm your purchase. The amount will be deducted from your wallet balance.",
  },
  {
    question: "How do I fund my wallet?",
    answer:
      "Click on 'Fund Wallet' from the dashboard or sidebar. Enter the amount you want to add and complete the payment through Paystack. Your wallet will be credited immediately after successful payment.",
  },
  {
    question: "What are the different user tiers?",
    answer:
      "We have multiple tiers: Client (standard pricing), Basic Agent, Master Agent, Premier Agent, and Elite Agent. Each tier offers progressively better pricing on data packages. Contact support to upgrade your tier.",
  },
  {
    question: "How does the referral program work?",
    answer:
      "Share your unique referral code with friends. When they sign up and make their first purchase, you earn a commission credited to your wallet. View your referrals and earnings in the 'Referrals' section.",
  },
  {
    question: "Why is my data purchase pending?",
    answer:
      "Purchases are usually instant, but occasionally there may be network delays. If your purchase shows 'pending' for more than 10 minutes, please contact support with your transaction reference.",
  },
  {
    question: "How do I check my transaction history?",
    answer:
      "Go to 'Transactions' from the sidebar to view all your wallet funding and data purchase history. You can filter by type and date to find specific transactions.",
  },
  {
    question: "Can I get a refund for failed purchases?",
    answer:
      "Yes, failed purchases are automatically refunded to your wallet. If you don't see the refund within 24 hours, please contact support with your transaction details.",
  },
  {
    question: "How do I update my profile information?",
    answer:
      "Navigate to 'Settings' from the sidebar. You can update your name, phone number, and password. Make sure to save your changes after editing.",
  },
];

export const HelpFAQDialog = ({ open, onOpenChange }: HelpFAQDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">
            Help & Frequently Asked Questions
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Can't find what you're looking for? Contact our support team via
              WhatsApp for immediate assistance.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
