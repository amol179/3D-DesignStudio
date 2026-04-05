import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TAX_RATE, SHIPPING_FEE } from "@/constants/pricingConstants";
import { AlertTriangle, PackageCheck } from "lucide-react";

function CheckoutPage({ onBack, onOrderPlaced, cartCount }) {
  const items = useSelector((state) => state.cart.items);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax + SHIPPING_FEE;

    return { subtotal, tax, shipping: SHIPPING_FEE, total };
  }, [items]);

  const hasItems = items.length > 0;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!hasItems) {
      return;
    }

    onOrderPlaced({
      orderId: `ORD-${Date.now()}`,
      items,
      shipping: form,
      totals,
      placedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="px-4 pt-3">
        <Header
          isAuthenticated={true}
          onDashboard={onBack}
          dashboardLabel="Back to Cart"
          cartCount={cartCount}
          showLogout={false}
        />
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-4">
          <div className="panel-surface rounded-3xl border border-white/10 p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">Checkout</p>
            <h1 className="mt-2 text-3xl font-semibold">Shipping details</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Review your order and enter delivery information. This flow intentionally stops before any payment gateway.
            </p>
          </div>

          {!hasItems ? (
            <Card className="border-white/10 bg-white/5 text-white">
              <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                <AlertTriangle className="h-10 w-10 text-amber-300" />
                <div>
                  <h2 className="text-xl font-semibold">No items in cart</h2>
                  <p className="mt-2 text-sm text-white/60">Add a design to your cart before checking out.</p>
                </div>
                <Button onClick={onBack} className="bg-emerald-500 text-slate-950 hover:bg-emerald-600">
                  Back to Cart
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle>Delivery information</CardTitle>
                <CardDescription className="text-white/55">
                  Fill in the recipient details for order confirmation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full name</Label>
                      <Input id="name" name="name" value={form.name} onChange={handleChange} required className="border-white/10 bg-white/5 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" name="email" value={form.email} onChange={handleChange} required className="border-white/10 bg-white/5 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required className="border-white/10 bg-white/5 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" value={form.city} onChange={handleChange} required className="border-white/10 bg-white/5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" name="address" value={form.address} onChange={handleChange} required className="min-h-28 border-white/10 bg-white/5 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" name="pincode" value={form.pincode} onChange={handleChange} required className="border-white/10 bg-white/5 text-white" />
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onBack}>
                      Back to Cart
                    </Button>
                    <Button type="submit" className="bg-emerald-500 text-slate-950 hover:bg-emerald-600">
                      Place Order
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </section>

        <aside className="lg:sticky lg:top-6 h-fit space-y-4">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
              <CardDescription className="text-white/55">Payment gateway is intentionally omitted.</CardDescription>
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

              <div className="rounded-2xl border border-white/10 bg-emerald-500/10 p-4 text-emerald-100">
                <div className="flex items-start gap-3">
                  <PackageCheck className="mt-0.5 h-5 w-5" />
                  <p className="text-sm">
                    This checkout ends with a local order confirmation. No payment modal or gateway is used.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

CheckoutPage.propTypes = {
  onBack: PropTypes.func.isRequired,
  onOrderPlaced: PropTypes.func.isRequired,
  cartCount: PropTypes.number.isRequired,
};

export default CheckoutPage;
