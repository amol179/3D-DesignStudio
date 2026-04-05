import PropTypes from "prop-types";
import {
  ArrowRight,
  LogIn,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ThemeToggle from "./ThemeToggle";

/* ---------------- HIGHLIGHTS ---------------- */

const highlights = [
  "Pick tees, hoodies, or caps in seconds",
  "Upload art and place it in 3D",
  "Export high-res PNG/JPG or short clips",
];

const microFeatures = [
  {
    title: "Fast mockups",
    desc: "Drop your logo and see it on a live 3D preview.",
  },
  { title: "Print-ready", desc: "Keep crisp edges with masked design areas." },
  {
    title: "Brand-safe",
    desc: "Your assets stay local — no uploads required.",
  },
];

/* ---------------- FRAMER MOTION VARIANTS ---------------- */

const sectionVariant = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
};

const containerVariant = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.25,
    },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

/* ---------------- COMPONENT ---------------- */

export default function LandingPage({
  isAuthenticated,
  onStart,
  onLogin,
  onSignup,
  onLogout,
}) {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0">
        <img
          src="/golden-bg.png"
          alt="Luxury background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,200,120,0.35),transparent_50%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-14 lg:py-20">
        {/* HEADER */}

        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-black grid place-items-center font-bold shadow-lg">
              DC
            </div>

            <div>
              <p className="text-sm text-gray-300">Design Studio</p>
              <p className="font-semibold tracking-wide">Mockups & 3D</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {!isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogin}
                  className="text-gray-200 hover:text-white hover:bg-white/10"
                >
                  <LogIn size={16} className="mr-1" />
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={onSignup}
                  className="bg-gradient-to-r from-yellow-400 to-amber-600 text-black font-semibold hover:scale-105 transition shadow-md"
                >
                  Sign up
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onLogout}
                  className="text-white"
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </header>

        {/* HERO */}

        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* LEFT */}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-7 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 px-4 py-1 text-sm text-yellow-300">
              <Sparkles size={16} />
              Launch in under 5 minutes
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              We Design Smart Fashion Experiences
            </h1>

            <p className="text-lg text-gray-300 max-w-xl mx-auto lg:mx-0">
              AI-powered T-shirt & hoodie mockups with real-time 3D previews.
              Design, customize and export instantly.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Button
                size="lg"
                onClick={onStart}
                className="bg-gradient-to-r from-yellow-400 to-amber-600 text-black font-semibold shadow-lg hover:scale-105 transition"
              >
                Start Designing
                <ArrowRight size={18} className="ml-2" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black transition"
              >
                Watch Demo
              </Button>
            </div>

            <ul className="space-y-3 text-gray-300 pt-4">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 justify-center lg:justify-start"
                >
                  <span className="h-2 w-2 rounded-full bg-yellow-400" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* RIGHT CARD */}

          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9 }}
          >
            <Card className="bg-black/60 border border-yellow-400/30 backdrop-blur-xl shadow-2xl rounded-3xl">
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-white">
                  AI Design Workspace
                  <span className="text-xs text-gray-400">
                    3D Preview Engine
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden border border-yellow-400/30">
                  <img
                    src="https://images.unsplash.com/photo-1558655146-9f40138edfeb"
                    alt="3D Design Workspace"
                    className="w-full h-64 object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                    <div>
                      <p className="text-yellow-300 text-sm font-semibold">
                        AI Powered Design
                      </p>

                      <p className="text-white text-lg font-semibold">
                        Create 3D Fashion Mockups
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  {microFeatures.map((feature) => (
                    <div
                      key={feature.title}
                      className="rounded-xl bg-black/40 border border-white/20 p-4 text-center"
                    >
                      <p className="text-sm text-white font-semibold">
                        {feature.title}
                      </p>
                      <p className="text-xs text-gray-300 mt-1">
                        {feature.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* FEATURES SECTION */}

        <motion.section
          className="mt-28"
          variants={sectionVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <div className="text-center mb-14">
            <p className="text-yellow-400 text-sm mb-2">PLATFORM FEATURES</p>

            <h2 className="text-3xl md:text-4xl font-bold">
              Powerful Tools for Modern Designers
            </h2>

            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              Our AI powered design studio helps creators build stunning fashion
              mockups faster than ever.
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariant}
          >
            <motion.div
              variants={cardVariant}
              whileHover={{ y: -8, scale: 1.04 }}
              className="group rounded-2xl border border-yellow-400/30 bg-black/50 backdrop-blur-xl p-7"
            >
              <Sparkles className="text-yellow-400 mb-4" size={28} />

              <h3 className="text-lg font-semibold mb-2">
                AI Design Generator
              </h3>

              <p className="text-gray-400 text-sm">
                Generate professional clothing mockups instantly using our AI
                powered design engine.
              </p>
            </motion.div>

            <motion.div
              variants={cardVariant}
              whileHover={{ y: -8, scale: 1.04 }}
              className="group rounded-2xl border border-yellow-400/30 bg-black/50 backdrop-blur-xl p-7"
            >
              <UploadCloud className="text-yellow-400 mb-4" size={28} />

              <h3 className="text-lg font-semibold mb-2">Smart Asset Upload</h3>

              <p className="text-gray-400 text-sm">
                Upload logos, artwork or graphics and instantly preview them on
                3D apparel models.
              </p>
            </motion.div>

            <motion.div
              variants={cardVariant}
              whileHover={{ y: -8, scale: 1.04 }}
              className="group rounded-2xl border border-yellow-400/30 bg-black/50 backdrop-blur-xl p-7"
            >
              <ShieldCheck className="text-yellow-400 mb-4" size={28} />

              <h3 className="text-lg font-semibold mb-2">
                High Resolution Export
              </h3>

              <p className="text-gray-400 text-sm">
                Export PNG, JPG or short product videos ready for marketing,
                e-commerce or printing.
              </p>
            </motion.div>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}

LandingPage.propTypes = {
  isAuthenticated: PropTypes.bool,
  onStart: PropTypes.func.isRequired,
  onLogin: PropTypes.func,
  onSignup: PropTypes.func,
  onLogout: PropTypes.func,
};

LandingPage.propTypes = {
  onStart: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  onSignup: PropTypes.func.isRequired,
};
