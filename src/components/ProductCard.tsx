import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  image: string;
  price: number;
  category?: string;
  options?: string[]; // for dropdown like "12 cans", "24 cans"
}

export const ProductCard = ({
  id,
  name,
  description,
  image,
  price,
  category,
  options = ["24 Cans","12 Cans"],
}: ProductCardProps) => {
  return (
    <Link to={`/product/${id}`}>
      <div className="bg-card rounded-xl border-2 border-border overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-150 flex flex-col h-[30rem]">
        
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow text-center">
          {category && (
            <Badge variant="outline" className="mb-2 mx-auto text-xs">
              {category}
            </Badge>
          )}

          <h3 className="font-heading font-semibold text-base mb-2 text-foreground">
            {name}
          </h3>

          <p className="font-heading font-bold text-lg text-foreground mb-4">
            ₵{price.toFixed(2)}
          </p>

          {/* Dropdown + Add to Cart */}
          <div className="flex flex-col gap-2 mt-auto">
            <select className="w-full border rounded  px-2 py-2 text-sm">
             
                <option>12</option>
                <option>24</option>
            
            </select>

            <Button size="sm" className="w-full flex justify-center items-center gap-2 font-bold ">
              Add to cart
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};
