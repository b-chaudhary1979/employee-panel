import SideMenu from "../components/sidemenu";

export default function Announcements() {
  return (
    <div className="bg-[#fbf9f4] min-h-screen flex">
      <SideMenu />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Announcements</h1>
      </main>
    </div>
  );
} 