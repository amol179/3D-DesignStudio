import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AVAILABLE_SIZES, TAX_RATE, SHIPPING_FEE } from "@/constants/pricingConstants";
import { buildGarmentPreviewDataUrl } from "@/utils/cartPreview";
import { removeItem, updateItemSize, updateQuantity } from "@/features/cartSlice";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

function CartPage({ onBack, onCheckout, cartCount }) {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const [previewUrls, setPreviewUrls] = useState({});

  useEffect(() => {
    let cancelled = false;

    const generatePreviews = async () => {
      const entries = await Promise.all(
        items.map(async (item) => [item.id, await buildGarmentPreviewDataUrl(item)]),
      );

      if (!cancelled) {
        setPreviewUrls(Object.fromEntries(entries.filter(([, url]) => url)));
      }
    };

    if (items.length > 0) {
      generatePreviews();
    } else {
      setPreviewUrls({});
    }

    return () => {
      cancelled = true;
    };
  }, [items]);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax + SHIPPING_FEE;

    return {
      subtotal,
      tax,
      shipping: SHIPPING_FEE,
      total,
    };
  }, [items]);

  const hasItems = items.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="px-4 pt-3">
        <Header
          isAuthenticated={true}
          onDashboard={onBack}
          dashboardLabel="Back to Designer"
          cartCount={cartCount}
          showLogout={false}
        />
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="space-y-4">
          <div className="panel-surface rounded-3xl border border-white/10 p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">Shopping Cart</p>
            <h1 className="mt-2 text-3xl font-semibold">Your selected garments</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Review the design snapshot, change quantities or sizes, and continue to checkout when you are ready.
            </p>
          </div>

          {!hasItems ? (
            <Card className="border-white/10 bg-white/5 text-white">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <div className="rounded-full bg-white/10 p-4 text-white/70">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Your cart is empty</h2>
                  <p className="mt-2 text-sm text-white/60">
                    Add a custom garment from the designer to continue.
                  </p>
                </div>
                <Button onClick={onBack} className="bg-emerald-500 text-slate-950 hover:bg-emerald-600">
                  Go Back to Designer
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="border-white/10 bg-white/5 text-white">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 md:flex-row">
                      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 md:w-44 md:shrink-0">
                        <img
                          src={previewUrls[item.id] || item.designSnapshot}
                          alt={`${item.garmentName} preview`}
                          className="h-52 w-full object-contain p-2"
                        />
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <CardTitle className="text-xl">{item.garmentName}</CardTitle>
                            <CardDescription className="mt-1 text-white/55">
                              {item.garmentType} • {item.view} view • {item.color}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-white/50">Price</p>
                            <p className="text-2xl font-semibold">₹{item.unitPrice}</p>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <div>
                            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/40">Size</p>
                            <Select
                              value={item.size}
                              onValueChange={(value) => dispatch(updateItemSize({ id: item.id, size: value }))}
                            >
                              <SelectTrigger className="border-white/10 bg-white/5 text-white">
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent>
                                {AVAILABLE_SIZES.map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/40">Quantity</p>
                            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                                className="h-8 w-8 text-white hover:bg-white/10"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                                className="h-8 w-8 text-white hover:bg-white/10"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-end justify-between sm:justify-end">
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => dispatch(removeItem(item.id))}
                              className="gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3 text-sm text-white/70">
                          <span>Line total</span>
                          <span className="font-semibold text-white">₹{item.unitPrice * item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-6 h-fit space-y-4">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
              <CardDescription className="text-white/55">Taxes are estimated at checkout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-white/70">
                <span>Subtotal</span>
                <span>₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>Tax ({Math.round(TAX_RATE * 100)}%)</span>
                <span>₹{totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>Shipping</span>
                <span>{totals.shipping === 0 ? "Free" : `₹${totals.shipping.toFixed(2)}`}</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>₹{totals.total.toFixed(2)}</span>
              </div>
              <Button
                onClick={onCheckout}
                disabled={!hasItems}
                className="mt-4 w-full bg-emerald-500 text-slate-950 hover:bg-emerald-600 disabled:opacity-40"
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

CartPage.propTypes = {
  onBack: PropTypes.func.isRequired,
  onCheckout: PropTypes.func.isRequired,
  cartCount: PropTypes.number.isRequired,
};

export default CartPage;
