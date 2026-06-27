import React, { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { DashboardLayout } from "@/layout/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { RoleGuard } from "@/components/role-guard"

function lazyLoad<T extends Record<string, React.ComponentType<any>>, K extends keyof T>(loader: () => Promise<T>, name: K) {
  return lazy(() => loader().then(m => ({ default: m[name] })))
}
// asdsa
const LoginPage = lazyLoad(() => import("@/pages/auth/login/page"), "LoginPage")
const DashboardPage = lazyLoad(() => import("@/pages/dashboard/page"), "DashboardPage")
const ProductPage = lazyLoad(() => import("@/pages/product/page"), "ProductPage")
const ProductFormPage = lazyLoad(() => import("@/pages/product/form"), "ProductFormPage")
const ProductJsonPage = lazyLoad(() => import("@/pages/product/json"), "ProductJsonPage")
const ArticlesPage = lazyLoad(() => import("@/pages/articles/page"), "ArticlesPage")
const ArticleFormPage = lazyLoad(() => import("@/pages/articles/form"), "ArticleFormPage")
const MediaPage = lazyLoad(() => import("@/pages/media/page"), "MediaPage")
const CategoriesPage = lazyLoad(() => import("@/pages/categories/page"), "CategoriesPage")
const ArticleCategoriesPage = lazyLoad(() => import("@/pages/article-categories/page"), "ArticleCategoriesPage")
const ArticleTagsPage = lazyLoad(() => import("@/pages/article-tags/page"), "ArticleTagsPage")
const BrandsPage = lazyLoad(() => import("@/pages/brands/page"), "BrandsPage")
const MarketplacesPage = lazyLoad(() => import("@/pages/marketplaces/page"), "MarketplacesPage")
const OAuthPage = lazyLoad(() => import("@/pages/oauth/page"), "OAuthPage")
const CommentsPage = lazyLoad(() => import("@/pages/comments/page"), "CommentsPage")
const PageViewsPage = lazyLoad(() => import("@/pages/page-views/page"), "PageViewsPage")

const L = ({ children }: { children: React.ReactNode }) => <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>}>{children}</Suspense>

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<L><LoginPage /></L>} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<L><RoleGuard roles={["admin", "editor"]}><DashboardPage /></RoleGuard></L>} />
            <Route path="/products" element={<L><ProductPage /></L>} />
            <Route path="/products/new" element={<L><RoleGuard roles={["admin", "editor"]}><ProductFormPage /></RoleGuard></L>} />
            <Route path="/products/newjson" element={<L><RoleGuard roles={["admin", "editor"]}><ProductJsonPage /></RoleGuard></L>} />
            <Route path="/products/:id/edit" element={<L><RoleGuard roles={["admin", "editor"]}><ProductFormPage /></RoleGuard></L>} />
            <Route path="/articles" element={<L><ArticlesPage /></L>} />
            <Route path="/articles/new" element={<L><RoleGuard roles={["admin", "editor"]}><ArticleFormPage /></RoleGuard></L>} />
            <Route path="/articles/:id/edit" element={<L><RoleGuard roles={["admin", "editor"]}><ArticleFormPage /></RoleGuard></L>} />
            <Route path="/categories" element={<L><RoleGuard roles={["admin", "editor"]}><CategoriesPage /></RoleGuard></L>} />
            <Route path="/brands" element={<L><RoleGuard roles={["admin", "editor"]}><BrandsPage /></RoleGuard></L>} />
            <Route path="/marketplaces" element={<L><RoleGuard roles={["admin", "editor"]}><MarketplacesPage /></RoleGuard></L>} />
            <Route path="/media" element={<L><MediaPage /></L>} />
            <Route path="/articles/categories" element={<L><RoleGuard roles={["admin", "editor"]}><ArticleCategoriesPage /></RoleGuard></L>} />
            <Route path="/articles/tags" element={<L><RoleGuard roles={["admin", "editor"]}><ArticleTagsPage /></RoleGuard></L>} />
              <Route path="/comments" element={<L><RoleGuard roles={["admin", "editor"]}><CommentsPage /></RoleGuard></L>} />
              <Route path="/page-views" element={<L><RoleGuard roles={["admin", "editor"]}><PageViewsPage /></RoleGuard></L>} />
              <Route path="/oauth" element={<L><RoleGuard roles={["admin"]}><OAuthPage /></RoleGuard></L>} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
