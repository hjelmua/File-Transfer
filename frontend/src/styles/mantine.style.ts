import { MantineThemeOverride } from "@mantine/core";

export default <MantineThemeOverride>{
  colors: {
    hjelm: [
      "#e6f7fb",
      "#c2eaf4",
      "#96d9eb",
      "#66c6e0",
      "#41bcd8",
      "#2fb5d2",
      "#25a0bb",
      "#1b8099",
      "#126077",
      "#094050",
    ],
  },
  primaryColor: "hjelm",
  components: {
    Modal: {
      styles: (theme) => ({
        title: {
          fontSize: theme.fontSizes.lg,
          fontWeight: 700,
        },
      }),
    },
  },
};
