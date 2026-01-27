"use client"

import { ActionMenu } from "@/components/action-menu"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ShadcnDataTable } from "@/components/ui/shadcn-data-table"
import { CreateBucketApiKeyModal } from "@/components/modals/create-bucket-api-key-modal"
import { useToast } from "@/hooks/use-toast"
import { Copy, Trash2 } from "lucide-react"
import { useState } from "react"

// Mock API Key data
interface APIKey {
  id: string
  region: string
  storageClass: "standard" | "infrequent-access"
  accessKey: string
  creationDate: string
}

const mockAPIKeys: APIKey[] = [
  {
    id: "1",
    region: "In-Bangalore-1",
    storageClass: "standard",
    accessKey: "TB5QU9TSR8G26S488E1R",
    creationDate: "2026-01-22T14:05:06Z",
  },
  {
    id: "2",
    region: "In-Bangalore-1",
    storageClass: "infrequent-access",
    accessKey: "589CRVCWT12GP5H21NE3",
    creationDate: "2026-01-22T17:13:13Z",
  },
]

export default function KMSStoragePage() {
  const [selectedAPIKey, setSelectedAPIKey] = useState<APIKey | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { toast } = useToast()

  const handleCopyAccessKey = (apiKey: APIKey) => {
    navigator.clipboard.writeText(apiKey.accessKey)
    toast({
      title: "Access Key Copied",
      description: "The access key has been copied to your clipboard.",
    })
  }

  const handleDelete = (apiKey: APIKey) => {
    setSelectedAPIKey(apiKey)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedAPIKey) {
      toast({
        title: "API Key Deleted",
        description: `The API key ${selectedAPIKey.accessKey} has been deleted successfully.`,
      })
      setIsDeleteModalOpen(false)
      setSelectedAPIKey(null)
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleCreateSuccess = () => {
    // Refresh the page or update the data
    handleRefresh()
  }

  // Table columns configuration
  const columns = [
    {
      key: "region",
      label: "Region",
      sortable: true,
      searchable: true,
      render: (value: string) => (
        <div className="text-sm leading-5">{value}</div>
      ),
    },
    {
      key: "storageClass",
      label: "Storage Class",
      sortable: true,
      searchable: true,
      render: (value: string) => {
        const displayValue =
          value === "standard" ? "Standard" : "Infrequent Access"
        return <div className="text-sm leading-5">{displayValue}</div>
      },
    },
    {
      key: "accessKey",
      label: "Access Key",
      sortable: true,
      searchable: true,
      render: (value: string) => (
        <div className="text-sm font-mono leading-5">{value}</div>
      ),
    },
    {
      key: "creationDate",
      label: "Creation Date",
      sortable: true,
      render: (value: string) => {
        const date = new Date(value)
        const formattedDate = date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
        const formattedTime = date.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
        return (
          <div className="text-sm text-muted-foreground leading-5">
            {formattedDate} at {formattedTime}
          </div>
        )
      },
    },
    {
      key: "actions",
      label: "Actions",
      align: "right" as const,
      render: (_: any, row: APIKey) => {
        return (
          <div className="flex justify-end">
            <ActionMenu
              customActions={[
                {
                  label: "Copy Access Key",
                  icon: <Copy className="mr-2 h-4 w-4" />,
                  onClick: () => handleCopyAccessKey(row),
                },
                {
                  label: "Delete Access Key",
                  icon: <Trash2 className="mr-2 h-4 w-4" />,
                  onClick: () => handleDelete(row),
                  variant: "destructive",
                },
              ]}
              resourceName={row.accessKey}
              resourceType="API Key"
            />
          </div>
        )
      },
    },
  ]

  const showEmptyState = mockAPIKeys.length === 0

  return (
    <PageLayout
      title="API Keys"
      description="Manage your Object Storage API keys for programmatic access."
      headerActions={
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create Bucket API Key
        </Button>
      }
    >
      {showEmptyState ? (
        <Card className="mt-8">
          <CardContent>
            <EmptyState
              title="No API Keys Yet"
              description="Create your first API key to enable programmatic access to your object storage buckets."
              actionText="Create Your First API Key"
              onAction={() => {
                window.location.href = "/administration/kms/storage/create"
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <ShadcnDataTable
          columns={columns}
          data={mockAPIKeys}
          searchableColumns={["region", "accessKey"]}
          defaultSort={{ column: "creationDate", direction: "desc" }}
          pageSize={10}
          enableSearch={true}
          enablePagination={true}
          onRefresh={handleRefresh}
          enableVpcFilter={false}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        resourceName={selectedAPIKey?.accessKey || ""}
        resourceType="API Key"
        onConfirm={handleDeleteConfirm}
      />

      <CreateBucketApiKeyModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </PageLayout>
  )
}
