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
  Thermometer, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Info,
  Lightbulb,
  Sparkles,
  Heart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type Step = "education" | "questionnaire" | "results" | "recommendations" | "doctors";

const educationContent = {
  title: "Understanding Menopause",
  description: "Menopause is a natural biological process marking the end of menstrual cycles. Understanding it helps you navigate this transition with confidence.",
  sections: [
    {
      title: "What is Menopause?",
      content: "Menopause is officially diagnosed after 12 consecutive months without a menstrual period. It typically occurs in your late 40s to early 50s, with the average age being 51. The transition period (perimenopause) can begin years earlier.",
    },
    {
      title: "Stages of Menopause",
      items: ["Perimenopause: Transition phase with irregular periods", "Menopause: 12 months without menstruation", "Postmenopause: Years after menopause", "Early menopause: Before age 45", "Premature menopause: Before age 40"],
    },
    {
      title: "Common Symptoms",
      items: ["Hot flashes and night sweats", "Irregular periods", "Mood changes and irritability", "Sleep disturbances", "Vaginal dryness", "Weight gain", "Memory issues", "Joint pain"],
    },
    {
      title: "Why Understanding Matters",
      content: "Recognizing menopause symptoms early allows for better management strategies, helps maintain bone and heart health, and improves quality of life during this natural transition.",
    },
  ],
};

const questions = [
  { 
    id: 1, 
    text: "What is your current age?", 
    factor: "Age Factor",
    options: [
      { text: "Under 40", score: 0 },
      { text: "40-45", score: 1 },
      { text: "46-50", score: 2 },
      { text: "51 or older", score: 3 }
    ]
  },
  { 
    id: 2, 
    text: "How regular are your menstrual periods?", 
    factor: "Period Regularity",
    options: [
      { text: "Very regular", score: 0 },
      { text: "Slightly irregular (varies by a few days)", score: 1 },
      { text: "Very irregular or skipping months", score: 2 },
      { text: "Periods have stopped", score: 3 }
    ]
  },
  { 
    id: 3, 
    text: "Do you experience hot flashes or night sweats?", 
    factor: "Vasomotor Symptoms",
    options: [
      { text: "Never", score: 0 },
      { text: "Occasionally (few times a month)", score: 1 },
      { text: "Frequently (weekly)", score: 2 },
      { text: "Daily or multiple times daily", score: 3 }
    ]
  },
  { 
    id: 4, 
    text: "How would you describe your sleep quality?", 
    factor: "Sleep Quality",
    options: [
      { text: "Sleep well most nights", score: 0 },
      { text: "Occasional difficulty sleeping", score: 1 },
      { text: "Frequent sleep problems", score: 2 },
      { text: "Severe insomnia or constant waking", score: 3 }
    ]
  },
  { 
    id: 5, 
    text: "Have you noticed mood changes or increased irritability?", 
    factor: "Mood Changes",
    options: [
      { text: "No noticeable changes", score: 0 },
      { text: "Mild mood fluctuations", score: 1 },
      { text: "Noticeable mood swings", score: 2 },
      { text: "Significant mood disturbances", score: 3 }
    ]
  },
  { 
    id: 6, 
    text: "Do you experience vaginal dryness or discomfort?", 
    factor: "Vaginal Health",
    options: [
      { text: "No issues", score: 0 },
      { text: "Occasional dryness", score: 1 },
      { text: "Frequent discomfort", score: 2 },
      { text: "Constant dryness/discomfort", score: 3 }
    ]
  },
  { 
    id: 7, 
    text: "Do you experience joint pain or stiffness?", 
    factor: "Joint Health",
    options: [
      { text: "No joint issues", score: 0 },
      { text: "Occasional stiffness", score: 1 },
      { text: "Regular joint pain", score: 2 },
      { text: "Significant joint problems", score: 3 }
    ]
  },
  { 
    id: 8, 
    text: "How would you rate your energy levels?", 
    factor: "Energy & Fatigue",
    options: [
      { text: "Good energy levels", score: 0 },
      { text: "Slightly lower than usual", score: 1 },
      { text: "Noticeably fatigued", score: 2 },
      { text: "Constantly exhausted", score: 3 }
    ]
  },
];

