// import { useEffect, useState } from "react";
// import { Moon, Sun } from "lucide-react";

// const getInitialTheme = () => {
//   if (typeof window === "undefined") return "light";
//   const stored = localStorage.getItem("theme");
//   if (stored === "light" || stored === "dark") return stored;
//   return window.matchMedia("(prefers-color-scheme: dark)").matches
//     ? "dark"
//     : "light";
// };

// const ThemeToggle = () => {
//   const [theme, setTheme] = useState(getInitialTheme);

//   useEffect(() => {
//     const root = document.documentElement;
//     if (theme === "dark") {
//       root.classList.add("dark");
//     } else {
//       root.classList.remove("dark");
//     }
//     localStorage.setItem("theme", theme);
//   }, [theme]);

//   const isDark = theme === "dark";

//   return (
//     <button
//       type="button"
//       onClick={() => setTheme(isDark ? "light" : "dark")}
//       className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-medium shadow-sm transition hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
//       aria-pressed={isDark}
//       aria-label="Toggle theme"
//     >
//       {isDark ? <Sun size={16} /> : <Moon size={16} />}
//       <span className="hidden sm:inline">
//         {isDark ? "Light mode" : "Dark mode"}
//       </span>
//     </button>
//   );
// };

// export default ThemeToggle;



"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";

  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="
      inline-flex items-center gap-2
      rounded-md
      border
      px-3 py-2
      text-sm font-medium
      shadow-sm
      transition
      
      bg-white text-black border-gray-300
      hover:bg-gray-100
      
      dark:bg-slate-800 dark:text-white dark:border-slate-600
      dark:hover:bg-slate-700
      
      focus-visible:outline focus-visible:outline-2
      focus-visible:outline-offset-2
      "
      aria-pressed={isDark}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span className="hidden sm:inline">
        {isDark ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
};

export default ThemeToggle;