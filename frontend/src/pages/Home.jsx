import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, ShieldAlert, BarChart3, ChevronRight, Zap, CheckCircle2 } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] overflow-hidden bg-surface-50">
      
      {/* Premium Hero Section with Gradient Mesh & Glassmorphism */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-24 md:py-32">
        
        {/* Abstract Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-[pulse_10s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40rem] h-[40rem] bg-emerald-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-[pulse_12s_ease-in-out_infinite]"></div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center [animation:fade-in-up_0.8s_ease-out]">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-semibold text-primary-700 mb-8 border border-white/40 shadow-xl shadow-primary-900/5">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Next-Gen Civic Analytics Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-surface-900 tracking-tight leading-tight mb-6">
            Intelligent <br className="md:hidden"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-teal-500">
              Civic Cleanliness
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-surface-600 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Report public cleanliness violations instantly. Our <strong className="text-surface-800">AWS Rekognition AI</strong> automatically analyzes images and dispatches cleanup crews faster than ever before.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center w-full sm:w-auto">
            {user ? (
              <Link to="/dashboard" className="btn-primary text-lg px-8 py-4 shadow-xl shadow-primary-600/20 hover:shadow-primary-600/40 flex items-center justify-center gap-2">
                Open Dashboard <ChevronRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg px-8 py-4 shadow-xl shadow-primary-600/20 hover:shadow-primary-600/40 flex items-center justify-center gap-2">
                  Become an Inspector <ChevronRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-4 flex items-center justify-center">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Modern Features Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold text-surface-900 mb-4">A Seamless Automated Pipeline</h2>
            <p className="text-xl text-surface-600 max-w-2xl mx-auto">From reporting a dirty street to dispatching a resolution team, entirely driven by Artificial Intelligence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Camera className="w-8 h-8 text-primary-600" />}
              step="01"
              title="Snap & Upload"
              description="Inspectors take photos of public areas. GPS coordinates are automatically extracted and pushed to AWS S3 storage."
              delay="0"
            />
            <FeatureCard 
              icon={<ShieldAlert className="w-8 h-8 text-red-500" />}
              step="02"
              title="AI Analysis"
              description="AWS Rekognition instantly scans the image for garbage, trash, and pollution to detect severe violations within milliseconds."
              delay="100"
            />
            <FeatureCard 
              icon={<CheckCircle2 className="w-8 h-8 text-teal-600" />}
              step="03"
              title="Instant Resolution"
              description="Officers receive automated AWS SES email alerts. Dashboard charts update in real-time until the violation is resolved."
              delay="200"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, step, title, description, delay }) => (
  <div 
    className="card p-8 group hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-900/5 transition-all duration-300 relative overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute top-0 right-0 p-6 text-7xl font-extrabold text-surface-50 group-hover:text-primary-50 transition-colors duration-300 pointer-events-none">
      {step}
    </div>
    <div className="w-16 h-16 rounded-2xl bg-primary-50/80 flex items-center justify-center mb-6 relative z-10 border border-primary-100 group-hover:scale-110 group-hover:bg-primary-100 transition-all duration-300">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-surface-900 mb-3 relative z-10">{title}</h3>
    <p className="text-surface-600 leading-relaxed text-lg relative z-10">{description}</p>
  </div>
);

export default Home;
