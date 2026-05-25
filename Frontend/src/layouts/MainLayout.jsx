import Sidebar from "../shared/components/Sidebar";

import Navbar from "../shared/components/Navbar";

import { Outlet } from "react-router-dom";

function MainLayout() {
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                {/* Navbar */}
                <Navbar />

                {/* Page Content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;