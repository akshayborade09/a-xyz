"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronDown, ChevronRight, Plus, X, Server, HardDrive, Tag, AlertTriangle, Download, Edit3, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockSubnets } from "@/lib/cluster-creation-data"

// Instance flavors from the screenshot
const instanceFlavors = [
  { id: "cpu-1x-4gb", name: "CPU-1x-4GB", vcpus: 1, ram: 4, pricePerHour: 3 },
  { id: "cpu-2x-8gb", name: "CPU-2x-8GB", vcpus: 2, ram: 8, pricePerHour: 6 },
  { id: "cpu-4x-16gb", name: "CPU-4x-16GB", vcpus: 4, ram: 16, pricePerHour: 13 },
  { id: "cpu-8x-32gb", name: "CPU-8x-32GB", vcpus: 8, ram: 32, pricePerHour: 25 },
  { id: "cpu-16x-64gb", name: "CPU-16x-64GB", vcpus: 16, ram: 64, pricePerHour: 49 },
  { id: "cpu-32x-128gb", name: "CPU-32x-128GB", vcpus: 32, ram: 128, pricePerHour: 97 }
]

// Storage presets
const storagePresets = [
  { size: 50, label: "50GB" },
  { size: 100, label: "100GB" },
  { size: 500, label: "500GB" },
  { size: 1000, label: "1TB" }
]

// Storage notches for visual markers on slider
const storageNotches = [50, 100, 250, 500, 750, 1000, 1024]

// Mock security groups data
const mockSecurityGroups = [
  { id: "sg-default", name: "default", description: "Default security group" },
  { id: "sg-web", name: "web-servers", description: "Security group for web servers" },
  { id: "sg-db", name: "database", description: "Security group for database servers" },
  { id: "sg-app", name: "application", description: "Security group for application servers" },
  { id: "sg-cache", name: "cache-servers", description: "Security group for cache servers" }
]

interface NodePool {
  id: string
  name: string
  instanceFlavor: string
  storageSize: number
  subnetId: string
  securityGroupId?: string
  desiredNodes: number
  minNodes: number
  maxNodes: number
  taints: Array<{ key: string; value: string; effect: string }>
  labels: Array<{ key: string; value: string }>
  tags: Array<{ key: string; value: string }>
  isDefault: boolean
}

interface Taint {
  key: string
  value: string
  effect: string
}

interface Label {
  key: string
  value: string
}

