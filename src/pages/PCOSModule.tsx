import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { RiskGauge } from "@/components/health/RiskGauge";
import { RiskChart } from "@/components/health/RiskChart";
import { NearbyDoctors } from "@/components/health/NearbyDoctors";
import { HealthDisclaimer } from "@/components/health/HealthDisclaimer";
import { Recommendations } from "@/components/health/Recommendations";
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Info,
  Lightbulb,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type Step = "education" | "questionnaire" | "results" | "recommendations" | "doctors";

const educationContent = {
  title: "Understanding PCOS",
  description: "Polycystic Ovary Syndrome (PCOS) is a common hormonal disorder affecting 1 in 10 women of reproductive age. Early detection can significantly improve quality of life.",
  sections: [
    {
      title: "What is PCOS?",
      content: "PCOS is a condition where the ovaries produce higher-than-normal amounts of male hormones (androgens), which can affect ovulation and cause various symptoms. It's one of the most common causes of female infertility.",
    },
    {
      title: "Common Symptoms",
      items: ["Irregular or missed periods", "Excess hair growth (hirsutism)", "Acne and oily skin", "Weight gain", "Hair thinning on scalp", "Difficulty getting pregnant", "Darkening of skin"],
    },
    {
      title: "Risk Factors",
      items: ["Family history of PCOS", "Insulin resistance or Type 2 diabetes", "Obesity or excess weight", "Chronic inflammation", "Early puberty"],
    },
    {
      title: "Why Early Detection Matters",
      content: "Early detection can help manage symptoms, reduce long-term health risks like diabetes, heart disease, and endometrial cancer, and improve fertility outcomes. With proper management, most women with PCOS can lead healthy lives.",
    },
  ],
};

const questions = [
  { 
    id: 1, 
    text: "How regular are your menstrual cycles?", 
    factor: "Cycle Regularity",
    options: [
      { text: "Very regular (21-35 days)", score: 0 },
      { text: "Somewhat irregular (varies by 1-2 weeks)", score: 1 },
      { text: "Very irregular (unpredictable)", score: 2 },
      { text: "Absent for 3+ months", score: 3 }
    ]
  },
  { 
    id: 2, 
    text: "Do you experience excess hair growth on face, chest, or back?", 
    factor: "Hirsutism",
    options: [
      { text: "No excess hair", score: 0 },
      { text: "Mild (few noticeable hairs)", score: 1 },
      { text: "Moderate (requires regular removal)", score: 2 },
      { text: "Severe (significant unwanted hair)", score: 3 }
    ]
  },
  { 
    id: 3, 
    text: "How would you describe your acne or skin issues?", 
    factor: "Skin Health",
    options: [
      { text: "Clear skin, no issues", score: 0 },
      { text: "Occasional breakouts", score: 1 },
      { text: "Persistent acne", score: 2 },
      { text: "Severe, cystic acne", score: 3 }
    ]
  },
  { 
    id: 4, 
    text: "Have you experienced unexplained weight gain or difficulty losing weight?", 
    factor: "Weight",
    options: [
      { text: "No weight issues", score: 0 },
      { text: "Slight weight gain (1-5 kg)", score: 1 },
      { text: "Moderate weight gain (5-15 kg)", score: 2 },
      { text: "Significant weight gain (>15 kg)", score: 3 }
    ]
  },
  { 
    id: 5, 
    text: "Do you have a family history of PCOS or diabetes?", 
    factor: "Family History",
    options: [
      { text: "No family history", score: 0 },
      { text: "Diabetes in family", score: 1 },
      { text: "PCOS in family", score: 2 },
      { text: "Both PCOS and diabetes", score: 3 }
    ]
  },
  { 
    id: 6, 
    text: "Do you experience signs of insulin resistance (dark patches on skin, fatigue after meals)?", 
    factor: "Insulin Resistance",
    options: [
      { text: "No signs", score: 0 },
      { text: "Occasional fatigue after meals", score: 1 },
      { text: "Dark patches (acanthosis nigricans)", score: 2 },
      { text: "Multiple signs of insulin resistance", score: 3 }
    ]
  },
  { 
    id: 7, 
    text: "How is your hair health on your scalp?", 
    factor: "Hair Thinning",
    options: [
      { text: "Healthy, full hair", score: 0 },
      { text: "Slightly thinner than before", score: 1 },
      { text: "Noticeable thinning", score: 2 },
      { text: "Significant hair loss", score: 3 }
    ]
  },
];

