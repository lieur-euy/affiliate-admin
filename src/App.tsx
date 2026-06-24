import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { LoginPage } from "@/pages/auth/login/page"
import { DashboardLayout } from "@/layout/dashboard-layout"
import { DashboardPage } from "@/pages/dashboard/page"
import { ProductPage, ProductFormPage, ProductJsonPage } from "@/pages/product"
import { ArticlesPage, ArticleFormPage } from "@/pages/articles"
import { MediaPage } from "@/pages/media/page"
import { CategoriesPage } from "@/pages/categories/page"
import { ArticleCategoriesPage } from "@/pages/article-categories/page"
import { ArticleTagsPage } from "@/pages/article-tags/page"
import { BrandsPage } from "@/pages/brands/page"
import { MarketplacesPage } from "@/pages/marketplaces/page"
import { OAuthPage } from "@/pages/oauth/page"
import { CommentsPage } from "@/pages/comments"
import { ProtectedRoute } from "@/components/protected-route"
import { RoleGuard } from "@/components/role-guard"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<RoleGuard roles={["admin", "editor"]}><DashboardPage /></RoleGuard>} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/products/new" element={<RoleGuard roles={["admin", "editor"]}><ProductFormPage /></RoleGuard>} />
            <Route path="/products/newjson" element={<RoleGuard roles={["admin", "editor"]}><ProductJsonPage /></RoleGuard>} />
            <Route path="/products/:id/edit" element={<RoleGuard roles={["admin", "editor"]}><ProductFormPage /></RoleGuard>} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/new" element={<RoleGuard roles={["admin", "editor"]}><ArticleFormPage /></RoleGuard>} />
            <Route path="/articles/:id/edit" element={<RoleGuard roles={["admin", "editor"]}><ArticleFormPage /></RoleGuard>} />
            <Route path="/categories" element={<RoleGuard roles={["admin", "editor"]}><CategoriesPage /></RoleGuard>} />
            <Route path="/brands" element={<RoleGuard roles={["admin", "editor"]}><BrandsPage /></RoleGuard>} />
            <Route path="/marketplaces" element={<RoleGuard roles={["admin", "editor"]}><MarketplacesPage /></RoleGuard>} />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/articles/categories" element={<RoleGuard roles={["admin", "editor"]}><ArticleCategoriesPage /></RoleGuard>} />
            <Route path="/articles/tags" element={<RoleGuard roles={["admin", "editor"]}><ArticleTagsPage /></RoleGuard>} />
            <Route path="/comments" element={
              <RoleGuard roles={["admin", "editor"]}>
                <CommentsPage />
              </RoleGuard>
            } />
            <Route path="/oauth" element={<RoleGuard roles={["admin"]}><OAuthPage /></RoleGuard>} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
