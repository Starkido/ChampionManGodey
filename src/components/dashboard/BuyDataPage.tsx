// import { useState } from "react";
// import { User } from "@supabase/supabase-js";
// import { NetworkBadge } from "@/components/NetworkBadge";
// import { TierBadge } from "@/components/TierBadge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { usePricingTiers } from "@/hooks/usePricingTiers";
// import { useCart } from "@/hooks/useCart";
// import { supabase } from "@/integrations/supabase/client";
// import { Database } from "@/integrations/supabase/types";
// import { toast } from "sonner";
// import { ShoppingCart, Smartphone, Check, Loader2, Trash2, Minus, Plus } from "lucide-react";
// import { cn } from "@/lib/utils";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";

// const generateIdempotencyKey = () =>
//   crypto.randomUUID();

// type AppRole = Database["public"]["Enums"]["app_role"];
// type Network = "MTN" | "Airtel" | "Telecel" | "MTN_AFA";

// interface BuyDataPageProps {
//   user: User;
//   userRole: AppRole;
//   walletBalance: number;
//   onPurchaseComplete?: () => void;
// }

// const networks: { id: Network; label: string }[] = [
//   { id: "MTN", label: "MTN" },
//   { id: "Airtel", label: "Airtel" },
//   { id: "Telecel", label: "Telecel" },
//   { id: "MTN_AFA", label: "MTN AFA" },
// ];

// export const BuyDataPage = ({ user, userRole, walletBalance, onPurchaseComplete }: BuyDataPageProps) => {
//   const [selectedNetwork, setSelectedNetwork] = useState<Network>("MTN");
//   const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [isPurchasing, setIsPurchasing] = useState(false);
//   const [isCheckingOut, setIsCheckingOut] = useState(false);

//   const { tiers, loading } = usePricingTiers(userRole, selectedNetwork);
//   const { cartItems, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart } = useCart(user.id);

//   const selectedTier = tiers.find((t) => t.id === selectedPackage);

//   const validatePhone = (phone: string): boolean => {
//     const phoneRegex = /^(0[235][0-9]{8}|233[235][0-9]{8})$/;
//     return phoneRegex.test(phone.replace(/\s/g, ""));
//   };

//   const handlePurchase = async () => {
//     if (!selectedPackage || !phoneNumber) {
//       toast.error("Please select a package and enter a phone number");
//       return;
//     }

//     if (!selectedTier) {
//       toast.error("Invalid package selected");
//       return;
//     }

//     if (walletBalance < selectedTier.price) {
//       toast.error("Insufficient wallet balance. Please fund your wallet first.");
//       return;
//     }

//     if (!validatePhone(phoneNumber)) {
//       toast.error("Please enter a valid Ghana phone number");
//       return;
//     }

//     setIsPurchasing(true);

//     // try {
//       // const { data, error } = await supabase.functions.invoke("purchase-data", {
//       //   body: {
//       //     pricing_tier_id: selectedPackage,
//       //     beneficiary_phone: phoneNumber.replace(/\s/g, ""),
//       //     quantity: 1,
//       //   },
//       // });
      
//       try {
//         const idempotencyKey = generateIdempotencyKey();

//         const { data, error } = await supabase.functions.invoke("purchase-data", {
//           body: {
//             idempotency_key: idempotencyKey,
//             pricing_tier_id: selectedPackage,
//             beneficiary_phone: phoneNumber.replace(/\s/g, ""),
//             quantity: 1,
//           },
//         });


//       if (error) {
//         console.error("Purchase error:", error);
//         toast.error("Purchase failed. Please try again.");
//         return;
//       }

//       if (data.error) {
//         toast.error(data.error);
//         return;
//       }

//       // Check if purchase was processed (success or partial success)
//       const wasProcessed = data.success !== false && !data.error;
      
//       if (wasProcessed) {
//         // Show success message
//         const successCount = data.results?.filter((r: any) => r.status === "success").length || 0;
//         const failedCount = data.results?.filter((r: any) => r.status === "failed").length || 0;
        
