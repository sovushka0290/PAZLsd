import type { CartLine, ProductViewModel } from '@fsd/entities/product/model/types'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartLine[]
  }),
  getters: {
    totalItemCount: state =>
      state.items.reduce((sum, line) => sum + line.quantity, 0),
    totalPrice: state =>
      state.items.reduce(
        (sum, line) => sum + (line.price ?? 0) * line.quantity,
        0
      ),
    /** Currency label for totals; first line wins if mixed. */
    dominantCurrencyCode: (state): string | null => {
      return state.items[0]?.currencyCode ?? null
    }
  },
  actions: {
    addProduct(product: ProductViewModel) {
      const existing = this.items.find(i => i.id === product.id)
      if (existing) {
        existing.quantity += 1
      } else {
        this.items.push({ ...product, quantity: 1 })
      }
    },
    applyQuantityDelta(productId: number, delta: number) {
      const line = this.items.find(i => i.id === productId)
      if (!line) {
        return
      }
      line.quantity = Math.max(1, line.quantity + delta)
    },
    removeItem(productId: number) {
      this.items = this.items.filter(i => i.id !== productId)
    },
    clear() {
      this.items = []
    }
  }
})
