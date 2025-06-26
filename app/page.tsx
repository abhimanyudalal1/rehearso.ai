"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Mic,
  Users,
  Brain,
  BarChart3,
  Video,
  MessageSquare,
  Clock,
  CheckCircle,
  Star,
  Target,
  Trophy,
  Eye,
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState<"solo" | "group">("solo")
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SpeakAI
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">AI-Powered Speaking Coach</Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            Master Public Speaking with AI & Friends
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Practice solo with our AI virtual audience or join real-time sessions with friends. Get instant feedback on
            your voice, body language, and delivery to become a confident speaker.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
              >
                Start Practicing Free
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3"
                onClick={() => {
                  document.getElementById("demo-section")?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Showcase - Real-time Speech Analysis */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Image - Fixed sizing */}
          <div className="w-full flex justify-center">
            <div className="relative w-full max-w-lg">
              <img
                src="/real-time-analysis.jpg"
                alt="Real-time Speech Analysis Dashboard"
                className="w-full h-auto max-h-96 object-cover object-center rounded-xl shadow-lg"
              />
            </div>
          </div>

          {/* Right Text */}
          <div>
            <Badge className="mb-3 bg-blue-100 text-blue-700">Advanced Technology</Badge>
            <h2 className="text-3xl font-bold mb-4">Real-time Speech Analysis</h2>
            <p className="text-gray-600 text-lg mb-6">
              Experience cutting-edge MediaPipe technology that analyzes your posture, gestures, and speech patterns in
              real-time with instant AI feedback.
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <strong>Live Posture Tracking:</strong> Computer vision detects your stance and provides instant
                  posture feedback.
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <strong>Gesture Recognition:</strong> AI analyzes hand movements and suggests more expressive
                  gestures.
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <strong>Voice Analytics:</strong> Real-time pitch, loudness, and tempo analysis with live graphs.
                </div>
              </li>
            </ul>
            <div className="mt-6">
              <Link href="/practice/solo">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">Start Analysis Now</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase - Smart Topic Generator */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Text */}
          <div>
            <Badge className="mb-3 bg-purple-100 text-purple-700">AI-Powered Content</Badge>
            <h2 className="text-3xl font-bold mb-4">Smart Topic Generator</h2>
            <p className="text-gray-600 text-lg mb-6">
              Never run out of speaking topics! Our AI generates personalized, engaging topics based on your interests,
              skill level, and current trends.
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-purple-600 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <strong>Personalized Topics:</strong> AI analyzes your profile to suggest relevant, engaging subjects.
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-purple-600 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <strong>Trending Content:</strong> Stay current with topics from news, social media, and popular
                  discussions.
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-purple-600 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <strong>Skill-Based Difficulty:</strong> Topics automatically adjust complexity as you improve.
                </div>
              </li>
            </ul>
            <div className="mt-6">
              <Link href="/practice/solo">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">Generate Topics</Button>
              </Link>
            </div>
          </div>

          {/* Right Image - Fixed sizing */}
          <div className="w-full flex justify-center">
            <div className="relative w-full max-w-lg">
              <img
                src="/ai-topic-generator.jpg"
                alt="AI Topic Generation Interface"
                className="w-full h-auto max-h-96 object-cover object-center rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Speaking Solution</h2>
          <p className="text-xl text-gray-600">Everything you need to become a confident speaker</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Live Video Analysis</CardTitle>
              <CardDescription>
                Real-time feedback on facial expressions, posture, and body language using computer vision
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>Group Practice Rooms</CardTitle>
              <CardDescription>
                Create or join rooms with friends for peer feedback and collaborative improvement
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle>Real-time Coaching</CardTitle>
              <CardDescription>
                Live suggestions during your speech: "Avoid fillers", "Maintain eye contact", "Speak louder"
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>
                Comprehensive post-speech reports with scores on grammar, clarity, confidence, and delivery
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to improve your speaking skills</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Choose Your Mode</h3>
              <p className="text-gray-600">Select solo practice with AI or create/join a group room with friends</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Get Your Topic</h3>
              <p className="text-gray-600">Receive an AI-generated topic and take 1 minute to prepare your thoughts</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Speak & Improve</h3>
              <p className="text-gray-600">Deliver your speech with real-time feedback and receive detailed analysis</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo-section" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Demo Header */}
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-blue-100 text-blue-700">Interactive Demo</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">See SpeakAI in Action</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Discover how our AI-powered platform transforms public speaking practice with real-time feedback,
                intelligent analysis, and collaborative learning experiences.
              </p>
            </div>

            {/* Feature Toggle */}
            <div className="flex justify-center mb-12">
              <div className="bg-gray-100 p-1 rounded-lg">
                <Button
                  variant={activeFeature === "solo" ? "default" : "ghost"}
                  onClick={() => setActiveFeature("solo")}
                  className="px-8 py-3"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Solo Practice
                </Button>
                <Button
                  variant={activeFeature === "group" ? "default" : "ghost"}
                  onClick={() => setActiveFeature("group")}
                  className="px-8 py-3"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Group Sessions
                </Button>
              </div>
            </div>

            {/* Solo Practice Demo */}
            {activeFeature === "solo" && (
              <div className="space-y-16">
                {/* Setup Phase */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                        <div className="flex items-center space-x-2 text-white">
                          <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                          <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                          <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                          <span className="ml-4 text-sm">SpeakAI - Solo Practice Setup</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="mb-6">
                          <h3 className="text-xl font-bold mb-2">Session Setup</h3>
                          <p className="text-gray-600 text-sm">Configure your practice session preferences</p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Speaking Duration</label>
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="flex justify-between text-sm mb-2">
                                <span>1 min</span>
                                <span className="font-medium text-blue-600">3 minutes</span>
                                <span>10 min</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "30%" }}></div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                              <div className="flex items-center space-x-2">
                                <Video className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium">Camera</span>
                              </div>
                              <Badge className="bg-green-600 text-white text-xs">On</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                              <div className="flex items-center space-x-2">
                                <Mic className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium">Microphone</span>
                              </div>
                              <Badge className="bg-green-600 text-white text-xs">On</Badge>
                            </div>
                          </div>

                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">What to expect:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• You'll get 1 minute to prepare after receiving your topic</li>
                              <li>• Real-time feedback will appear during your speech</li>
                              <li>• AI will analyze your voice, posture, and expressions</li>
                              <li>• Detailed report will be generated after completion</li>
                            </ul>
                          </div>

                          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            Start Practice Session
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="order-1 lg:order-2">
                    <div className="space-y-6">
                      <div>
                        <Badge className="mb-3 bg-blue-100 text-blue-700">Step 1: Setup</Badge>
                        <h3 className="text-3xl font-bold mb-4">Personalized Session Configuration</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          Start by customizing your practice session. Choose your speaking duration from 1-10 minutes,
                          enable camera and microphone permissions, and get ready for an AI-powered coaching experience
                          tailored to your needs.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-lg border">
                          <Brain className="w-6 h-6 text-blue-600 mb-2" />
                          <h4 className="font-medium mb-1">AI Topic Generation</h4>
                          <p className="text-sm text-gray-600">Smart & Personalized</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg border">
                          <Eye className="w-6 h-6 text-blue-600 mb-2" />
                          <h4 className="font-medium mb-1">Real-time Feedback</h4>
                          <p className="text-sm text-gray-600">Live Coaching</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Speaking Phase */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                      <div className="bg-gray-800 p-4">
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center space-x-4">
                            <Badge className="bg-red-600 text-white">
                              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                              LIVE
                            </Badge>
                            <div className="text-xl font-bold">2:34</div>
                          </div>
                          <div className="flex space-x-2">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                              <Mic className="w-4 h-4 text-white" />
                            </div>
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                              <Video className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 p-6">
                        <div className="col-span-3">
                          <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center relative">
                            <div className="text-center text-white">
                              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-xl font-bold">AJ</span>
                              </div>
                              <p className="text-sm">You're speaking...</p>
                            </div>

                            <div className="absolute top-3 left-3 right-3">
                              <div className="bg-black/50 p-3 rounded-lg">
                                <p className="text-white text-sm">
                                  <strong>Topic:</strong> "Describe a technology that has changed your life"
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-gray-800 p-4 rounded-lg">
                            <h4 className="text-white font-medium mb-3 flex items-center">
                              <Eye className="w-4 h-4 mr-2" />
                              Live Feedback
                            </h4>
                            <div className="space-y-2">
                              <div className="bg-blue-900/50 p-2 rounded text-blue-200 text-xs">
                                Great eye contact! Keep it up.
                              </div>
                              <div className="bg-green-900/50 p-2 rounded text-green-200 text-xs">
                                Your posture looks confident
                              </div>
                              <div className="bg-orange-900/50 p-2 rounded text-orange-200 text-xs">
                                Try to reduce "um" words
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-800 p-4 rounded-lg">
                            <h4 className="text-white font-medium mb-3 flex items-center">
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Live Metrics
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-300">Voice Clarity</span>
                                  <span className="text-green-400">89%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1">
                                  <div className="bg-green-400 h-1 rounded-full" style={{ width: "89%" }}></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-300">Confidence</span>
                                  <span className="text-blue-400">85%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1">
                                  <div className="bg-blue-400 h-1 rounded-full" style={{ width: "85%" }}></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-300">Eye Contact</span>
                                  <span className="text-purple-400">92%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1">
                                  <div className="bg-purple-400 h-1 rounded-full" style={{ width: "92%" }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="space-y-6">
                      <div>
                        <Badge className="mb-3 bg-green-100 text-green-700">Step 2: Practice</Badge>
                        <h3 className="text-3xl font-bold mb-4">Real-time AI Coaching</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          Speak naturally while our AI provides instant feedback. Watch your live metrics update in
                          real-time as the system analyzes your voice clarity, confidence level, eye contact, and body
                          language. Get immediate suggestions to improve your delivery.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                          <div>
                            <h4 className="font-medium">Instant Voice Analysis</h4>
                            <p className="text-sm text-gray-600">Real-time detection of pace, tone, and filler words</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                          <div>
                            <h4 className="font-medium">Body Language Tracking</h4>
                            <p className="text-sm text-gray-600">Computer vision analyzes posture and gestures</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                          <div>
                            <h4 className="font-medium">Live Coaching Tips</h4>
                            <p className="text-sm text-gray-600">Contextual suggestions appear as you speak</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Phase */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
                      <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 text-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-white font-bold text-lg">Session Complete!</h3>
                        <p className="text-white/90 text-sm">Here's your detailed performance analysis</p>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-4 gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">87</div>
                            <div className="text-xs text-gray-600">Overall</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">92</div>
                            <div className="text-xs text-gray-600">Voice</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">85</div>
                            <div className="text-xs text-gray-600">Body</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">89</div>
                            <div className="text-xs text-gray-600">Confidence</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-green-600 mb-2 flex items-center">
                              <Star className="w-4 h-4 mr-1" />
                              Strengths
                            </h4>
                            <ul className="text-sm space-y-1">
                              <li>• Clear articulation</li>
                              <li>• Good eye contact</li>
                              <li>• Confident posture</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-orange-600 mb-2 flex items-center">
                              <Target className="w-4 h-4 mr-1" />
                              Improve
                            </h4>
                            <ul className="text-sm space-y-1">
                              <li>• Reduce filler words</li>
                              <li>• Vary speaking pace</li>
                              <li>• Use more gestures</li>
                            </ul>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1">AI Recommendation</h4>
                          <p className="text-blue-800 text-sm">
                            Excellent progress! Focus on reducing "um" and "uh" in your next session. Your content
                            structure was very strong.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="order-1 lg:order-2">
                    <div className="space-y-6">
                      <div>
                        <Badge className="mb-3 bg-purple-100 text-purple-700">Step 3: Analysis</Badge>
                        <h3 className="text-3xl font-bold mb-4">Comprehensive AI Report</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          Receive detailed analysis with specific scores, personalized strengths and improvement areas,
                          and actionable AI recommendations. Track your progress over time and see exactly where to
                          focus next.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-lg border">
                          <Video className="w-6 h-6 text-purple-600 mb-2" />
                          <h4 className="font-medium mb-1">Live Video Analysis</h4>
                          <p className="text-sm text-gray-600">Comprehensive Analysis</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg border">
                          <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
                          <h4 className="font-medium mb-1">Detailed Reports</h4>
                          <p className="text-sm text-gray-600">Actionable Insights</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Group Sessions Demo */}
            {activeFeature === "group" && (
              <div className="space-y-16">
                {/* Room Selection */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
                        <div className="flex items-center space-x-2 text-white">
                          <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                          <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                          <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                          <span className="ml-4 text-sm">SpeakAI - Group Practice Rooms</span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex justify-center mb-6">
                          <div className="bg-gray-100 p-1 rounded-lg">
                            <Button className="px-4 py-2 bg-blue-600 text-white text-sm">
                              <Users className="w-4 h-4 mr-2" />
                              Join Room
                            </Button>
                            <Button variant="ghost" className="px-4 py-2 text-sm">
                              Create Room
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <h4 className="font-semibold">Public Speaking Beginners</h4>
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                  Waiting
                                </Badge>
                              </div>
                              <Button size="sm" className="bg-blue-600 text-white">
                                Join Room
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4" />
                                <span>Host: Sarah Chen</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>2 min per speaker</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">
                                <strong>Topic:</strong> Everyday Conversations
                              </span>
                              <span className="text-sm text-gray-600">3/6 participants</span>
                            </div>
                          </div>

                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <h4 className="font-semibold">Professional Presentations</h4>
                                <Badge className="bg-orange-100 text-orange-700 text-xs">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div>
                                  Active
                                </Badge>
                              </div>
                              <Button size="sm" variant="outline">
                                Join Room
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4" />
                                <span>Host: Mike Johnson</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>3 min per speaker</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">
                                <strong>Topic:</strong> Business Communication
                              </span>
                              <span className="text-sm text-gray-600">5/8 participants</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="order-1 lg:order-2">
                    <div className="space-y-6">
                      <div>
                        <Badge className="mb-3 bg-purple-100 text-purple-700">Step 1: Join</Badge>
                        <h3 className="text-3xl font-bold mb-4">Find Your Perfect Practice Group</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          Browse active practice rooms or create your own. Join sessions based on your interests, skill
                          level, and available time. Connect with speakers worldwide or practice with friends using
                          private room codes.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-lg border">
                          <Users className="w-6 h-6 text-purple-600 mb-2" />
                          <h4 className="font-medium mb-1">Create or Join Rooms</h4>
                          <p className="text-sm text-gray-600">Flexible & Social</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg border">
                          <Video className="w-6 h-6 text-purple-600 mb-2" />
                          <h4 className="font-medium mb-1">Live Video Sessions</h4>
                          <p className="text-sm text-gray-600">Real Connections</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Session */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
                      <div className="bg-gray-800 p-4">
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center space-x-4">
                            <h3 className="font-semibold">Public Speaking Beginners</h3>
                            <Badge className="bg-green-600 text-white text-xs">Live Session</Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <span>Room Code:</span>
                            <code className="bg-gray-700 px-2 py-1 rounded text-xs">ABC123</code>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="mb-6">
                          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium flex items-center">
                                <Mic className="w-4 h-4 mr-2 text-blue-600" />
                                Emma is speaking
                              </h4>
                              <div className="text-xl font-bold text-blue-600">1:23</div>
                            </div>
                            <p className="text-sm text-gray-600">
                              <strong>Topic:</strong> "Describe a skill you'd like to learn and why"
                            </p>
                            <div className="w-full bg-blue-200 rounded-full h-1 mt-2">
                              <div className="bg-blue-600 h-1 rounded-full" style={{ width: "60%" }}></div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {[
                            { name: "Sarah Chen", host: true, speaking: false },
                            { name: "Emma Wilson", host: false, speaking: true },
                            { name: "Mike Johnson", host: false, speaking: false },
                            { name: "You", host: false, speaking: false },
                          ].map((participant, index) => (
                            <div
                              key={index}
                              className={`relative aspect-video bg-gray-800 rounded-lg flex items-center justify-center ${participant.speaking ? "ring-2 ring-blue-500" : ""}`}
                            >
                              <div className="text-center text-white">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <span className="text-sm font-bold">
                                    {participant.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </span>
                                </div>
                                <div className="text-xs">{participant.name}</div>
                              </div>

                              {participant.host && (
                                <div className="absolute top-2 left-2">
                                  <Badge className="bg-yellow-500 text-white text-xs">Host</Badge>
                                </div>
                              )}

                              <div className="absolute bottom-2 right-2 flex space-x-1">
                                <div className="w-5 h-5 bg-black/50 rounded-full flex items-center justify-center">
                                  <Mic className="w-3 h-3 text-green-400" />
                                </div>
                                <div className="w-5 h-5 bg-black/50 rounded-full flex items-center justify-center">
                                  <Video className="w-3 h-3 text-green-400" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-center space-x-3">
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                            <Mic className="w-5 h-5 text-white" />
                          </div>
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                            <Video className="w-5 h-5 text-white" />
                          </div>
                          <Button className="bg-blue-600 text-white">Start Speaking</Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="space-y-6">
                      <div>
                        <Badge className="mb-3 bg-green-100 text-green-700">Step 2: Practice</Badge>
                        <h3 className="text-3xl font-bold mb-4">Live Video Practice Sessions</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          Practice with real people in HD video calls. Take turns speaking on AI-generated topics, see
                          live reactions from your audience, and build confidence in a supportive community environment.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                          <div>
                            <h4 className="font-medium">Real-time Video & Audio</h4>
                            <p className="text-sm text-gray-600">Crystal clear communication with all participants</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                          <div>
                            <h4 className="font-medium">Turn-based Speaking</h4>
                            <p className="text-sm text-gray-600">Organized sessions with timed speaking slots</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                          <div>
                            <h4 className="font-medium">Live Audience Feedback</h4>
                            <p className="text-sm text-gray-600">See real reactions and get immediate responses</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback & Community */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
                      <div className="bg-gradient-to-r from-green-600 to-purple-600 p-4">
                        <h3 className="text-white font-bold text-lg">Session Feedback & Chat</h3>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-3 gap-6 mb-6">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="text-lg font-bold">4</div>
                            <div className="text-xs text-gray-600">Participants</div>
                          </div>
                          <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <MessageSquare className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="text-lg font-bold">12</div>
                            <div className="text-xs text-gray-600">Feedback Given</div>
                          </div>
                          <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Star className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="text-lg font-bold">4.8</div>
                            <div className="text-xs text-gray-600">Avg Rating</div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-3">Recent Feedback</h4>
                            <div className="space-y-3">
                              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium">Sarah Chen</span>
                                  <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700">
                                  "Great storytelling! Your examples were very relatable and engaging."
                                </p>
                              </div>
                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium">Mike Johnson</span>
                                  <div className="flex space-x-1">
                                    {[1, 2, 3, 4].map((i) => (
                                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    ))}
                                    <Star className="w-3 h-3 text-gray-300" />
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700">
                                  "Good content structure. Try to maintain more eye contact with the camera."
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">Live Chat</h4>
                            <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                              <div className="space-y-2 text-sm">
                                <div>
                                  <strong>Emma:</strong> Great session everyone! 👏
                                </div>
                                <div>
                                  <strong>Sarah:</strong> Thanks for the feedback Mike!
                                </div>
                                <div>
                                  <strong>You:</strong> Looking forward to my turn
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="order-1 lg:order-2">
                    <div className="space-y-6">
                      <div>
                        <Badge className="mb-3 bg-orange-100 text-orange-700">Step 3: Learn</Badge>
                        <h3 className="text-3xl font-bold mb-4">Community Feedback & Growth</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          Give and receive constructive feedback from fellow speakers. Rate presentations, share
                          specific suggestions, and learn from diverse speaking styles. Build lasting connections with
                          practice partners.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-lg border">
                          <MessageSquare className="w-6 h-6 text-orange-600 mb-2" />
                          <h4 className="font-medium mb-1">Peer Feedback System</h4>
                          <p className="text-sm text-gray-600">Community Learning</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg border">
                          <Trophy className="w-6 h-6 text-orange-600 mb-2" />
                          <h4 className="font-medium mb-1">Group Analytics</h4>
                          <p className="text-sm text-gray-600">Competitive Growth</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Social Proof */}
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold mb-8">Trusted by Speakers Worldwide</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="p-6 bg-white rounded-lg shadow-sm border">
                  <div className="flex justify-center mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "SpeakAI helped me overcome my fear of public speaking. The AI feedback is incredibly accurate and
                    helpful."
                  </p>
                  <div className="font-medium">Jessica Chen</div>
                  <div className="text-sm text-gray-500">Marketing Manager</div>
                </div>

                <div className="p-6 bg-white rounded-lg shadow-sm border">
                  <div className="flex justify-center mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "The group sessions are amazing! I've made friends and improved my confidence significantly."
                  </p>
                  <div className="font-medium">David Rodriguez</div>
                  <div className="text-sm text-gray-500">Software Engineer</div>
                </div>

                <div className="p-6 bg-white rounded-lg shadow-sm border">
                  <div className="flex justify-center mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "As a teacher, this platform has helped me become more engaging in my presentations."
                  </p>
                  <div className="font-medium">Maria Santos</div>
                  <div className="text-sm text-gray-500">High School Teacher</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Become a Confident Speaker?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users who have improved their public speaking skills with our AI-powered platform
          </p>
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
            >
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">SpeakAI</span>
              </div>
              <p className="text-gray-400">Empowering confident speakers through AI technology</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Demo
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Community
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SpeakAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
