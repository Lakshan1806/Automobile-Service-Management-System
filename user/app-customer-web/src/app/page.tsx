"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const services = [
  {
    title: "Precision Maintenance",
    description: "Factory-trained technicians, digital inspections, and predictive reminders keep every NovaDrive vehicle in peak condition.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Transparent Scheduling",
    description: "See bay availability in real time, pick a valet option, and receive live updates from drop-off to keys back in hand.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Connected Roadside",
    description: "Tap into 24/7 roadside experts with secure driver verification and GPS-powered technician tracking.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

const highlights = [
  { label: "Certified technicians", value: "120+", suffix: "experts" },
  { label: "Service appointments", value: "4,200", suffix: "this month" },
  { label: "Average roadside ETA", value: "22", suffix: "minutes" },
];

const features = [
  { 
    text: "Live progress tracking for every appointment with secure messaging.", 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  { 
    text: "Digital service history that follows each vehicle in your garage.", 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  { 
    text: "Seamless roadside verification to keep you and your car safe.", 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )
  },
];

const steps = [
  {
    step: "01 • Book",
    title: "Tell us where and when",
    description: "Choose your favorite service center or mobile technician, select transport options, and confirm in under 60 seconds.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  },
  {
    step: "02 • Track",
    title: "Stay updated every mile",
    description: "Status changes, technician notes, and payment approvals stay in sync through the NovaDrive app and SMS.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    step: "03 • Drive",
    title: "Pick up with confidence",
    description: "Review your inspection summary, pay securely, and schedule the next visit with personalized recommendations.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  }
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeMetric, setActiveMetric] = useState(0);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % highlights.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Main Content */}
            <div className="relative space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Welcome to NovaDrive
                </span>
              </div>
              
              {/* Main Heading */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                  Car care,
                  <span className="block text-gray-900 dark:text-white">
                    reimagined.
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  Proactive maintenance, transparent scheduling, and instant roadside—all in one modern platform.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/appointments" 
                  className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    Book a Service
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                
                <Link 
                  href="/roadside-assistance" 
                  className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-800 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    Roadside Help
                  </span>
                </Link>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-gray-800">
                {highlights.map((item, index) => (
                  <div 
                    key={item.label}
                    className={`text-center p-4 rounded-lg transition-all duration-300 cursor-pointer ${
                      activeMetric === index 
                        ? 'bg-gray-50 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700' 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    onMouseEnter={() => setActiveMetric(index)}
                  >
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {item.value}
                    </div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-1">
                      {item.suffix}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits Card */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                    <span className="text-white dark:text-gray-900 font-bold text-sm">✓</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Why choose NovaDrive
                  </h2>
                </div>
                
                <div className="space-y-6">
                  {features.map((feature, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 group"
                    >
                      <div className="text-gray-600 dark:text-gray-400 mt-0.5">
                        {feature.icon}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed flex-1">
                        {feature.text}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                    <span className="font-bold">Join 50,000+ drivers</span> who trust NovaDrive
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 mb-8">
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Everything in one place
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Smarter car care
            </h2>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              The NovaDrive portal keeps service, billing, and roadside protection connected in one seamless experience.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={service.title}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300"
              >
                {/* Content */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 mb-6">
                    {service.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    {service.description}
                  </p>
                  
                  <Link 
                    href="/appointments" 
                    className="inline-flex items-center gap-2 text-gray-900 dark:text-white font-semibold hover:gap-3 transition-all duration-300"
                  >
                    Get started
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  How it works
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
                Simple as 1-2-3
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                We combined dealership-grade diagnostics with concierge communication for a stress-free experience.
              </p>

              <div className="flex gap-4">
                <Link 
                  href="/appointments" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  <span>Start now</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className="group flex items-start gap-6 p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                >
                  {/* Step Number */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-14 h-14 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-gray-900 font-bold text-lg shadow-sm">
                      {index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="absolute top-16 left-1/2 w-0.5 h-8 bg-gray-300 dark:bg-gray-600 transform -translate-x-1/2"></div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        {step.step}
                      </span>
                      <div className="text-gray-600 dark:text-gray-400">
                        {step.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 lg:p-16 text-white">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready to experience better car care?
            </h2>
            
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of drivers who trust NovaDrive for their vehicle maintenance and roadside protection.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/appointments" 
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-black rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Get Started Today
              </Link>
              <Link 
                href="/about" 
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-lg hover:border-white/50 hover:bg-white/10 transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}