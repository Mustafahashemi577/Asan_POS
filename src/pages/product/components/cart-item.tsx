import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { CartItemType } from './order-details';

interface CartItemProps {
  item: CartItemType;
  onRemoveItem: (itemId: number) => void;
}

export const CartItemCard = ({ item, onRemoveItem }: CartItemProps) => {
  return (
    <div key={item.id} className="flex items-center gap-3">
              <div className="h-14 w-14 overflow-hidden rounded-lg">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground">
                  {item.name}
                </h4>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {item.quantity}X
                  </span>
                  <span className="font-semibold text-foreground">
                    ${item.price}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onRemoveItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
  )
}

