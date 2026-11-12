// Lace 0.1.0-rc3 configuration for tatianae.com (portfolio of Tatiana Egoshina).
//
// Content map:
//   /                 page "home"        intro; projects listed by their `order`
//   /about            page "about"       intro + section headings; rows from "cv"
//   /projects/:slug   collection "projects"  header row, text, gallery blocks
//   /cv/:slug         collection "cv"    About rows; the site renders no page
//                                        for them and leaves them out of the sitemap
//   (no route)        global "settings"  site name, footer, accent, SEO defaults
//   (no route)        global "navigation" header links: about, instagram, email
//
// Project media use the built-in `gallery` (install its source with
// `lace add block gallery`). One project is a sequence of galleries, one per
// run of rows with the same layout (see README.md).
import { defineCollection, defineConfig, defineGlobal, definePage } from "@lacecms/config";
import { builtInBlocks, field } from "@lacecms/content";

// --- Models ------------------------------------------------------------------

const accentColor = (defaultValue: string) =>
  field.text({
    label: "Accent colour",
    description: "CSS hex colour of text and rules on this page.",
    placeholder: "#FF00A7",
    minLength: 4,
    maxLength: 7,
    defaultValue,
  });

export default await defineConfig({
  blocks: [
    builtInBlocks.hero,
    builtInBlocks.richText,
    builtInBlocks.image,
    builtInBlocks.quote,
    builtInBlocks.cta,
    builtInBlocks.link,
    builtInBlocks.gallery,
    builtInBlocks.navigation,
    builtInBlocks.videoEmbed,
  ],
  content: [
    definePage({
      key: "home",
      version: 10,
      label: "Home",
      path: "/",
      fields: {
        intro: field.richText({ label: "Introduction", required: true }),
        projectsHeading: field.text({
          label: "Projects heading",
          required: true,
          defaultValue: "Selected projects",
        }),
      },
      seo: true,
    }),
    definePage({
      key: "about",
      version: 1,
      label: "About",
      path: "/about",
      fields: {
        intro: field.richText({ label: "Introduction", required: true }),
        accentColor: accentColor("#FF8000"),
        sectionHeadings: field.group({
          label: "Section headings",
          description: "Headings of the tables built from About entries, in page order.",
          fields: {
            publications: field.text({
              label: "Publications",
              required: true,
              defaultValue: "Interviews and publications",
            }),
            exhibitions: field.text({
              label: "Exhibitions",
              required: true,
              defaultValue: "Exhibitions",
            }),
            teaching: field.text({ label: "Teaching", required: true, defaultValue: "Teaching" }),
            talks: field.text({
              label: "Talks",
              required: true,
              defaultValue: "Public speaking engagements",
            }),
            jury: field.text({ label: "Jury", required: true, defaultValue: "Jury" }),
          },
        }),
      },
      seo: true,
    }),
    defineCollection({
      key: "projects",
      version: 2,
      label: "Projects",
      route: "/projects/:slug",
      fields: {
        order: field.number({
          label: "Order",
          required: true,
          min: 0,
          max: 100000,
          placeholder: "10",
          description:
            'Position on the home page, smallest first; also drives "Next project". Leave gaps (10, 20, 30) to insert projects later.',
        }),
        year: field.text({
          label: "Year",
          required: true,
          maxLength: 20,
          placeholder: "2026←25",
          description: "Single year or range, newest first. The first year groups the home list.",
        }),
        summary: field.text({
          label: "Short description",
          required: true,
          maxLength: 160,
          description: "Shown in the home list, the project header and as the search description.",
        }),
        body: field.richText({
          label: "Text",
          description: "Paragraphs and links above the media.",
        }),
      },
      layout: {
        mode: "sections",
        groups: [
          { key: "row", label: "List row", fields: ["order", "year", "summary"] },
          { key: "text", label: "Text", fields: ["body"] },
        ],
      },
      listFields: ["order", "year", "summary"],
      listOptions: {
        sortableFields: ["order", "year"],
        searchableFields: ["summary"],
      },
      blocks: ["gallery"],
      seo: { description: "summary" },
    }),
    defineCollection({
      key: "cv",
      version: 1,
      label: "About entries",
      // A collection needs a route in rc2. The site renders no /cv pages and
      // filters this model out of the sitemap.
      route: "/cv/:slug",
      fields: {
        section: field.select({
          label: "Section",
          required: true,
          options: ["publications", "exhibitions", "teaching", "talks", "jury"],
          presentation: {
            control: "cards",
            choices: [
              { value: "publications", label: "Interviews and publications" },
              { value: "exhibitions", label: "Exhibitions" },
              { value: "teaching", label: "Teaching" },
              { value: "talks", label: "Public speaking" },
              { value: "jury", label: "Jury" },
            ],
          },
        }),
        year: field.text({
          label: "Year",
          required: true,
          maxLength: 20,
          placeholder: "2025←22",
          description: "Single year or range. Rows are sorted by the first year, newest first.",
        }),
        organization: field.text({
          label: "Organisation or venue",
          maxLength: 200,
          description: "Outlet, school, event or venue. Leave empty for jury rows.",
        }),
        note: field.text({
          label: "Note",
          maxLength: 120,
          description: "City (exhibitions), format (teaching) or (print).",
        }),
        url: field.url({ label: "Link", description: "Adds ↗ after the row." }),
        order: field.number({
          label: "Order within year",
          min: 0,
          max: 100000,
          description: "Optional. Orders rows of the same year, smallest first.",
        }),
      },
      layout: {
        mode: "sections",
        groups: [
          { key: "row", label: "Row", fields: ["section", "year", "organization", "note"] },
          { key: "extra", label: "Link and order", fields: ["url", "order"] },
        ],
      },
      listFields: ["section", "year", "organization"],
      listOptions: {
        sortableFields: ["year", "order", "section"],
        filterableFields: ["section"],
        searchableFields: ["organization", "note"],
      },
    }),
    defineGlobal({
      key: "settings",
      version: 3,
      label: "Site settings",
      description: "Site name, footer, default accent colour and search defaults.",
      fields: {
        siteName: field.text({
          label: "Site name",
          required: true,
          defaultValue: "Tatiana Egoshina",
        }),
        footerNote: field.text({ label: "Footer note", defaultValue: "2026, Milan" }),
        vatNumber: field.text({ label: "Partita IVA", maxLength: 20 }),
        accentColor: accentColor("#FF00A7"),
        titleTemplate: field.text({
          label: "Title template",
          description: "%s stands for the page title.",
        }),
        description: field.textarea({
          label: "Site description",
          defaultValue: "Design portfolio",
        }),
        image: field.media({ label: "Share image" }),
      },
      layout: {
        mode: "tabs",
        groups: [
          {
            key: "site",
            label: "Site",
            fields: ["siteName", "footerNote", "vatNumber", "accentColor"],
          },
          {
            key: "seo",
            label: "Search and sharing",
            fields: ["titleTemplate", "description", "image"],
          },
        ],
      },
      seoDefaults: {
        siteName: "siteName",
        titleTemplate: "titleTemplate",
        description: "description",
        image: "image",
      },
    }),
    defineGlobal({
      key: "navigation",
      version: 2,
      label: "Navigation",
      description: "Header links after the site name, in order.",
      fields: {
        links: field.list({
          label: "Links",
          defaultValue: [],
          minItems: 1,
          maxItems: 10,
          itemLabel: "label",
          item: field.group({
            fields: {
              label: field.text({ label: "Label", required: true, minLength: 1, maxLength: 40 }),
              url: field.url({
                label: "Destination",
                required: true,
                description:
                  "Pick a page (About), or type https://… for Instagram or mailto:ciao@tatianae.com for email.",
              }),
              newTab: field.boolean({ label: "Open in a new tab", defaultValue: false }),
            },
          }),
        }),
      },
    }),
  ],
});
