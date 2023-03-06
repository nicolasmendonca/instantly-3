import React, { Suspense } from "react";
import { Center, ChakraProvider, Spinner } from "@chakra-ui/react";
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
          suspense: true,
          revalidateIfStale: false,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
        }}
      >
        <Suspense
          fallback={
            <Center height="100dvh">
              <Spinner />
            </Center>
          }
        >
          <AuthProvider>
            <App />
          </AuthProvider>
        </Suspense>
      </SWRConfig>
    </ChakraProvider>
  </React.StrictMode>
);
