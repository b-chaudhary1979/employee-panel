import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { useState, useEffect } from "react";
import { SidebarProvider } from "../context/SidebarContext";
import { useSidebar } from "../context/SidebarContext";
import { useRouter } from "next/router";

function PlaygroundContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isOpen } = useSidebar();
  const router = useRouter();

  // Check for ci and aid in query params
  useEffect(() => {
    if (router.isReady) {
      const { ci, aid } = router.query;
      if (!ci || !aid) {
        router.replace("/auth/login");
      }
    }
  }, [router.isReady, router.query]);

  // Optionally, show nothing or a loader while checking
  const { ci, aid } = router.query;
  if (!ci || !aid) {
    return null; // or a loader
  }
  return (
    <div className="bg-[#fbf9f4] min-h-screen flex">
      {/* Sidebar */}
      <SideMenu />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header username="Admin User" />

        

        <main
        className="transition-all duration-300 px-8 py-12 md:py-6"
        style={{ marginLeft: isOpen ? 270 : 64 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-extrabold text-[#a259f7] tracking-tight animate-fade-in-up">Instructions</h2>
            <button
              className="bg-[#a259f7] hover:bg-[#7c3aed] text-white font-semibold py-2 px-6 rounded-lg shadow transition-colors duration-200"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </button>
          </div>
          <div className="rounded-2xl bg-[#232136] p-8 mb-16 shadow-xl border border-[#a259f7]/20">
            <ol className="list-decimal list-inside space-y-6 text-lg md:text-xl text-gray-300 animate-fade-in-up">
              <li>
                <span className="font-bold text-[#a259f7]">Login or Register:</span> <br/>
                <span>
                  Start by <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/auth/login'}>logging in</span> or <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/auth/signup'}>registering</span> a new account. Registration is a multi-step process collecting your personal, company, and usage details, and lets you select a plan. After signup, you'll receive a <span className="text-[#a259f7]">Unique ID</span> and <span className="text-[#a259f7]">Company ID</span> for secure access.
                </span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Verify Your Email (if required):</span> <br/>
                <span>
                  Some accounts may require email verification. Check your inbox and follow the link to activate your account.
                </span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Explore the Dashboard:</span> <br/>
                <span>
                  The <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/dashboard'}>Dashboard</span> is your home for high-level overviews and analytics. Here, you'll eventually see summaries of your company's security, activity, and more.
                </span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Navigate with the Side Menu:</span> <br/>
                <span>
                  Use the side menu (left) to access all features. It's always visible and collapsible for more space. Each icon and label links to a different section:
                  <ul className="list-disc ml-8 mt-2 space-y-1">
                    <li><span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/products'}>Products</span>: Manage your product catalog.</li>
                    <li><span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/employees'}>Employees</span>: Manage employee records.</li>
                    <li><span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/users-permissions'}>Users & Permissions</span>: Control user accounts and access rights.</li>
                    <li><span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/api-keys'}>API Keys</span>: View and manage integration keys.</li>
                    <li><span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/security'}>Passwords & Security</span>: Adjust security settings and password policies.</li>
                    <li><span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/announcements'}>Announcements</span>: View or post company-wide updates.</li>
                    <li><span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/notes-tasks'}>Notes & Tasks</span>: Organize your notes and to-dos.</li>
                  </ul>
                </span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Check Pricing & Plans:</span> <br/>
                <span>
                  Access the <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/#pricing'}>Pricing</span> section from the homepage, login, or signup to compare plans and features. Choose the plan that fits your needs.
                </span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Use Each Feature:</span> <br/>
                <span>
                  Each section is designed for a specific purpose. For example, add or edit products in <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/products'}>Products</span>, manage staff in <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/employees'}>Employees</span>, and set permissions in <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/users-permissions'}>Users & Permissions</span>.
                </span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Security & API:</span> <br/>
                <span>
                  Visit <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/security'}>Passwords & Security</span> to update your security settings, and <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/api-keys'}>API Keys</span> to manage integrations.
                </span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Stay Updated:</span> <br/>
                <span>
                  Check <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/announcements'}>Announcements</span> for important updates and <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/notes-tasks'}>Notes & Tasks</span> to keep track of your work.
                </span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Document Your Changes:</span> <br/>
                <span>
                  Always document any changes you make in the system for future reference and team collaboration.
                </span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Test Your Implementation:</span> <br/>
                <span>
                  After making changes, thoroughly test your implementation to ensure everything works as expected.
                </span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Logout Securely:</span> <br/>
                <span>
                  Always log out when finished to keep your account secure.
                </span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Need Help?</span> <br/>
                <span>
                  If you encounter issues, reach out to support or check the Announcements for guidance.
                </span>
              </li>
            </ol>
          </div>
          <h2 className="text-4xl font-extrabold text-[#a259f7] mb-8 tracking-tight animate-fade-in-up">How to Use</h2>
          <div className="rounded-2xl bg-[#232136] p-8 shadow-xl border border-[#a259f7]/20">
            <ol className="list-decimal list-inside space-y-6 text-lg md:text-xl text-gray-300 animate-fade-in-up">
              <li>
                <span className="font-bold text-[#a259f7]">Access the Dashboard:</span> <br/>
                <span>After login, you'll land on the <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/dashboard'}>Dashboard</span>. Use it for a quick overview and navigation.</span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Navigate Sections:</span> <br/>
                <span>Click any item in the side menu to jump to that feature. The menu highlights your current section and uses smooth transitions for a modern feel.</span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Manage Data:</span> <br/>
                <span>In <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/products'}>Products</span> and <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/employees'}>Employees</span>, add, edit, or remove entries as needed. Use <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/users-permissions'}>Users & Permissions</span> to control access.</span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Integrate & Secure:</span> <br/>
                <span>Generate and manage <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/api-keys'}>API Keys</span> for integrations. Update your password and security settings in <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/security'}>Passwords & Security</span>.</span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Stay Organized:</span> <br/>
                <span>Use <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/notes-tasks'}>Notes & Tasks</span> to keep track of your work, and <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/announcements'}>Announcements</span> to stay informed.</span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Responsive & Fast:</span> <br/>
                <span>The app is responsive and shows a loader during navigation for a smooth experience.</span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Support:</span> <br/>
                <span>For help, check Announcements or contact support.</span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Use Announcements for Team Communication:</span> <br/>
                <span>Post and read important updates in <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/announcements'}>Announcements</span> to keep everyone informed.</span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Collaborate with Team Members:</span> <br/>
                <span>Assign tasks and share notes in <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/notes-tasks'}>Notes & Tasks</span> for better collaboration.</span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Review and Update Permissions Regularly:</span> <br/>
                <span>Periodically review user roles in <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/users-permissions'}>Users & Permissions</span> to ensure proper access control.</span>
              </li>
              <li>
                <span className="font-bold text-[#a259f7]">Backup Important Data:</span> <br/>
                <span>Regularly export or backup your critical data from <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/products'}>Products</span> and <span className="underline cursor-pointer hover:text-[#a259f7]" onClick={() => window.location.href='/employees'}>Employees</span> sections.</span>
              </li>
            </ol>
          </div>
        </div>
      </main>

      </div>
    </div>
  );
}

export default function Home() {
  return (
    <SidebarProvider>
      <PlaygroundContent />
    </SidebarProvider>
  );
}