//         if (successCount > 0 && failedCount === 0) {
//           toast.success(
//             `Purchase successful! ${selectedTier.data_amount} sent to ${phoneNumber}`,
//             { description: data.reference ? `Ref: ${data.reference}` : undefined }
//           );
//         } else if (successCount > 0) {
//           toast.success(
//             `Purchase partially completed! ${successCount} succeeded, ${failedCount} failed.`,
//             { description: data.reference ? `Ref: ${data.reference}` : undefined }
//           );
//         } else {
//           toast.info(
//             `Purchase processed. ${failedCount} item(s) failed. Amount refunded.`,
//             { description: data.reference ? `Ref: ${data.reference}` : undefined }
//           );
//         }

//         // Clear state
//         setSelectedPackage(null);
//         setPhoneNumber("");
//         setSelectedNetwork("MTN");
        
//         // Refresh page after a short delay to show the toast
//         setTimeout(() => {
//           window.location.reload();
//         }, 1500);
//       } else {
//         toast.error("Purchase failed. Please try again.");
//       }
//     } catch (err) {
//       console.error("Purchase error:", err);
//       toast.error("Purchase failed. Please try again.");
//     } finally {
//       setIsPurchasing(false);
//     }
//   };

//   const handleAddToCart = async () => {
//     if (!selectedPackage || !phoneNumber) {
//       toast.error("Please select a package and enter a phone number");
//       return;
//     }

//     if (!validatePhone(phoneNumber)) {
//       toast.error("Please enter a valid Ghana phone number");
//       return;
//     }

//     const success = await addToCart(selectedPackage, phoneNumber.replace(/\s/g, ""));
//     if (success) {
//       toast.success("Added to cart!");
//       setSelectedPackage(null);
//     }
//   };

//   const handleCheckout = async () => {
//     if (cartItems.length === 0) {
//       toast.error("Cart is empty");
//       return;
//     }

//     if (walletBalance < cartTotal) {
//       toast.error("Insufficient wallet balance. Please fund your wallet first.");
//       return;
//     }

//     setIsCheckingOut(true);

//     // try {
//     //   const { data, error } = await supabase.functions.invoke("purchase-data", {
//     //     body: {
//     //       cart_items: cartItems.map((item) => ({
//     //         pricing_tier_id: item.pricing_tier_id,
//     //         beneficiary_phone: item.beneficiary_phone,
//     //         quantity: item.quantity,
//     //       })),
//     //     },
//     //   });

//     try {
//     const idempotencyKey = generateIdempotencyKey();

//     const { data, error } = await supabase.functions.invoke("purchase-data", {
//       body: {
//         idempotency_key: idempotencyKey,
//         cart_items: cartItems.map((item) => ({
//           pricing_tier_id: item.pricing_tier_id,
//           beneficiary_phone: item.beneficiary_phone,
//           quantity: item.quantity,
//         })),
//       },
//     });


//       if (error) {
//         console.error("Checkout error:", error);
//         toast.error("Checkout failed. Please try again.");
//         return;
//       }

//       if (data.error) {
//         toast.error(data.error);
//         return;
//       }

//       // Check if checkout was processed (success or partial success)
//       const wasProcessed = data.success !== false && !data.error;
      
//       if (wasProcessed) {
//         // Show success message
//         const successCount = data.results?.filter((r: any) => r.status === "success").length || 0;
//         const failedCount = data.results?.filter((r: any) => r.status === "failed").length || 0;
        
//         if (successCount > 0 && failedCount === 0) {
//           toast.success("Checkout successful! All data bundles are being processed.", {
//             description: data.reference ? `Ref: ${data.reference}` : undefined,
//           });
//         } else if (successCount > 0) {
//           toast.success(
//             `Checkout partially completed! ${successCount} succeeded, ${failedCount} failed.`,
//             { description: data.reference ? `Ref: ${data.reference}` : undefined }
//           );
//         } else {
//           toast.info(
//             `Checkout processed. ${failedCount} item(s) failed. Amount refunded.`,
//             { description: data.reference ? `Ref: ${data.reference}` : undefined }
//           );
//         }

//         // Clear cart
//         await clearCart();
        
//         // Clear purchase form state
//         setSelectedPackage(null);
//         setPhoneNumber("");
//         setSelectedNetwork("MTN");
        
//         // Refresh page after a short delay to show the toast
//         setTimeout(() => {
//           window.location.reload();
//         }, 1500);
//       } else {
//         toast.error("Checkout failed. Please try again.");
//       }
//     } catch (err) {
//       console.error("Checkout error:", err);
//       toast.error("Checkout failed. Please try again.");
//     } finally {
//       setIsCheckingOut(false);
//     }
//   };

