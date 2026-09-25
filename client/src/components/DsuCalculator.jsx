import React, { useState, useMemo } from 'react';
import { Calculator, DollarSign, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function DsuCalculator({ onOpenApply }) {
  const [familyMembers, setFamilyMembers] = useState(4);
  const [annualIncomeDzd, setAnnualIncomeDzd] = useState(1400000); // 1,400,000 DZD/year
  const [realEstateValueDzd, setRealEstateValueDzd] = useState(3000000); // Family home estimate in DZD
  const [hasRentalHouse, setHasRentalHouse] = useState(false);

  // Conversion rate (approximate official DZD to EUR ~ 145 DZD per EUR)
  const exchangeRate = 145;

  // Scale of Equivalence calculation (Scala di Equivalenza DSU)
  const scaleEquivalence = useMemo(() => {
    if (familyMembers <= 1) return 1.0;
    if (familyMembers === 2) return 1.57;
    if (familyMembers === 3) return 2.04;
    if (familyMembers === 4) return 2.46;
    if (familyMembers === 5) return 2.85;
    return 2.85 + (familyMembers - 5) * 0.35;
  }, [familyMembers]);

  // ISEE Parificato Calculation
  const iseeResult = useMemo(() => {
    const incomeEur = annualIncomeDzd / exchangeRate;
    const realEstateEur = realEstateValueDzd / exchangeRate;
    // Italian DSU formula: ISR (Income) + 20% of ISP (Assets exceeding exemption)
    const exemptAssets = Math.max(0, realEstateEur - (52500));
    const ispe = (incomeEur + exemptAssets * 0.20) / scaleEquivalence;
    const isee = Math.round(ispe);

    // DSU Threshold is usually €25,000 to €27,000
    const maxThreshold = 26306; // standard 2026 Italian DSU limit
    const qualifies = isee <= maxThreshold;
    const tier = isee < 13000 ? 'Tier 1 (Maximum Grant)' : isee < 19000 ? 'Tier 2 (High Grant)' : 'Tier 3 (Partial Grant + Zero Tuition)';

    let estimatedStipend = "€7,532 / year";
    if (isee >= 13000 && isee < 19000) estimatedStipend = "€5,800 / year";
    if (isee >= 19000 && isee <= maxThreshold) estimatedStipend = "€4,200 / year";

    return {
      isee,
      qualifies,
      tier,
      estimatedStipend,
      maxThreshold
    };
  }, [annualIncomeDzd, realEstateValueDzd, familyMembers]);

  return (
    <section id="dsu-calculator" className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            Italian Regional Scholarship Simulator
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight">
            DSU & ISEE Parificato Calculator
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Estimate your eligibility for Italian regional welfare (ER.GO, ESU, DiSCo, EDISU). 
            Over <strong className="text-emerald-400 font-semibold">94% of Algerian applicants</strong> fall within the top scholarship bracket.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          
          {/* Interactive Input Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl glass-panel border border-slate-800 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 font-display flex items-center gap-2">
              <span>Family Financial Parameters</span>
              <span className="text-xs font-normal text-slate-400">(In Algerian Dinar DZD)</span>
            </h3>

            <div className="space-y-6">
              {/* Family Members Slider */}
              <div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <label className="text-slate-300 font-medium">Family Members in Household:</label>
                  <span className="text-white font-bold px-3 py-1 bg-luxury-950 rounded-lg border border-slate-700 text-sm">
                    {familyMembers} Persons
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={familyMembers}
                  onChange={(e) => setFamilyMembers(parseInt(e.target.value))}
                  className="w-full h-2 bg-luxury-950 rounded-lg appearance-none cursor-pointer accent-italia-green"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>1 person</span>
                  <span>5 persons</span>
                  <span>10+ persons</span>
                </div>
              </div>

              {/* Annual Family Income */}
              <div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <label className="text-slate-300 font-medium">Total Annual Household Income:</label>
                  <span className="text-emerald-400 font-bold px-3 py-1 bg-luxury-950 rounded-lg border border-slate-700 text-sm">
                    {annualIncomeDzd.toLocaleString()} DZD
                  </span>
                </div>
                <input
                  type="range"
                  min="300000"
                  max="5000000"
                  step="50000"
                  value={annualIncomeDzd}
                  onChange={(e) => setAnnualIncomeDzd(parseInt(e.target.value))}
                  className="w-full h-2 bg-luxury-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>300,000 DZD (~25,000/mo)</span>
                  <span>2,500,000 DZD</span>
                  <span>5,000,000+ DZD</span>
                </div>
              </div>

              {/* Real Estate Value Estimate */}
              <div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <label className="text-slate-300 font-medium">Estimated Value of Family Residence:</label>
                  <span className="text-slate-200 font-bold px-3 py-1 bg-luxury-950 rounded-lg border border-slate-700 text-sm">
                    {realEstateValueDzd.toLocaleString()} DZD
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15000000"
                  step="250000"
                  value={realEstateValueDzd}
                  onChange={(e) => setRealEstateValueDzd(parseInt(e.target.value))}
                  className="w-full h-2 bg-luxury-950 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>0 (Renting)</span>
                  <span>5,000,000 DZD</span>
                  <span>15,000,000+ DZD</span>
                </div>
              </div>

              {/* Informative Note */}
              <div className="p-4 rounded-xl bg-luxury-950/80 border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <HelpCircle className="w-3.5 h-3.5 text-italia-green" />
                  <span>How is ISEE Parificato verified?</span>
                </div>
                <p>
                  Requires certified translation into Italian: Family record book (Fiche Familiale), 
                  parental annual salary slips (C20 / ATS / Fiche de Paie), and certificate of non-property or residence from the Conservation Foncière, 
                  legalized by the Algerian Ministry of Foreign Affairs (MAE) and Italian consular services.
                </p>
              </div>
            </div>
          </div>

          {/* Results Summary Card */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl glass-panel tricolor-glow-card flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between gap-2 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Simulation Outcome</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  Consular Rate 145 DZD/€
                </span>
              </div>

              {/* Estimated ISEE Number */}
              <div className="mb-6">
                <span className="text-xs text-slate-400 block mb-1">Estimated ISEE Parificato Value:</span>
                <div className="text-4xl sm:text-5xl font-extrabold text-white font-display tracking-tight flex items-baseline gap-2">
                  <span>€{iseeResult.isee.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 font-medium">/ year</span>
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  Official Regional Maximum Limit: €{iseeResult.maxThreshold.toLocaleString()}
                </span>
              </div>

              {/* Eligibility Result Banner */}
              {iseeResult.qualifies ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 mb-6">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Eligible: {iseeResult.tier}</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Your calculated income is well below the regional threshold. You qualify for the maximum state scholarship package!
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 mb-6">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>Requires Assessment Review</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Your calculated ISEE is near the cap. Contact our advisors to review valid deductions for family size and dependent allowances.
                  </p>
                </div>
              )}

              {/* Guaranteed Package Breakdown */}
              <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Cash Living Stipend:</span>
                  <strong className="text-emerald-400 font-bold text-sm">{iseeResult.estimatedStipend}</strong>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">University Tuition:</span>
                  <strong className="text-white font-bold">100% Free (€0 / year)</strong>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Daily Campus Dining (Mensa):</span>
                  <strong className="text-white font-bold">1 to 2 Free Meals / Day</strong>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-400">University Housing:</span>
                  <strong className="text-white font-bold">Priority Residence Hall</strong>
                </div>
              </div>
            </div>

            {/* Apply Action */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <button
                onClick={onOpenApply}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-italia-green hover:bg-emerald-600 shadow-green-glow transition-all flex items-center justify-center gap-2"
              >
                <span>Lock In My Scholarship File</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
