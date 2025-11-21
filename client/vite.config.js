import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // or any port you want
    proxy: {
      "/auth": "http://localhost:4000",
      "/posts": "http://localhost:4000",
      "/user": "http://localhost:4000",
    },
  },
});
