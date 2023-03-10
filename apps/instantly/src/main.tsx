import React, { Suspense } from "react";
import {
  Center,
  ChakraProvider,
  extendTheme,
  Spinner,
  ThemeConfig,
} from "@chakra-ui/react";
import { AuthProvider } from "./features/auth/AuthProvider";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./index.css";
import { SWRConfig } from "swr";
import { InstantlyClientProvider } from "./features/clients/useInstantlyClient";

// @ts-ignore
import { swrLoggerMiddleware } from "./swrLoggerMiddleware";

const themeConfig: ThemeConfig = {
  initialColorMode: "dark",
};
const theme = extendTheme({ config: themeConfig });

const limitRevalidations = true;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <SWRConfig
        value={{
          suspense: true,
          revalidateIfStale: !limitRevalidations,
          revalidateOnFocus: !limitRevalidations,
          revalidateOnReconnect: !limitRevalidations,
          revalidateOnMount: !limitRevalidations,
          use: [swrLoggerMiddleware],
        }}
      >
        <Suspense
          fallback={
            <Center height="100dvh">
              <Spinner />
            </Center>
          }
        >
          <InstantlyClientProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </InstantlyClientProvider>
        </Suspense>
      </SWRConfig>
    </ChakraProvider>
  </React.StrictMode>
);
