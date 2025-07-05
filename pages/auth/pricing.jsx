import { useState } from "react";
import { Check, Star, Users, Shield, Zap, Crown } from "lucide-react";

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Basic",
      description: "Perfect for individuals and small projects",
      monthlyPrice: 29,
      annualPrice: 290,
      icon: Users,
      badge: null,
      features: [
        "Up to 5 projects",
        "Basic analytics",
        "Email support",
        "5GB storage",
        "Standard templates",
      ],
      buttonText: "Get Started",
      buttonVariant: "outline",
      popular: false,
    },
    {
      name: "Professional",
      description: "Ideal for growing businesses and teams",
      monthlyPrice: 59,
      annualPrice: 590,
      icon: Zap,
      badge: "Most Popular",
      features: [
        "Unlimited projects",
        "Advanced analytics",
        "Priority support",
        "50GB storage",
        "Premium templates",
        "Team collaboration",
        "Custom integrations",
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "default",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For large organizations with advanced needs",
      monthlyPrice: 99,
      annualPrice: 990,
      icon: Crown,
      badge: "Enterprise",
      features: [
        "Everything in Professional",
        "Unlimited storage",
        "24/7 phone support",
        "Custom development",
        "SLA guarantee",
        "Advanced security",
        "Dedicated manager",
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline",
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "TechStart Inc.",
      content:
        "This platform has revolutionized how we manage our projects. The analytics are incredible!",
      rating: 5,
      avatar: "SJ",
    },
    {
      name: "Michael Chen",
      company: "Design Studio",
      content:
        "Best investment we've made. Our productivity increased by 300% in just 2 months.",
      rating: 5,
      avatar: "MC",
    },
    {
      name: "Emily Rodriguez",
      company: "Marketing Pro",
      content:
        "Outstanding support team and features that actually work. Highly recommend!",
      rating: 5,
      avatar: "ER",
    },
  ];

  const companies = [
    "Microsoft",
    "Google",
    "Amazon",
    "Apple",
    "Netflix",
    "Spotify",
    "Airbnb",
    "Uber",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50">
      <div className="container mx-auto px-6 pt-20 pb-16">
        <div className="text-center animate-fade-in">
          
          <div className="mb-4 animate-pulse bg-purple-600 hover:bg-purple-700 text-white inline-block px-4 py-1 rounded-full">
            <Star className="w-4 h-4 mr-2 inline" />
            Trusted by 10,000+ customers
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent mb-6 animate-slide-in-left">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-in-right">
            Professional solutions for every need. Start with our free trial and
            scale as you grow. No hidden fees, cancel anytime.
          </p>

          
          <div className="flex items-center justify-center gap-4 mb-12 animate-scale-in">
            <span
              className={`text-lg font-medium ${
                !isAnnual ? "text-purple-600" : "text-gray-500"
              }`}
            >
              Monthly
            </span>
            
            <button
              onClick={() => setIsAnnual((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                isAnnual ? "bg-purple-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  isAnnual ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-lg font-medium ${
                isAnnual ? "text-purple-600" : "text-gray-500"
              }`}
            >
              Annual
            </span>
            
            <span className="ml-2 animate-bounce bg-purple-100 text-purple-700 border border-purple-200 rounded-full px-3 py-1 text-sm">
              Save 20%
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => {
          
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const originalPrice = isAnnual ? plan.monthlyPrice * 12 : null;

            return (
              // <Card ...>
              <div
                key={plan.name}
                className={`relative hover-lift transition-all duration-300 animate-scale-in ${
                  plan.popular
                    ? "border-purple-500 shadow-2xl scale-105 ring-2 ring-purple-500/20 bg-gradient-to-br from-purple-50 to-violet-50"
                    : "border-purple-200 hover:border-purple-400 bg-white/80 backdrop-blur-sm"
                } p-6 rounded-2xl`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-1 animate-pulse rounded-full text-sm font-semibold">
                      {plan.badge}
                    </span>
                  </div>
                )}

                
                <div className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full">
                      <plan.icon className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {plan.name}
                  </div>
                  <div className="text-gray-600 mt-2">{plan.description}</div>
                </div>

                
                <div className="text-center">
                  <div className="mb-6">
                    {isAnnual && originalPrice && (
                      <div className="text-sm text-gray-500 line-through mb-1">
                        ${originalPrice}/year
                      </div>
                    )}
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-2">
                      ${price}
                    </div>
                    <div className="text-gray-600">
                      per {isAnnual ? "year" : "month"}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={feature}
                        className="flex items-center animate-slide-in-right"
                        style={{ animationDelay: `${featureIndex * 100}ms` }}
                      >
                        <Check className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                
                <div>
                  
                  <button
                    className={`w-full py-6 text-lg font-semibold ripple hover:scale-105 transition-transform rounded-lg ${
                      plan.buttonVariant === "default"
                        ? "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
                        : "border border-purple-300 text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trusted By Section */}
        <div className="text-center mb-20 animate-fade-in">
          <p className="text-gray-600 mb-8 text-lg">
            Trusted by leading companies worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 items-center opacity-60">
            {companies.map((company, index) => (
              <div
                key={company}
                className="text-center hover:opacity-100 transition-opacity animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-gradient-to-br from-purple-100 to-violet-100 h-12 w-24 mx-auto rounded flex items-center justify-center font-semibold text-purple-700 text-sm">
                  {company}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 animate-slide-in-left bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
            What Our Customers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              // <Card ...>
              <div
                key={testimonial.name}
                className="hover-lift animate-scale-in bg-white/80 backdrop-blur-sm border-purple-200 hover:border-purple-400 p-6 rounded-2xl"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* <CardContent ...> */}
                <div className="pt-6">
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-purple-400 mr-1 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        
        <div className="text-center animate-fade-in">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <div className="max-w-2xl mx-auto space-y-6">
            {[
              {
                q: "Can I change my plan anytime?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes, we offer a 14-day free trial for the Professional plan with no credit card required.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
              },
            ].map((faq, index) => (
              // <Card ...>
              <div
                key={index}
                className="text-left hover-lift animate-slide-in-right bg-white/80 backdrop-blur-sm border-purple-200 hover:border-purple-400 p-6 rounded-2xl"
              >
                {/* <CardContent ...> */}
                <div className="pt-6">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    {faq.q}
                  </h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20 animate-scale-in">
          {/* <Card ...> */}
          <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white border-0 rounded-2xl p-8">
            {/* <CardContent ...> */}
            <div className="py-12">
              <Shield className="w-16 h-16 mx-auto mb-6 animate-pulse" />
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of satisfied customers. Start your free trial
                today!
              </p>
              
              <button className="px-8 py-6 text-lg ripple bg-white text-purple-700 hover:bg-gray-100 rounded-lg font-semibold">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
