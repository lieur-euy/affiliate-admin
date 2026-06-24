import React from "react"
import { useTranslation } from "react-i18next"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/providers/auth"
import { LayoutDashboard, Package, BookOpen, Database, Image, MessageSquareText } from "lucide-react"
import { Link } from "react-router-dom"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isViewer = user?.role === "viewer"
  const canManage = !isViewer

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Package className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Affiliate</span>
                  <span className="truncate text-xs">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain label={t("nav.dashboard")} items={[
          { title: t("nav.dashboard"), url: "/dashboard", icon: <LayoutDashboard /> },
        ]} />
        <NavMain label={t("product.title")} items={[
          { title: t("nav.products"), url: "/products", icon: <Package /> },
          ...(canManage ? [{ title: t("common.masterdata"), icon: React.createElement(Database), items: [
            { title: t("nav.categories"), url: "/categories" },
            { title: t("nav.brands"), url: "/brands" },
            { title: t("nav.marketplaces"), url: "/marketplaces" },
          ]}] : []),
        ]} />
        <NavMain label={t("article.title")} items={[
          { title: t("nav.articles"), url: "/articles", icon: <BookOpen /> },
          ...(canManage ? [{ title: t("common.masterdata"), icon: React.createElement(Database), items: [
            { title: t("article.category"), url: "/articles/categories" },
            { title: "Tags", url: "/articles/tags" },
          ]}] : []),
        ]} />
        <NavMain label={t("nav.media")} items={[
          { title: t("nav.media"), url: "/media", icon: <Image /> },
        ]} />
        <NavMain label="Comments" items={[
          { title: "Comments", url: "/comments", icon: <MessageSquareText /> },
        ]} />
        {canManage && (
          <NavMain label={t("nav.oauth")} items={[
            { title: t("nav.oauth"), url: "/oauth", icon: <Database /> },
          ]} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
