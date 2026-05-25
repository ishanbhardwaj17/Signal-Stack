import useAuthInit from "./features/auth/hooks/useAuthInit";

import AppRoutes from "./app/app.routes";

function App() {
  useAuthInit();

  return <AppRoutes />;
}

export default App;