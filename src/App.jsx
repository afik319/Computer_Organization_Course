import './App.css';
import Pages from "@/pages/index.jsx";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <>
      <Pages />
      <Toaster
        toastOptions={{
          duration: 3000,
          className: "text-right rtl",
        }}
      />
    </>
  );
}

export default App;
