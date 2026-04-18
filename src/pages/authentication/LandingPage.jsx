import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo_2.jpeg";
import GradientButton from "../../components/Authentication/GradientButton";
import { FileText, ShieldCheck, Users, Zap, Clock, Sparkles, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      t: "Smart Document Organization",
      d: "Organize and categorize documents with intelligent tagging and folder structures.",
      icon: FileText,
    },
    {
      t: "Enterprise-Grade Security",
      d: "Role-based access control ensures your documents are protected and compliant.",
      icon: ShieldCheck,
    },
    {
      t: "Team Collaboration",
      d: "Work together seamlessly with comments, mentions, and real-time updates.",
      icon: Users,
    },
    {
      t: "Fast Performance",
      d: "Lightning-fast uploads, previews, and document processing.",
      icon: Zap,
    },
    {
      t: "Version Control",
      d: "Track changes, compare versions, and restore previous document states.",
      icon: Clock,
    },
    {
      t: "AI-Power Insights",
      d: "Extract text, summarize content, and search semantically with advanced AI.",
      icon: Sparkles,
    },
  ];

  return (
    <div className="min-h-screen  flex flex-col">
      <main className="flex-1 flex flex-col items-center">
        <section className="w-full px-6 pt-10">

          <div className="flex items-center justify-between mb-9">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="DocuSphere"
                className="h-10 md:h-12 object-contain"
              />
              <span className="text-xl sm:text-2xl md:text-3xl font-bold">
                DocuSphere
              </span>
            </div>
            <nav className="flex items-center gap-2 sm:gap-3">
              <GradientButton onClick={() => navigate("/signin")}>
                Sign In
              </GradientButton>
              
              <GradientButton onClick={() => navigate("/signup")}>
                Get Started
              </GradientButton>
            </nav>
          </div>
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-slate-900">
              All your documents.
              <span className="block mt-1">One intelligent sphere.</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto font-semibold leading-relaxed">
              DocuSphere lets your team manage documents, track versions, and
              collaborate effortlessly — all in one place.
            </p>
            <GradientButton className="mt-8" onClick={() => navigate("/signup")}>
              Get Started
            </GradientButton>
          </div>
        </section>

        <section className="w-full max-w-5xl px-6 mt-10">
          <div className="rounded-3xl border-2 border-[#05152C] bg-white px-8 py-10 shadow-sm">
            <h2 className="text-2xl md:text-4xl font-bold  text-center">
              Everything you need to manage documents
            </h2>
            <p className="mt-3 text-base md:text-xl  text-center max-w-2xl mx-auto font-semibold">
              Built for teams of all sizes, DocuSphere provides powerful
              features to help you stay organized and productive.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:auto-rows-fr ">
              {features.map(({ t, d, icon: Icon }) => (
                <div
                  key={t}
                  tabIndex={0}
                  className="h-full min-h-0 bg-white rounded-2xl border border-[#44ADE9] shadow-xl px-5 py-6 flex flex-col items-center text-center focus:outline-none focus:border transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1"
                >
                  <div className="h-12 w-12 shrink-0 rounded-md bg-[#1A395E] flex items-center justify-center mb-4 ">
                    <Icon className="text-white" size={22} />
                  </div>
                  <h3 className="text-xl font-semibold shrink-0 text-[#05152C]">
                    {t}
                  </h3>
                  <p className="mt-2 text-base flex-1 min-h-0">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        
        <section className="w-full max-w-6xl px-6 mt-10 mb-12">
          <div className="bg-[#05152C] text-white rounded-3xl px-6 sm:px-8 py-10 text-center transition-all duration-300 shadow-xl ">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold">
              Ready to transform your document workflow?
            </h2>
            <p className="mt-3 text-sm sm:text-base md:text-lg text-white max-w-2xl mx-auto">
              Join thousands of teams already using DocuSphere to manage their
              documents more effectively.
            </p>
              <GradientButton variant="light" onClick={() => navigate('/signup')}>
              Get Started
              <span className="ml-2 sm:ml-3 font-bold text-[#05152C]"> <ArrowRight size={18} className="sm:hidden" /> <ArrowRight size={22} className="hidden sm:inline" /></span>
            </GradientButton>
          </div>
        </section>
      </main>
    </div>
  );
}