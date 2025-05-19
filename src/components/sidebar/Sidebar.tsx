
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { usePasswordStore } from "@/store/passwordStore";
import { useAuthStore } from "@/store/authStore";
import { ThemeToggle } from "../theme-toggle";

import {
  ChevronLeft,
  ChevronRight,
  Key,
  Lock,
  Mail,
  Banknote,
  Globe,
  AppWindow,
  MessageCircle,
  LogOut,
  Settings,
  User,
  Home,
  Box,
} from "lucide-react";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const categories = usePasswordStore((state) => state.categories);
  const setCurrentCategory = usePasswordStore((state) => state.setCurrentCategory);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCategoryClick = (categoryId: number) => {
    setCurrentCategory(categoryId);
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName) {
      case "Email":
        return <Mail size={18} />;
      case "Banque":
        return <Banknote size={18} />;
      case "Réseaux sociaux":
        return <MessageCircle size={18} />;
      case "Sites web":
        return <Globe size={18} />;
      case "Applications":
        return <AppWindow size={18} />;
      case "Autres":
        return <Box size={18} />;
      default:
        return <Lock size={18} />;
    }
  };

  return (
    <div
      className={`bg-sidebar dark:bg-sidebar border-r border-border relative transition-all duration-300 ${collapsed ? "w-16" : "w-64"
        }`}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <img
                  src="/media/CipherNestlogo.png"
                  alt="CipherNest Logo"
                  className="h-8 w-auto"
                />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </Button>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <div className="space-y-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <Home size={18} />
              {!collapsed && <span>Tableau de bord</span>}
            </NavLink>

            <NavLink
              to="/password-list"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <Key size={18} />
              {!collapsed && <span>Tous les mots de passe</span>}
            </NavLink>

            {!collapsed && (
              <div className="mt-4 mb-2 px-3 text-xs font-medium text-muted-foreground">
                Catégories
              </div>
            )}

            <div className="space-y-1">
              {categories.map((category) => (
                <NavLink
                  key={category.id}
                  to={`/categories/${category.id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                    }`
                  }
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {/* <Lock size={18} /> */}
                  {getCategoryIcon(category.name)}
                  {!collapsed && <span>{category.name}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="flex flex-col gap-2">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <Settings size={18} />
              {!collapsed && <span>Paramètres</span>}
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <User size={18} />
              {!collapsed && <span>Profil</span>}
            </NavLink>

            <div className="flex items-center gap-3">
              {!collapsed && <ThemeToggle />}

              <Button
                variant="ghost"
                size={collapsed ? "icon" : "default"}
                onClick={handleLogout}
                className="w-full"
              >
                <LogOut size={18} className={collapsed ? "" : "mr-2"} />
                {!collapsed && <span>Déconnexion</span>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
