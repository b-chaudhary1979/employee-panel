import React, { useEffect, useState, useRef } from "react";
import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { useSidebar } from "../context/SidebarContext";
import { useUserInfo } from "../context/UserInfoContext";
import Loader from "../loader/Loader";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function MyTasksPage() {
  const { isOpen } = useSidebar();
  const { user, loading } = useUserInfo();
  const [tasks, setTasks] = useState([]);
  const [fetching, setFetching] = useState(true);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(72);

  /* fetch tasks for this employee */
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.companyId || !user?.id) return; // user.id === employeeId (aid)
      const qSnap = await getDocs(
        collection(db, "users", user.companyId, "employees", user.id, "assignments")
      );
      const list = qSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTasks(list);
      setFetching(false);
    };
    fetchTasks();
  }, [user?.companyId, user?.id]);

  // Update header height on resize
  useEffect(() => {
    const resize = () => setHeaderHeight(headerRef.current?.offsetHeight || 72);
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, []);

  if (loading || fetching) return <Loader />;

  const getContentMarginLeft = () => {
    if (typeof window !== "undefined" && window.innerWidth < 640) return 0;
    return isOpen ? 270 : 64;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onHeight={(h) => setHeaderHeight(h)} ref={headerRef} />
      <SideMenu />

      <main
        className="p-6 transition-all duration-300"
        style={{ marginLeft: getContentMarginLeft(), marginTop: headerHeight }}
      >
        <h1 className="text-2xl font-bold mb-6">My Tasks</h1>
        {tasks.length === 0 ? (
          <p>No tasks assigned yet.</p>
        ) : (
          <div className="grid gap-4">
            {tasks.map((t) => (
              <div key={t.id} className="bg-white shadow rounded p-4 border">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold text-lg">{t.title || "Untitled Task"}</h2>
                  <span className="text-sm px-2 py-1 rounded bg-purple-100 text-purple-700">
                    {t.priority || "Medium"}
                  </span>
                </div>
                <p className="text-gray-700 mb-2 line-clamp-3">{t.description}</p>
                <div className="text-sm text-gray-500 flex flex-wrap gap-4">
                  <span>Due: {t.dueDate || "-"}</span>
                  <span>Assigned: {new Date(t.assignedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}