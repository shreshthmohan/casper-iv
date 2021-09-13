module.exports = {
  purge: ["./**/*.html", "./src/**/*.js", "./**/*.hbs"],
  darkMode: false, // or 'media' or 'class'
  corePlugins: {
    preflight: false,
  },
  theme: {},
  variants: {
    extend: {
      backgroundColor: ["disabled"],
      cursor: ["disabled"],
    },
  },
};
