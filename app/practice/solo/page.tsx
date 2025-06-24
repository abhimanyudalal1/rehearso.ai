// Add "use client" directive at the very top for Next.js Client Components
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  RotateCcw,
  ArrowLeft,
  Eye,
  Smile,
  AlertCircle,
  BarChart3,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import axios from "axios"; // For making API calls to your Node.js backend

// Import the new AI analysis and speech recognition services
import { aiAnalysis, type SpeechAnalysis } from "@/lib/ai-analysis";
import { speechRecognition, type SpeechMetrics } from "@/lib/speech-recognition";

// Define your backend URLs
const NODE_BACKEND_URL = process.env.NEXT_PUBLIC_NODE_BACKEND_URL || "http://localhost:4000"; // Your Node.js backend
const FASTAPI_WEBSOCKET_URL = process.env.NEXT_PUBLIC_FASTAPI_WEBSOCKET_URL || "ws://localhost:8000/ws/audio"; // Your FastAPI WebSocket

export default function SoloPracticePage() {
  const [currentStep, setCurrentStep] = useState<"setup" | "preparation" | "speaking" | "feedback">("setup");
  const [speakingTime, setSpeakingTime] = useState([2]);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [preparationTime, setPreparationTime] = useState(60); // This variable is defined but not explicitly used for `setTimeRemaining` in preparation step
  const [currentTopic, setCurrentTopic] = useState("");
  const [liveFeedback, setLiveFeedback] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null); // To store the current user's ID

  // Update the state to include real analysis
  const [speechMetrics, setSpeechMetrics] = useState<SpeechMetrics | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SpeechAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const localStreamRef = useRef<MediaStream | null>(null); // To store the media stream

  // Wrapped handleStopRecording in useCallback as it's a dependency for useEffect
  // This must be defined BEFORE the useEffect that uses it.
  const handleStopRecording = useCallback(async () => {
    setIsRecording(false);
    setIsAnalyzing(true);

    // Stop all tracks on the local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    try {
      // Get speech metrics
      const metrics = speechRecognition.stopRecording();
      setSpeechMetrics(metrics);

      // Analyze speech with AI
      const analysis = await aiAnalysis.analyzeSpeech(metrics.transcript, metrics.duration, {
        fillerWordCount: metrics.fillerWordCount,
        averageVolume: metrics.averageVolume,
        eyeContactPercentage: metrics.eyeContactPercentage,
        gestureCount: metrics.gestureCount,
      });
      setAnalysisResult(analysis);

      // Save session to database via your Node.js backend
      if (userId) {
        // Only save if a user ID is available
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("No token found, cannot save session.");
            return;
          }

          // You'll need to create an API endpoint in your Node.js backend (e.g., /api/sessions)
          // that accepts this data and saves it to the SpeechSessionModel.
          await axios.post(
            `${NODE_BACKEND_URL}/api/sessions`,
            {
              userId: userId,
              title: `Solo Practice - ${new Date().toLocaleDateString()}`,
              content: metrics.transcript,
              duration: metrics.duration,
              feedback: {
                overallScore: analysis.overallScore,
                clarity: analysis.voiceClarity, // Map to clarity
                pace: analysis.pacingScore,
                confidence: analysis.confidence,
                suggestions: analysis.improvements, // Map improvements to suggestions
              },
              audioUrl: "", // Implement actual audio storage and URL here if needed
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("Session saved successfully!");
        } catch (dbError) {
          console.error("Error saving session to backend:", dbError);
        }
      } else {
        console.warn("User ID not available, skipping session save to database.");
      }
    } catch (error) {
      console.error("Error analyzing speech or saving session:", error);
      // Fallback analysis
      setAnalysisResult({
        overallScore: 75,
        voiceClarity: 80,
        confidence: 70,
        bodyLanguage: 75,
        eyeContact: metrics?.eyeContactPercentage || 75, // Use actual if available, else fallback
        grammarScore: 85,
        vocabularyScore: 80,
        pacingScore: 75,
        volumeScore: metrics?.averageVolume || 70, // Use actual if available, else fallback
        strengths: ["Clear articulation", "Good content structure", "Appropriate speaking pace"],
        improvements: ["Reduce filler words", "Maintain more eye contact", "Use more varied vocabulary"],
        recommendation: "Focus on practicing without filler words and maintaining consistent eye contact with your audience.",
      });
    } finally {
      setIsAnalyzing(false);
      setCurrentStep("feedback");
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [userId, currentTopic]); // Added userId and currentTopic to dependencies

  // This useEffect fetches user ID on component mount
  useEffect(() => {
    const token = localStorage.getItem("token"); // Assuming you store token in localStorage
    if (token) {
      axios
        .get(`${NODE_BACKEND_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.data.success && response.data.user) {
            setUserId(response.data.user.id);
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          // Handle token expiration or invalid token, e.g., redirect to login
          // router.push('/login');
        });
    } else {
      console.warn("No authentication token found. Session data will be saved with a placeholder user ID.");
      // For development, if no token, you might want a default ID or enforce login
      // setUserId("anonymous_user_id_for_dev");
    }
  }, []);

  // Set up live feedback listener from speechRecognition service
  useEffect(() => {
    speechRecognition.setOnLiveFeedbackReceived((feedbackMessage) => {
      setLiveFeedback((prev) => {
        const newFeedback = [...prev, feedbackMessage];
        return newFeedback.slice(-3); // Keep only last 3 feedback items
      });
    });
  }, []);

  useEffect(() => {
    if (timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else if (timeRemaining === 0 && currentStep === "preparation") {
      setCurrentStep("speaking");
      setTimeRemaining(speakingTime[0] * 60);
    } else if (timeRemaining === 0 && currentStep === "speaking") {
      handleStopRecording(); // This is now safely defined
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeRemaining, currentStep, speakingTime, handleStopRecording]); // handleStopRecording is now safely defined here

  const generateRandomTopic = useCallback(async () => {
    // Wrapped in useCallback
    try {
      const topics = await aiAnalysis.generateTopics("Everyday Conversations", 1);
      setCurrentTopic(topics[0] || "Describe your ideal weekend");
    } catch (error) {
      console.error("Error generating topic:", error);
      const fallbackTopics = [
        "Describe your ideal weekend",
        "What's the most interesting place you've visited?",
        "How has technology changed communication?",
        "What skill would you like to learn and why?",
        "Describe a person who has influenced your life",
      ];
      setCurrentTopic(fallbackTopics[Math.floor(Math.random() * fallbackTopics.length)]);
    }
  }, []); // Empty dependency array as it doesn't depend on any state/props

  const startPreparation = async () => {
    await generateRandomTopic();
    setCurrentStep("preparation");
    setTimeRemaining(60); // 1 minute preparation
  };

  const startRecording = async () => {
    try {
      if (!speechRecognition.isSupported()) {
        alert("Speech recognition is not supported in your browser. Please use a modern browser like Chrome.");
        return;
      }

      await speechRecognition.initialize();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: isMicOn,
        video: isCameraOn ? { width: 640, height: 480 } : false,
      });
      localStreamRef.current = stream; // Store the stream reference

      if (videoRef.current && isCameraOn) {
        videoRef.current.srcObject = stream;
      }

      // Pass the WebSocket URL to the service if it needs it (it now uses it internally)
      await speechRecognition.startRecording(stream);

      setIsRecording(true);
      setCurrentStep("speaking");
      setTimeRemaining(speakingTime[0] * 60);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert(
        `Failed to start recording: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please check microphone/camera permissions.`
      );
      setIsRecording(false); // Ensure recording state is reset
      setCurrentStep("setup"); // Go back to setup on error
    }
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const resetSession = () => {
    setCurrentStep("setup");
    setIsRecording(false);
    setTimeRemaining(0);
    setLiveFeedback([]);
    setCurrentTopic("");
    setSpeechMetrics(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  // Camera feed display
  useEffect(() => {
    if (isCameraOn && currentStep === "speaking" && videoRef.current && localStreamRef.current) {
      videoRef.current.srcObject = localStreamRef.current;
    }
  }, [isCameraOn, currentStep]);

  if (currentStep === "setup") {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4 flex items-center">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">Solo Practice Session</h1>
              <p className="text-gray-600">Practice with our AI virtual audience and get real-time feedback</p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Session Setup</CardTitle>
                <CardDescription>Configure your practice session preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3">Speaking Duration</label>
                  <div className="space-y-3">
                    <Slider
                      value={speakingTime}
                      onValueChange={setSpeakingTime}
                      max={10}
                      min={1}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>1 min</span>
                      <span className="font-medium">{speakingTime[0]} minutes</span>
                      <span>10 min</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Video className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Camera</span>
                    </div>
                    <Button
                      variant={isCameraOn ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsCameraOn(!isCameraOn)}
                    >
                      {isCameraOn ? "On" : "Off"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mic className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Microphone</span>
                    </div>
                    <Button variant={isMicOn ? "default" : "outline"} size="sm" onClick={() => setIsMicOn(!isMicOn)}>
                      {isMicOn ? "On" : "Off"}
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">What to expect:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• You'll get 1 minute to prepare after receiving your topic</li>
                    <li>• Real-time feedback will appear during your speech</li>
                    <li>• AI will analyze your voice, posture, and expressions (simulated for now)</li>
                    <li>• Detailed report will be generated after completion</li>
                  </ul>
                </div>

                <Button
                  onClick={startPreparation}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  Start Practice Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "preparation") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <Badge className="mb-4 bg-orange-100 text-orange-700">Preparation Time</Badge>
              <div className="text-6xl font-bold text-orange-600 mb-4">{formatTime(timeRemaining)}</div>
              <Progress value={((60 - timeRemaining) / 60) * 100} className="h-2 mb-6" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Your Speaking Topic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
                  <p className="text-lg font-medium text-gray-800">{currentTopic}</p>
                </div>

                <div className="text-left space-y-3">
                  <h4 className="font-medium">Preparation Tips:</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Think about your main points (2-3 key ideas)</li>
                    <li>• Consider examples or stories to support your points</li>
                    <li>• Plan a strong opening and closing</li>
                    <li>• Take deep breaths and visualize success</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "speaking") {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Badge className="bg-red-600 text-white">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                LIVE
              </Badge>
              <div className="text-2xl font-bold">{formatTime(timeRemaining)}</div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant={isMicOn ? "default" : "destructive"} size="sm" onClick={() => setIsMicOn(!isMicOn)}>
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              <Button
                variant={isCameraOn ? "default" : "destructive"}
                size="sm"
                onClick={() => setIsCameraOn(!isCameraOn)}
              >
                {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
              <Button variant="destructive" onClick={handleStopRecording}>
                Stop Session
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-4 h-[calc(100vh-120px)]">
            {/* Main Video Area */}
            <div className="lg:col-span-3 bg-black rounded-lg relative overflow-hidden">
              {isCameraOn ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video> // Added video element
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <VideoOff className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-400">Camera is off</p>
                  </div>
                </div>
              )}

              {/* Topic Reminder */}
              <div className="absolute top-4 left-4 right-4">
                <Card className="bg-black/50 border-gray-600">
                  <CardContent className="p-3">
                    <p className="text-sm text-white">{currentTopic}</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Live Feedback Panel */}
            <div className="space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Live Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {liveFeedback.length === 0 ? (
                    <p className="text-gray-400 text-sm">Feedback will appear here...</p>
                  ) : (
                    liveFeedback.map((feedback, index) => (
                      <div key={index} className="bg-blue-900/50 p-3 rounded-lg">
                        <p className="text-blue-200 text-sm">{feedback}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Live Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Voice Clarity</span>
                      <span className="text-green-400">{analysisResult?.voiceClarity || 85}%</span>{" "}
                      {/* Use actual if available */}
                    </div>
                    <Progress value={analysisResult?.voiceClarity || 85} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Eye Contact</span>
                      <span className="text-blue-400">{speechMetrics?.eyeContactPercentage || 78}%</span>{" "}
                      {/* Use actual if available */}
                    </div>
                    <Progress value={speechMetrics?.eyeContactPercentage || 78} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Confidence</span>
                      <span className="text-purple-400">{analysisResult?.confidence || 82}%</span>{" "}
                      {/* Use actual if available */}
                    </div>
                    <Progress value={analysisResult?.confidence || 82} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "feedback") {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Session Complete</h1>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={resetSession}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Practice Again
              </Button>
              <Link href="/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Great Job!</h2>
              <p className="text-gray-600">Here's your detailed performance analysis</p>
            </div>

            {isAnalyzing && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing your speech...</p>
              </div>
            )}

            {analysisResult && ( // Only render if analysisResult is available
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{analysisResult.overallScore}</div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">{analysisResult.voiceClarity}</div>
                      <div className="text-sm text-gray-600">Voice Clarity</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{analysisResult.bodyLanguage}</div>
                      <div className="text-sm text-gray-600">Body Language</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">{analysisResult.confidence}</div>
                      <div className="text-sm text-gray-600">Confidence</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-green-600">
                        <Smile className="w-5 h-5 mr-2" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysisResult.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <div>
                              <div className="font-medium">{strength}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-orange-600">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysisResult.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                            <div>
                              <div className="font-medium">{improvement}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Detailed Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Grammar & Vocabulary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Grammar accuracy</span>
                            <span className="text-sm font-medium">{analysisResult.grammarScore}%</span>
                          </div>
                          <Progress value={analysisResult.grammarScore} className="h-2" />
                          <div className="flex justify-between">
                            <span className="text-sm">Vocabulary richness</span>
                            <span className="text-sm font-medium">{analysisResult.vocabularyScore}%</span>
                          </div>
                          <Progress value={analysisResult.vocabularyScore} className="h-2" />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Delivery Metrics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Speaking pace</span>
                            <span className="text-sm font-medium">{analysisResult.pacingScore}%</span>
                          </div>
                          <Progress value={analysisResult.pacingScore} className="h-2" />
                          <div className="flex justify-between">
                            <span className="text-sm">Volume consistency</span>
                            <span className="text-sm font-medium">{analysisResult.volumeScore}%</span>
                          </div>
                          <Progress value={analysisResult.volumeScore} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">AI Recommendation</h4>
                      <p className="text-blue-800 text-sm">{analysisResult.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            {!analysisResult && !isAnalyzing && (
              <div className="text-center text-gray-600 py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No analysis data available. Please try practicing again.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}