//   return (
//     <div className="p-6 lg:p-8 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
//             Buy Data
//           </h1>
//           <p className="text-muted-foreground mt-1">
//             Purchase data bundles at <TierBadge tier={userRole} size="sm" className="inline-flex ml-1" /> prices
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-border">
//             <span className="text-sm text-muted-foreground">Wallet:</span>
//             <span className="font-semibold text-foreground">GHS {walletBalance.toFixed(2)}</span>
//           </div>

//           {/* Cart Sheet */}
//           <Sheet>
//             <SheetTrigger asChild>
//               <Button variant="outline" className="relative">
//                 <ShoppingCart className="w-4 h-4" />
//                 {cartItems.length > 0 && (
//                   <Badge
//                     className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
//                     variant="default"
//                   >
//                     {cartItems.length}
//                   </Badge>
//                 )}
//               </Button>
//             </SheetTrigger>
//             <SheetContent className="w-full sm:max-w-md">
//               <SheetHeader>
//                 <SheetTitle>Your Cart</SheetTitle>
//               </SheetHeader>

//               <div className="mt-6 space-y-4">
//                 {cartItems.length === 0 ? (
//                   <p className="text-center text-muted-foreground py-8">
//                     Your cart is empty
//                   </p>
//                 ) : (
//                   <>
//                     <div className="space-y-3 max-h-[60vh] overflow-y-auto">
//                       {cartItems.map((item) => (
//                         <div
//                           key={item.id}
//                           className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
//                         >
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center gap-2">
//                               <NetworkBadge network={(item.tier?.network || "MTN") as "MTN" | "Airtel" | "Telecel" | "MTN_AFA"} size="sm" />
//                               <span className="font-medium text-sm truncate">
//                                 {item.tier?.data_amount}
//                               </span>
//                             </div>
//                             <p className="text-xs text-muted-foreground mt-1">
//                               {item.tier?.package_name}
//                             </p>
//                             <p className="text-xs text-muted-foreground">
//                               To: {item.beneficiary_phone}
//                             </p>
//                             <p className="text-sm font-semibold text-primary mt-1">
//                               GHS {((item.tier?.price || 0) * item.quantity).toFixed(2)}
//                             </p>
//                           </div>

//                           <div className="flex flex-col items-end gap-2">
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               className="h-7 w-7"
//                               onClick={() => removeFromCart(item.id)}
//                             >
//                               <Trash2 className="w-4 h-4 text-destructive" />
//                             </Button>
//                             <div className="flex items-center gap-1">
//                               <Button
//                                 variant="outline"
//                                 size="icon"
//                                 className="h-6 w-6"
//                                 onClick={() => updateQuantity(item.id, item.quantity - 1)}
//                               >
//                                 <Minus className="w-3 h-3" />
//                               </Button>
//                               <span className="w-6 text-center text-sm">{item.quantity}</span>
//                               <Button
//                                 variant="outline"
//                                 size="icon"
//                                 className="h-6 w-6"
//                                 onClick={() => updateQuantity(item.id, item.quantity + 1)}
//                               >
//                                 <Plus className="w-3 h-3" />
//                               </Button>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     <Separator />

//                     <div className="space-y-3">
//                       <div className="flex justify-between text-sm">
//                         <span className="text-muted-foreground">Subtotal</span>
//                         <span className="font-semibold">GHS {cartTotal.toFixed(2)}</span>
//                       </div>
//                       <div className="flex justify-between text-sm">
//                         <span className="text-muted-foreground">Wallet Balance</span>
//                         <span className={cn(
//                           "font-semibold",
//                           walletBalance < cartTotal ? "text-destructive" : "text-primary"
//                         )}>
//                           GHS {walletBalance.toFixed(2)}
//                         </span>
//                       </div>

//                       <Button
//                         className="w-full"
//                         variant="gold"
//                         disabled={isCheckingOut || cartItems.length === 0 || walletBalance < cartTotal}
//                         onClick={handleCheckout}
//                       >
//                         {isCheckingOut ? (
//                           <Loader2 className="w-4 h-4 animate-spin" />
//                         ) : walletBalance < cartTotal ? (
//                           "Insufficient Balance"
//                         ) : (
//                           `Checkout - GHS ${cartTotal.toFixed(2)}`
//                         )}
//                       </Button>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </SheetContent>
//           </Sheet>
//         </div>
//       </div>

