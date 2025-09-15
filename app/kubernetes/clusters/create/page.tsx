"use client"

import { Suspense } from "react"
import { PageLayout } from "@/components/page-layout"
import CreateClusterClientComponent from './client-component'

export default function CreateClusterPage() {
  return (
    <Suspense fallback={
      <PageLayout title="Create Cluster" description="Loading cluster creation form...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading cluster creation form...</p>
          </div>
        </div>
      </PageLayout>
    }>
      <CreateClusterClientComponent />
    </Suspense>
  )
}