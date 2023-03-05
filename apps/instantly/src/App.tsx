import { useAuth } from "src/features/auth/AuthProvider";
import { LoginPage } from "src/features/auth/LoginPage";
import { AppRouter } from "./routes/AppRouter";

function App() {
  const { user } = useAuth();

  if (user) {
    return <AppRouter />;
  }

  return <LoginPage />;
}

export default App;