//       {/* Network Selection */}
//       <Card>
//         <CardHeader className="pb-4">
//           <CardTitle className="text-lg">Select Network</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//             {networks.map((network) => (
//               <button
//                 key={network.id}
//                 onClick={() => {
//                   setSelectedNetwork(network.id);
//                   setSelectedPackage(null);
//                 }}
//                 className={cn(
//                   "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
//                   selectedNetwork === network.id
//                     ? "border-primary bg-primary/5"
//                     : "border-border hover:border-primary/50"
//                 )}
//               >
//                 <NetworkBadge network={network.id} size="lg" />
//                 <span className="text-sm font-medium">{network.label}</span>
//               </button>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Phone Number Input */}
//       <Card>
//         <CardHeader className="pb-4">
//           <CardTitle className="text-lg">Beneficiary Phone Number</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="max-w-md">
//             <Label htmlFor="phone" className="sr-only">Phone Number</Label>
//             <div className="relative">
//               <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
//               <Input
//                 id="phone"
//                 type="tel"
//                 placeholder="e.g., 0241234567"
//                 value={phoneNumber}
//                 onChange={(e) => setPhoneNumber(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//             <p className="text-xs text-muted-foreground mt-2">
//               Enter the phone number to receive the data bundle
//             </p>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Data Packages */}
//       <Card>
//         <CardHeader className="pb-4">
//           <CardTitle className="text-lg">Select Data Package</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <div className="flex items-center justify-center py-12">
//               <Loader2 className="w-8 h-8 animate-spin text-primary" />
//             </div>
//           ) : tiers.length === 0 ? (
//             <div className="text-center py-12 text-muted-foreground">
//               No packages available for this network
//             </div>
//           ) : (
//             <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//               {tiers.map((tier) => (
//                 <button
//                   key={tier.id}
//                   onClick={() => setSelectedPackage(tier.id)}
//                   className={cn(
//                     "p-4 rounded-xl border-2 transition-all text-left relative",
//                     selectedPackage === tier.id
//                       ? "border-primary bg-primary/5"
//                       : "border-border hover:border-primary/50"
//                   )}
//                 >
//                   {selectedPackage === tier.id && (
//                     <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
//                       <Check className="w-4 h-4 text-primary-foreground" />
//                     </div>
//                   )}
//                   <p className="font-display text-2xl font-bold text-foreground">
//                     {tier.data_amount}
//                   </p>
//                   <p className="text-sm text-muted-foreground mt-1">
//                     {tier.package_name}
//                   </p>
//                   <p className="text-lg font-semibold text-primary mt-3">
//                     GHS {Number(tier.price).toFixed(2)}
//                   </p>
//                 </button>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Action Buttons */}
//       {selectedTier && (
//         <div className="flex flex-col sm:flex-row gap-3 p-4 bg-card rounded-xl border border-border">
//           <div className="flex-1">
//             <p className="text-sm text-muted-foreground">Selected Package</p>
//             <p className="font-semibold text-foreground">
//               {selectedTier.data_amount} - {selectedNetwork}
//             </p>
//             <p className="text-primary font-bold">
//               GHS {Number(selectedTier.price).toFixed(2)}
//             </p>
//           </div>
//           <div className="flex gap-3">
//             <Button
//               variant="outline"
//               onClick={handleAddToCart}
//               disabled={!phoneNumber}
//             >
//               <ShoppingCart className="w-4 h-4" />
//               Add to Cart
//             </Button>
//             <Button
//               variant="gold"
//               onClick={handlePurchase}
//               disabled={isPurchasing || !phoneNumber || walletBalance < selectedTier.price}
//             >
//               {isPurchasing ? (
//                 <Loader2 className="w-4 h-4 animate-spin" />
//               ) : (
//                 "Buy Now"
//               )}
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };



import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { NetworkBadge } from "@/components/NetworkBadge";
import { TierBadge } from "@/components/TierBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePricingTiers } from "@/hooks/usePricingTiers";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { ShoppingCart, Smartphone, Check, Loader2, Trash2, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const generateIdempotencyKey = () => crypto.randomUUID();

type AppRole = Database["public"]["Enums"]["app_role"];
type Network = "MTN" | "AT_iShare" | "AT_BigTime" | "Telecel" | "MTN_AFA";

