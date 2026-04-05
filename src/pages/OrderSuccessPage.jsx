import PropTypes from "prop-types";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Sparkles } from "lucide-react";

function OrderSuccessPage({ orderDetails, onContinue, cartCount }) {
  const items = orderDetails?.items || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="px-4 pt-3">
        <Header
          isAuthenticated={true}
          onDashboard={onContinue}
          dashboardLabel="Continue Designing"
          cartCount={cartCount}
          showLogout={false}
        />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-24 top-4 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          </div>

          <div className="relative z-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.3em] text-white/40">Order confirmed</p>
            <h1 className="mt-2 text-4xl font-semibold">Your design order is ready</h1>
            <p className="mt-3 text-sm text-white/60">
              {orderDetails
                ? `Order ${orderDetails.orderId} has been captured locally. No payment gateway was used.`
                : "Your order was captured locally and is ready for the next design session."}
            </p>

            <div className="mt-8 grid gap-4 text-left md:grid-cols-2">
              <Card className="border-white/10 bg-slate-950/55 text-white">
                <CardHeader>
                  <CardTitle>Order summary</CardTitle>
                  <CardDescription className="text-white/50">Captured at checkout</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-white/70">
                  <div className="flex items-center justify-between">
                    <span>Items</span>
                    <span>{items.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>₹{orderDetails?.totals?.subtotal?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total</span>
                    <span>₹{orderDetails?.totals?.total?.toFixed(2) || "0.00"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-slate-950/55 text-white">
                <CardHeader>
                  <CardTitle>Shipping to</CardTitle>
                  <CardDescription className="text-white/50">Delivery details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-white/70">
                  <p className="font-medium text-white">{orderDetails?.shipping?.name || "Customer"}</p>
                  <p>{orderDetails?.shipping?.address || "Address not captured"}</p>
                  <p>
                    {orderDetails?.shipping?.city || "City"}
                    {orderDetails?.shipping?.pincode ? ` - ${orderDetails.shipping.pincode}` : ""}
                  </p>
                  <p>{orderDetails?.shipping?.email || "Email not captured"}</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button onClick={onContinue} className="bg-emerald-500 text-slate-950 hover:bg-emerald-600">
                Continue Designing
              </Button>
              <Button variant="outline" onClick={onContinue} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Start a New Concept
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

OrderSuccessPage.propTypes = {
  orderDetails: PropTypes.shape({
    orderId: PropTypes.string,
    items: PropTypes.array,
    shipping: PropTypes.object,
    totals: PropTypes.object,
  }),
  onContinue: PropTypes.func.isRequired,
  cartCount: PropTypes.number.isRequired,
};

export default OrderSuccessPage;
