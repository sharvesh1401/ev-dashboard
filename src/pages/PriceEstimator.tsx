import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Calculator, Calendar, MapPin, Battery, TrendingUp, DollarSign, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface PriceInputs {
  make: string;
  model: string;
  year: number;
  mileage: number;
  batteryHealth: number;
  condition: string;
  location: string;
  originalPrice: number;
  batteryCapacity: number;
}

interface PricePrediction {
  estimatedPrice: number;
  priceRange: { min: number; max: number };
  depreciation: number;
  batteryValue: number;
  marketTrend: string;
  confidenceScore: number;
}

const PriceEstimator = () => {
  const [inputs, setInputs] = useState<PriceInputs>({
    make: "tesla",
    model: "model_3",
    year: 2021,
    mileage: 30000,
    batteryHealth: 92,
    condition: "good",
    location: "urban",
    originalPrice: 45000,
    batteryCapacity: 75,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PricePrediction | null>(null);
  const { toast } = useToast();

  const predictPrice = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const currentYear = new Date().getFullYear();
      const vehicleAge = currentYear - inputs.year;
      
      // Base depreciation calculation
      const baseDepreciation = Math.min(0.6, vehicleAge * 0.12 + (inputs.mileage / 100000) * 0.15);
      
      // Brand and model factors
      const brandFactors = {
        tesla: 0.85, // Retains value well
        bmw: 0.75,
        audi: 0.70,
        nissan: 0.65,
        chevrolet: 0.60,
        other: 0.55,
      };
      
      // Condition factors
      const conditionFactors = {
        excellent: 1.1,
        good: 1.0,
        fair: 0.85,
        poor: 0.65,
      };
      
      // Location factors
      const locationFactors = {
        urban: 1.05,
        suburban: 1.0,
        rural: 0.9,
      };
      
      // Battery health impact (critical for EVs)
      const batteryFactor = 0.4 + (inputs.batteryHealth / 100) * 0.6;
      
      const brandFactor = brandFactors[inputs.make as keyof typeof brandFactors] || brandFactors.other;
      const conditionFactor = conditionFactors[inputs.condition as keyof typeof conditionFactors] || 1.0;
      const locationFactor = locationFactors[inputs.location as keyof typeof locationFactors] || 1.0;
      
      // Calculate estimated price
      const retentionRate = (1 - baseDepreciation) * brandFactor * conditionFactor * locationFactor * batteryFactor;
      const estimatedPrice = inputs.originalPrice * retentionRate;
      
      // Price range calculation
      const variance = estimatedPrice * 0.15;
      const priceRange = {
        min: Math.max(0, estimatedPrice - variance),
        max: estimatedPrice + variance,
      };
      
      // Battery value calculation
      const batteryReplacementCost = inputs.batteryCapacity * 200; // $200 per kWh
      const batteryValue = batteryReplacementCost * (inputs.batteryHealth / 100) * 0.7;
      
      // Market trend analysis
      let marketTrend = "stable";
      if (inputs.make === "tesla" && vehicleAge < 3) marketTrend = "increasing";
      else if (vehicleAge > 5) marketTrend = "decreasing";
      
      // Confidence score
      const confidenceScore = Math.min(95, 70 + (inputs.batteryHealth - 70) * 0.5 + (brandFactor - 0.5) * 50);
      
      setPrediction({
        estimatedPrice: Math.round(estimatedPrice),
        priceRange: {
          min: Math.round(priceRange.min),
          max: Math.round(priceRange.max),
        },
        depreciation: Math.round((1 - retentionRate) * 100),
        batteryValue: Math.round(batteryValue),
        marketTrend,
        confidenceScore: Math.round(confidenceScore),
      });
      
      toast({
        title: "Price Estimated",
        description: "Used EV price prediction has been generated.",
      });
    } catch (error) {
      toast({
        title: "Estimation Failed",
        description: "Unable to estimate price. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [inputs, toast]);

  const handleInputChange = (field: keyof PriceInputs, value: string | number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    setPrediction(null);
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-400';
      case 'decreasing': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Link to="/" className="glass-button-enhanced p-3 hover:text-emerald-400 transition-all duration-300 btn-touch hover:scale-105 flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
            <Calculator className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-emerald-100">Used EV Price Estimator</h1>
            <p className="text-emerald-200/80">Predict market value of used electric vehicles</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card p-6">
            <h2 className="text-xl font-semibold text-emerald-100 mb-6">Vehicle Information</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-emerald-100">Make</Label>
                  <Select value={inputs.make} onValueChange={(value) => handleInputChange('make', value)}>
                    <SelectTrigger className="glass-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      <SelectItem value="tesla">Tesla</SelectItem>
                      <SelectItem value="bmw">BMW</SelectItem>
                      <SelectItem value="audi">Audi</SelectItem>
                      <SelectItem value="nissan">Nissan</SelectItem>
                      <SelectItem value="chevrolet">Chevrolet</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-100">Model</Label>
                  <Select value={inputs.model} onValueChange={(value) => handleInputChange('model', value)}>
                    <SelectTrigger className="glass-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      <SelectItem value="model_3">Model 3</SelectItem>
                      <SelectItem value="model_y">Model Y</SelectItem>
                      <SelectItem value="model_s">Model S</SelectItem>
                      <SelectItem value="i3">i3</SelectItem>
                      <SelectItem value="e_tron">e-tron</SelectItem>
                      <SelectItem value="leaf">Leaf</SelectItem>
                      <SelectItem value="bolt">Bolt</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-emerald-100 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    Year
                  </Label>
                  <Input
                    type="number"
                    value={inputs.year}
                    onChange={(e) => handleInputChange('year', Number(e.target.value))}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-100">Mileage (km)</Label>
                  <Input
                    type="number"
                    value={inputs.mileage}
                    onChange={(e) => handleInputChange('mileage', Number(e.target.value))}
                    className="glass-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-emerald-100">Original Price ($)</Label>
                  <Input
                    type="number"
                    value={inputs.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', Number(e.target.value))}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-100">Battery Capacity (kWh)</Label>
                  <Input
                    type="number"
                    value={inputs.batteryCapacity}
                    onChange={(e) => handleInputChange('batteryCapacity', Number(e.target.value))}
                    className="glass-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-emerald-100 flex items-center gap-2">
                    <Battery className="h-4 w-4 text-emerald-400" />
                    Battery Health
                  </Label>
                  <span className="text-emerald-400 font-medium">{inputs.batteryHealth}%</span>
                </div>
                <Slider
                  value={[inputs.batteryHealth]}
                  onValueChange={([value]) => handleInputChange('batteryHealth', value)}
                  min={60}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-emerald-100">Vehicle Condition</Label>
                <Select value={inputs.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                  <SelectTrigger className="glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-emerald-100 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  Location Type
                </Label>
                <Select value={inputs.location} onValueChange={(value) => handleInputChange('location', value)}>
                  <SelectTrigger className="glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="urban">Urban</SelectItem>
                    <SelectItem value="suburban">Suburban</SelectItem>
                    <SelectItem value="rural">Rural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={predictPrice}
              disabled={isLoading}
              className="w-full mt-6 glass-button-enhanced bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-400/30"
            >
              {isLoading ? "Estimating..." : "Estimate Price"}
            </Button>
          </Card>
        </motion.div>

        {/* Results Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card p-6">
            <h2 className="text-xl font-semibold text-emerald-100 mb-6">Price Estimation</h2>
            
            {prediction ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="glass-card-enhanced p-6 bg-gradient-to-r from-green-500/25 to-emerald-600/25 border-green-500/40">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">
                      ${prediction.estimatedPrice.toLocaleString()}
                    </div>
                    <div className="text-lg text-emerald-100/90 mb-2">
                      Estimated Market Value
                    </div>
                    <div className="text-sm text-emerald-200/70">
                      Range: ${prediction.priceRange.min.toLocaleString()} - ${prediction.priceRange.max.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card-enhanced p-4 text-center">
                    <div className="text-xl font-bold text-emerald-100">{prediction.depreciation}%</div>
                    <div className="text-sm text-emerald-200/70">depreciation</div>
                  </div>
                  <div className="glass-card-enhanced p-4 text-center">
                    <div className="text-xl font-bold text-emerald-100">{prediction.confidenceScore}%</div>
                    <div className="text-sm text-emerald-200/70">confidence</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center glass-card-enhanced p-3">
                    <span className="text-emerald-200/80">Battery value</span>
                    <span className="text-emerald-100 font-medium">${prediction.batteryValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center glass-card-enhanced p-3">
                    <span className="text-emerald-200/80">Market trend</span>
                    <span className={`font-medium ${getTrendColor(prediction.marketTrend)}`}>
                      {prediction.marketTrend}
                    </span>
                  </div>
                </div>

                <div className="glass-card-enhanced p-4 bg-emerald-500/15 border-emerald-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-100 font-medium">Market Analysis</span>
                  </div>
                  <div className="text-sm text-emerald-200/85">
                    Based on vehicle age, mileage, battery health ({inputs.batteryHealth}%), and current market conditions,
                    your {inputs.make} {inputs.model} has retained{" "}
                    <span className="text-emerald-400 font-medium">{100 - prediction.depreciation}%</span> of its original value.
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12 text-emerald-200/70">
                <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Enter your vehicle details and click "Estimate Price" to get a comprehensive market valuation.</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PriceEstimator;