import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import { NextUIProvider } from "@nextui-org/react";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./Layout";
import { Unlock } from "../src/routes/Unlock";
import { LoggedIn } from "../src/routes/LoggedIn";
import { Error } from "../src/routes/Error";
import { Search } from "../src/routes/Search";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <Error />,
    children: [
      {
        path: "",
        element: <Unlock />,
      },
      {
        path: "loggedIn",
        element: <LoggedIn />,
      },
      {
        path: "search",
        element: <Search />,
      },
      {
        path: "search/:searchTerm",
        element: <Search />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <NextUIProvider>
    <RouterProvider router={router} />
  </NextUIProvider>
);
