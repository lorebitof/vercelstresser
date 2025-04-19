import Link from "next/link"
import { Zap, Shield, Clock, Users, ChevronRight, Server, Database } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">Global Stresser</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-white/80 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-white/80 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-white/80 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/register" passHref>
              <Button variant="gradient" size="sm">
                Register
              </Button>
            </Link>
          </nav>
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="text-white">
              Menu
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with enhanced animations */}
      <section className="hero-gradient grid-pattern flex-1 flex items-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute bottom-20 right-10 w-80 h-80 bg-purple-700/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/3 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          ></div>

          {/* Grid lines */}
          <div className="absolute inset-0 grid-pattern opacity-20"></div>

          {/* Floating particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse-slow"></div>
          <div
            className="absolute top-1/3 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-pulse-slow"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-purple-400 rounded-full animate-pulse-slow"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-2/3 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse-slow"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block px-3 py-1 mb-6 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium animate-fade-in">
             BEST STRESSER and ADVANCED is GLOBAL!
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 glow-text animate-fade-in-up">
            GlobalStresser is the best way
            to test your targets.
            </h1>
            <p className="text-xl text-white/80 mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Beautifully designed, experience reliable and uninterrupted power that
            enables you to easily launch powerful tests.
            </p>
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <Link href="/register" passHref>
                <Button variant="gradient" size="lg" className="glow group">
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with enhanced animations */}
      <section id="features" className="bg-black py-20 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium">
              Powerful Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Advanced Testing Capabilities</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Our platform offers a comprehensive suite of tools to thoroughly test your network infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/5 p-6 rounded-lg border border-white/10 backdrop-blur-sm transform transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg hover:shadow-purple-500/10">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Fast Payments</h3>
              <p className="text-white/70">
              You can make a payment with crypto with our automated confirmation system.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-lg border border-white/10 backdrop-blur-sm transform transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg hover:shadow-purple-500/10">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Server className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Powerfull Booter</h3>
              <p className="text-white/70">
              Our Panel is optimized for simple usage with Up to 50GBit/s Layer 4 &amp; 1.5TBit/s of Global Traffic
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-lg border border-white/10 backdrop-blur-sm transform transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg hover:shadow-purple-500/10">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Database className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Data Protection</h3>
              <p className="text-white/70">
              Your information is safe with us. We will never publish your data anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section with enhanced animations */}
      <section id="pricing" className="gradient-bg py-20 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute bottom-20 left-10 w-80 h-80 bg-purple-700/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium">
              Pricing Plans
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose Your Plan</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Select the perfect plan for your needs. All plans include access to our core features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-black/30 p-8 rounded-lg border border-white/10 backdrop-blur-sm transform transition-all duration-300 hover:translate-y-[-5px] hover:border-purple-500/30">
              <h3 className="text-xl font-semibold text-white mb-2">Planet</h3>
              <div className="text-3xl font-bold text-white mb-4">
                $10.00<span className="text-lg font-normal text-white/70">/monthly</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> 1 Concurrent Attack
                </li>
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> 60 Second Max Time
                </li>
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> Basic Methods
                </li>
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> 24/7 Support
                </li>
              </ul>
              <Link href="https://t.me/udpnfo" passHref>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  Subscribe
                </Button>
              </Link>
            </div>

            <div className="bg-black/30 p-8 rounded-lg border border-primary/30 backdrop-blur-sm relative transform transition-all duration-300 hover:translate-y-[-5px] hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                Popular
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Continent</h3>
              <div className="text-3xl font-bold text-white mb-4">
                $20.00<span className="text-lg font-normal text-white/70">/monthly</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> 3 Concurrent Attacks
                </li>
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> 300 Second Max Time
                </li>
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> All Methods
                </li>
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> 24/7 Priority Support
                </li>
              </ul>
              <Link href="https://t.me/udpnfo" passHref>
                <Button variant="gradient" className="w-full glow">
                Subscribe
                </Button>
              </Link>
            </div>

            <div className="bg-black/30 p-8 rounded-lg border border-white/10 backdrop-blur-sm transform transition-all duration-300 hover:translate-y-[-5px] hover:border-purple-500/30">
              <h3 className="text-xl font-semibold text-white mb-2">Empire</h3>
              <div className="text-3xl font-bold text-white mb-4">
                $40.00<span className="text-lg font-normal text-white/70">/monthly</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> 5 Concurrent Attacks
                </li>
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> 600 Second Max Time
                </li>
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> All Methods + Premium
                </li>
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> 24/7 VIP Support
                </li>
              </ul>
              <Link href="https://t.me/udpnfo" passHref>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* New Plan: Galaxy */}
            <div className="bg-black/30 p-8 rounded-lg border border-white/10 backdrop-blur-sm transform transition-all duration-300 hover:translate-y-[-5px] hover:border-purple-500/30">
              <h3 className="text-xl font-semibold text-white mb-2">Galaxy</h3>
              <div className="text-3xl font-bold text-white mb-4">
                $70.00<span className="text-lg font-normal text-white/70">/monthly</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> 10 Concurrent Attacks
                </li>
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> 1200 Second Max Time
                </li>
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> All Methods + Premium
                </li>
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> 24/7 VIP Support
                </li>
              </ul>
              <Link href="https://t.me/udpnfo" passHref>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                Subscribe
                </Button>
              </Link>
            </div>

            {/* New Plan: Universe */}
            <div className="bg-black/30 p-8 rounded-lg border border-white/10 backdrop-blur-sm transform transition-all duration-300 hover:translate-y-[-5px] hover:border-purple-500/30">
              <h3 className="text-xl font-semibold text-white mb-2">Universe</h3>
              <div className="text-3xl font-bold text-white mb-4">
                $200.00<span className="text-lg font-normal text-white/70">/monthly</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> 25 Concurrent Attacks
                </li>
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> 3600 Second Max Time
                </li>
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> All Methods + Premium + Exclusive
                </li>
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> Dedicated VIP Support
                </li>
              </ul>
              <Link href="https://t.me/udpnfo" passHref>
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
              Subscribe
                </Button>
              </Link>
            </div>

            {/* New Plan: Omniverse */}
            <div className="bg-black/30 p-8 rounded-lg border border-white/10 backdrop-blur-sm transform transition-all duration-300 hover:translate-y-[-5px] hover:border-purple-500/30">
              <h3 className="text-xl font-semibold text-white mb-2">Omniverse</h3>
              <div className="text-3xl font-bold text-white mb-4">
                $500.00<span className="text-lg font-normal text-white/70">/monthly</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> 50 Concurrent Attacks
                </li>
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> 7600 Max Time
                </li>
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> All Methods + Premium + Exclusive + Custom
                </li>
                <li className="flex items-center text-white/80">
                  <span className="mr-2 text-primary">✓</span> Dedicated 24/7 VIP Support
                </li>
              </ul>
              <Link href="https://t.me/udpnfo" passHref>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  Subscribe
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-black"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Stop wasting time in powerless solutions. </h2>
            <p className="text-xl text-white/80 mb-8">
            Start experiencing real power right now.
            </p>
            <Link href="/register" passHref>
              <Button variant="gradient" size="lg" className="glow">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-white">Global Stresser</h2>
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
              <Link href="https://t.me/globalstress" className="text-white/80 hover:text-white transition-colors">
                Telegram
              </Link>
              <Link href="#pricing" className="text-white/80 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/login" className="text-white/80 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/register" className="text-white/80 hover:text-white transition-colors">
                Register
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/60 text-sm">
            &copy; {new Date().getFullYear()} Global Stresser. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
