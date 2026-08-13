export const FONT_DISPLAY = "'Baloo 2', sans-serif";
export const FONT_BODY = "'Plus Jakarta Sans', sans-serif";
export const FONT_MONO = "'JetBrains Mono', monospace";

export interface ThemeTokens {
  bg: string;
  bgAlt: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  purple: string;
  purpleStrong: string;
  purpleDeep: string;
  teal: string;
  tealDeep: string;
  gold: string;
  goldDeep: string;
  green: string;
  red: string;
  chip: string[];
}

export const THEME: { dark: ThemeTokens; light: ThemeTokens } = {
  dark: {
    bg: "#16121F",
    bgAlt: "#0F0C17",
    surface: "#221C31",
    surfaceAlt: "#2B2440",
    border: "#3A3252",
    text: "#F6F3FC",
    textMuted: "#B3A8CC",
    textFaint: "#7C7098",
    purple: "#9B7FE8",
    purpleStrong: "#7C5CE0",
    purpleDeep: "#40315F",
    teal: "#31D6C0",
    tealDeep: "#1B8A96",
    gold: "#F5B942",
    goldDeep: "#C98F1F",
    green: "#5FD483",
    red: "#F16A63",
    chip: ["#7C5CE0", "#31D6C0", "#F5B942", "#F16A63", "#5FD483", "#E87FC1"],
  },
  light: {
    bg: "#FBF9FE",
    bgAlt: "#F2EDFB",
    surface: "#FFFFFF",
    surfaceAlt: "#F3EEFB",
    border: "#E5DCF7",
    text: "#221A38",
    textMuted: "#5F5578",
    textFaint: "#8D82A6",
    purple: "#6B34C9",
    purpleStrong: "#5B27B5",
    purpleDeep: "#EDE3FA",
    teal: "#0F9C8B",
    tealDeep: "#0B7A6C",
    gold: "#C98214",
    goldDeep: "#A66A0E",
    green: "#238C4E",
    red: "#C43E38",
    chip: ["#6B34C9", "#0F9C8B", "#C98214", "#C43E38", "#238C4E", "#B33F98"],
  },
};
