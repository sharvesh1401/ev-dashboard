import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { DollarSign, MapPin, Clock, Zap, TrendingUp, Calculator, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { incrementPredictionCount } from "@/lib/predictionCounter";

interface CostInputs {
  batteryCapacity: number;
  currentCharge: number;
  targetCharge: number;
  location: string;
  timeOfDay: string;
  chargingSpeed: string;
  electricityRate: number;
}

interface CostPrediction {
  totalCost: number;
  costPerKWh: number;
  chargingTime: number;
  energyNeeded: number;
  peakHourSurcharge: number;
}

const ChargingCost = () => {
  const [inputs, setInputs] = useState<CostInputs>({
    batteryCapacity: 75,
    currentCharge: 20,
    targetCharge: 80,
    location: "home",
    timeOfDay: "evening",
    chargingSpeed: "standard",
    electricityRate: 0.15,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<CostPrediction | null>(null);
  const { toast } = useToast();

  const predictCost = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      const energyNeeded = ((inputs.targetCharge - inputs.currentCharge) / 100) * inputs.batteryCapacity;
      
      // Location multipliers
      const locationMultipliers = {
        home: 1.0,
        public: 1.5,
        highway: 2.0,
        workplace: 0.8,
      };
      
      // Time-of-day multipliers
      const timeMultipliers = {
        morning: 1.2,
        afternoon: 1.0,
        evening: 1.4,
        night: 0.8,
      };
      
      // Charging speed factors
      const speedFactors = {
        slow: { multiplier: 0.9, timeHours: energyNeeded / 3.7 },
        standard: { multiplier: 1.0, timeHours: energyNeeded / 7.4 },
        fast: { multiplier: 1.3, timeHours: energyNeeded / 50 },
        superfast: { multiplier: 1.8, timeHours: energyNeeded / 150 },
      };
      
      const locationMult = locationMultipliers[inputs.location as keyof typeof locationMultipliers] || 1.0;
      const timeMult = timeMultipliers[inputs.timeOfDay as keyof typeof timeMultipliers] || 1.0;
      const speedFactor = speedFactors[inputs.chargingSpeed as keyof typeof speedFactors] || speedFactors.standard;
      
      const costPerKWh = inputs.electricityRate * locationMult * timeMult * speedFactor.multiplier;
      const totalCost = energyNeeded * costPerKWh;
      const peakHourSurcharge = totalCost * Math.max(0, timeMult - 1.0);
      
      setPrediction({
        totalCost: Math.round(totalCost * 100) / 100,
        costPerKWh: Math.round(costPerKWh * 1000) / 1000,
        chargingTime: Math.round(speedFactor.timeHours * 60) / 60,
        energyNeeded: Math.round(energyNeeded * 10) / 10,
        peakHourSurcharge: Math.round(peakHourSurcharge * 100) / 100,
      });
      
      // Increment prediction counter
      incrementPredictionCount();
      
      toast({
        title: "Cost Calculated",
        description: "Charging cost forecast has been generated.",
      });
    } catch (error) {
      toast({
        title: "Calculation Failed",
        description: "Unable to calculate charging cost. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [inputs, toast]);

  const handleInputChange = (field: keyof CostInputs, value: string | number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    setPrediction(null);
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
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-emerald-100">Charging Cost Forecaster</h1>
            <p className="text-emerald-200/80">Predict charging costs based on location and time</p>
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
            <h2 className="text-xl font-semibold text-emerald-100 mb-6">Charging Parameters</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-emerald-100">Battery Capacity (kWh)</Label>
                  <Input
                    type="number"
                    value={inputs.batteryCapacity}
                    onChange={(e) => handleInputChange('batteryCapacity', Number(e.target.value))}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-100">Electricity Rate ($/kWh)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={inputs.electricityRate}
                    onChange={(e) => handleInputChange('electricityRate', Number(e.target.value))}
                    className="glass-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-emerald-100">Current Charge (%)</Label>
                  <Input
                    type="number"
                    value={inputs.currentCharge}
                    onChange={(e) => handleInputChange('currentCharge', Number(e.target.value))}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-100">Target Charge (%)</Label>
                  <Input
                    type="number"
                    value={inputs.targetCharge}
                    onChange={(e) => handleInputChange('targetCharge', Number(e.target.value))}
                    className="glass-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-emerald-100 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  Charging Location
                </Label>
                <Select value={inputs.location} onValueChange={(value) => handleInputChange('location', value)}>
                  <SelectTrigger className="glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="home">Home (Residential)</SelectItem>
                    <SelectItem value="workplace">Workplace</SelectItem>
                    <SelectItem value="public">Public Station</SelectItem>
                    <SelectItem value="highway">Highway Fast Charger</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-emerald-100 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  Time of Day
                </Label>
                <Select value={inputs.timeOfDay} onValueChange={(value) => handleInputChange('timeOfDay', value)}>
                  <SelectTrigger className="glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="morning">Morning (6AM-12PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12PM-6PM)</SelectItem>
                    <SelectItem value="evening">Evening (6PM-10PM)</SelectItem>
                    <SelectItem value="night">Night (10PM-6AM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-emerald-100 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-400" />
                  Charging Speed
                </Label>
                <Select value={inputs.chargingSpeed} onValueChange={(value) => handleInputChange('chargingSpeed', value)}>
                  <SelectTrigger className="glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="slow">Slow (3.7kW)</SelectItem>
                    <SelectItem value="standard">Standard (7.4kW)</SelectItem>
                    <SelectItem value="fast">Fast (50kW)</SelectItem>
                    <SelectItem value="superfast">Superfast (150kW)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={predictCost}
              disabled={isLoading}
              className="w-full mt-6 glass-button-enhanced bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-400/30"
            >
              {isLoading ? "Calculating..." : "Calculate Cost"}
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
            <h2 className="text-xl font-semibold text-emerald-100 mb-6">Cost Forecast</h2>
            
            {prediction ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="glass-card-enhanced p-6 bg-gradient-to-r from-purple-500/25 to-pink-600/25 border-purple-500/40">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-400 mb-2">
                      ${prediction.totalCost}
                    </div>
                    <div className="text-lg text-emerald-100/90">
                      Total Charging Cost
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card-enhanced p-4 text-center">
                    <div className="text-xl font-bold text-emerald-100">{prediction.energyNeeded}</div>
                    <div className="text-sm text-emerald-200/70">kWh needed</div>
                  </div>
                  <div className="glass-card-enhanced p-4 text-center">
                    <div className="text-xl font-bold text-emerald-100">{prediction.chargingTime}h</div>
                    <div className="text-sm text-emerald-200/70">charging time</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center glass-card-enhanced p-3">
                    <span className="text-emerald-200/80">Cost per kWh</span>
                    <span className="text-emerald-100 font-medium">${prediction.costPerKWh}</span>
                  </div>
                  {prediction.peakHourSurcharge > 0 && (
                    <div className="flex justify-between items-center glass-card-enhanced p-3 bg-yellow-500/15 border-yellow-500/40">
                      <span className="text-emerald-200/80">Peak hour surcharge</span>
                      <span className="text-yellow-400 font-medium">+${prediction.peakHourSurcharge}</span>
                    </div>
                  )}
                </div>

                <div className="glass-card-enhanced p-4 bg-emerald-500/15 border-emerald-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-100 font-medium">Cost Breakdown</span>
                  </div>
                  <div className="text-sm text-emerald-200/85">
                    {prediction.energyNeeded} kWh × ${prediction.costPerKWh}/kWh = ${prediction.totalCost}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12 text-emerald-200/70">
                <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Enter your charging parameters and click "Calculate Cost" to get a detailed forecast.</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ChargingCost;