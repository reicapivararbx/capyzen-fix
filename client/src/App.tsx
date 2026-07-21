import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Admin from "./pages/Admin";
import FNF from "./pages/FNF";
import Chat from "./pages/Chat";
import Friends from "./pages/Friends";

function AppRouter() {
  return (
    <Router base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/loja"} component={Shop} />
        <Route path={"/admin"} component={Admin} />
        <Route path={"/fnf"} component={FNF} />
        <Route path={"/amigos"} component={Friends} />
        <Route path={"/friends"} component={Friends} />
        <Route path={"/chat"} component={Chat} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
