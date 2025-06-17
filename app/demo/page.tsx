"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Eye,
  Mic,
  BarChart3,
  Video,
  Users,
  Brain,
  MessageSquare,
  Trophy,
  Clock,
  Target,
  CheckCircle,
  Star,
} from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  const [activeFeature, setActiveFeature] = useState<"solo" | "group">("solo")

  const soloFeatures = [
    {
      title: "AI Topic Generation",
      description:
        "Get personalized speaking topics based on your skill level and interests. Our AI generates thousands of unique topics across categories like business, personal stories, current events, and more.",
      icon: Brain,
      highlight: "Smart & Personalized",
    },
    {
      title: "Real-time Feedback",
      description:
        "Receive instant feedback while you speak. Our AI analyzes your voice tone, pace, filler words, and provides live suggestions like 'Speak louder' or 'Maintain eye contact'.",
      icon: Eye,
      highlight: "Live Coaching",
    },
    {
      title: "Voice & Video Analysis",
      description:
        "Advanced speech recognition tracks your clarity, grammar, and vocabulary while computer vision analyzes your posture, gestures, and facial expressions.",
      icon: Video,
      highlight: "Comprehensive Analysis",
    },
    {
      title: "Detailed Reports",
      description:
        "Get comprehensive post-session reports with scores, strengths, improvement areas, and personalized AI recommendations for your next practice session.",
      icon: BarChart3,
      highlight: "Actionable Insights",
    },
  ]

  const groupFeatures = [
    {
      title: "Create or Join Rooms",
      description:
        "Start your own practice room or join existing sessions. Set topics, time limits, and participant numbers. Share room codes with friends or join public rooms.",
      icon: Users,
      highlight: "Flexible & Social",
    },
    {
      title: "Live Video Sessions",
      description:
        "Practice with real people in HD video calls. See everyone's reactions, get peer feedback, and build confidence in a supportive environment.",
      icon: Video,
      highlight: "Real Connections",
    },
    {
      title: "Peer Feedback System",
      description:
        "Give and receive constructive feedback from other speakers. Rate presentations, share specific suggestions, and learn from diverse speaking styles.",
      icon: MessageSquare,
      highlight: "Community Learning",
    },
    {
      title: "Group Analytics",
      description:
        "Track your performance in group settings vs solo practice. See how you compare with peers and identify areas where group practice helps most.",
      icon: Trophy,
      highlight: "Competitive Growth",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-700">Interactive Demo</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">See SpeakAI in Action</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover how our AI-powered platform transforms public speaking practice with real-time feedback,
              intelligent analysis, and collaborative learning experiences.
            </p>
          </div>

          {/* Feature Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white p-1 rounded-lg border shadow-sm">
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
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                      <h2 className="text-3xl font-bold mb-4">Personalized Session Configuration</h2>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        Start by customizing your practice session. Choose your speaking duration from 1-10 minutes,
                        enable camera and microphone permissions, and get ready for an AI-powered coaching experience
                        tailored to your needs.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {soloFeatures.slice(0, 2).map((feature, index) => (
                        <div key={index} className="p-4 bg-white rounded-lg border">
                          <feature.icon className="w-6 h-6 text-blue-600 mb-2" />
                          <h4 className="font-medium mb-1">{feature.title}</h4>
                          <p className="text-sm text-gray-600">{feature.highlight}</p>
                        </div>
                      ))}
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
                      <h2 className="text-3xl font-bold mb-4">Real-time AI Coaching</h2>
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
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                      <h2 className="text-3xl font-bold mb-4">Comprehensive AI Report</h2>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        Receive detailed analysis with specific scores, personalized strengths and improvement areas,
                        and actionable AI recommendations. Track your progress over time and see exactly where to focus
                        next.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {soloFeatures.slice(2, 4).map((feature, index) => (
                        <div key={index} className="p-4 bg-white rounded-lg border">
                          <feature.icon className="w-6 h-6 text-purple-600 mb-2" />
                          <h4 className="font-medium mb-1">{feature.title}</h4>
                          <p className="text-sm text-gray-600">{feature.highlight}</p>
                        </div>
                      ))}
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
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                      <h2 className="text-3xl font-bold mb-4">Find Your Perfect Practice Group</h2>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        Browse active practice rooms or create your own. Join sessions based on your interests, skill
                        level, and available time. Connect with speakers worldwide or practice with friends using
                        private room codes.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {groupFeatures.slice(0, 2).map((feature, index) => (
                        <div key={index} className="p-4 bg-white rounded-lg border">
                          <feature.icon className="w-6 h-6 text-purple-600 mb-2" />
                          <h4 className="font-medium mb-1">{feature.title}</h4>
                          <p className="text-sm text-gray-600">{feature.highlight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Session */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                      <h2 className="text-3xl font-bold mb-4">Live Video Practice Sessions</h2>
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
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                      <h2 className="text-3xl font-bold mb-4">Community Feedback & Growth</h2>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        Give and receive constructive feedback from fellow speakers. Rate presentations, share specific
                        suggestions, and learn from diverse speaking styles. Build lasting connections with practice
                        partners.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {groupFeatures.slice(2, 4).map((feature, index) => (
                        <div key={index} className="p-4 bg-white rounded-lg border">
                          <feature.icon className="w-6 h-6 text-orange-600 mb-2" />
                          <h4 className="font-medium mb-1">{feature.title}</h4>
                          <p className="text-sm text-gray-600">{feature.highlight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="text-center py-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Speaking Skills?</h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Join thousands of speakers who have improved their confidence and skills with SpeakAI's intelligent
              coaching platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                  Start Free Trial - No Credit Card Required
                </Button>
              </Link>
              <div className="flex items-center space-x-4 text-blue-100">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Free 7-day trial</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">No setup required</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold mb-8">Trusted by Speakers Worldwide</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-white rounded-lg shadow-sm">
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

              <div className="p-6 bg-white rounded-lg shadow-sm">
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

              <div className="p-6 bg-white rounded-lg shadow-sm">
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
    </div>
  )
}