interface BuyDataPageProps {
  user: User;
  userRole: AppRole;
  walletBalance: number;
  onPurchaseComplete?: () => void;
}

const networks: { id: Network; label: string; description?: string }[] = [
  { id: "MTN", label: "MTN" },
  { id: "AT_iShare", label: "AT iShare", description: "60-day expiry" },
  { id: "AT_BigTime", label: "AT BigTime", description: "Non-expiry" },
  { id: "Telecel", label: "Telecel" },
  { id: "MTN_AFA", label: "MTN AFA" },
];

export const BuyDataPage = ({ user, userRole, walletBalance, onPurchaseComplete }: BuyDataPageProps) => {
  const [selectedNetwork, setSelectedNetwork] = useState<Network>("MTN");
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { tiers, loading } = usePricingTiers(userRole, selectedNetwork);
  const { cartItems, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart } = useCart(user.id);

  const selectedTier = tiers.find((t) => t.id === selectedPackage);

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(0[235][0-9]{8}|233[235][0-9]{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const handlePurchase = async () => {
    if (!selectedPackage || !phoneNumber) {
      toast.error("Please select a package and enter a phone number");
      return;
    }

    if (!selectedTier) {
      toast.error("Invalid package selected");
      return;
    }

    if (walletBalance < selectedTier.price) {
      toast.error("Insufficient wallet balance. Please fund your wallet first.");
      return;
    }

    if (!validatePhone(phoneNumber)) {
      toast.error("Please enter a valid Ghana phone number");
      return;
    }

    setIsPurchasing(true);

    try {
      const idempotencyKey = generateIdempotencyKey();

      const { data, error } = await supabase.functions.invoke("purchase-data", {
        body: {
          idempotency_key: idempotencyKey,
          pricing_tier_id: selectedPackage,
          beneficiary_phone: phoneNumber.replace(/\s/g, ""),
          quantity: 1,
        },
      });

      if (error) {
        console.error("Purchase error:", error);
        toast.error("Purchase failed. Please try again.");
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      const wasProcessed = data.success !== false && !data.error;

      if (wasProcessed) {
        const successCount = data.results?.filter((r: any) => r.status === "success").length || 0;
        const failedCount = data.results?.filter((r: any) => r.status === "failed").length || 0;

        if (successCount > 0 && failedCount === 0) {
          toast.success(
            `Purchase successful! ${selectedTier.data_amount} sent to ${phoneNumber}`,
            { description: data.reference ? `Ref: ${data.reference}` : undefined }
          );
        } else if (successCount > 0) {
          toast.success(
            `Purchase partially completed! ${successCount} succeeded, ${failedCount} failed.`,
            { description: data.reference ? `Ref: ${data.reference}` : undefined }
          );
        } else {
          toast.info(
            `Purchase processed. ${failedCount} item(s) failed. Amount refunded.`,
            { description: data.reference ? `Ref: ${data.reference}` : undefined }
          );
        }

        setSelectedPackage(null);
        setPhoneNumber("");
        setSelectedNetwork("MTN");

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error("Purchase failed. Please try again.");
      }
    } catch (err) {
      console.error("Purchase error:", err);
      toast.error("Purchase failed. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedPackage || !phoneNumber) {
      toast.error("Please select a package and enter a phone number");
      return;
    }

    if (!validatePhone(phoneNumber)) {
      toast.error("Please enter a valid Ghana phone number");
      return;
    }

    const success = await addToCart(selectedPackage, phoneNumber.replace(/\s/g, ""));
    if (success) {
      toast.success("Added to cart!");
      setSelectedPackage(null);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (walletBalance < cartTotal) {
      toast.error("Insufficient wallet balance. Please fund your wallet first.");
      return;
    }

    setIsCheckingOut(true);

    try {
      const idempotencyKey = generateIdempotencyKey();

      const { data, error } = await supabase.functions.invoke("purchase-data", {
        body: {
          idempotency_key: idempotencyKey,
          cart_items: cartItems.map((item) => ({
            pricing_tier_id: item.pricing_tier_id,
            beneficiary_phone: item.beneficiary_phone,
            quantity: item.quantity,
          })),
        },
      });

      if (error) {
        console.error("Checkout error:", error);
        toast.error("Checkout failed. Please try again.");
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      const wasProcessed = data.success !== false && !data.error;

      if (wasProcessed) {
        const successCount = data.results?.filter((r: any) => r.status === "success").length || 0;
        const failedCount = data.results?.filter((r: any) => r.status === "failed").length || 0;

        if (successCount > 0 && failedCount === 0) {
          toast.success("Checkout successful! All data bundles are being processed.", {
            description: data.reference ? `Ref: ${data.reference}` : undefined,
          });
        } else if (successCount > 0) {
          toast.success(
            `Checkout partially completed! ${successCount} succeeded, ${failedCount} failed.`,
            { description: data.reference ? `Ref: ${data.reference}` : undefined }
          );
        } else {
          toast.info(
            `Checkout processed. ${failedCount} item(s) failed. Amount refunded.`,
            { description: data.reference ? `Ref: ${data.reference}` : undefined }
          );
        }

        await clearCart();
        setSelectedPackage(null);
        setPhoneNumber("");
        setSelectedNetwork("MTN");

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error("Checkout failed. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            Buy Data
          </h1>
          <p className="text-muted-foreground mt-1">
            Purchase data bundles at <TierBadge tier={userRole} size="sm" className="inline-flex ml-1" /> prices
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-border">
            <span className="text-sm text-muted-foreground">Wallet:</span>
            <span className="font-semibold text-foreground">GHS {walletBalance.toFixed(2)}</span>
          </div>

          {/* Cart Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cartItems.length > 0 && (
                  <Badge
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    variant="default"
                  >
                    {cartItems.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Your Cart</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                {cartItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Your cart is empty
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <NetworkBadge network={(item.tier?.network || "MTN") as Network} size="sm" />
                              <span className="font-medium text-sm truncate">
                                {item.tier?.data_amount}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.tier?.package_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              To: {item.beneficiary_phone}
                            </p>
                            <p className="text-sm font-semibold text-primary mt-1">
                              GHS {((item.tier?.price || 0) * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-6 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold">GHS {cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Wallet Balance</span>
                        <span className={cn(
                          "font-semibold",
                          walletBalance < cartTotal ? "text-destructive" : "text-primary"
                        )}>
                          GHS {walletBalance.toFixed(2)}
                        </span>
                      </div>

                      <Button
                        className="w-full"
                        variant="gold"
                        disabled={isCheckingOut || cartItems.length === 0 || walletBalance < cartTotal}
                        onClick={handleCheckout}
                      >
                        {isCheckingOut ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : walletBalance < cartTotal ? (
                          "Insufficient Balance"
                        ) : (
                          `Checkout - GHS ${cartTotal.toFixed(2)}`
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Network Selection */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Select Network</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {networks.map((network) => (
              <button
                key={network.id}
                onClick={() => {
                  setSelectedNetwork(network.id);
                  setSelectedPackage(null);
                }}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                  selectedNetwork === network.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <NetworkBadge network={network.id} size="lg" />
                <span className="text-sm font-medium text-center">{network.label}</span>
                {network.description && (
                  <span className="text-xs text-muted-foreground text-center">{network.description}</span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phone Number Input */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Beneficiary Phone Number</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Label htmlFor="phone" className="sr-only">Phone Number</Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="e.g., 0241234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Enter the phone number to receive the data bundle
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Packages */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Select Data Package</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : tiers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No packages available for this network
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tiers.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedPackage(tier.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left relative",
                    selectedPackage === tier.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {selectedPackage === tier.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  <p className="font-display text-2xl font-bold text-foreground">
                    {tier.data_amount}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tier.package_name}
                  </p>
                  <p className="text-lg font-semibold text-primary mt-3">
                    GHS {Number(tier.price).toFixed(2)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {selectedTier && (
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-card rounded-xl border border-border">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Selected Package</p>
            <p className="font-semibold text-foreground">
              {selectedTier.data_amount} - {networks.find(n => n.id === selectedNetwork)?.label || selectedNetwork}
            </p>
            <p className="text-primary font-bold">
              GHS {Number(selectedTier.price).toFixed(2)}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleAddToCart}
              disabled={!phoneNumber}
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </Button>
            <Button
              variant="gold"
              onClick={handlePurchase}
              disabled={isPurchasing || !phoneNumber || walletBalance < selectedTier.price}
            >
              {isPurchasing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Buy Now"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
