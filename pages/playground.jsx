import SideMenuProvider, { useSideMenu } from "../components/sidemenu";

function PlaygroundContent() {
  const { open } = useSideMenu();
  return (
    <div className="min-h-screen bg-[#FBF6F1] text-black w-full">
      <main
        className="transition-all duration-300 px-8 py-12 md:py-20"
        style={{ marginLeft: open ? 270 : 64 }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-extrabold text-[#a259f7] mb-8 tracking-tight animate-fade-in-up">Instructions</h2>
          <ol className="list-decimal list-inside space-y-4 text-xl text-gray-800 mb-16 animate-fade-in-up">
            <li>Read all instructions carefully before starting.</li>
            <li>Ensure you have access to all required resources.</li>
            <li>Set up your environment as specified.</li>
            <li>Follow the steps in the given order.</li>
            <li>Double-check your work after each step.</li>
            <li>Ask for help if you encounter issues.</li>
            <li>Document any changes you make.</li>
            <li>Test your implementation thoroughly.</li>
            <li>Submit your work before the deadline.</li>
            <li>Review feedback and iterate as needed.</li>
          </ol>
          <h2 className="text-4xl font-extrabold text-[#a259f7] mb-8 tracking-tight animate-fade-in-up">How to Use</h2>
          <ol className="list-decimal list-inside space-y-4 text-xl text-gray-800 animate-fade-in-up">
            <li>Open the application dashboard.</li>
            <li>Navigate to the desired section using the side menu.</li>
            <li>Read the provided instructions carefully.</li>
            <li>Input your data or select options as required.</li>
            <li>Click the 'Submit' button to proceed.</li>
            <li>Wait for the confirmation message.</li>
            <li>Check the results displayed on the screen.</li>
            <li>Use the navigation to explore other features.</li>
            <li>Log out when you are finished.</li>
            <li>Contact support if you need assistance.</li>
          </ol>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <SideMenuProvider>
      <PlaygroundContent />
    </SideMenuProvider>
  );
}
