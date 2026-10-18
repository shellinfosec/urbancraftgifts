URBAN CRAFT & CO — PRELOADER COLLECTION
=======================================
START HERE: double-click index.html (opens in any browser). Click "Preview here" on a card,
or "Open full-page" for the real full-screen experience. Each file also has a Replay button.

FILES
  01_Line_Draw.html          cream · outline draws · curtain lifts up
  02_Evening_Iris.html       green · gold ribbon shimmer · iris-close reveal
  03_Ribbon_and_Tag.html     ribbon ties, box forms, tag drops & sways · soft dissolve
  04_Seal_Ring.html          gold progress ring around the outline icon · soft expand
  05_Split_Panels.html       colour fills up with progress · screen splits open
  assets/                    4 vector SVG versions of the outline logo (traced from your PNG)

HOW IT WORKS
  - Everything is pure HTML/CSS/JS with inline SVG. No libraries, no images, no internet needed.
  - The logo is vector, so it stays sharp on any screen, retina included.
  - It shows for a minimum time (MIN) and never hides before the page has genuinely finished
    loading (the browser "load" event), so slow connections wait at ~92% instead of faking it.
  - Respects "reduce motion" system settings (shortens to a quick fade).

ADD ONE TO YOUR WEBSITE (3 copy-pastes)
  Open your chosen file in a text editor. Ignore the DEMO parts (marked in the file).
  1. <html> tag: add  class="is-loading"
  2. <style>: copy everything under "PRELOADER CORE" and "PRELOADER 0X" into your CSS.
  3. <body>: paste the block between "PRELOADER START" and "PRELOADER END" as the FIRST thing in <body>.
  4. Before </body>: paste the <script> at the bottom of the file.
  5. Delete the demo nav/hero, the Replay button, and the "DEMO WEBSITE" CSS.
  Tip: your page's real content should be what shows after the preloader leaves — the script adds
  the class "site-ready" to <body> as the exit starts, if you want to animate your content in with it.

SETTINGS (top of the <script>)
  var MIN  = minimum display time in milliseconds (e.g. 3600)
  var EXIT = exit animation length in ms; keep in sync with the CSS transition duration

SHOW ONLY ON THE FIRST VISIT PER SESSION (optional)
  Put this in <head> before the preloader CSS:
    <script>try{if(sessionStorage.getItem('uc_seen')){document.documentElement.classList.remove('is-loading');document.write('<style>#preloader{display:none}</style>')}else{sessionStorage.setItem('uc_seen','1')}}catch(e){}</script>

WORDPRESS / SHOPIFY / WIX / SQUARESPACE
  Paste the markup into a "custom HTML / code injection" area that loads at the top of every page
  (header/body-start), and the CSS + script into the same injection points.

BRAND COLOURS USED
  Green #2F3A2E | Brown #8B5E3C | Sand #E8DDC9 | Gold #D4B483 | Cream #F8F6EE | Charcoal #2B2828
