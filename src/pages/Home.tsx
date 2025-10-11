import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  FolderOpen, 
  Camera, 
  DollarSign, 
  Users, 
  MessageSquare,
  BarChart3,
  Shield,
  Clock,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useAuth();
  const features = [
    {
      icon: <FolderOpen className="w-6 h-6 text-blue-600" />,
      title: "Project Management",
      description: "Organize and track all your roofing projects in one place with powerful tools."
    },
    {
      icon: <Camera className="w-6 h-6 text-blue-600" />,
      title: "Daily Updates",
      description: "Document progress with photos, videos, and detailed work summaries."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
      title: "Client Updates",
      description: "Send professional, branded updates to clients with financial summaries."
    },
    {
      icon: <DollarSign className="w-6 h-6 text-blue-600" />,
      title: "Cost Tracking",
      description: "Monitor materials, labor costs, and project budgets in real-time."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
      title: "Analytics & Reports",
      description: "Gain insights with detailed analytics and performance metrics."
    },
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Team Collaboration",
      description: "Manage team members, assign tasks, and coordinate workflows."
    }
  ];

  const benefits = [
    "Professional client communication",
    "Real-time project tracking",
    "Mobile-friendly interface",
    "Secure data storage",
    "Customizable workflows",
    "24/7 access from anywhere"
  ];

  // DEV ONLY: Skip authentication
  const handleDevBypass = () => {
    const mockUser = {
      id: 'dev-user-1',
      email: 'dev@onsite.com',
      name: 'Dev User',
      role: 'admin' as const,
      company: 'OnSite Development'
    };

    // Update auth context with mock user
    setUser(mockUser);

    toast({
      title: 'DEV MODE: Bypassed Authentication',
      description: 'Logged in as Dev User (Admin)',
    });

    // Navigate to dashboard
    navigate('/Dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header/Navigation */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">OnSite</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* DEV ONLY: Quick Bypass Button */}
              {import.meta.env.DEV && (
                <Button
                  onClick={handleDevBypass}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
                  size="sm"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  DEV: Skip to App
                </Button>
              )}
              <Link to="/login">
                <Button variant="ghost" className="text-gray-700">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-6">
            Roofing Project Management
            <span className="block text-blue-600 mt-2">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional tools for roofing contractors to manage projects, track costs, 
            communicate with clients, and grow your business.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features designed specifically for roofing contractors
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-3">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why Choose OnSite?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built by contractors, for contractors. OnSite streamlines your workflow 
                so you can focus on what matters most - delivering quality work.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-8 border-2 border-blue-200">
              <Card className="shadow-xl">
                <CardHeader className="bg-blue-600 text-white rounded-t-lg">
                  <CardTitle className="text-2xl flex items-center">
                    <Shield className="w-6 h-6 mr-2" />
                    Enterprise Ready
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Save Time</h4>
                      <p className="text-sm text-gray-600">Automate reporting and client communication</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <DollarSign className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Increase Revenue</h4>
                      <p className="text-sm text-gray-600">Better tracking leads to better profitability</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Delight Clients</h4>
                      <p className="text-sm text-gray-600">Professional updates build trust and loyalty</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of roofing contractors already using OnSite
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-blue-100 mt-4">No credit card required • 14-day free trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">OnSite</span>
          </div>
          <p className="text-sm">
            © 2025 OnSite | Roofing Contractor Management. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