const MenopauseModule = () => {
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

  const stageCategory = useMemo(() => {
    if (score < 25) return { label: "Pre-menopausal", color: "text-teal", level: "low" as const };
    if (score < 50) return { label: "Early Perimenopause", color: "text-accent", level: "low" as const };
    if (score < 75) return { label: "Late Perimenopause", color: "text-accent", level: "medium" as const };
    return { label: "Menopausal/Post-menopausal", color: "text-primary", level: "high" as const };
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
        assessment_type: "menopause",
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
                    ? "bg-teal text-teal-foreground scale-110" 
                    : (["education", "questionnaire", "results", "recommendations", "doctors"] as Step[]).indexOf(currentStep) > i
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                {i < 4 && (
                  <div className={`w-6 md:w-12 h-0.5 transition-colors duration-300 ${
                    (["education", "questionnaire", "results", "recommendations", "doctors"] as Step[]).indexOf(currentStep) > i 
                      ? "bg-primary" 
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
                <div className="w-20 h-20 rounded-2xl bg-teal/20 flex items-center justify-center mx-auto mb-6">
                  <Thermometer className="w-10 h-10 text-teal" />
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
                      <Info className="w-5 h-5 text-teal" />
                      {section.title}
                    </h3>
                    {section.content && (
                      <p className="text-muted-foreground">{section.content}</p>
                    )}
                    {section.items && (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {section.items.map((item, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-foreground">
                            <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
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
                  <Heart className="w-5 h-5 mr-2" />
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
                    className="bg-teal h-2 rounded-full transition-all duration-500 ease-out"
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
                    className={`glass-card rounded-xl p-4 text-left hover:border-teal hover:shadow-glow transition-all duration-300 border-2 ${
                      answers[questions[currentQuestion].id] === option.score 
                        ? "border-teal bg-teal/10" 
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

              {Object.keys(answers).length > 0 && (
                <div className="mt-8 p-4 rounded-xl bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">
                    Current Stage Indicator: <span className={stageCategory.color + " font-semibold"}>{stageCategory.label}</span>
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
                  Your Menopause Assessment
                </h1>
                <p className="text-muted-foreground">
                  Based on your responses, here's your personalized analysis
                </p>
              </div>

              <div className="glass-card rounded-2xl p-8 text-center mb-8">
                <RiskGauge score={score} label="Symptom Score" color={stageCategory.color} />
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mt-6 ${
                  stageCategory.level === "low" ? "bg-teal/20" : 
                  stageCategory.level === "medium" ? "bg-accent/20" : "bg-primary/20"
                } ${stageCategory.color}`}>
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-semibold">{stageCategory.label}</span>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 mb-8">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Symptom Analysis
                </h3>
                <RiskChart factors={riskFactors} />
              </div>

              <div className="glass-card rounded-2xl p-6 mb-8">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-teal" />
                  Understanding Your Stage
                </h3>
                <p className="text-muted-foreground mb-4">
                  {score < 25 
                    ? "Your symptoms suggest you're likely in a pre-menopausal stage. Continue monitoring any changes and maintain a healthy lifestyle."
                    : score < 50
                    ? "Your symptoms indicate you may be entering perimenopause. This is a normal transition that can last several years."
                    : score < 75
                    ? "You're showing signs of late perimenopause. Consider discussing symptom management options with your healthcare provider."
                    : "Your symptoms suggest you're in menopause or post-menopause. Focus on maintaining bone and heart health."
                  }
                </p>
                <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                  <strong>Most Significant Symptoms:</strong>{" "}
                  {riskFactors
                    .filter(f => f.value >= 2)
                    .map(f => f.name)
                    .join(", ") || "No severe symptoms detected"}
                </div>
              </div>

              <HealthDisclaimer />

              <div className="text-center mt-8">
                <Button size="lg" onClick={() => setCurrentStep("recommendations")} className="group">
                  View Recommendations
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
                  Your Wellness Plan
                </h1>
                <p className="text-muted-foreground">
                  Personalized recommendations for your menopause journey
                </p>
              </div>

              <Recommendations riskLevel={stageCategory.level} type="menopause" />

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <Button size="lg" onClick={() => setCurrentStep("doctors")} className="group">
                  Find Specialists
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
                  Find menopause specialists and endocrinologists near you
                </p>
              </div>

              <NearbyDoctors specialty="gynecologist menopause endocrinologist" />

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

export default MenopauseModule;
