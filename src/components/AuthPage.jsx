// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import ThemeToggle from "./ThemeToggle";
// import { auth } from "@/lib/firebase";
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signInWithPopup,
//   GoogleAuthProvider,
// } from "firebase/auth";

// const tabs = [
//   { id: "login", label: "Login" },
//   { id: "signup", label: "Sign up" },
// ];


// export default function AuthPage({
//   initialMode = "login",
//   onBack,
//   onContinue,
// }) {
//   const [mode, setMode] = useState(initialMode);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [company, setCompany] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const title = mode === "login" ? "Welcome back" : "Create your account";
//   const cta = mode === "login" ? "Login" : "Create account";
//   const helper =
//     mode === "login" ? "Don't have an account?" : "Already have an account?";
//   const helperCta = mode === "login" ? "Sign up" : "Login";
//   const toggleMode = () => {
//     setMode(mode === "login" ? "signup" : "login");
//     setError("");
//     setEmail("");
//     setPassword("");
//     setCompany("");
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       if (!email || !password) {
//         setError("Please fill in all fields");
//         setLoading(false);
//         return;
//       }
//       await signInWithEmailAndPassword(auth, email, password);
//       onContinue?.();
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       if (!email || !password) {
//         setError("Please fill in all fields");
//         setLoading(false);
//         return;
//       }
//       if (password.length < 6) {
//         setError("Password must be at least 6 characters");
//         setLoading(false);
//         return;
//       }
//       await createUserWithEmailAndPassword(auth, email, password);
//       onContinue?.();
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleSignIn = async () => {
//     setError("");
//     setLoading(true);
//     try {
//       const provider = new GoogleAuthProvider();
//       await signInWithPopup(auth, provider);
//       onContinue?.();
//     } catch (err) {
//       if (err.code !== "auth/popup-closed-by-user") {
//         setError(err.message);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleContinue = mode === "login" ? handleLogin : handleSignup;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#fdf4e5] via-[#eef4ff] to-white text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
//       <div className="max-w-5xl mx-auto px-6 py-10 lg:py-16">
//         <header className="flex items-center justify-between mb-12">
//           <div className="flex items-center gap-3">
//             <div className="h-10 w-10 rounded-full bg-slate-900 text-white grid place-items-center font-semibold dark:bg-white dark:text-slate-900">
//               DC
//             </div>
//             <div className="leading-tight">
//               <p className="text-sm text-slate-500 dark:text-slate-400">
//                 Design Cloud
//               </p>
//               <p className="font-semibold">Mockups & 3D</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <ThemeToggle />
//             <Button variant="ghost" size="sm" onClick={onBack}>
//               Back
//             </Button>
//           </div>
//         </header>

//         <div className="grid lg:grid-cols-2 gap-8 items-center">
//           <div className="space-y-4">
//             <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm text-slate-700 shadow-sm dark:bg-slate-800/80 dark:text-slate-100">
//               <span className="h-2 w-2 rounded-full bg-amber-500" />
//               Secure workspace access
//             </div>
//             <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
//               {title}
//             </h1>
//             <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl">
//               Keep your designs synced, save canvases, and export print-ready
//               mockups after you sign in.
//             </p>
//             <div className="grid grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-200">
//               <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:bg-slate-800 dark:border-slate-700">
//                 <p className="font-semibold">Save states</p>
//                 <p className="text-slate-500 dark:text-slate-400 mt-1">
//                   Autosave your layouts and pick up later.
//                 </p>
//               </div>
//               <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:bg-slate-800 dark:border-slate-700">
//                 <p className="font-semibold">Team-ready</p>
//                 <p className="text-slate-500 dark:text-slate-400 mt-1">
//                   Share exports with teammates instantly.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <Card className="bg-white/90 shadow-2xl backdrop-blur border-slate-200 dark:bg-slate-900/80 dark:border-slate-800">
//             <CardHeader className="pb-2">
//               <div className="flex items-center gap-2">
//                 {tabs.map((tab) => (
//                   <Button
//                     key={tab.id}
//                     size="sm"
//                     variant={mode === tab.id ? "default" : "outline"}
//                     onClick={() => setMode(tab.id)}
//                     className="rounded-full px-4"
//                   >
//                     {tab.label}
//                   </Button>
//                 ))}
//               </div>
//               <CardTitle className="text-2xl mt-4">{title}</CardTitle>
//               <p className="text-sm text-slate-600 dark:text-slate-400">
//                 {mode === "login"
//                   ? "Access your saved designs and exports."
//                   : "Create an account to save and share your mockups."}
//               </p>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-3">
//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="you@example.com"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     disabled={loading}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="password">Password</Label>
//                   <Input
//                     id="password"
//                     type="password"
//                     placeholder="••••••••"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     disabled={loading}
//                   />
//                 </div>
//                 {mode === "signup" && (
//                   <div className="space-y-2">
//                     <Label htmlFor="company">Team / Brand (optional)</Label>
//                     <Input
//                       id="company"
//                       type="text"
//                       placeholder="Brand name"
//                       value={company}
//                       onChange={(e) => setCompany(e.target.value)}
//                       disabled={loading}
//                     />
//                   </div>
//                 )}
//               </div>

//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-slate-200 dark:border-slate-700" />
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <span className="px-2 bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400">
//                     Or continue with
//                   </span>
//                 </div>
//               </div>

//               <Button
//                 type="button"
//                 variant="outline"
//                 className="w-full"
//                 onClick={handleGoogleSignIn}
//                 disabled={loading}
//               >
//                 <svg
//                   className="w-4 h-4 mr-2"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path
//                     d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//                     fill="currentColor"
//                   />
//                   <path
//                     d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//                     fill="currentColor"
//                   />
//                   <path
//                     d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//                     fill="currentColor"
//                   />
//                   <path
//                     d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//                     fill="currentColor"
//                   />
//                 </svg>
//                 {loading ? "Signing in..." : "Sign in with Google"}
//               </Button>

//               {error && (
//                 <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
//                   {error}
//                 </div>
//               )}

//               <Button
//                 className="w-full"
//                 onClick={handleContinue}
//                 disabled={loading}
//               >
//                 {loading ? "Loading..." : cta}
//               </Button>
//               <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
//                 {helper}{" "}
//                 <button className="underline" onClick={toggleMode}>
//                   {helperCta}
//                 </button>
//               </p>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }




// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import ThemeToggle from "./ThemeToggle";
// import { auth } from "@/lib/firebase";
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signInWithPopup,
//   GoogleAuthProvider,
// } from "firebase/auth";

// const tabs = [
//   { id: "login", label: "Login" },
//   { id: "signup", label: "Sign up" },
// ];

// export default function AuthPage({ initialMode = "login", onBack, onContinue }) {
//   const [mode, setMode] = useState(initialMode);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [company, setCompany] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const title = mode === "login" ? "Welcome back" : "Create your account";
//   const cta = mode === "login" ? "Login" : "Create account";
//   const helper =
//     mode === "login" ? "Don't have an account?" : "Already have an account?";
//   const helperCta = mode === "login" ? "Sign up" : "Login";

//   const toggleMode = () => {
//     setMode(mode === "login" ? "signup" : "login");
//     setError("");
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       onContinue?.();
//     } catch (err) {
//       setError(err.message);
//     }
//     setLoading(false);
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await createUserWithEmailAndPassword(auth, email, password);
//       onContinue?.();
//     } catch (err) {
//       setError(err.message);
//     }
//     setLoading(false);
//   };

//   const handleGoogleSignIn = async () => {
//     setLoading(true);
//     try {
//       const provider = new GoogleAuthProvider();
//       await signInWithPopup(auth, provider);
//       onContinue?.();
//     } catch (err) {
//       setError(err.message);
//     }
//     setLoading(false);
//   };

//   const handleContinue = mode === "login" ? handleLogin : handleSignup;

//   return (
//     <div
//       className="relative min-h-screen bg-cover bg-center"
//       style={{ backgroundImage: "url('/golden-bg.png')" }}
//     >
//       {/* Overlay */}
//       <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

//       <div className="relative max-w-6xl mx-auto px-6 py-12">

//         {/* HEADER */}
//         <header className="flex items-center justify-between mb-14">
//           <div className="flex items-center gap-3">
//             <div className="h-11 w-11 rounded-full bg-gradient-to-br from-yellow-400 to-amber-700 text-white grid place-items-center font-bold">
//               DC
//             </div>
//             <div>
//               <p className="text-yellow-300 text-sm">Design Cloud</p>
//               <p className="text-white font-semibold">Mockups & 3D</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <ThemeToggle />
//             <Button variant="outline" onClick={onBack}>
//               Back
//             </Button>
//           </div>
//         </header>

//         <div className="grid lg:grid-cols-2 gap-12 items-center">

//           {/* LEFT TEXT */}
//           <div className="text-white space-y-6">
//             <h1 className="text-5xl font-bold">{title}</h1>
//             <p className="text-lg text-gray-200">
//               Keep your designs synced and export professional mockups after
//               signing in.
//             </p>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-white/10 backdrop-blur p-4 rounded-xl">
//                 <p className="font-semibold">Save Designs</p>
//                 <p className="text-sm text-gray-300">
//                   Autosave your layouts and access later.
//                 </p>
//               </div>

//               <div className="bg-white/10 backdrop-blur p-4 rounded-xl">
//                 <p className="font-semibold">Team Ready</p>
//                 <p className="text-sm text-gray-300">
//                   Share projects with teammates easily.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* AUTH CARD */}
//           <Card className="bg-white/90 backdrop-blur-xl border-none shadow-2xl rounded-2xl">
//             <CardHeader>
//               <div className="flex gap-2">
//                 {tabs.map((tab) => (
//                   <Button
//                     key={tab.id}
//                     size="sm"
//                     onClick={() => setMode(tab.id)}
//                     className={`rounded-full px-4 ${
//                       mode === tab.id
//                         ? "bg-gradient-to-r from-yellow-400 to-amber-600 text-white"
//                         : "bg-gray-100"
//                     }`}
//                   >
//                     {tab.label}
//                   </Button>
//                 ))}
//               </div>

//               <CardTitle className="text-2xl mt-4">{title}</CardTitle>
//             </CardHeader>

//             <CardContent className="space-y-4">

//               <Input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />

//               <Input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />

//               {mode === "signup" && (
//                 <Input
//                   placeholder="Brand name"
//                   value={company}
//                   onChange={(e) => setCompany(e.target.value)}
//                 />
//               )}

//               {/* GOOGLE LOGIN */}
//               <Button
//                 variant="outline"
//                 className="w-full"
//                 onClick={handleGoogleSignIn}
//               >
//                 Sign in with Google
//               </Button>

//               {error && (
//                 <div className="text-red-500 text-sm">{error}</div>
//               )}

//               <Button
//                 className="w-full bg-gradient-to-r from-yellow-400 to-amber-600 text-white"
//                 onClick={handleContinue}
//               >
//                 {loading ? "Loading..." : cta}
//               </Button>

//               <p className="text-sm text-center">
//                 {helper}{" "}
//                 <button className="underline" onClick={toggleMode}>
//                   {helperCta}
//                 </button>
//               </p>
//             </CardContent>
//           </Card>

//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ThemeToggle from "./ThemeToggle";
import { auth } from "@/lib/firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

const tabs = [
  { id: "login", label: "Login" },
  { id: "signup", label: "Sign up" },
];

export default function AuthPage({ initialMode = "login", onBack, onContinue }) {

  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const title = mode === "login" ? "Welcome back" : "Create your account";
  const cta = mode === "login" ? "Login" : "Create account";

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError("");
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onContinue?.();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      onContinue?.();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onContinue?.();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleContinue = mode === "login" ? handleLogin : handleSignup;

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/golden-bg.png')" }}
    >

      {/* overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="relative max-w-5xl mx-auto px-6 py-10">

        {/* HEADER */}
        <header className="flex items-center justify-between mb-12">

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-400 to-amber-600 text-white grid place-items-center font-bold">
              DC
            </div>

            <div>
              <p className="text-sm text-yellow-300">Design Cloud</p>
              <p className="font-semibold text-white">Mockups & 3D</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Button
              onClick={onBack}
              className="bg-white text-black hover:bg-gray-200"
            >
              Back
            </Button>
          </div>

        </header>

        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* LEFT SIDE TEXT */}
          <div className="text-white space-y-5">

            <h1 className="text-4xl font-bold">{title}</h1>

            <p className="text-gray-200">
              Keep your designs synced and export professional mockups after
              signing in.
            </p>

            <div className="grid grid-cols-2 gap-4">

              <div className="bg-white/10 p-4 rounded-xl backdrop-blur">
                <p className="font-semibold">Save Designs</p>
                <p className="text-sm text-gray-300">
                  Autosave layouts and access later.
                </p>
              </div>

              <div className="bg-white/10 p-4 rounded-xl backdrop-blur">
                <p className="font-semibold">Team Ready</p>
                <p className="text-sm text-gray-300">
                  Share projects with teammates.
                </p>
              </div>

            </div>

          </div>

          {/* LOGIN CARD */}

          <Card className="bg-white/95 shadow-2xl rounded-2xl border-none">

            <CardHeader>

              <div className="flex gap-2">

                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    size="sm"
                    onClick={() => setMode(tab.id)}
                    className={
                      mode === tab.id
                        ? "bg-gradient-to-r from-yellow-400 to-amber-600 text-white"
                        : "bg-gray-200 text-black"
                    }
                  >
                    {tab.label}
                  </Button>
                ))}

              </div>

              <CardTitle className="text-2xl mt-4 text-black">
                {title}
              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-4">

              <Input
                type="email"
                placeholder="Email"
                className="bg-white text-black border-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                type="password"
                placeholder="Password"
                className="bg-white text-black border-gray-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {mode === "signup" && (
                <Input
                  placeholder="Brand name"
                  className="bg-white text-black border-gray-300"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              )}

              {/* GOOGLE BUTTON */}

              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleGoogleSignIn}
              >

                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  className="w-5 h-5"
                />

                Sign in with Google

              </Button>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <Button
                className="w-full bg-gradient-to-r from-yellow-400 to-amber-600 text-white"
                onClick={handleContinue}
              >
                {loading ? "Loading..." : cta}
              </Button>

              <p className="text-sm text-center text-gray-600">

                {mode === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}

                <button
                  className="ml-2 underline"
                  onClick={toggleMode}
                >
                  {mode === "login" ? "Sign up" : "Login"}
                </button>

              </p>

            </CardContent>

          </Card>

        </div>

      </div>

    </div>
  );
}