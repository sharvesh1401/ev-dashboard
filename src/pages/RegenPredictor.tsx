import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Zap, Activity, Mountain, Car, TrendingUp, Battery, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface RegenInputs {
  vehicleWeight: number;
  speed: number;
  brakeIntensity: number;
  terrainType: string;
  regenEfficiency: number;
  tripDistance: number;
  elevationChange: number;
}

interface RegenPrediction {
  energyRecovered: number;
  rangeExtension: number;
  efficiencyGain: number;
  brakeEvents: number;
  potentialSavings: number;
}

const RegenPredictor = () => {
  const [inputs, setInputs] = useState<RegenInputs>({
    vehicleWeight: 1800,
    speed: 50,
    brakeIntensity: 70,
    terrainType: "mixed",
    regenEfficiency: 85,
    tripDistance: 100,
    elevationChange: 200,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<RegenPrediction | null>(null);
  const { toast } = useToast();

  const predictRegen = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2200));
      
      // Complex regenerative braking calculation
      const kineticEnergy = 0.5 * inputs.vehicleWeight * Math.pow(inputs.speed / 3.6, 2) / 1000; // kWh
      
      // Terrain factors
      const terrainFactors = {
        flat: { brakingEvents: 3, elevationFactor: 0.1 },
        mixed: { brakingEvents: 8, elevationFactor: 0.5 },
        hilly: { brakingEvents: 15, elevationFactor: 1.0 },
        mountainous: { brakingEvents: 25, elevationFactor: 1.5 },
      };
      
      const terrain = terrainFactors[inputs.terrainType as keyof typeof terrainFactors] || terrainFactors.mixed;
      
      // Calculate braking events per 100km
      const brakeEventsTotal = (inputs.tripDistance / 100) * terrain.brakingEvents;
      
      // Energy recovery calculation
      const brakeIntensityFactor = inputs.brakeIntensity / 100;
      const efficiencyFactor = inputs.regenEfficiency / 100;
      const elevationEnergy = (inputs.elevationChange * inputs.vehicleWeight * 9.81) / (3.6e6); // kWh
      
      const energyPerBrake = kineticEnergy * brakeIntensityFactor * efficiencyFactor;
      const totalKineticRecovery = energyPerBrake * brakeEventsTotal;
      const elevationRecovery = elevationEnergy * terrain.elevationFactor * efficiencyFactor;
      
      const totalEnergyRecovered = totalKineticRecovery + elevationRecovery;
      
      // Range and efficiency calculations
      const avgConsumption = 0.2; // kWh/km
      const rangeExtension = totalEnergyRecovered / avgConsumption;
      const efficiencyGain = (totalEnergyRecovered / (inputs.tripDistance * avgConsumption)) * 100;
      const potentialSavings = totalEnergyRecovered * 0.15; // $0.15 per kWh
      
      setPrediction({
        energyRecovered: Math.round(totalEnergyRecovered * 1000) / 1000,
        rangeExtension: Math.round(rangeExtension * 10) / 10,
        efficiencyGain: Math.round(efficiencyGain * 10) / 10,
        brakeEvents: Math.round(brakeEventsTotal),
        potentialSavings: Math.round(potentialSavings * 100) / 100,
      });
      
      toast({
        title: "Regeneration Calculated",
        description: "Energy recovery prediction has been generated.",
      });
    } catch (error) {
      toast({
        title: "Calculation Failed",
        description: "Unable to calculate energy recovery. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [inputs, toast]);

  const handleInputChange = (field: keyof RegenInputs, value: string | number) => {
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
          <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-emerald-100">Regenerative Energy Predictor</h1>
            <p className="text-emerald-200/80">Estimate energy recovery from regenerative braking</p>
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
            <h2 className="text-xl font-semibold text-emerald-100 mb-6">Trip & Vehicle Parameters</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-emerald-100">Vehicle Weight (kg)</Label>
                  <Input
                    type="number"
                    value={inputs.vehicleWeight}
                    onChange={(e) => handleInputChange('vehicleWeight', Number(e.target.value))}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-100">Trip Distance (km)</Label>
                  <Input
                    type="number"
                    value={inputs.tripDistance}
                    onChange={(e) => handleInputChange('tripDistance', Number(e.target.value))}
                    className="glass-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-emerald-100 flex items-center gap-2">
                    <Car className="h-4 w-4 text-emerald-400" />
                    Average Speed
                  </Label>
                  <span className="text-emerald-400 font-medium">{inputs.speed} km/h</span>
                </div>
                <Slider
                  value={[inputs.speed]}
                  onValueChange={([value]) => handleInputChange('speed', value)}
                  min={20}
                  max={120}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-emerald-100 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    Brake Intensity
                  </Label>
                  <span className="text-emerald-400 font-medium">{inputs.brakeIntensity}%</span>
                </div>
                <Slider
                  value={[inputs.brakeIntensity]}
                  onValueChange={([value]) => handleInputChange('brakeIntensity', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-emerald-100 flex items-center gap-2">
                    <Battery className="h-4 w-4 text-emerald-400" />
                    Regen Efficiency
                  </Label>
                  <span className="text-emerald-400 font-medium">{inputs.regenEfficiency}%</span>
                </div>
                <Slider
                  value={[inputs.regenEfficiency]}
                  onValueChange={([value]) => handleInputChange('regenEfficiency', value)}
                  min={60}
                  max={95}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-emerald-100 flex items-center gap-2">
                  <Mountain className="h-4 w-4 text-emerald-400" />
                  Terrain Type
                </Label>
                <Select value={inputs.terrainType} onValueChange={(value) => handleInputChange('terrainType', value)}>
                  <SelectTrigger className="glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="flat">Flat (highways, city)</SelectItem>
                    <SelectItem value="mixed">Mixed terrain</SelectItem>
                    <SelectItem value="hilly">Hilly roads</SelectItem>
                    <SelectItem value="mountainous">Mountainous</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-emerald-100">Total Elevation Change (m)</Label>
                <Input
                  type="number"
                  value={inputs.elevationChange}
                  onChange={(e) => handleInputChange('elevationChange', Number(e.target.value))}
                  className="glass-input"
                />
              </div>
            </div>

            <Button
              onClick={predictRegen}
              disabled={isLoading}
              className="w-full mt-6 glass-button-enhanced bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-400/30"
            >
              {isLoading ? "Calculating..." : "Calculate Energy Recovery"}
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
            <h2 className="text-xl font-semibold text-emerald-100 mb-6">Energy Recovery Prediction</h2>
            
            {prediction ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="glass-card-enhanced p-6 bg-gradient-to-r from-orange-500/25 to-red-600/25 border-orange-500/40">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-400 mb-2">
                      {prediction.energyRecovered}
                    </div>
                    <div className="text-lg text-emerald-100/90">
                      kWh Recovered
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card-enhanced p-4 text-center">
                    <div className="text-xl font-bold text-emerald-100">+{prediction.rangeExtension}</div>
                    <div className="text-sm text-emerald-200/70">km range extension</div>
                  </div>
                  <div className="glass-card-enhanced p-4 text-center">
                    <div className="text-xl font-bold text-emerald-100">{prediction.efficiencyGain}%</div>
                    <div className="text-sm text-emerald-200/70">efficiency gain</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center glass-card-enhanced p-3">
                    <span className="text-emerald-200/80">Braking events</span>
                    <span className="text-emerald-100 font-medium">{prediction.brakeEvents}</span>
                  </div>
                  <div className="flex justify-between items-center glass-card-enhanced p-3">
                    <span className="text-emerald-200/80">Potential savings</span>
                    <span className="text-green-400 font-medium">${prediction.potentialSavings}</span>
                  </div>
                </div>

                <div className="glass-card-enhanced p-4 bg-emerald-500/15 border-emerald-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-100 font-medium">Recovery Insight</span>
                  </div>
                  <div className="text-sm text-emerald-200/85">
                    Based on your driving profile, regenerative braking will recover{" "}
                    <span className="text-emerald-400 font-medium">{prediction.energyRecovered} kWh</span> of energy,
                    extending your range by <span className="text-emerald-400 font-medium">{prediction.rangeExtension} km</span>.
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12 text-emerald-200/70">
                <Zap className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Enter your trip parameters and click "Calculate Energy Recovery" to see how much energy you can recover.</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default RegenPredictor;