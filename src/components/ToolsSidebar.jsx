import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu } from "lucide-react";
import ToolBar from "./ToolBar";
import TextToolBar from "./TextToolBar";
import LineToolBar from "./LineToolBar";

export function ToolsSidebar({ manualSync }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden fixed top-4 left-4 z-30 h-10 w-10"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[82vw] max-w-sm sm:w-[360px] p-4 sm:p-6"
      >
        <SheetHeader>
          <SheetTitle className="text-left">Design Console</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-140px)] mt-4">
          <div className="pr-2 sm:pr-6">
            <div className="rounded-2xl border bg-gradient-to-br from-white via-slate-50 to-white shadow-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-semibold">
                    Workflow
                  </p>
                  <h3 className="text-base font-semibold leading-tight">
                    Build your print-ready layout
                  </h3>
                </div>
                <span className="text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 font-semibold">
                  Pro Mode
                </span>
              </div>

              <ToolBar manualSync={manualSync} />
              <TextToolBar manualSync={manualSync} />
              <LineToolBar manualSync={manualSync} />
            </div>
          </div>
        </ScrollArea>
      </SheetContent>

      {/* Desktop version - always visible */}
      <div className="hidden lg:block">
        <div className="w-full min-w-[220px] max-w-[260px] rounded-3xl border bg-gradient-to-b from-white via-slate-50 to-white shadow-xl">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-semibold">
                  Tools
                </p>
                <h2 className="font-semibold text-lg leading-tight">
                  Design Console
                </h2>
                <p className="text-xs text-muted-foreground">
                  Add art, text, colors, and refine details.
                </p>
              </div>
              <span
                className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.25)]"
                aria-hidden
              />
            </div>
            <ScrollArea className="max-h-[72vh] pr-2">
              <div className="space-y-4">
                <ToolBar manualSync={manualSync} />
                <TextToolBar manualSync={manualSync} />
                <LineToolBar manualSync={manualSync} />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
