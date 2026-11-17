# Kun Foods Shopify theme

A custom Online Store 2.0 theme for Kun Foods. It was built from scratch, with no Dawn code. Every section, block and colour can be edited in the Shopify theme editor.

## Pages and sections

**Homepage** (`templates/index.json`)
1. **Announcement bar**: a scrolling strip of messages (free delivery, bundle savings, the WhatsApp bot).
2. **Header**: the logo, a menu with dropdowns, a mobile drawer, search, account and a cart count. It sticks to the top of the page.
3. **Hero**: a full-width background video or image, a heading, and taglines that rotate.
4. **Image with text** (×2): alternating image and text blocks with a row of benefit badges (up to 8, using built-in icons).
5. **Featured collection**: a product grid with a quantity stepper and quick add to cart.
6. **Video reviews**: a star rating and swipeable vertical video cards that play on tap.
7. **Featured recipes**: three cards from your Recipes blog.
8. **Newsletter**: email sign-up with a first-order offer.
9. **Footer**: menu columns, social icons (including WhatsApp) and policy links.

**Product page** (`templates/product.json`)
- An image and video gallery with thumbnails. Choosing a variant shows that variant's image.
- Flavour chips, which can show a small image of each variant.
- **Bundle tiers** (1 / 2 / 4 packs). The chosen tier sets the quantity added to cart and shows the saving.
- **Subscribe & save**, which appears automatically when a subscription app adds selling plans.
- Trust badges, and collapsible tabs for ingredients and cooking steps (these read product metafields).
- Below the product: icon benefits, recipes, and an FAQ.

**Other pages**: collection (with "Shop by" chips, sorting and pagination), cart (with a free-delivery progress bar), search, blog, article (with a WhatsApp recipe-bot callout), collections list, page, 404, password, gift card and all customer account pages.

## Install

### Option A: upload a zip
```bash
cd shopify-theme
zip -r ../kun-foods-theme.zip . -x "README.md"
```
Then go to Shopify admin → **Online Store → Themes → Add theme → Upload zip file**.

### Option B: Shopify CLI (best for development)
```bash
npm install -g @shopify/cli
cd shopify-theme
shopify theme dev --store your-store.myshopify.com   # live local preview
shopify theme push --unpublished                      # upload as a new theme
```

## Store setup checklist

1. **Menus** (Online Store → Navigation)
   - `main-menu`: add child links to create dropdowns, e.g. *Shop → Masalas, Ready meals* and *Learn → Our story, Recipes, FAQs*.
   - `footer`: used by the footer columns. You can pick a different menu for each column in the editor.
   - Optional: a "Shop by" menu of collection links, then select it in the collection template's **Collection grid** section.
2. **Featured collection**: in the theme editor, choose the collection for the homepage "Shop all" grid.
3. **Bundle discounts**: the bundle tiers only *show* the saving. To actually charge less, create automatic discounts in **Discounts**. For example: "10% off, minimum quantity 2" and "20% off, minimum quantity 4", applied to the products. Keep the percentages in the theme's tier blocks the same as these.
4. **Subscriptions** (optional): install a subscription app such as Shopify Subscriptions. The "Subscribe & save" option appears on its own once a product has a selling plan.
5. **Product metafields** (Settings → Custom data → Products). All are optional:
   | Namespace & key | Type | Used for |
   |---|---|---|
   | `custom.subtitle` | Single line text | Line under the product title and on cards, e.g. "Serves 4–6 · Medium heat" |
   | `custom.ingredients` | Rich text | "Ingredients" tab |
   | `custom.how_to_cook` | Rich text | "How to cook" tab |
   Star ratings appear automatically if a reviews app fills the standard `reviews.rating` metafields.
6. **Recipes blog**: create a blog called *Recipes* and select it in the **Featured recipes** sections. On each post, add a category tag (e.g. `Main course`) and a time tag such as `time:30`, which displays as "30 min".
7. **Theme settings → Social media**: add your WhatsApp link (e.g. `https://wa.me/92XXXXXXXXXX`). This connects shoppers to the Kun Foods WhatsApp recipe bot.
8. **Theme settings → Cart**: set the free-delivery threshold (e.g. `5000`) so the cart shows a progress bar.
9. **Fonts and colours**: both fonts default to Assistant, which is safe. For more character, try a serif heading font such as Playfair Display or Lora under **Typography**. The colours are a warm cream, chili red and saffron palette, and every one can be changed under **Colors**.

## Placeholder text

The demo text is placeholder copy for Kun Foods: taglines, badges, FAQ answers, reviews, the Rs. 5,000 delivery threshold and the 15% sign-up offer. Replace it all in the theme editor before launch, especially the review quotes, which must come from real customers.

## File layout

```
assets/      base.css, theme.js (no build step, no dependencies)
config/      theme settings
layout/      theme.liquid, password.liquid
locales/     en.default.json (all storefront text)
sections/    every page section, plus header and footer groups
snippets/    product card, price, icons, etc.
templates/   JSON page templates and customer pages
```

The theme passes Shopify Theme Check with no errors or warnings.
