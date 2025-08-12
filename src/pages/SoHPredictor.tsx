import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, Zap, Activity, AlertTriangle, ArrowLeft, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

interface SoHInputs {
  batteryAge: number;
  cycleCount: number;
  averageTemp: number;
  chargingSpeed: number;
  depthOfDischarge: number;
  idleTime: number;
}

interface SoHPrediction {
  currentSoH: number;
  futureSOH: number;
  degradationRate: number;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  recommendation: string;
}

const SoHPredictor = () => {
  const [inputs, setInputs] = useState<SoHInputs>({
    batteryAge: 24,
    cycleCount: 500,
    averageTemp: 25,
    chargingSpeed: 50,
    depthOfDischarge: 80,
    idleTime: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<SoHPrediction | null>(null);
  const { toast } = useToast();

  // Simulate ML model prediction for State of Health
  const predictSoH = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate model loading and inference
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Complex SoH prediction algorithm (replace with actual ML model)
      const ageFactor = Math.max(0, 1 - (inputs.batteryAge / 100) * 0.5);
      const cycleFactor = Math.max(0, 1 - (inputs.cycleCount / 2000) * 0.4);
      const tempFactor = 1 - Math.abs(inputs.averageTemp - 20) * 0.005;
      const chargeFactor = 1 - Math.abs(inputs.chargingSpeed - 30) * 0.002;
      const dodFactor = 1 - (inputs.depthOfDischarge / 100) * 0.1;
      const idleFactor = 1 - (inputs.idleTime / 100) * 0.05;
      
      const currentSoH = Math.max(50, Math.min(100, 
        100 * ageFactor * cycleFactor * tempFactor * chargeFactor * dodFactor * idleFactor
      ));
      
      const degradationRate = (100 - currentSoH) / inputs.batteryAge;
      const futureSOH = Math.max(0, currentSoH - degradationRate * 12);
      
      let healthStatus: SoHPrediction['healthStatus'] = 'excellent';
      let recommendation = 'Battery is in excellent condition. Continue current charging practices.';
      
      if (currentSoH < 90) {
        healthStatus = 'good';
        recommendation = 'Battery health is good. Consider optimizing charging habits for longevity.';
      }
      if (currentSoH < 80) {
        healthStatus = 'fair';
        recommendation = 'Battery showing signs of aging. Monitor performance and consider service.';
      }
      if (currentSoH < 70) {
        healthStatus = 'poor';
        recommendation = 'Battery health is concerning. Professional assessment recommended.';
      }
      
      setPrediction({
        currentSoH: Math.round(currentSoH * 10) / 10,
        futureSOH: Math.round(futureSOH * 10) / 10,
        degradationRate: Math.round(degradationRate * 100) / 100,
        healthStatus,
        recommendation
      });
      
      toast({
        title: "SoH Analysis Complete",
        description: "Battery health assessment has been generated.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze battery health. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [inputs, toast]);

  const handleInputChange = (field: keyof SoHInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    setPrediction(null);
  };

  const getHealthColor = (status: SoHPrediction['healthStatus']) => {
    switch (status) {
      case 'excellent': return 'text-emerald-400';
      case 'good': return 'text-green-400';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-white';
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
          <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-emerald-100">State of Health Predictor</h1>
            <p className="text-emerald-200/80">Analyze battery health with advanced ML algorithms</p>
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
            <h2 className="text-xl font-semibold text-emerald-100 mb-6">Battery History</h2>
            
            <div className="space-y-6">
              {/* Battery Age */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-emerald-100 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    Battery Age
                  </Label>
                  <span className="text-emerald-400 font-medium">{inputs.batteryAge} months</span>
                </div>
                <Slider
                  value={[inputs.batteryAge]}
                  onValueChange={([value]) => handleInputChange('batteryAge', value)}
                  max={120}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Cycle Count */}
              <div className="space-y-2">
                <Label className="text-emerald-100">Charge Cycles</Label>
                <Input
                  type="number"
                  value={inputs.cycleCount}
                  onChange={(e) => handleInputChange('cycleCount', Number(e.target.value))}
                  className="glass-input"
                />
              </div>

              {/* Average Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-emerald-100 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    Avg Operating Temp
                  </Label>
                  <span className="text-emerald-400 font-medium">{inputs.averageTemp}°C</span>
                </div>
                <Slider
                  value={[inputs.averageTemp]}
                  onValueChange={([value]) => handleInputChange('averageTemp', value)}
                  min={-10}
                  max={60}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Charging Speed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-emerald-100 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    Avg Charging Speed
                  </Label>
                  <span className="text-emerald-400 font-medium">{inputs.chargingSpeed} kW</span>
                </div>
                <Slider
                  value={[inputs.chargingSpeed]}
                  onValueChange={([value]) => handleInputChange('chargingSpeed', value)}
                  max={150}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Depth of Discharge */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-emerald-100">Depth of Discharge</Label>
                  <span className="text-emerald-400 font-medium">{inputs.depthOfDischarge}%</span>
                </div>
                <Slider
                  value={[inputs.depthOfDischarge]}
                  onValueChange={([value]) => handleInputChange('depthOfDischarge', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Idle Time */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-emerald-100">Daily Idle Time</Label>
                  <span className="text-emerald-400 font-medium">{inputs.idleTime}h</span>
                </div>
                <Slider
                  value={[inputs.idleTime]}
                  onValueChange={([value]) => handleInputChange('idleTime', value)}
                  max={24}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <Button
              onClick={predictSoH}
              disabled={isLoading}
              className="w-full mt-6 glass-button-enhanced bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-400/30"
            >
              {isLoading ? "Analyzing..." : "Analyze Battery Health"}
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
            <h2 className="text-xl font-semibold text-emerald-100 mb-6">Health Analysis</h2>
            
            {prediction ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Current SoH */}
                <div className="glass-card-enhanced p-6 bg-gradient-to-r from-blue-500/25 to-cyan-600/25 border-blue-500/40">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400 mb-2">
                      {prediction.currentSoH}%
                    </div>
                    <div className="text-lg text-emerald-100/90 mb-2">
                      Current State of Health
                    </div>
                    <div className={`text-sm font-medium ${getHealthColor(prediction.healthStatus)}`}>
                      {prediction.healthStatus.toUpperCase()}
                    </div>
                  </div>
                </div>
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card-enhanced p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-100">{prediction.futureSOH}%</div>
                    <div className="text-sm text-emerald-200/70">Predicted SoH (1 year)</div>
                  </div>
                  <div className="glass-card-enhanced p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-100">{prediction.degradationRate}%</div>
                    <div className="text-sm text-emerald-200/70">Monthly degradation</div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="glass-card-enhanced p-4 bg-emerald-500/15 border-emerald-400/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-emerald-100 mb-1">Recommendation</h4>
                      <p className="text-sm text-emerald-200/85">{prediction.recommendation}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12 text-emerald-200/70">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Enter your battery usage data and click "Analyze Battery Health" to get a comprehensive assessment.</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Battsense Integration Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-emerald-200/80 text-sm leading-relaxed">
              <strong>Note:</strong> This in-dashboard check is quick & manual. For detailed CSV-based diagnostics, use Battsense.
            </p>
          </div>
          <a
            href="https://battsense.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-button-enhanced px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-400/30 transition-all duration-300 hover:scale-105 flex items-center gap-2 btn-touch"
          >
            <span className="font-medium">Battsense</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default SoHPredictor;