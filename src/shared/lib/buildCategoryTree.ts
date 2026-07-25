import type { ApiCategory } from '@fsd/shared/api/types'

export interface CategoryTreeNode {
  id: number
  name: string
  slug: string
  parent: number | null
  products_count?: number
  children: CategoryTreeNode[]
}

/**
 * Converts a flat list of ApiCategory objects to a hierarchical CategoryTreeNode tree structure.
 */
export function buildCategoryTree(categories: ApiCategory[]): CategoryTreeNode[] {
  const nodeMap = new Map<number, CategoryTreeNode>()

  // 1. Create nodes
  for (const cat of categories) {
    nodeMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parent: cat.parent,
      products_count: (cat as any).products_count,
      children: []
    })
  }

  const roots: CategoryTreeNode[] = []

  // 2. Build relationships
  for (const cat of categories) {
    const node = nodeMap.get(cat.id)
    if (node) {
      if (cat.parent === null) {
        roots.push(node)
      } else {
        const parentNode = nodeMap.get(cat.parent)
        if (parentNode) {
          parentNode.children.push(node)
        } else {
          // If parent node is not in mapping, treat as root
          roots.push(node)
        }
      }
    }
  }

  // 3. Sort children at each level alphabetically by name
  const sortTreeNodes = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    for (const node of nodes) {
      if (node.children.length > 0) {
        sortTreeNodes(node.children)
      }
    }
  }

  sortTreeNodes(roots)
  return roots
}