export default function NodePoolCreationPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [nodePools, setNodePools] = useState<NodePool[]>([
    {
      id: "default-pool",
      name: "default-pool",
      instanceFlavor: "cpu-2x-8gb",
      storageSize: 50,
      subnetId: "",
      securityGroupId: undefined,
      desiredNodes: 2,
      minNodes: 1,
      maxNodes: 5,
      taints: [{ key: "", value: "", effect: "NoSchedule" }],
      labels: [{ key: "", value: "" }],
      tags: [{ key: "", value: "" }],
      isDefault: true
    }
  ])

  const [nextPoolId, setNextPoolId] = useState(2)
  const [yamlPreviewOpen, setYamlPreviewOpen] = useState(false)
  const [highlightedStorage, setHighlightedStorage] = useState<string | null>(null)
  const [draggingStorage, setDraggingStorage] = useState<string | null>(null)
  const [dragValue, setDragValue] = useState<number>(0)

  // Get selected instance flavor details
  const getSelectedFlavor = (flavorId: string) => {
    return instanceFlavors.find(f => f.id === flavorId) || instanceFlavors[1]
  }

  // Calculate costs
  const calculateCosts = useMemo(() => {
    let totalInstanceCost = 0
    let totalStorageCost = 0

    nodePools.forEach(pool => {
      const flavor = getSelectedFlavor(pool.instanceFlavor)
      const instanceCost = flavor.pricePerHour * pool.desiredNodes
      const storageCost = pool.storageSize * 0.0625 * pool.desiredNodes // ₹0.0625 per GB per hour
      
      totalInstanceCost += instanceCost
      totalStorageCost += storageCost
    })

    return {
      totalInstanceCost,
      totalStorageCost,
      totalCost: totalInstanceCost + totalStorageCost
    }
  }, [nodePools])

  // Add new node pool
  const addNodePool = () => {
    const newPool: NodePool = {
      id: `pool-${nextPoolId}`,
      name: `node-pool-${nextPoolId}`,
      instanceFlavor: "cpu-2x-8gb",
      storageSize: 50,
      subnetId: "",
      securityGroupId: undefined,
      desiredNodes: 1,
      minNodes: 1,
      maxNodes: 3,
      taints: [{ key: "", value: "", effect: "NoSchedule" }],
      labels: [{ key: "", value: "" }],
      tags: [{ key: "", value: "" }],
      isDefault: false
    }
    
    setNodePools([...nodePools, newPool])
    setNextPoolId(nextPoolId + 1)
  }

  // Remove node pool
  const removeNodePool = (poolId: string) => {
    if (nodePools.find(p => p.id === poolId)?.isDefault) {
      toast({
        title: "Cannot remove default pool",
        description: "The default node pool is required and cannot be deleted.",
        variant: "destructive"
      })
      return
    }
    
    setNodePools(nodePools.filter(p => p.id !== poolId))
  }

  // Update node pool
  const updateNodePool = (poolId: string, updates: Partial<NodePool>) => {
    setNodePools(nodePools.map(pool => 
      pool.id === poolId ? { ...pool, ...updates } : pool
    ))
  }

  // Add taint
  const addTaint = (poolId: string) => {
    const pool = nodePools.find(p => p.id === poolId)
    if (pool) {
      updateNodePool(poolId, {
        taints: [...pool.taints, { key: "", value: "", effect: "NoSchedule" }]
      })
    }
  }

  // Remove taint
  const removeTaint = (poolId: string, index: number) => {
    const pool = nodePools.find(p => p.id === poolId)
    if (pool) {
      updateNodePool(poolId, {
        taints: pool.taints.filter((_, i) => i !== index)
      })
    }
  }

  // Update taint
  const updateTaint = (poolId: string, index: number, field: keyof Taint, value: string) => {
    const pool = nodePools.find(p => p.id === poolId)
    if (pool) {
      const updatedTaints = pool.taints.map((taint, i) => 
        i === index ? { ...taint, [field]: value } : taint
      )
      updateNodePool(poolId, { taints: updatedTaints })
    }
  }

  // Add label
  const addLabel = (poolId: string) => {
    const pool = nodePools.find(p => p.id === poolId)
    if (pool) {
      updateNodePool(poolId, {
        labels: [...pool.labels, { key: "", value: "" }]
      })
    }
  }

  // Remove label
  const removeLabel = (poolId: string, index: number) => {
    const pool = nodePools.find(p => p.id === poolId)
    if (pool) {
      updateNodePool(poolId, {
        labels: pool.labels.filter((_, i) => i !== index)
      })
    }
  }

  // Update label
  const updateLabel = (poolId: string, index: number, field: keyof Label, value: string) => {
    const pool = nodePools.find(p => p.id === poolId)
    if (pool) {
      const updatedLabels = pool.labels.map((label, i) => 
        i === index ? { ...label, [field]: value } : label
      )
      updateNodePool(poolId, { labels: updatedLabels })
    }
  }

  // Add tag
  const addTag = (poolId: string) => {
    const pool = nodePools.find(p => p.id === poolId)
    if (pool) {
      updateNodePool(poolId, {
        tags: [...pool.tags, { key: "", value: "" }]
      })
    }
  }

  // Remove tag
  const removeTag = (poolId: string, index: number) => {
    const pool = nodePools.find(p => p.id === poolId)
    if (pool) {
      updateNodePool(poolId, {
        tags: pool.tags.filter((_, i) => i !== index)
      })
    }
  }

  // Update tag
  const updateTag = (poolId: string, index: number, field: 'key' | 'value', value: string) => {
    const pool = nodePools.find(p => p.id === poolId)
    if (pool) {
      const newTags = [...pool.tags]
      newTags[index][field] = value
      updateNodePool(poolId, { tags: newTags })
    }
  }

  // Validation
  const validateForm = () => {
    for (const pool of nodePools) {
      // Check if name is provided
      if (!pool.name.trim()) {
        return false
      }
      // Check node count validation
      if (pool.minNodes < 0 || pool.maxNodes < pool.minNodes || pool.desiredNodes < pool.minNodes || pool.desiredNodes > pool.maxNodes) {
        return false
      }
    }
    return true
  }

  // Handle save and continue
  const handleSaveAndContinue = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the validation errors before continuing.",
        variant: "destructive"
      })
      return
    }

    // In a real implementation, this would save the configuration
    toast({
      title: "Configuration Saved",
      description: "Node pool configuration has been saved successfully."
    })
    
    // Navigate to next step (would be implemented in real app)
    router.push("/kubernetes/clusters/create/next-step")
  }

  // Generate YAML preview
  const generateYAML = () => {
    const nodePoolsYAML = nodePools.map(pool => {
      const flavor = getSelectedFlavor(pool.instanceFlavor)
      let poolYAML = `  - name: ${pool.name}
    instanceType: ${flavor.name}
    vcpus: ${flavor.vcpus}
    memory: ${flavor.ram}GB
    storage: ${pool.storageSize}GB
    scaling:
      desired: ${pool.desiredNodes}
      min: ${pool.minNodes}
      max: ${pool.maxNodes}`

      // Add labels if any
      if (pool.labels.length > 0 && pool.labels.some(label => label.key && label.value)) {
        poolYAML += '\n    labels:'
        pool.labels.filter(label => label.key && label.value).forEach(label => {
          poolYAML += `\n      ${label.key}: "${label.value}"`
        })
      }

      // Add taints if any
      if (pool.taints.length > 0 && pool.taints.some(taint => taint.key && taint.value)) {
        poolYAML += '\n    taints:'
        pool.taints.filter(taint => taint.key && taint.value).forEach(taint => {
          poolYAML += `\n      - key: "${taint.key}"\n        value: "${taint.value}"\n        effect: ${taint.effect}`
        })
      }

      // Add tags if any
      if (pool.tags.length > 0 && pool.tags.some(tag => tag.key && tag.value)) {
        poolYAML += '\n    tags:'
        pool.tags.filter(tag => tag.key && tag.value).forEach(tag => {
          poolYAML += `\n      ${tag.key}: "${tag.value}"`
        })
      }

      return poolYAML
    }).join('\n')

    const yaml = `apiVersion: v1
kind: Cluster
metadata:
  name: mks-cluster
spec:
  nodePools:
${nodePoolsYAML}`
    
    return yaml
  }

  // Download YAML
  const downloadYAML = () => {
    const yaml = generateYAML()
    const blob = new Blob([yaml], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mks-cluster-spec.yaml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <PageLayout
      title="Configure Node Pools"
      description="Configure node pools for your MKS cluster"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {nodePools.map((pool, index) => (
            <Card key={pool.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="text-lg">
                        {pool.name}
                        {pool.isDefault && (
                          <Badge variant="secondary" className="ml-2">
                            Default Node Pool (required)
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                  </div>
                  {!pool.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNodePool(pool.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Node Pool Name */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Node Pool Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={pool.name}
                    onChange={(e) => updateNodePool(pool.id, { name: e.target.value })}
                    placeholder="Enter node pool name (e.g., workers, database, gpu-nodes)"
                    className={`w-full ${!pool.name.trim() ? 'border-destructive focus:border-destructive' : ''}`}
                  />
                  {!pool.name.trim() && (
                    <p className="text-xs text-destructive">Node pool name is required</p>
                  )}
                </div>

                {/* Instance Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Instance Type <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {instanceFlavors.map((flavor) => (
                      <Card
                        key={flavor.id}
                        className={`cursor-pointer transition-all ${
                          pool.instanceFlavor === flavor.id
                            ? "ring-2 ring-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => updateNodePool(pool.id, { instanceFlavor: flavor.id })}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-1">
                          <div className="font-medium text-sm">{flavor.name}</div>
                            <div className="text-sm font-semibold text-primary">
                              ₹{flavor.pricePerHour}/hour/node
                          </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {flavor.vcpus} vCPU • {flavor.ram} GB RAM
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Node Scaling */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Scaling Settings <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Min Nodes</Label>
                      <Input
                        type="number"
                        value={pool.minNodes}
                        onChange={(e) => updateNodePool(pool.id, { minNodes: Math.max(0, Number(e.target.value) || 0) })}
                        min={0}
                        className="text-center"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Desired Nodes</Label>
                      <Input
                        type="number"
                        value={pool.desiredNodes}
                        onChange={(e) => updateNodePool(pool.id, { desiredNodes: Math.max(1, Number(e.target.value) || 1) })}
                        min={1}
                        className="text-center"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Max Nodes</Label>
                      <Input
                        type="number"
                        value={pool.maxNodes}
                        onChange={(e) => updateNodePool(pool.id, { maxNodes: Math.max(1, Number(e.target.value) || 1) })}
                        min={1}
                        className="text-center"
                      />
                    </div>
                  </div>
                  
                  {/* Request Higher Node Limits Link */}
                  <div className="text-right">
                    <button 
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      onClick={() => {
                        // In a real implementation, this would open a support form or redirect to limits page
                        toast({
                          title: "Request Submitted",
                          description: "Your request for higher node limits has been submitted to our support team.",
                        })
                      }}
                    >
                      Request Higher Limits
                    </button>
                  </div>
                  
                  {/* Validation */}
                  {pool.minNodes > pool.maxNodes && (
                    <p className="text-xs text-destructive">Min nodes cannot be greater than max nodes</p>
                  )}
                  {pool.desiredNodes < pool.minNodes && (
                    <p className="text-xs text-destructive">Desired nodes must be at least min nodes</p>
                  )}
                  {pool.desiredNodes > pool.maxNodes && (
                    <p className="text-xs text-destructive">Desired nodes cannot exceed max nodes</p>
                  )}
                </div>

                {/* Bootable Volume Selection */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">
                    Bootable Volume <span className="text-destructive">*</span>
                  </Label>
                  
                  {/* Machine Image */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Machine Image</Label>
                    <Input
                      value="Ubuntu"
                      disabled
                      className="bg-muted text-muted-foreground cursor-not-allowed"
                      placeholder="Ubuntu"
                    />
                  </div>
                  
                  {/* Storage Size */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Storage Size (GB)</Label>

                  {/* Enhanced Storage Selection UI */}
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl space-y-5">
                    
                    {/* Custom Input Field with Enhanced Highlighting */}
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <Input
                          type="number"
                          value={pool.storageSize}
                          onChange={(e) => {
                            const value = Math.max(50, Math.min(1024, Number(e.target.value) || 50))
                            updateNodePool(pool.id, { storageSize: value })
                            setTimeout(() => {
                              setHighlightedStorage(pool.id)
                              setTimeout(() => setHighlightedStorage(null), 2000)
                            }, 300)
                          }}
                          className={`w-32 h-12 text-center text-lg font-semibold pr-10 border-2 transition-all duration-300 ${
                            highlightedStorage === pool.id 
                              ? "border-green-500 bg-green-50" 
                              : draggingStorage === pool.id
                              ? "border-green-400 bg-green-50"
                              : "border-slate-300 hover:border-slate-400"
                          }`}
                          min={50}
                          max={2048}
                          placeholder="Size"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground pointer-events-none">
                          GB
                        </span>
                      </div>
                    </div>

                    {/* Enhanced Slider with Notches */}
                    <div className="space-y-4">
                      <Label className="text-xs font-medium text-muted-foreground">Select size by dragging the slider</Label>
                      <div className="relative px-2 pb-8">
                        <Slider
                          value={[pool.storageSize]}
                          onValueChange={(value) => {
                            updateNodePool(pool.id, { storageSize: value[0] })
                            setDragValue(value[0])
                            if (!draggingStorage) {
                              setDraggingStorage(pool.id)
                            }
                          }}
                          onValueCommit={(value) => {
                            setDraggingStorage(null)
                            setTimeout(() => {
                              setHighlightedStorage(pool.id)
                              setTimeout(() => setHighlightedStorage(null), 2000)
                            }, 300)
                          }}
                          max={1024}
                          min={50}
                          step={25}
                          className="w-full"
                        />
                        
                        {/* Dragging Tooltip */}
                        {draggingStorage === pool.id && (
                          <div 
                            className="absolute pointer-events-none z-10 transform -translate-x-1/2 -translate-y-full"
                            style={{ 
                              left: `${((dragValue - 50) / (2048 - 50)) * 100}%`,
                              top: '-10px'
                            }}
                          >
                            <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg">
                              {dragValue} GB
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"></div>
                            </div>
                          </div>
                        )}
                        
                        {/* Notches */}
                        <div className="absolute top-8 left-0 right-0 pointer-events-none">
                          <div className="flex justify-between px-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-0.5 h-2 transition-all duration-200 ${
                                Math.abs(pool.storageSize - 50) <= 25 ? "bg-primary" : "bg-slate-300"
                              }`} />
                              <span className={`text-xs mt-1 transition-all duration-200 ${
                                Math.abs(pool.storageSize - 50) <= 25 ? "text-primary font-medium" : "text-muted-foreground"
                              }`}>
                                50GB
                              </span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className={`w-0.5 h-2 transition-all duration-200 ${
                                Math.abs(pool.storageSize - 1024) <= 25 ? "bg-primary" : "bg-slate-300"
                              }`} />
                              <span className={`text-xs mt-1 transition-all duration-200 ${
                                Math.abs(pool.storageSize - 1024) <= 25 ? "text-primary font-medium" : "text-muted-foreground"
                              }`}>
                                1TB
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Quick Select</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {storagePresets.map((preset) => (
                    <Button
                            key={preset.size}
                      type="button"
                            variant={pool.storageSize === preset.size ? "default" : "outline"}
                      size="sm"
                            className={`h-10 text-sm font-medium transition-all duration-200 ${
                              pool.storageSize === preset.size 
                                ? "bg-primary text-primary-foreground shadow-md scale-105" 
                                : "hover:scale-105 hover:shadow-sm"
                            }`}
                            onClick={() => {
                              updateNodePool(pool.id, { storageSize: preset.size })
                              setTimeout(() => {
                                setHighlightedStorage(pool.id)
                                setTimeout(() => setHighlightedStorage(null), 1500)
                              }, 300)
                            }}
                          >
                            {preset.label}
                    </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Volume Size Warning */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800">
                        <strong>Note:</strong> Once chosen, storage size cannot be changed later. Please select carefully.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subnet Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Subnet <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={pool.subnetId} 
                    onValueChange={(value) => updateNodePool(pool.id, { subnetId: value })}
                  >
                    <SelectTrigger className={!pool.subnetId ? 'border-red-300 bg-red-50' : ''}>
                      <SelectValue placeholder="Select a subnet" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockSubnets.map((subnet) => (
                        <SelectItem key={subnet.id} value={subnet.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{subnet.name}</span>
                            <Badge 
                              variant="secondary" 
                              className={`ml-2 text-xs ${
                                subnet.type === 'Public' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {subnet.type}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!pool.subnetId && (
                    <p className="text-xs text-destructive">Please select a subnet</p>
                  )}
                </div>

                {/* Advanced Settings */}
                <div>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="advanced-settings">
                      <AccordionTrigger className="text-base font-semibold">
                        Advanced Settings
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-4 space-y-5">
                          {/* Security Group Selection */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">Security Group</Label>
                            <Select 
                              value={pool.securityGroupId || "none"} 
                              onValueChange={(value) => updateNodePool(pool.id, { securityGroupId: value === "none" ? undefined : value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a security group (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  <span className="text-muted-foreground">No security group</span>
                                </SelectItem>
                                {mockSecurityGroups.map((sg) => (
                                  <SelectItem key={sg.id} value={sg.id}>
                                    <div className="flex flex-col items-start">
                                      <span>{sg.name}</span>
                                      <span className="text-xs text-muted-foreground">{sg.description}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Taints */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">Taints</Label>
                    <div className="space-y-3">
                      {pool.taints.map((taint, index) => (
                                <div key={index} className="grid grid-cols-3 gap-3">
                          <Input
                            placeholder="Key"
                            value={taint.key}
                                    onChange={(e) => updateTaint(pool.id, index, 'key', e.target.value)}
                                    className="text-xs"
                          />
                          <Input
                            placeholder="Value"
                            value={taint.value}
                                    onChange={(e) => updateTaint(pool.id, index, 'value', e.target.value)}
                                    className="text-xs"
                          />
                          <div className="flex gap-2">
                                    <Select 
                              value={taint.effect}
                                      onValueChange={(value) => updateTaint(pool.id, index, 'effect', value)}
                                    >
                                      <SelectTrigger className="text-xs">
                                        <SelectValue placeholder="Effect" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="NoSchedule">NoSchedule</SelectItem>
                                        <SelectItem value="PreferNoSchedule">PreferNoSchedule</SelectItem>
                                        <SelectItem value="NoExecute">NoExecute</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    {pool.taints.length > 1 ? (
                            <Button
                              type="button"
                                        variant="outline"
                              size="sm"
                              onClick={() => removeTaint(pool.id, index)}
                                        className="px-2"
                            >
                                        <X className="h-3 w-3" />
                            </Button>
                                    ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                                        onClick={() => addTaint(pool.id)}
                                        className="px-2"
                    >
                                        <Plus className="h-3 w-3" />
                    </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                  </div>
                  
                          {/* Labels */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">Labels</Label>
                    <div className="space-y-3">
                      {pool.labels.map((label, index) => (
                                <div key={index} className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Key"
                            value={label.key}
                                    onChange={(e) => updateLabel(pool.id, index, 'key', e.target.value)}
                                    className="text-xs"
                          />
                          <div className="flex gap-2">
                            <Input
                              placeholder="Value"
                              value={label.value}
                                      onChange={(e) => updateLabel(pool.id, index, 'value', e.target.value)}
                                      className="text-xs"
                            />
                                    {pool.labels.length > 1 ? (
                            <Button
                              type="button"
                                        variant="outline"
                              size="sm"
                              onClick={() => removeLabel(pool.id, index)}
                                        className="px-2"
                            >
                                        <X className="h-3 w-3" />
                            </Button>
                                    ) : (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addLabel(pool.id)}
                                        className="px-2"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    )}
                          </div>
                        </div>
                      ))}
                    </div>
                </div>

                {/* Tags */}
                <div className="space-y-3">
                            <Label className="text-sm font-medium">Tags</Label>
                            <div className="space-y-3">
                              {pool.tags.map((tag, index) => (
                                <div key={index} className="grid grid-cols-2 gap-3">
                                  <Input
                                    placeholder="Key"
                                    value={tag.key}
                                    onChange={(e) => updateTag(pool.id, index, 'key', e.target.value)}
                                    className="text-xs"
                                  />
                  <div className="flex gap-2">
                    <Input
                                      placeholder="Value"
                                      value={tag.value}
                                      onChange={(e) => updateTag(pool.id, index, 'value', e.target.value)}
                                      className="text-xs"
                                    />
                                    {pool.tags.length > 1 ? (
                                      <Button 
                            type="button"
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => removeTag(pool.id, index)}
                                        className="px-2"
                          >
                            <X className="h-3 w-3" />
                                      </Button>
                                    ) : (
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => addTag(pool.id)}
                                        className="px-2"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                      ))}
                    </div>
                        </div>
                      </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>


                </CardContent>
              </Card>
            ))}

            {/* Add Node Pool Button */}
            <Button
              type="button"
              variant="outline"
              onClick={addNodePool}
              className="w-full h-16 border-dashed"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Node Pool
            </Button>

            {/* Main Form Card with Action Buttons */}
            <Card>
              <CardContent className="pt-6">
              </CardContent>
              <div className="flex justify-end gap-4 px-6 pb-6">
                <Button
                  type="button"
                  variant="outline"
                  className="hover:bg-secondary transition-colors"
                  onClick={() => router.back()}
                >
                  Back to Configuration
                </Button>
                <Button 
                  type="button"
                  disabled={!validateForm()}
                  className={`transition-colors ${
                    validateForm() 
                      ? 'bg-black text-white hover:bg-black/90' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={handleSaveAndContinue}
                >
                  Continue to Review
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column - Summary & Cost */}
          <div className="space-y-6">
            {/* Cost Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cost Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Instance Costs:</span>
                    <span className="font-medium">₹{calculateCosts.totalInstanceCost.toFixed(2)}/hour</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Storage Costs:</span>
                    <span className="font-medium">₹{calculateCosts.totalStorageCost.toFixed(2)}/hour</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-primary">₹{calculateCosts.totalCost.toFixed(2)}/hour</span>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    ≈ ₹{(calculateCosts.totalCost * 24 * 30).toFixed(2)}/month
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Node Pool Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Node Pool Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {nodePools.map((pool) => {
                  const flavor = getSelectedFlavor(pool.instanceFlavor)
                  return (
                    <div key={pool.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{pool.name}</span>
                        {pool.isDefault && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>{flavor.name} • {pool.desiredNodes} nodes</div>
                        <div>{pool.storageSize} GB storage</div>
                        <div>₹{(flavor.pricePerHour * pool.desiredNodes).toFixed(2)}/hour</div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* YAML Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuration Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <Collapsible open={yamlPreviewOpen} onOpenChange={setYamlPreviewOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span>View YAML</span>
                      {yamlPreviewOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <div className="bg-muted p-3 rounded-lg">
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                        {generateYAML()}
                      </pre>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={downloadYAML}
                      className="w-full mt-3"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download YAML
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

