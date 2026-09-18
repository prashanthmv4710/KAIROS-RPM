import * as React from 'react';
import { useInitializeTheming } from "./utils/Theming";
import { useInitializeStore } from "./utils/store";
import { A11yAnnouncementProvider } from "./components/A11yAnnouncement";
import { A11yDevAssertions } from "./components/A11yDevAssertions";
import { SnackbarProvider } from "./components/Snackbar";
import OrdersPage from "./pages/OrdersPage";

export default function App() {

  // ── Theme ─────────────────────────────────────────────────────
  // Set the active theme for this app. Change the name to match the target brand.
  // Supported themes:
  //   'Walmart' | "Sam's Club" | 'Walmart B2B' | 'Bodega' | 'Cashi MX'
  //   'Data Ventures' | 'Sparky' | 'Walmart Legacy' | 'Walmart+' | "Member's Mark"
  useInitializeTheming('Walmart', ['Walmart'] as const);

  useInitializeStore();

  // ── Accessibility ─────────────────────────────────────────────
  // A11yAnnouncementProvider mounts the global live regions used by
  // `useAnnounce()` for polite/assertive screen reader announcements.
  // A11yDevAssertions runs a dev-only DOM scanner that throws into the
  // Vite error overlay when it finds an a11y violation (missing alt,
  // clickable non-interactive, unlabeled input, multiple h1, etc.).
  // In production both are no-ops / tree-shaken.
  //
  // Every page MUST be wrapped in <Page title="…"> — it renders the
  // single h1, the <main> landmark, and the skip-to-content link.
  // Do NOT write <main>, <h1>, or a skip link by hand.
  //
  // See the a11y rules file for the full directive.

  // ── Store Bindings (REQUIRED for headers & product interactions) ──
  // Every page with a header MUST use useHeaderCartBindings() so cart
  // count and price update live as items are added/removed:
  //
  //   import { useHeaderCartBindings, useStoreConnectedItemBindings } from "./utils/store";
  //
  //   const { cartCount, cartPrice } = useHeaderCartBindings();
  //   <WCPHeader cartCount={cartCount} cartPrice={cartPrice} />
  //
  // Every product card/tile MUST use useStoreConnectedItemBindings() so
  // cart qty, heart state, and header totals stay in sync across all
  // components that reference the same SKU:
  //
  //   const bindItem = useStoreConnectedItemBindings();
  //   const product = bindItem({ sku: "ABC", name: "Item", priceCents: 1999 });
  //
  //   <WCPHeartView activated={product.hearted} onChange={product.onHeartChange} />
  //   {product.cartQty === 0
  //     ? <Button variant="primary" onClick={product.onAddToCart}>Add to cart</Button>
  //     : <QuantityStepper count={product.cartQty} onChange={product.onCartQtyChange} />}
  //
  // NEVER use local useState for cart/heart state. NEVER use addToCart()
  // with QuantityStepper — it increments; use onCartQtyChange (sets exact qty).
  // See .cursor/rules/component-communication.mdc for full API reference.

  return (
    <A11yAnnouncementProvider>
      <A11yDevAssertions />
      <SnackbarProvider>
        <OrdersPage />
      </SnackbarProvider>
    </A11yAnnouncementProvider>
  );
}
