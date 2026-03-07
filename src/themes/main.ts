import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineGlobalStyles,
  defineRecipe,
  defineSemanticTokens,
  defineTokens,
} from "@chakra-ui/react"

import { animationStyles } from "./animationStyles"
import { layerStyles } from "./layerStyles"
import { textStyles } from "./textStyles"

const tokens = defineTokens({
  colors: {
    pink: {
      50: { value: "#fff0f6" },
      100: { value: "#ffd6e7" },
      200: { value: "#ffb3d2" },
      300: { value: "#ff8fbd" },
      400: { value: "#ff6aa8" },
      500: { value: "#f0448e" },
      600: { value: "#cc2f72" },
      700: { value: "#a61f59" },
      800: { value: "#7a1342" },
      900: { value: "#520a2b" },
      950: { value: "#3a0619" },
    },
      purple: {
        50: { value: "#f6f0f6" },
        100: { value: "#e3d6e2" },
        200: { value: "#cbb8ca" },
        300: { value: "#b19bb0" },
        400: { value: "#8e6f8c" },
        500: { value: "#6e4f6c" },
        600: { value: "#51354f" },
        700: { value: "#3a2138" },
        800: { value: "#2a0f27" },
        900: { value: "#1B0019" },
        950: { value: "#120011" }
      },
      brown: {
        50: { value: "#f7ede7" },
        100: { value: "#f0d9c8" },
        200: { value: "#e6c7b2" },
        300: { value: "#d7b49e" },
        400: { value: "#c89f85" },
        500: { value: "#b98a6c" },
        600: { value: "#a97553" },
        700: { value: "#9c603a" },
        800: { value: "#8d4b21" },
        900: { value: "#7e3608" },
      },
      neutral: {
        50: { value: "#fffdfa" },
        100: { value: "#fff7f5" },
        200: { value: "#f4f1f0" },
        800: { value: "#2a2528" },
        900: { value: "#1f1a1d" },
      },
      red: {
        400: { value: "#f87171" },
        500: { value: "#ef4444" },
      },
    },
  })

const semanticTokens = defineSemanticTokens({
  colors: {
    background: {
      value: {
        DEFAULT: "{colors.purple.950}",
        _dark: "{colors.purple.950}",
      },
    },

    border: {
      value: {
        DEFAULT: "{colors.purple.700}",
        _dark: "{colors.purple.500}",
      },
    },

    borderHover: {
      value: {
        DEFAULT: "{colors.purple.500}",
        _dark: "{colors.pink.300}",
      },
    },

    shadow: {
      value: {
        DEFAULT: "{colors.purple.200}",
        _dark: "{colors.pink.300}",
      }
    },

    surface: {
      value: {
        base: "{colors.white}",
        _dark: "{colors.neutral.800}",
      },
    },

    accent: {
      value: {
        base: "{colors.purple.500}",
        _dark: "{colors.pink.300}",
      },
    },

    text: {
      value: {
        base: "#4a4a4a",
        _dark: "#f2f2f2",
      },
    },

    error: {
      value: {
        base: "{colors.red.500}",
        _dark: "{colors.red.400}",
      },
    },

  },
})

const globalCss = defineGlobalStyles({
  html: {
    scrollBehavior: "smooth",
    fontSize: "20px",
  },

  body: {
    background: "{colors.background}",
    color: "{colors.text}",
    display: "flex",
    margin: "0",
    boxSizing: "border-box",
  },

  "#root": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: "800px",
    marginRight: "auto",
    marginLeft: "auto",
    width: "100%",
  },
})

const buttonRecipe = defineRecipe({
  base: {
    transition: "all 0.2s ease",
    fontWeight: "semibold",
  },
  variants: {
    variant: {
      surface: {
        color: "white",
        border: "1px solid",
        borderColor: "purple.600",
        background:
          "linear-gradient(135deg, {colors.purple.700}, {colors.pink.500})",
        _hover: {
          background:
            "linear-gradient(135deg, {colors.purple.600}, {colors.pink.400})",
          boxShadow: "0 6px 20px rgba(240, 68, 142, 0.35)",
          transform: "translateY(-1px)",
        },
        _active: {
          background:
            "linear-gradient(135deg, {colors.purple.800}, {colors.pink.600})",
          transform: "translateY(0)",
        },
      },
      solidPurple: {
        bg: "purple.700",
        color: "white",
        border: "1px solid",
        borderColor: "purple.600",
        _hover: {
          bg: "purple.600",
          boxShadow: "0 6px 18px rgba(58, 33, 56, 0.4)",
          transform: "translateY(-1px)",
        },
        _active: {
          bg: "purple.800",
          transform: "translateY(0)",
        },
      },
      solidPink: {
        bg: "pink.400",
        color: "white",
        border: "1px solid",
        borderColor: "pink.600",
        _hover: {
          bg: "pink.400",
          boxShadow: "0 6px 18px rgba(240, 68, 142, 0.35)",
          transform: "translateY(-1px)",
        },
        _active: {
          bg: "pink.600",
          transform: "translateY(0)",
        },
      },
      outlinePurple: {
        bg: "transparent",
        color: "purple.200",
        border: "1px solid",
        borderColor: "purple.500",
        _hover: {
          bg: "purple.900",
          color: "pink.200",
          borderColor: "pink.400",
        },
        _active: {
          bg: "purple.800",
        },
      },
      ghostPink: {
        bg: "transparent",
        color: "pink.300",
        border: "1px solid transparent",
        _hover: {
          bg: "purple.900",
          color: "pink.200",
        },
        _active: {
          bg: "purple.800",
        },
      },
      danger: {
        bg: "red.500",
        color: "white",
        border: "1px solid",
        borderColor: "red.500",
        _hover: {
          bg: "red.400",
        },
        _active: {
          bg: "red.500",
          filter: "brightness(0.92)",
        },
      },
    },
  },
  defaultVariants: {
    variant: "surface",
  },
})

const config = defineConfig({
  globalCss,
  theme: {
    tokens,
    semanticTokens,
    layerStyles,
    textStyles,
    animationStyles,
    recipes: {
      button: buttonRecipe,
    },
  },
})

export const system = createSystem(defaultConfig, config)
