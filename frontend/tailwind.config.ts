export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          surface: {
            base:    "#0d0f12",
            raised:  "#13161b",
            overlay: "#1a1e26",
            border:  "#252a35",
            hover:   "#1e2330",
          },
          accent: {
            DEFAULT: "#7c6ff7",
            dim:     "#5a51d4",
            glow:    "#9d94fa",
            muted:   "#2d2b52",
          },
          ink: {
            primary:   "#eef0f6",
            secondary: "#9ba3b8",
            tertiary:  "#5a6175",
            inverse:   "#0d0f12",
          },
          success: "#34d399",
          warning: "#fbbf24",
          danger:  "#f87171",
          info:    "#60a5fa",
        },
        fontFamily: {
          sans: ["Inter", "system-ui", "sans-serif"],
          mono: ["JetBrains Mono", "Fira Code", "monospace"],
        },
        fontSize: {
          "2xs": ["0.65rem", { lineHeight: "1rem" }],
        },
        animation: {
          "fade-in":  "fadeIn 0.2s ease-out",
          "slide-up": "slideUp 0.25s ease-out",
          "blink":    "blink 1s step-end infinite",
        },
        keyframes: {
          fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
          slideUp: {
            from: { opacity: "0", transform: "translateY(8px)" },
            to:   { opacity: "1", transform: "translateY(0)" },
          },
          blink: {
            "0%,100%": { opacity: "1" },
            "50%":     { opacity: "0" },
          },
        },
        boxShadow: {
          "glow-accent": "0 0 20px 0 rgba(124,111,247,0.25)",
          "glow-sm":     "0 0 8px 0 rgba(124,111,247,0.15)",
        },
      },
    },
    plugins: [],
  };