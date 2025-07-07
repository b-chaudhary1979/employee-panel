import SideMenuProvider, { useSideMenu } from "../components/sidemenu";

function APIKeysContent() {
  const { open } = useSideMenu();
  return (
    <div className="min-h-screen bg-[#FBF6F1] text-black w-full">
      <main className="flex-1 p-8 transition-all duration-300" style={{ marginLeft: open ? 270 : 64 }}>
        <h1 className="text-2xl font-bold">API Keys</h1>
      </main>
    </div>
  );
}

export default function APIKeys() {
  return (
    <SideMenuProvider>
      <APIKeysContent />
    </SideMenuProvider>
  );
} 