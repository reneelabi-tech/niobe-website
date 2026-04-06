const nunjucks = require("nunjucks");

module.exports = function (eleventyConfig) {
  // Pass static assets through without processing
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("images");

  // Configure Nunjucks with autoescape enabled so plain text values
  // are safe, and use | safe filter only for fields containing HTML.
  let nunjucksEnv = nunjucks.configure(".", {
    autoescape: true,
    throwOnUndefined: false,
  });
  eleventyConfig.setLibrary("njk", nunjucksEnv);

  // JSON serialisation filter for embedding data in <script> tags
  eleventyConfig.addFilter("json", v => JSON.stringify(v));

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk"],
  };
};
