import { useState } from "react";
import { Battery, DollarSign, Zap, Calculator, TrendingUp, Home, Github, ExternalLink } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const tools = [
  { 
    title: "Dashboard", 
    url: "/", 
    icon: Home,
    description: "Overview & Analytics"
  },
  { 
    title: "Range Estimator", 
    url: "/range", 
    icon: Battery,
    description: "Predict driving range"
  },
  { 
    title: "SoH Predictor", 
    url: "/soh", 
    icon: TrendingUp,
    description: "Battery health analysis"
  },
  { 
    title: "Charging Cost", 
    url: "/cost", 
    icon: DollarSign,
    description: "Cost forecasting"
  },
  { 
    title: "Regen Energy", 
    url: "/regen", 
    icon: Zap,
    description: "Energy recovery prediction"
  },
  { 
    title: "Price Estimator", 
    url: "/price", 
    icon: Calculator,
    description: "Used EV pricing"
  },
];

const externalLinks = [];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const isExpanded = tools.some((tool) => isActive(tool.url));

  const getNavClasses = (path: string) => {
    const active = isActive(path);
    return `glass-button p-3 w-full justify-start gap-3 text-left transition-all duration-300 ${
      active 
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30 shadow-lg" 
        : "text-sidebar-foreground hover:text-emerald-300 hover:border-emerald-400/20"
    }`;
  };

  return (
    <Sidebar
      className="border-r border-white/10 bg-sidebar/80 backdrop-blur-xl"
      collapsible="icon"
    >
      <SidebarHeader className="p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="glass-card-enhanced p-3 sm:p-4 gradient-nature">
              <h1 className={`font-bold text-white ${collapsed ? "text-xs" : "text-sm sm:text-lg lg:text-xl"}`}>
                {collapsed ? "EA" : "EcoAmp Suite"}
              </h1>
              {!collapsed && (
                <p className="text-emerald-100/90 text-xs sm:text-sm mt-1">ML-Powered EV Analytics</p>
              )}
            </div>
          </motion.div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 font-semibold mb-4">
            {collapsed ? "Tools" : "ML Tools"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {tools.map((tool, index) => (
                <SidebarMenuItem key={tool.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={tool.url} end>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={getNavClasses(tool.url)}
                      >
                        <tool.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        {!collapsed && (
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs sm:text-sm">{tool.title}</div>
                            <div className="text-xs text-muted-foreground truncate hidden sm:block">
                              {tool.description}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 sm:p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 font-semibold mb-2">
            {collapsed ? "Links" : "Connect"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2">
              {externalLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button-enhanced p-2 flex items-center gap-2 sm:gap-3 text-sidebar-foreground hover:text-emerald-300 transition-colors w-full btn-touch"
                >
                  <link.icon className="h-4 w-4" />
                  {!collapsed && <span className="text-xs sm:text-sm">{link.title}</span>}
                </a>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}