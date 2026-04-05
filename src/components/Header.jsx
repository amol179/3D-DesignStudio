import PropTypes from "prop-types";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

const Header = ({ isAuthenticated, onLanding, onDashboard, onCart, onLogin, onSignup, onLogout, showLogout = true, hideDashboardButton = false, dashboardLabel = "Dashboard", cartCount = 0 }) => {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2 rounded-2xl bg-card/80 border shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-900 text-white grid place-items-center font-semibold dark:bg-white dark:text-slate-900">
          DC
        </div>
        <div className="leading-tight">
          <p className="text-sm text-muted-foreground">Design Cloud</p>
          <p className="font-semibold text-foreground">Mockups & 3D Studio</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onCart && (
          <Button variant="outline" size="sm" onClick={onCart} className="relative pr-4">
            <ShoppingCart className="h-4 w-4" />
            <span>Cart</span>
            <span className="absolute -top-2 -right-2 min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white shadow">
              {cartCount}
            </span>
          </Button>
        )}
        {isAuthenticated ? (
          <>
            {!hideDashboardButton && onDashboard ? (
              <Button variant="outline" size="sm" onClick={onDashboard}>
                {dashboardLabel}
              </Button>
            ) : onLanding && !hideDashboardButton ? (
              <Button variant="outline" size="sm" onClick={onLanding}>
                Home
              </Button>
            ) : null}
            {showLogout && onLogout && (
              <Button variant="destructive" size="sm" onClick={onLogout}>
                Logout
              </Button>
            )}
          </>
        ) : (
          <>
            {onLogin && (
              <Button variant="outline" size="sm" onClick={onLogin}>
                Login
              </Button>
            )}
            {onSignup && (
              <Button variant="default" size="sm" onClick={onSignup}>
                Sign up
              </Button>
            )}
          </>
        )}
        <ThemeToggle />
      </div>
    </div>
  );
};

Header.propTypes = {
  isAuthenticated: PropTypes.bool,
  onLanding: PropTypes.func,
  onDashboard: PropTypes.func,
  onLogin: PropTypes.func,
  onSignup: PropTypes.func,
  onLogout: PropTypes.func,
  showLogout: PropTypes.bool,
  hideDashboardButton: PropTypes.bool,
  dashboardLabel: PropTypes.string,
  onCart: PropTypes.func,
  cartCount: PropTypes.number,
};

export default Header;
