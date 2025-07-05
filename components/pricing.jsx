import { useState } from "react";
import { Check, Star, Users, Shield, Zap, Crown } from "lucide-react";

const PricingComponent = ({ onPlanSelect, selectedPlan }) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Free",
      description: "Perfect for individuals and small projects",
      monthlyPrice: 0,
      annualPrice: 0,
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
      name: "Pro",
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
        "Everything in Pro",
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

  const handlePlanSelect = (planName) => {
    if (onPlanSelect) {
      onPlanSelect(planName);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="mb-4 animate-pulse bg-purple-600 hover:bg-purple-700 text-white inline-block px-4 py-1 rounded-full">
          <Star className="w-4 h-4 mr-2 inline" />
          Trusted by 10,000+ customers
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Choose Your Perfect Plan
        </h1>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          Professional solutions for every need. Start with our free trial and
          scale as you grow. No hidden fees, cancel anytime.
        </p>
        <div className="flex items-center justify-center gap-4 mb-6">
          <span
            className={`text-sm font-medium ${
              !isAnnual ? "text-purple-600" : "text-gray-500"
            }`}
          >
            Monthly
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsAnnual((v) => !v);
            }}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              isAnnual ? "bg-purple-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                isAnnual ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${
              isAnnual ? "text-purple-600" : "text-gray-500"
            }`}
          >
            Annual
          </span>

          <span className="ml-2 bg-purple-100 text-purple-700 border border-purple-200 rounded-full px-2 py-1 text-xs">
            Save 20%
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan, index) => {
          const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
          const originalPrice = isAnnual ? plan.monthlyPrice * 12 : null;

          return (
            <div
              key={plan.name}
              className={`relative transition-all duration-300 cursor-pointer ${
                selectedPlan === plan.name
                  ? "border-purple-500 shadow-lg scale-105 ring-2 ring-purple-500/20 bg-gradient-to-br from-purple-50 to-violet-50"
                  : plan.popular
                  ? "border-purple-300 hover:border-purple-400 bg-white/80 backdrop-blur-sm"
                  : "border-gray-200 hover:border-purple-300 bg-white/80 backdrop-blur-sm"
              } p-4 rounded-xl`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePlanSelect(plan.name);
              }}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center pb-3">
                <div className="flex justify-center mb-3">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full">
                    <plan.icon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {plan.name}
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  {plan.description}
                </div>
              </div>

              <div className="text-center">
                <div className="mb-4">
                  {isAnnual && originalPrice && plan.monthlyPrice > 0 && (
                    <div className="text-xs text-gray-500 line-through mb-1">
                      ${originalPrice}/year
                    </div>
                  )}
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-1">
                    {plan.monthlyPrice === 0 ? "Free" : `$${price}`}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {plan.monthlyPrice === 0
                      ? "Forever"
                      : `per ${isAnnual ? "year" : "month"}`}
                  </div>
                </div>

                <ul className="space-y-2 mb-4 text-sm">
                  {plan.features.slice(0, 4).map((feature, featureIndex) => (
                    <li key={feature} className="flex items-center">
                      <Check className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 4 && (
                    <li className="text-purple-600 text-xs font-medium">
                      +{plan.features.length - 4} more features
                    </li>
                  )}
                </ul>
              </div>

              <div className="text-center">
                <div
                  className={`w-full py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    selectedPlan === plan.name
                      ? "bg-purple-600 text-white"
                      : plan.buttonVariant === "default"
                      ? "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
                      : "border border-purple-300 text-purple-700 hover:bg-purple-50"
                  }`}
                >
                  {selectedPlan === plan.name ? "Selected" : plan.buttonText}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PricingComponent;
