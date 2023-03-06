import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "./features/auth/AuthProvider";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./index.css";
import { SWRConfig } from "swr";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider>
      <SWRConfig
        value={{
          revalidateIfStale: false,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
        }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </SWRConfig>
    </ChakraProvider>
  </React.StrictMode>
);
