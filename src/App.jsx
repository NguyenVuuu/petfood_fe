import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { router } from "./router/index.tsx";
import { store } from "./store/index.ts";
import { queryClient } from "./lib/queryClient.ts";
import ChatBot from "./components/ChatBot";

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
         <ChatBot />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: "12px",
              fontFamily: "inherit",
            },
          }}
        />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
