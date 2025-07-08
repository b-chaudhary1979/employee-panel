import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { SidebarProvider } from "../context/SidebarContext";

function NotesTasksContent() {
  return (
    <div className="bg-[#fbf9f4] min-h-screen flex">
      <SideMenu />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header username="Admin User" />
        <main className="flex-1 p-8 transition-all duration-300">
          <h1 className="text-2xl font-bold">Notes & Tasks</h1>
        </main>
      </div>
    </div>
  );
}

export default function NotesTasks() {
  return (
    <SidebarProvider>
      <NotesTasksContent />
    </SidebarProvider>
  );
}
