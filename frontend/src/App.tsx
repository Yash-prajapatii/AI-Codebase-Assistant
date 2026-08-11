import { ToastProvider } from "./components/ui/Toast";
import { Sidebar } from "./components/sidebar/Sidebar";
import { ChatWindow } from "./components/chat/ChatWindow";

export default function App() {
  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-surface-base">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <ChatWindow />
        </main>
      </div>
    </ToastProvider>
  );
}