const PCOSModule = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("education");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [saving, setSaving] = useState(false);

  const score = useMemo(() => {
    const total = Object.values(answers).reduce((a, b) => a + b, 0);
    const maxScore = questions.length * 3;
    return Math.round((total / maxScore) * 100);
  }, [answers]);

  const riskCategory = useMemo(() => {
    if (score < 30) return { label: "Low Risk", color: "text-teal", level: "low" as const };
    if (score < 60) return { label: "Medium Risk", color: "text-accent", level: "medium" as const };
    return { label: "High Risk", color: "text-destructive", level: "high" as const };
  }, [score]);

  const riskFactors = useMemo(() => {
    return questions.map((q) => ({
      name: q.factor,
      value: answers[q.id] ?? 0,
      maxValue: 3,
    }));
  }, [answers]);

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentStep("results");
      saveAssessment(newAnswers);
    }
  };

  const saveAssessment = async (finalAnswers: Record<number, number>) => {
    if (!user) return;
    
    setSaving(true);
    try {
      const total = Object.values(finalAnswers).reduce((a, b) => a + b, 0);
      const maxScore = questions.length * 3;
      const finalScore = Math.round((total / maxScore) * 100);
      
      const { error } = await supabase.from("health_assessments").insert({
        user_id: user.id,
        assessment_type: "pcos",
        risk_score: finalScore,
        risk_category: finalScore < 30 ? "low" : finalScore < 60 ? "medium" : "high",
        responses: finalAnswers,
      });

      if (error) throw error;
      toast({ title: "Assessment saved", description: "Your results have been saved to your profile." });
    } catch (error) {
      console.error("Failed to save assessment:", error);
    } finally {
      setSaving(false);
    }
  };

  const restartAssessment = () => {
    setCurrentStep("education");
    setAnswers({});
    setCurrentQuestion(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {(["education", "questionnaire", "results", "recommendations", "doctors"] as Step[]).map((step, i) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-medium transition-all duration-300 ${
                  currentStep === step 
                    ? "bg-accent text-accent-foreground scale-110" 
                    : (["education", "questionnaire", "results", "recommendations", "doctors"] as Step[]).indexOf(currentStep) > i
                    ? "bg-teal text-teal-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                {i < 4 && (
                  <div className={`w-6 md:w-12 h-0.5 transition-colors duration-300 ${
                    (["education", "questionnaire", "results", "recommendations", "doctors"] as Step[]).indexOf(currentStep) > i 
                      ? "bg-teal" 
                      : "bg-border"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Education Step */}
          {currentStep === "education" && (
            <div className="animate-fade-up">
              <div className="text-center mb-10">
                <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-6">
                  <Activity className="w-10 h-10 text-accent" />
                </div>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {educationContent.title}
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {educationContent.description}
                </p>
              </div>

              <div className="grid gap-6">
                {educationContent.sections.map((section, i) => (
                  <div key={i} className="glass-card rounded-2xl p-6 hover:shadow-glow transition-shadow">
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-accent" />
                      {section.title}
                    </h3>
                    {section.content && (
                      <p className="text-muted-foreground">{section.content}</p>
                    )}
                    {section.items && (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {section.items.map((item, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-foreground">
                            <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <HealthDisclaimer />
              </div>

              <div className="text-center mt-10">
                <Button size="lg" onClick={() => setCurrentStep("questionnaire")} className="group">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Assessment
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          )}

          {/* Questionnaire Step */}
          {currentStep === "questionnaire" && (
            <div className="animate-fade-up">
              <div className="text-center mb-10">
                <div className="text-sm text-muted-foreground mb-2">
                  Question {currentQuestion + 1} of {questions.length}
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-8 overflow-hidden">
                  <div 
                    className="bg-accent h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                  {questions[currentQuestion].text}
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Factor: {questions[currentQuestion].factor}
                </p>
              </div>

              <div className="grid gap-4 max-w-xl mx-auto">
                {questions[currentQuestion].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(option.score)}
                    className={`glass-card rounded-xl p-4 text-left hover:border-accent hover:shadow-glow transition-all duration-300 border-2 ${
                      answers[questions[currentQuestion].id] === option.score 
                        ? "border-accent bg-accent/10" 
                        : "border-transparent"
                    }`}
                  >
                    <span className="text-foreground font-medium">{option.text}</span>
                  </button>
                ))}
              </div>

              {currentQuestion > 0 && (
                <div className="text-center mt-8">
                  <Button variant="ghost" onClick={() => setCurrentQuestion(currentQuestion - 1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous Question
                  </Button>
                </div>
              )}

              {/* Real-time score preview */}
              {Object.keys(answers).length > 0 && (
                <div className="mt-8 p-4 rounded-xl bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">
                    Current Risk Estimate: <span className={riskCategory.color + " font-semibold"}>{score}%</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Results Step */}
          {currentStep === "results" && (
            <div className="animate-fade-up">
              <div className="text-center mb-10">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Your PCOS Risk Assessment
                </h1>
                <p className="text-muted-foreground">
                  Based on your responses, here's your personalized risk analysis
                </p>
              </div>

              <div className="glass-card rounded-2xl p-8 text-center mb-8">
                <RiskGauge score={score} label="Risk Score" color={riskCategory.color} />
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mt-6 ${
                  riskCategory.level === "low" ? "bg-teal/20" : 
                  riskCategory.level === "medium" ? "bg-accent/20" : "bg-destructive/20"
                } ${riskCategory.color}`}>
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-semibold">{riskCategory.label}</span>
                </div>
              </div>

              {/* Risk Factor Breakdown */}
              <div className="glass-card rounded-2xl p-6 mb-8">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Risk Factor Breakdown
                </h3>
                <RiskChart factors={riskFactors} />
              </div>

              {/* Explanation */}
              <div className="glass-card rounded-2xl p-6 mb-8">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-accent" />
                  Why This Result?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your assessment analyzed {questions.length} key indicators including menstrual regularity, 
                  hormonal symptoms, family history, and metabolic factors. 
                  {score < 30 
                    ? " Your responses indicate low presence of common PCOS indicators. Continue monitoring your health and maintaining a balanced lifestyle."
                    : score < 60 
                    ? " Some responses suggest moderate risk factors. Consider consulting a healthcare provider for a clinical evaluation."
                    : " Multiple responses indicate significant risk factors. We strongly recommend consulting a gynecologist or endocrinologist for proper diagnosis and management."
                  }
                </p>
                <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                  <strong>Key Contributing Factors:</strong>{" "}
                  {riskFactors
                    .filter(f => f.value > 1)
                    .map(f => f.name)
                    .join(", ") || "No major risk factors detected"}
                </div>
              </div>

              <HealthDisclaimer />

              <div className="text-center mt-8">
                <Button size="lg" onClick={() => setCurrentStep("recommendations")} className="group">
                  View Personalized Plan
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          )}

          {/* Recommendations Step */}
          {currentStep === "recommendations" && (
            <div className="animate-fade-up">
              <div className="text-center mb-10">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Your Personalized Plan
                </h1>
                <p className="text-muted-foreground">
                  Evidence-based recommendations tailored to your {riskCategory.label.toLowerCase()} profile
                </p>
              </div>

              <Recommendations riskLevel={riskCategory.level} type="pcos" />

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <Button size="lg" onClick={() => setCurrentStep("doctors")} className="group">
                  Find Nearby Specialists
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" onClick={restartAssessment}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Start Over
                </Button>
              </div>
            </div>
          )}

          {/* Doctors Step */}
          {currentStep === "doctors" && (
            <div className="animate-fade-up">
              <div className="text-center mb-10">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Connect with Specialists
                </h1>
                <p className="text-muted-foreground">
                  Find qualified healthcare providers near you for further evaluation
                </p>
              </div>

              <NearbyDoctors specialty="gynecologist endocrinologist PCOS" />

              <div className="text-center mt-10">
                <Button variant="outline" onClick={restartAssessment}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Start New Assessment
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PCOSModule;
