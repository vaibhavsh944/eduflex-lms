import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { SEO } from '@/components/shared/SEO'
import { Filter, Search } from 'lucide-react'
import { useFilterState } from '@/hooks/useFilterState'
import { useCourses } from '@/hooks/queries/useCourses'
import { useDebounce } from '@/hooks/useDebounce'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'

import { CourseCard } from '@/components/courses/CourseCard'
import { CourseCardSkeleton } from '@/components/courses/CourseCardSkeleton'
import { FilterPanel } from '@/components/courses/FilterPanel'
import { FilterDrawer } from '@/components/courses/FilterDrawer'
import { ActiveFilters } from '@/components/courses/ActiveFilters'
import { SortDropdown } from '@/components/courses/SortDropdown'
import { PAGE_SIZE } from '@/hooks/queries/useCourses'

export function CatalogPage() {
  const { filters, setFilters, clearFilters, activeFilterCount } = useFilterState()
  const [searchInput, setSearchInput] = useState(filters.q)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const debouncedSearch = useDebounce(searchInput, 400)
  
  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== filters.q) {
      setFilters({ q: debouncedSearch })
    }
  }, [debouncedSearch])

  const { data: pageData, isLoading, isError, refetch, isPlaceholderData } = useCourses(filters)

  return (
    <>
      <SEO title="Course Catalog | EduFlow" description="Browse our extensive catalog of professional courses." />
      <Helmet>
        <title>Course Catalog | EduFlow</title>
        <meta name="description" content="Browse our extensive catalog of professional courses." />
      </Helmet>

      <div className="bg-muted/30 border-b border-border py-8">
        <div className="container px-4">
          <h1 className="text-3xl font-bold md:text-4xl">Course Catalog</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Explore our wide range of premium courses designed to help you master new skills and advance your career.
          </p>
        </div>
      </div>

      <div className="container px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-6">
            <FilterPanel 
              filters={filters} 
              onFilterChange={setFilters} 
              onClear={clearFilters} 
            />
          </aside>

          {/* Mobile Filter Drawer */}
          <FilterDrawer 
            isOpen={isMobileFilterOpen}
            onClose={() => setIsMobileFilterOpen(false)}
            filters={filters}
            onFilterChange={setFilters}
            onClear={clearFilters}
            activeCount={activeFilterCount}
          />

          {/* Main Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            
            {/* Top Bar: Search, Mobile Filter Toggle, Sort */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card p-2 rounded-xl border border-border">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search courses..." 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="lg:hidden flex-1 sm:flex-none gap-2"
                  onClick={() => setIsMobileFilterOpen(true)}
                >
                  <Filter className="h-4 w-4" />
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>
                
                <div className="hidden sm:block h-6 w-px bg-border mx-1" />
                
                <SortDropdown 
                  value={filters.sort}
                  onChange={(val) => setFilters({ sort: val })}
                />
              </div>
            </div>

            {/* Active Filters */}
            <ActiveFilters 
              filters={filters} 
              onFilterChange={setFilters} 
              onClear={clearFilters} 
            />

            {/* Results */}
            <div className={`transition-opacity duration-200 ${isPlaceholderData ? 'opacity-50' : 'opacity-100'}`}>
              {isError ? (
                <ErrorState onRetry={() => refetch()} />
              ) : isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {[...Array(6)].map((_, i) => <CourseCardSkeleton key={i} />)}
                </div>
              ) : pageData?.data.length === 0 ? (
                <EmptyState 
                  title="No courses found" 
                  description="Try adjusting your filters or search query to find what you're looking for."
                  action={activeFilterCount > 0 ? { label: 'Clear Filters', onClick: clearFilters } : undefined}
                />
              ) : (
                <>
                  <div className="mb-4 text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{pageData?.count}</span> results
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {pageData?.data.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {pageData && pageData.pageCount > 1 && (
                    <div className="mt-12 flex justify-center">
                      <Pagination 
                        currentPage={pageData.page}
                        totalPages={pageData.pageCount}
                        onPageChange={(page) => setFilters({ page }, { keepPage: true })}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
