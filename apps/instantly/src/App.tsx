import { useAuth } from "src/features/auth/AuthProvider";
import { LoginPage } from "src/features/auth/LoginPage";
import { CenteredSpinner } from "./components/CenteredSpinner";
import { AppRouter } from "./routes/AppRouter";

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <CenteredSpinner height="100dvh" />;
  }
  if (!user) {
    return <LoginPage />;
  }

  return <AppRouter />;
}

export default App;
