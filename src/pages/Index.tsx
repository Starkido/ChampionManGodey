import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { FeatureCard } from "@/components/FeatureCard";
import { NetworkBadge } from "@/components/NetworkBadge";
import { TierBadge } from "@/components/TierBadge";
import { 
  Wallet, 
  Zap, 
  Shield, 
  Users, 
  Smartphone, 
  TrendingUp,
  ArrowRight,
  Check
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Wallet,
      title: "Secure Wallet System",
      description: "Fund your wallet via Paystack and purchase data instantly. Track all transactions in real-time.",
    },
    {
      icon: Zap,
      title: "Instant Delivery",
      description: "Data bundles delivered in seconds. No delays, no hassle. Just fast, reliable service.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with encrypted transactions and secure authentication.",
    },
    {
      icon: Users,
      title: "Agent Network",
      description: "Join our agent program and earn commissions. Multiple tiers with increasing benefits.",
    },
    {
      icon: Smartphone,
      title: "All Networks",
      description: "Support for MTN, Airtel, Telecel, and MTN AFA. One platform for all your data needs.",
    },
    {
      icon: TrendingUp,
      title: "Referral Rewards",
      description: "Earn commissions when you refer new users. Track your earnings and grow your network.",
    },
  ];

  const pricingTiers = [
    { tier: "client" as const, discount: "0%" },
    { tier: "basic_agent" as const, discount: "5%" },
    { tier: "master_agent" as const, discount: "10%" },
    { tier: "premier_agent" as const, discount: "15%" },
    { tier: "elite_agent" as const, discount: "20%" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button variant="hero">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Zap className="w-4 h-4" />
              The #1 Data Reseller Platform in Ghana
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 animate-slide-up">
              Buy & Resell
              <span className="block text-primary">Data Bundles</span>
              Like a Pro
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Join thousands of agents earning daily income through our platform. 
              Instant delivery, competitive pricing, and a powerful referral system.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="xl">
                  Start Earning Today
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="xl">
                  Login to Dashboard
                </Button>
              </Link>
            </div>

            {/* Network badges */}
            <div className="flex items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <span className="text-sm text-muted-foreground">Supported Networks:</span>
              <NetworkBadge network="MTN" />
              {/* <NetworkBadge network="Airtel" /> */}
              <NetworkBadge network="Telecel" />
              <NetworkBadge network="MTN_AFA" />
              <NetworkBadge network="AT_iShare" />
              <NetworkBadge network="AT_BigTime" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools you need to buy, sell, and manage data bundles efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Agent Tiers Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Agent Tiers & Benefits
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upgrade your tier to unlock better pricing and earn more from every transaction.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {pricingTiers.map(({ tier, discount }, index) => (
              <div 
                key={tier}
                className="relative p-6 rounded-2xl bg-card border border-border text-center hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <TierBadge tier={tier} size="lg" className="mb-4" />
                <div className="font-display text-3xl font-bold text-foreground mb-2">
                  {discount}
                </div>
                <div className="text-sm text-muted-foreground">
                  Discount on all purchases
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/auth?mode=signup">
              <Button variant="gold" size="lg">
                Become an Agent
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Get started in minutes with our simple 3-step process.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Create Account", desc: "Sign up and complete your profile in under 2 minutes." },
              { step: "02", title: "Fund Wallet", desc: "Add funds to your wallet securely via Paystack." },
              { step: "03", title: "Buy & Sell", desc: "Purchase data bundles at discounted rates and resell for profit." },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 text-2xl font-display font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Start Earning?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join our growing network of agents and start earning commissions today.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="xl">
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                Free to join
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                Instant setup
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                24/7 support
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-sidebar text-sidebar-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo variant="white" />
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
            <p className="text-sm text-sidebar-foreground/60">
              © 2026 Champion Man Agency. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;



// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Logo } from "@/components/Logo";
// import { FeatureCard } from "@/components/FeatureCard";
// import { NetworkBadge } from "@/components/NetworkBadge";
// import { TierBadge } from "@/components/TierBadge";
// import {
//   Wallet,
//   Zap,
//   Shield,
//   Users,
//   Smartphone,
//   TrendingUp,
//   ArrowRight,
//   Check,
//   Clock,
//   Infinity,
// } from "lucide-react";

// const Index = () => {
//   const features = [
//     {
//       icon: Wallet,
//       title: "Secure Wallet System",
//       description: "Fund your wallet via Paystack and purchase data instantly. Track all transactions in real-time.",
//     },
//     {
//       icon: Zap,
//       title: "Instant Delivery",
//       description: "Data bundles delivered in seconds. No delays, no hassle. Just fast, reliable service.",
//     },
//     {
//       icon: Shield,
//       title: "Enterprise Security",
//       description: "Bank-grade security with encrypted transactions and secure authentication.",
//     },
//     {
//       icon: Users,
//       title: "Agent Network",
//       description: "Join our agent program and earn commissions. Multiple tiers with increasing benefits.",
//     },
//     {
//       icon: Smartphone,
//       title: "All Networks",
//       description: "Support for MTN, AT iShare, AT BigTime, Telecel, and MTN AFA. One platform for all your needs.",
//     },
//     {
//       icon: TrendingUp,
//       title: "Referral Rewards",
//       description: "Earn commissions when you refer new users. Track your earnings and grow your network.",
//     },
//   ];

//   const pricingTiers = [
//     { tier: "client" as const, discount: "0%" },
//     { tier: "basic_agent" as const, discount: "5%" },
//     { tier: "master_agent" as const, discount: "10%" },
//     { tier: "premier_agent" as const, discount: "15%" },
//     { tier: "elite_agent" as const, discount: "20%" },
//   ];

//   const networks = [
//     {
//       id: "MTN" as const,
//       label: "MTN",
//       description: "Ghana's largest network",
//     },
//     {
//       id: "AT_iShare" as const,
//       label: "AT iShare",
//       description: "60-day expiry bundles",
//       badge: { icon: Clock, text: "60-Day" },
//     },
//     {
//       id: "AT_BigTime" as const,
//       label: "AT BigTime",
//       description: "Non-expiry bundles",
//       badge: { icon: Infinity, text: "No Expiry" },
//     },
//     {
//       id: "Telecel" as const,
//       label: "Telecel",
//       description: "Reliable coverage",
//     },
//     {
//       id: "MTN_AFA" as const,
//       label: "MTN AFA",
//       description: "AFA data plans",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Navigation */}
//       <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
//         <div className="container mx-auto px-4 h-16 flex items-center justify-between">
//           <Logo />
//           <div className="flex items-center gap-4">
//             <Link to="/auth">
//               <Button variant="ghost">Login</Button>
//             </Link>
//             <Link to="/auth?mode=signup">
//               <Button variant="hero">Get Started</Button>
//             </Link>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section className="relative pt-32 pb-20 overflow-hidden">
//         {/* Background decorations */}
//         <div className="absolute inset-0 bg-gradient-hero opacity-5" />
//         <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
//         <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

//         <div className="container mx-auto px-4 relative z-10">
//           <div className="max-w-4xl mx-auto text-center">
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
//               <Zap className="w-4 h-4" />
//               The #1 Data Reseller Platform in Ghana
//             </div>

//             <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 animate-slide-up">
//               Buy & Resell
//               <span className="block text-primary">Data Bundles</span>
//               Like a Pro
//             </h1>

//             <p
//               className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up"
//               style={{ animationDelay: "0.1s" }}
//             >
//               Join thousands of agents earning daily income through our platform.
//               Instant delivery, competitive pricing, and a powerful referral system.
//             </p>

//             <div
//               className="flex flex-wrap items-center justify-center gap-4 mb-12 animate-slide-up"
//               style={{ animationDelay: "0.2s" }}
//             >
//               <Link to="/auth?mode=signup">
//                 <Button variant="hero" size="xl">
//                   Start Earning Today
//                   <ArrowRight className="w-5 h-5" />
//                 </Button>
//               </Link>
//               <Link to="/auth">
//                 <Button variant="outline" size="xl">
//                   Login to Dashboard
//                 </Button>
//               </Link>
//             </div>

//             {/* Network badges */}
//             <div
//               className="animate-slide-up"
//               style={{ animationDelay: "0.3s" }}
//             >
//               <p className="text-sm text-muted-foreground mb-4">Supported Networks:</p>
//               <div className="flex flex-wrap items-center justify-center gap-3">
//                 {networks.map((network) => (
//                   <div key={network.id} className="flex flex-col items-center gap-1.5">
//                     <NetworkBadge network={network.id} size="md" />
//                     {network.badge && (
//                       <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
//                         <network.badge.icon className="w-3 h-3" />
//                         {network.badge.text}
//                       </span>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Networks Highlight Section */}
//       <section className="py-16 bg-secondary/30">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-10">
//             <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
//               AirtelTigo Plans — Two Bundle Types
//             </h2>
//             <p className="text-muted-foreground max-w-xl mx-auto">
//               We offer both AirtelTigo bundle types so you can serve every customer's need.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
//             {/* AT iShare */}
//             <div className="p-6 rounded-2xl bg-card border border-red-200 hover:shadow-lg transition-all">
//               <div className="flex items-center gap-3 mb-4">
//                 <NetworkBadge network="AT_iShare" size="lg" />
//                 <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
//                   <Clock className="w-5 h-5 text-red-600" />
//                 </div>
//               </div>
//               <h3 className="font-display text-xl font-bold text-foreground mb-2">AT iShare</h3>
//               <p className="text-muted-foreground text-sm mb-4">
//                 AirtelTigo iShare bundles with a <span className="font-semibold text-foreground">60-day validity</span>. 
//                 Great for customers who want longer-lasting data at affordable rates.
//               </p>
//               <ul className="space-y-2 text-sm text-muted-foreground">
//                 <li className="flex items-center gap-2">
//                   <Check className="w-4 h-4 text-red-500 flex-shrink-0" />
//                   60-day data validity
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <Check className="w-4 h-4 text-red-500 flex-shrink-0" />
//                   1GB, 2GB, and 5GB bundles
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <Check className="w-4 h-4 text-red-500 flex-shrink-0" />
//                   Competitive agent pricing
//                 </li>
//               </ul>
//             </div>

//             {/* AT BigTime */}
//             <div className="p-6 rounded-2xl bg-card border border-orange-200 hover:shadow-lg transition-all">
//               <div className="flex items-center gap-3 mb-4">
//                 <NetworkBadge network="AT_BigTime" size="lg" />
//                 <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
//                   <Infinity className="w-5 h-5 text-orange-600" />
//                 </div>
//               </div>
//               <h3 className="font-display text-xl font-bold text-foreground mb-2">AT BigTime</h3>
//               <p className="text-muted-foreground text-sm mb-4">
//                 AirtelTigo BigTime bundles with <span className="font-semibold text-foreground">no expiry date</span>. 
//                 Perfect for customers who want data that lasts as long as they need it.
//               </p>
//               <ul className="space-y-2 text-sm text-muted-foreground">
//                 <li className="flex items-center gap-2">
//                   <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
//                   Never expires
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
//                   1GB, 2GB, 5GB & 10GB bundles
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
//                   Premium non-expiry pricing
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="py-20">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-12">
//             <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
//               Everything You Need to Succeed
//             </h2>
//             <p className="text-muted-foreground max-w-2xl mx-auto">
//               Our platform provides all the tools you need to buy, sell, and manage data bundles efficiently.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {features.map((feature, index) => (
//               <FeatureCard key={index} {...feature} />
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Agent Tiers Section */}
//       <section className="py-20 bg-secondary/30">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-12">
//             <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
//               Agent Tiers & Benefits
//             </h2>
//             <p className="text-muted-foreground max-w-2xl mx-auto">
//               Upgrade your tier to unlock better pricing and earn more from every transaction.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto">
//             {pricingTiers.map(({ tier, discount }) => (
//               <div
//                 key={tier}
//                 className="relative p-6 rounded-2xl bg-card border border-border text-center hover:shadow-lg transition-all hover:-translate-y-1"
//               >
//                 <TierBadge tier={tier} size="lg" className="mb-4" />
//                 <div className="font-display text-3xl font-bold text-foreground mb-2">
//                   {discount}
//                 </div>
//                 <div className="text-sm text-muted-foreground">Discount on all purchases</div>
//               </div>
//             ))}
//           </div>

//           <div className="text-center mt-8">
//             <Link to="/auth?mode=signup">
//               <Button variant="gold" size="lg">
//                 Become an Agent
//                 <ArrowRight className="w-5 h-5" />
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* How It Works */}
//       <section className="py-20 bg-gradient-hero text-white">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-12">
//             <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
//             <p className="text-white/70 max-w-2xl mx-auto">
//               Get started in minutes with our simple 3-step process.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
//             {[
//               { step: "01", title: "Create Account", desc: "Sign up and complete your profile in under 2 minutes." },
//               { step: "02", title: "Fund Wallet", desc: "Add funds to your wallet securely via Paystack." },
//               { step: "03", title: "Buy & Sell", desc: "Purchase data bundles at discounted rates and resell for profit." },
//             ].map((item, index) => (
//               <div key={index} className="text-center">
//                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 text-2xl font-display font-bold mb-4">
//                   {item.step}
//                 </div>
//                 <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
//                 <p className="text-white/70">{item.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-20">
//         <div className="container mx-auto px-4">
//           <div className="max-w-3xl mx-auto text-center">
//             <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
//               Ready to Start Earning?
//             </h2>
//             <p className="text-muted-foreground text-lg mb-8">
//               Join our growing network of agents and start earning commissions today.
//             </p>

//             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
//               <Link to="/auth?mode=signup">
//                 <Button variant="hero" size="xl">
//                   Create Free Account
//                   <ArrowRight className="w-5 h-5" />
//                 </Button>
//               </Link>
//             </div>

//             <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
//               <span className="flex items-center gap-2">
//                 <Check className="w-4 h-4 text-success" />
//                 Free to join
//               </span>
//               <span className="flex items-center gap-2">
//                 <Check className="w-4 h-4 text-success" />
//                 Instant setup
//               </span>
//               <span className="flex items-center gap-2">
//                 <Check className="w-4 h-4 text-success" />
//                 5 networks supported
//               </span>
//               <span className="flex items-center gap-2">
//                 <Check className="w-4 h-4 text-success" />
//                 24/7 support
//               </span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="py-12 bg-sidebar text-sidebar-foreground">
//         <div className="container mx-auto px-4">
//           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
//             <Logo variant="white" />
//             <div className="flex items-center gap-6 text-sm">
//               <a href="#" className="hover:text-white transition-colors">Terms</a>
//               <a href="#" className="hover:text-white transition-colors">Privacy</a>
//               <a href="#" className="hover:text-white transition-colors">Support</a>
//             </div>
//             <p className="text-sm text-sidebar-foreground/60">
//               © 2026 Champion Man Agency. All rights reserved.
//             </p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default Index;
