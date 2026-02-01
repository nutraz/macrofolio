import React, { useEffect } from 'react';
import { useRevenueCat } from '../hooks/useRevenueCat';
import { Check, Crown, Sparkles, Zap, Shield, BarChart3, Download } from 'lucide-react';

interface PremiumPageProps {}

const PremiumPage: React.FC<PremiumPageProps> = () => {
  const { isPremium, offerings, loading, purchase, getOfferings } = useRevenueCat();
  const [purchasing, setPurchasing] = React.useState<string | null>(null);

  useEffect(() => {
    getOfferings();
  }, [getOfferings]);

  const handlePurchase = async (productId: string) => {
    setPurchasing(productId);
    try {
      const result = await purchase(productId);
      if (result.success) {
        alert('Purchase successful! Welcome to Premium!');
      } else {
        alert('Purchase not completed. Please try again.');
      }
    } catch (error) {
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const premiumFeatures = [
    { icon: BarChart3, title: 'Advanced Analytics', desc: 'Historical charts & performance metrics' },
    { icon: Zap, title: 'Real-Time Alerts', desc: 'Price movement notifications' },
    { icon: Download, title: 'Export Features', desc: 'CSV/PDF portfolio reports' },
    { icon: Shield, title: 'Priority Support', desc: 'Dedicated assistance' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-textMuted">Loading premium offerings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-bg text-textPrimary py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-warning to-orange-500 rounded-2xl mb-6 shadow-glow-orange">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
            Unlock Macrofolio Pro
          </h1>
          <p className="text-lg text-textMuted max-w-2xl mx-auto">
            Get unlimited access to advanced analytics, real-time alerts, and premium features. 
            Secure subscription management with demo mode enabled.
          </p>
        </div>

        {/* Premium Status Banner */}
        {isPremium ? (
          <div className="bg-gradient-to-r from-success/20 to-green-500/10 border border-success/30 rounded-2xl p-8 mb-12 text-center">
            <Sparkles className="w-12 h-12 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-success mb-2">🎉 You are a Premium User!</h2>
            <p className="text-textMuted">Enjoy full access to all premium features.</p>
          </div>
        ) : null}

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {premiumFeatures.map((feature, index) => (
            <div key={index} className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6 hover:border-warning/30 transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <feature.icon className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-textPrimary mb-1">{feature.title}</h3>
                  <p className="text-textMuted text-sm">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subscription Plans */}
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Choose Your Plan</h2>
          
          {offerings.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {offerings.map((offering) => (
                <div 
                  key={offering.identifier}
                  className={`relative bg-gradient-to-br from-bg to-bg border rounded-xl p-6 transition-all duration-300 ${
                    offering.identifier === 'annual' 
                      ? 'border-success/50 shadow-glow-green' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {offering.identifier === 'annual' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-white text-xs font-medium px-3 py-1 rounded-full">
                      Best Value - Save 17%
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-textPrimary mb-2">{offering.title}</h3>
                    <p className="text-textMuted text-sm mb-4">{offering.description}</p>
                    <div className="text-3xl font-bold text-textPrimary">
                      {offering.priceString}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-sm text-textMuted">
                      <Check className="w-4 h-4 text-success mr-2" />
                      All premium features unlocked
                    </li>
                    <li className="flex items-center text-sm text-textMuted">
                      <Check className="w-4 h-4 text-success mr-2" />
                      Cancel anytime
                    </li>
                    <li className="flex items-center text-sm text-textMuted">
                      <Check className="w-4 h-4 text-success mr-2" />
                      Secure payment via RevenueCat
                    </li>
                  </ul>

                  <button
                    onClick={() => handlePurchase(offering.productIdentifier)}
                    disabled={purchasing === offering.productIdentifier}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                      offering.identifier === 'annual'
                        ? 'bg-success hover:bg-success/80 text-white shadow-glow-green'
                        : 'btn-primary'
                    } ${purchasing === offering.productIdentifier ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {purchasing === offering.productIdentifier ? (
                      <span className="flex items-center justify-center">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Processing...
                      </span>
                    ) : (
                      `Subscribe ${offering.priceString}`
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-textMuted">No offerings available at the moment.</p>
              <button 
                onClick={getOfferings}
                className="mt-4 btn-secondary"
              >
                Refresh Offerings
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PremiumPage;

